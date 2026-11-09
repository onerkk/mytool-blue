import json,collections
D=json.load(open('/tmp/x/dump.json'))
G='甲乙丙丁戊己庚辛壬癸';Z='子丑寅卯辰巳午未申酉戌亥'
EL={'子':'水','亥':'水','寅':'木','卯':'木','巳':'火','午':'火','申':'金','酉':'金','辰':'土','戌':'土','丑':'土','未':'土'}
GEN={'木':'火','火':'土','土':'金','金':'水','水':'木'};CTL={'木':'土','土':'水','水':'火','火':'金','金':'木'}
# trigram: code(bit0=bottom) -> name, element, inner (stem, branches), outer
T={7:('乾','金','甲','子寅辰','壬','午申戌'),0:('坤','土','乙','未巳卯','癸','丑亥酉'),1:('震','木','庚','子寅辰','庚','午申戌'),6:('巽','木','辛','丑亥酉','辛','未巳卯'),
   2:('坎','水','戊','寅辰午','戊','申戌子'),5:('離','火','己','卯丑亥','己','酉未巳'),4:('艮','土','丙','辰午申','丙','戌子寅'),3:('兌','金','丁','巳卯丑','丁','亥酉未')}
pal={}
for t in T:
    pure=t|(t<<3);c=pure;pal[c]=(t,6,pure)
    for k in range(5):
        c^=1<<k;pal[c]=(t,k+1,pure)
    c^=1<<3;pal[c]=(t,4,pure)          # 遊魂
    c=(c&~7)|t;pal[c]=(t,3,pure)        # 歸魂
assert len(pal)==64
def kin(pe,e):
    if pe==e:return '兄弟'
    if GEN[pe]==e:return '子孫'
    if CTL[pe]==e:return '妻財'
    if GEN[e]==pe:return '父母'
    return '官鬼'
def najia(code):
    lo,up=code&7,code>>3;out=[]
    for i in range(6):
        t=T[lo] if i<3 else T[up]
        out.append((t[2] if i<3 else t[4],(t[3] if i<3 else t[5])[i%3]))
    return out
SP=['青龍','朱雀','勾陳','螣蛇','白虎','玄武'];SPS={'甲':0,'乙':0,'丙':1,'丁':1,'戊':2,'己':3,'庚':4,'辛':4,'壬':5,'癸':5}
bad=collections.Counter();ex={}
def B(k,i):
    bad[k]+=1;ex.setdefault(k,i)
for r in D['ly']:
    code=r['code'];t,shi,pure=pal[code];pe=T[t][1];ying=(shi+2)%6+1
    p=r['palace']
    if p['name']!=T[t][0] or p['element']!=pe:B('palace',(code,r['name'],p['name'],T[t][0]))
    if p['shi']!=shi or p['ying']!=ying:B('shi/ying',(code,r['name'],p['shi'],shi))
    nj=najia(code);pn=najia(pure);present=set(kin(pe,EL[b]) for s,b in nj)
    gi,zi=G.index(r['day'][0]),Z.index(r['day'][1]);xun=(zi-gi)%12;vo={Z[(xun+10)%12],Z[(xun+11)%12]}
    if set(r['voids'])!=vo:B('void',(r['day'],r['voids']))
    for i,l in enumerate(r['lines']):
        s,b=nj[i]
        if l[0]!=s:B('stem',(code,r['name'],i+1,l[0],s))
        if l[1]!=b:B('branch',(code,r['name'],i+1,l[1],b))
        if l[2]!=kin(pe,EL[b]):B('relative',(code,i+1,l[2]))
        role='世' if i+1==shi else '應' if i+1==ying else ''
        if (l[3] or '')!=role:B('role',(code,i+1,l[3]))
        sp=SP[(SPS[r['day'][0]]+i)%6]
        if l[4]!=sp and not (l[4] in('騰蛇','螣蛇') and sp=='螣蛇'):B('spirit',(r['day'],i+1,l[4],sp))
        hk=kin(pe,EL[pn[i][1]]);exp=None if hk in present else [pn[i][0],pn[i][1],hk]
        if l[5]!=exp:B('hidden',(code,r['name'],i+1,l[5],exp))
print('liuyao rows',len(D['ly']),'mismatches',dict(bad),ex)
# liuren
from kinliuren import kinliuren
S={'貴':'貴','蛇':'蛇','雀':'雀','合':'合','勾':'勾','龍':'龍','空':'空','虎':'虎','常':'常','玄':'玄','陰':'陰','后':'后'}
bad=collections.Counter();ex={};n=0;gm=collections.Counter()
for r in D['lr']:
    gi=G.index(r['day'][0]);hi=Z.index(r['hour']);hgz=G[(gi%5*2+hi)%10]+r['hour']
    try:
        k0=kinliuren.Liuren('雨水','正',r['day'],hgz).result(0)
    except Exception as e:
        B('kin-throw',(r['day'],hgz,str(e)[:60]));continue
    n+=1
    tr=[k0['三傳'][x][0] for x in ('初傳','中傳','末傳')]
    if tr!=r['tr']:B('三傳',(r['day'],r['hour'],r['tr'],tr,r['gate'],r['type'],k0['格局']))
    cs=[k0['四課'][x][0][0] for x in ('一課','二課','三課','四課')]
    if cs!=r['courses']:B('四課',(r['day'],r['hour'],r['courses'],cs))
    if k0['地轉天盤']!=r['plate']:B('天地盤',(r['day'],r['hour']))
    g0=k0['地轉天將']
    if g0==r['gen_day']:gm['result(0)=site day']+=1
    elif g0==r['gen_night']:gm['result(0)=site night']+=1
    else:
        gm['result(0)=neither']+=1;ex.setdefault('gen',(r['day'],r['hour'],g0,r['gen_day'],r['gen_night']))
    try:
        g1=kinliuren.Liuren('雨水','正',r['day'],hgz).result(1)['地轉天將']
        gm['result(1)=site day' if g1==r['gen_day'] else 'result(1)=site night' if g1==r['gen_night'] else 'result(1)=neither']+=1
    except Exception as e: gm['r1 throw']+=1
print('liuren compared',n,'mismatches',dict(bad));print(dict(gm))
for k,v in ex.items():print(k,v)
