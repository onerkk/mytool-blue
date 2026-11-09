import json,collections
from kinliuren import kinliuren
D=json.load(open('/tmp/x/dump.json'));G='甲乙丙丁戊己庚辛壬癸';Z='子丑寅卯辰巳午未申酉戌亥'
by=collections.Counter();tot=collections.Counter();exs=collections.defaultdict(list)
for r in D['lr']:
    gi=G.index(r['day'][0]);hi=Z.index(r['hour']);hgz=G[(gi%5*2+hi)%10]+r['hour']
    try:k=kinliuren.Liuren('雨水','正',r['day'],hgz).result(0)
    except Exception:continue
    tr=[k['三傳'][x][0] for x in ('初傳','中傳','末傳')];rot=(11-hi)%12
    key=r['gate'];tot[key]+=1
    if tr!=r['tr']:
        kind='初傳不同' if tr[0]!=r['tr'][0] else '初同中末不同'
        by[(key,kind)]+=1;exs[(key,kind)].append((r['day'],'局%d'%(((hi-11)%12)+1),'站'+''.join(r['tr']),'kin'+''.join(tr),k['格局'][0]))
print('各宗門總數',dict(tot))
for k,v in sorted(by.items(),key=lambda x:-x[1]):print(k,v,exs[k][:5])
