"""Independent numerical QA only; pyswisseph is not a browser dependency.

References: Swiss Ephemeris 2.10 programmer manual and PVR chapter 1.
Uses the binding's native sidereal calculation, not the project's ayanamsa table.
"""
import datetime as dt
import json
import math
from pathlib import Path
import swisseph as swe


def fields(jd):
    flags = swe.FLG_MOSEPH | swe.FLG_SIDEREAL
    sun = swe.calc_ut(jd, swe.SUN, flags)[0][0]
    moon = swe.calc_ut(jd, swe.MOON, flags)[0][0]
    return {"tithi": (moon - sun) % 360, "karana": (moon - sun) % 360,
            "yoga": (sun + moon) % 360, "nakshatra": moon % 360}


def crossing(jd, key, target, direction):
    def residual(t):
        return (fields(t)[key] - target + 180) % 360 - 180
    near, far = jd, jd + direction * 3
    if direction < 0:
        near, far = far, near
    assert residual(near) <= 0 <= residual(far)
    for _ in range(45):
        mid = (near + far) / 2
        if residual(mid) < 0:
            near = mid
        else:
            far = mid
    return ((near + far) / 2 - 2440587.5) * 86400


def main():
    cases = []
    for utc in ["1900-01-01T12:00:00Z", "1983-08-25T06:55:00Z",
                "2026-06-21T10:00:00Z", "2100-12-25T12:00:00Z"]:
        for mode, sidmode in [("lahiri", swe.SIDM_LAHIRI), ("raman", swe.SIDM_RAMAN)]:
            swe.set_sid_mode(sidmode)
            birth = dt.datetime.fromisoformat(utc.replace("Z", "+00:00")).timestamp()
            jd = birth / 86400 + 2440587.5
            expected = {}
            for key, width in [("tithi", 12), ("karana", 6), ("yoga", 360 / 27), ("nakshatra", 360 / 27)]:
                index = math.floor(fields(jd)[key] / width)
                expected[key] = {"index": index + 1,
                    "startEpochSeconds": crossing(jd, key, index * width, -1),
                    "endEpochSeconds": crossing(jd, key, ((index + 1) * width) % 360, 1)}
            cases.append({"utc": utc, "ayanamsa": mode, "latitude": 23.31,
                          "longitude": 120.31, "expected": expected})
    target = Path(__file__).resolve().parents[1] / "tests/fixtures/vedic-panchanga-swiss-20261003.json"
    target.write_text(json.dumps({"source": "Swiss Ephemeris 2.10 Moshier native sidereal Sun/Moon; independent 64 crossings",
        "reference": "https://www.astro.com/swisseph/swephprg.htm", "cases": cases}, indent=2) + "\n")
    print(json.dumps({"cases": len(cases), "crossings": len(cases) * 8}))


if __name__ == "__main__":
    main()
