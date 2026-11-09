import json,swisseph as swe,datetime as dt
D=json.load(open('/tmp/wv.json'));swe.set_sid_mode(swe.SIDM_LAHIRI)
order=['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];yrs=[7,20,6,10,7,18,16,19,17]
bad=0;mx=0;n=0
for r in D:
    t=dt.datetime.fromisoformat(r['utc'].replace('Z','+00:00'));jd=swe.julday(t.year,t.month,t.day,t.hour+t.minute/60)
    mo=swe.calc_ut(jd,swe.MOON,swe.FLG_MOSEPH|swe.FLG_SIDEREAL)[0][0];span=360/27;ni=int(mo//span);fr=(mo%span)/span
    if min(fr,1-fr)<1e-4: continue
    n+=1
    if r['v']['dfirst']!=order[ni%9]: bad+=1
    else: mx=max(mx,abs(r['v']['dbal']-(1-fr)*yrs[ni%9]))
print('dasha cases',n,'first-lord mismatches',bad,'max balance diff (days)',round(mx*365.25,2))
