import json,collections
D=json.load(open('/tmp/x/mh.json'));YJ=json.load(open('/tmp/x/yjj.json'))
TR={1:('乾','天','金',[1,1,1]),2:('兌','澤','金',[1,1,0]),3:('離','火','火',[1,0,1]),4:('震','雷','木',[1,0,0]),5:('巽','風','木',[0,1,1]),6:('坎','水','水',[0,1,0]),7:('艮','山','土',[0,0,1]),8:('坤','地','土',[0,0,0])}
byL={tuple(v[3]):k for k,v in TR.items()}
KW=[[1,10,13,25,44,6,33,12],[43,58,49,17,28,47,31,45],[14,38,30,21,50,64,56,35],[34,54,55,51,32,40,62,16],[9,61,37,42,57,59,53,20],[5,60,63,3,48,29,39,8],[26,41,22,27,18,4,52,23],[11,19,36,24,46,7,15,2]]
N="乾坤屯蒙需訟師比小畜履泰否同人大有謙豫隨蠱臨觀噬嗑賁剝復无妄大畜頤大過坎離咸恆遯大壯晉明夷家人睽蹇解損益夬姤萃升困井革鼎震艮漸歸妹豐旅巽兌渙節中孚小過既濟未濟"
two={'小畜','同人','大有','噬嗑','无妄','大畜','大過','大壯','明夷','家人','歸妹','中孚','小過','既濟','未濟'};names=[];i=0
while i<len(N):
    if N[i:i+2] in two:names.append(N[i:i+2]);i+=2
    else:names.append(N[i]);i+=1
def full(u,l):
    n=KW[u-1][l-1];nm=names[n-1]
    return (TR[u][0]+'為'+TR[u][1] if u==l else TR[u][1]+TR[l][1]+nm),n
GEN={'木':'火','火':'土','土':'金','金':'水','水':'木'};CTL={'木':'土','土':'水','水':'火','火':'金','金':'木'}
norm=lambda s:s.replace('無妄','无妄').replace('恒','恆')
bad=collections.Counter();ex={};tyr=collections.Counter();judg={}
def B(k,i):bad[k]+=1;ex.setdefault(k,i)
for r in D:
    u,l,d=r['u'],r['l'],r['d'];L=TR[l][3]+TR[u][3]
    fb,nb=full(u,l)
    if norm(r['ben']['n'])!=fb:B('本卦名',(u,l,r['ben']['n'],fb))
    judg[nb]=r['ben']['j']
    src=L
    C=L[:];C[d-1]^=1;cl,cu=byL[tuple(C[:3])],byL[tuple(C[3:])]
    if norm(r['bian']['n'])!=full(cu,cl)[0]:B('變卦名',(u,l,d,r['bian']['n'],full(cu,cl)[0]))
    if u==l and u in(1,8): src=C   # 乾坤無互，互其變卦
    hl,hu=byL[tuple(src[1:4])],byL[tuple(src[2:5])]
    if norm(r['hu']['n'])!=full(hu,hl)[0]:B('互卦名',(u,l,d,r['hu']['n'],full(hu,hl)[0]))
    ti,yo=(u,l) if d<=3 else (l,u)
    if r['ti']!=TR[ti][0] or r['yo']!=TR[yo][0]:B('體用',(u,l,d,r['ti'],r['yo']))
    te,ye=TR[ti][2],TR[yo][2]
    rel='比和' if te==ye else '用生體' if GEN[ye]==te else '體生用' if GEN[te]==ye else '體剋用' if CTL[te]==ye else '用剋體'
    tyr[(rel,r['ty']['r'],r['ty']['f'])]+=1
print('梅花 384 起卦 不符',dict(bad),ex)
print('體用關係對照（我算, 站內名稱, 站內吉凶）:',dict(tyr))
cl=lambda s:''.join(ch for ch in s if ch not in '，。、；：？！ \u3000')
diff=[(e['number'],e['name'],judg.get(e['number']),e['judgment']) for e in YJ if judg.get(e['number']) is not None and cl(judg[e['number']]).replace('無','无')!=cl(e['judgment'].split('：',1)[-1]).replace('無','无')]
print('梅花卦辭 vs 易經資料 不同',len(diff))
for x in diff[:40]:print(x)
