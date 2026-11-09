import json,collections
D=json.load(open('/tmp/x/cp.json'));P=['year','month','day','hour']
he={frozenset(x) for x in ['子丑','寅亥','卯戌','辰酉','巳申','午未']}
ch={frozenset(x) for x in ['子午','丑未','寅申','卯酉','辰戌','巳亥']}
hai={frozenset(x) for x in ['子未','丑午','寅巳','卯辰','申亥','酉戌']}
po={frozenset(x) for x in ['子酉','丑辰','寅亥','卯午','巳申','未戌']}
xing={frozenset(x) for x in ['寅巳','巳申','申寅','丑戌','戌未','未丑','子卯']}
zixing=set('辰午酉亥')
half={frozenset(x) for x in ['申子','子辰','亥卯','卯未','寅午','午戌','巳酉','酉丑']}
gong={frozenset(x) for x in ['申辰','亥未','寅戌','巳丑']}
ghe={frozenset(x) for x in ['甲己','乙庚','丙辛','丁壬','戊癸']}
gch={frozenset(x) for x in ['甲庚','乙辛','丙壬','丁癸']}
exp_names={'六合':he,'六沖':ch,'六害':hai,'相破':po,'相刑':xing,'半合':half}
seen=collections.Counter();bad=collections.Counter();ex={}
def B(k,i):bad[k]+=1;ex.setdefault(k,i)
for r in D:
    got=collections.defaultdict(set)
    for x in r['br']:
        got[x['type']].add((x['aPillar'],x['bPillar']));seen[x['type']]+=1
        ai,bi=P.index(x['aPillar']),P.index(x['bPillar'])
        if r['a'][ai][1]!=x['aBranch'] or r['b'][bi][1]!=x['bBranch']:B('支與柱不符',x['type'])
    for t,S in exp_names.items():
        exp={(P[i],P[j]) for i in range(4) for j in range(4) if frozenset((r['a'][i][1],r['b'][j][1])) in S and r['a'][i][1]!=r['b'][j][1]}
        g=got.get(t,set())
        if exp-g:B(t+' 少列',(r['a'],r['b'],sorted(exp-g)[:2]))
        if g-exp:B(t+' 多列',(r['a'],r['b'],sorted(g-exp)[:2]))
    # stems
    sg=collections.defaultdict(set)
    for x in r['st'] or []:
        sg[x['type']].add((x['aPillar'],x['bPillar']));seen['干:'+x['type']]+=1
    for t,S,keys in (('五合',ghe,['五合','天干五合','合']),('沖',gch,['天干沖','相沖','沖','天干相沖'])):
        exp={(P[i],P[j]) for i in range(4) for j in range(4) if frozenset((r['a'][i][0],r['b'][j][0])) in S}
        g=set().union(*[sg.get(k,set()) for k in keys])
        if exp-g:B('干'+t+' 少列',(r['a'],r['b'],sorted(exp-g)[:2]))
        if g-exp:B('干'+t+' 多列',(r['a'],r['b'],sorted(g-exp)[:2]))
print('couples',len(D));print('站內出現的類型',dict(seen));print('不符',dict(bad))
for k,v in ex.items():print(k,v)
