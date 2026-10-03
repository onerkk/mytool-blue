"""Independent Swiss/Moshier numerical QA; not part of the web calculation."""
from pathlib import Path
import datetime as dt
import json
import swisseph as swe

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / "docs/vedic-r7-swiss-input-20261003.json").read_text())
swe.set_sid_mode(swe.SIDM_LAHIRI)
FLAGS = swe.FLG_MOSEPH | swe.FLG_SIDEREAL
PLANETS = dict(Sun=swe.SUN, Moon=swe.MOON, Mars=swe.MARS, Mercury=swe.MERCURY,
               Jupiter=swe.JUPITER, Venus=swe.VENUS, Saturn=swe.SATURN,
               Rahu=swe.MEAN_NODE, Ketu=swe.MEAN_NODE)

def timestamp(value):
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()

def longitude(planet, value):
    jd = value / 86400 + 2440587.5
    return (swe.calc_ut(jd, PLANETS[planet], FLAGS)[0][0] +
            (180 if planet == "Ketu" else 0)) % 360

def signed(a, b):
    return (a - b + 180) % 360 - 180

def crossing(planet, target, guess):
    a, b = guess - 2 * 86400, guess + 2 * 86400
    fn = lambda t: signed(longitude(planet, t), target)
    fa, fb = fn(a), fn(b)
    assert fa * fb <= 0, (planet, target, guess, fa, fb)
    while b - a > .1:
        middle = (a + b) / 2
        fm = fn(middle)
        if fa * fm <= 0:
            b = middle
        else:
            a, fa = middle, fm
    return (a + b) / 2

natal = longitude("Sun", timestamp(data["input"]["utc"]))
results = []
for label, rows, step in [
    ("annual", [dict(start=data["annual"]["utc"])], 360),
    ("monthly", data["months"], 30),
    ("sixty-hour", data["segments"], 2.5),
]:
    for i, row in enumerate(rows):
        target = (natal + i * step) % 360
        actual = timestamp(row["start"])
        independent = crossing("Sun", target, actual)
        seconds = actual - independent
        assert abs(seconds) < 180, (label, i, seconds)
        results.append(dict(layer=label, index=i + 1, differenceSeconds=seconds,
                            nativeUTC=row["start"],
                            swissUTC=dt.datetime.fromtimestamp(
                                independent, dt.timezone.utc).isoformat()))
for row in data["ingresses"]:
    actual = timestamp(row["utc"])
    independent = crossing(row["planet"], row["boundary"], actual)
    degree_error = abs(signed(longitude(row["planet"], actual), row["boundary"]))
    assert degree_error < 1 / 60, (row["planet"], degree_error)
    # An independent numerical root can lie on either side of its own
    # discontinuous sign boundary. Murthi uses the entered, half-open interval.
    moon = longitude("Moon", independent + (1 if row["planet"] == "Moon" else 0))
    assert int(moon / 30) == row["moonAtIngress"]["sign"], (row["planet"], row["utc"], actual-independent, moon, row["moonAtIngress"])
    results.append(dict(layer="ingress", planet=row["planet"],
                        differenceSeconds=actual - independent,
                        longitudeErrorDegrees=degree_error,
                        moonSignAtIndependentIngress=int(moon / 30)))
out = dict(
    testedAt=dt.datetime.now(dt.timezone.utc).isoformat(),
    source="Swiss Ephemeris 2.10.03/Moshier SIDM_LAHIRI, independent from browser",
    scope="157 solar crossings and nine most recent native ingress/Murthi anchors",
    solverToleranceSeconds=.1,
    ownMoonIngressPolicy="Moon sign evaluated one second after its independent ingress; other ingress Moon anchors evaluated at their independent root",
    maximumSolarDifferenceSeconds=max(abs(p["differenceSeconds"]) for p in results
                                     if p["layer"] != "ingress"),
    maximumIngressLongitudeErrorDegrees=max(
        p["longitudeErrorDegrees"] for p in results if p["layer"] == "ingress"),
    results=results, passed=len(results), total=len(results),
    precisionNote="Numerical root tolerance is separate from ephemeris error. Slow planet crossing time errors are reported, not hidden or presented as event precision.",
)
(ROOT / "docs/vedic-r7-swiss-validation-20261003.json").write_text(
    json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({key: out[key] for key in ["passed", "total",
    "maximumSolarDifferenceSeconds", "maximumIngressLongitudeErrorDegrees"]}))
