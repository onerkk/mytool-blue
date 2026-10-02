#!/usr/bin/env python3
"""Build the independently worded, edition-bound sixty-lot analysis register.

Modern temple explanations are NOT redistributed. Each small category retains
its source fingerprint and literal feature tags, rather than claiming a lexical
classifier is a divination theorem. Poem interpretation below was individually
reviewed against the retrieved temple pages, including inconsistent passages.
"""
import hashlib, json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent.parent / 'research/oracle-temple-full'
REVIEW = '''維持|排除眼前遮蔽後，沿既有方向推進。|需要能澄清問題的證據與實際排障。|財利與考試附記另有早晚、先後之別，不能以總體吉意取代。
待機|花未開而有可發展條件，先找使事情生長的方法。|春色可指時令，也可指關係態度、技術或經營條件。|感情與再婚附記不同；不把春字直接換算成成功日期。
協調|以可促成合作的方法維持方向，而非投機或搖擺。|關係需要雙方檢討、配合；事業需要信譽與技術。|再試的說法有前次受挫前提；並非任何問題都保證第二次成功。
把握|風浪已平的意象支持適時行動，減少多餘猜疑。|須先確認現實阻礙確已解除。|婚姻附記仍有口舌；平安與功名象義不保證醫療結果。
暫守|局面有變數，錯過先機後宜按部就班，減少躁進。|先查外部條件與轉職、擴張的風險。|求財宜等待；感情附記有阻礙，訴訟以協商為廟方解法。
暫守|逆境與不協調的意象勸止強求，先處理損耗。|調整造成困境的做法，保留退路。|合作與感情難和合，不應因籤意而編造對方心意或災難。
維持|遮蔽逐步消散，以正當且和合的方法繼續。|先弄清問題，接受指導與合作。|原有財務路徑與新事業的附記不同，新投入仍宜暫緩。
收成|先前的投入開始有回報，務實接受實際結果。|收成以既有耕耘為前提，避免投機。|復合需雙方願意；一方不願時不能套兩相全強求。
止爭|志趣與利益不合的組合易生衝突，先辨合作基礎。|檢查雙方長期目標與責任是否一致。|感情、合夥與變動各有不利附記；不以生肖排斥特定人。
暫守|努力與成果不相稱，先停止空耗，回到可做的實事。|盤點已做的工作及失敗原因，控制新增成本。|換職、外出、婚談附記偏保留，不直接斷終身無望。
待機|黑暗至黎明是漸開的意象，靠準備承接轉機。|需有可辨識的新資訊或實際機會。|子丑寅與雞有多種時間或人物解法，並未唯一定位日期。
求助|從風浪到平安，重點是解除危險與尋求合適支援。|先界定危險，再找有能力的協調者。|關係復合不是唯一好結果；離開有害關係也可符合脫險。
暫守|所求面臨實質難關，強求或反覆問卜不能替代處理。|保留資源、補足能力並辨認受阻原因。|功名、求財與外出附記保留；年齡、生死斷語不作實際預測。
漸進|事情逐步結成結果，特別檢查金錢與投入的轉折。|需要持续耕耘及可核對的成果。|平安表示化解波折；訴訟附記重視協商，月桂不是唯一日期。
待機|晚成的故事勸人耐心準備，時機未到時先守現況。|繼續累積能被使用的本領。|工作變動宜緩；婚姻解說同有未到與下定決心可談的不同條件。
暫守|停止過度營求，改以持續努力和守信處理當前事。|不能用祭祀或焦慮代替應做的工作。|新計畫、外出與婚談附記保留；因果報應屬信仰敘事。
修正|改正既有失誤，再尋可協調與重來的契機。|分辨真實善意與利益安排，準備要持續。|龍蛇可以指時間、人物或象徵，不能直接指定貴人的生肖。
求助|祿馬的意象重在提攜與發展，需要適當支援。|向有經驗者商量，避免獨斷與急進。|求職、功名與關係附記較支持，疾病附記不能作療程依據。
暫守|先衡量能力與目標，選較熟悉的途徑等待轉明。|減少過度期望並持續修正準備。|新業與舊業有別，有限財利不等於可高槓桿投資。
暫守|前路受阻時也要照顧家庭與既有責任。|先處理分心、支出與關係衝突。|財務易有耗散象；感情需雙方同意，不由此認定外遇。
求助|面對難關，以誠實努力、和合及他人支援來處理。|自助與可行協助需同時存在。|先難後易的附記不保证結果；宗教護佑是本版本的信仰語境。
待機|太公晚成象重在清貧時持續準備，等待被使用。|持之以恆而不勉強出頭；貴人提攜是重要條件。|本頁解說誤混第23籤魚水段，採本詩、事項與案例中相符內容。
待機|魚與水未相逢，提示能力、需求與機會尚未接合。|尋找互相需要的合作條件，避免急進與獨行。|婚姻解說同有把握對象與情少之說，须以雙方實際意願核對。
漸進|浮雲退去是先難後明的意象，靠實學與持續努力。|先克服實際阻礙，不以小財象期待暴利。|功名較支持，外出移動附記保留；婚談有難成及成後佳兩層。
自助|問題主要靠自己的準備與行動解決，不能只問神。|分清可由自己處理的環節並持續用功。|雞犬是傳統時間提示，未唯一到年、月、日；感情要相互真心。
把握|已出現的可行機會宜及時承接，避免反覆遲疑。|先確認能力與條件足以應付再行動。|春季與牡丹象為版本附記；買賣說法不構成市場價格預測。
維持|安心守分而不勉強，讓已有能力逐步獲得使用。|耐心、誠信與不過度營求。|少量財利、遲成及貴人各有條件，總體平順不支持無限擴張。
暫守|失去原來有利位置時，宜收斂衝動與避免受欺。|確認處境與自身可控制的資源。|求財段另稱積極進取，與總體宜守有矛盾，須保留分歧。
待機|枯木未逢春，先充實與查明情況，再考慮新計畫。|等待實際條件成熟，不把希望當成果。|新業弱於舊業是本版附記；春字可指轉機，不能唯一排日期。
修正|目前成果可能轉弱，防驕滿、過度擴張與空耗。|改進方法、控制規模並維持實際努力。|有限財利與感情變化象需另查现实，不把月圓衰退當必然事件。
把握|在有利條件下積極耕耘，成果建立在勤儉與合作。|家人或團隊須共同承擔而非坐等回報。|功名、事業、移居的支持附記不免除成本與能力評估。
止爭|兩股力量互扯時以和為貴，避免意氣爭鬥。|辨明衝突的實際原因並建立協商方式。|在地經營與出外有不同附記；龍虎不構成人身敵友名單。
修正|先充實與自省，待風向可用時再發揮所長。|檢討第一次不成的原因，繼續改進。|本頁後段與第13籤重複且語境不同，只採本詩與相符段落。
漸進|面對艱辛需有恆心，等待蘭桂發展的可見契機。|持续努力、識別幫助者並避免半途而廢。|蘭桂的季節與人物說並存；不能單憑花期定成功時間。
漸進|先放下無效焦慮，情況有逐步脫險的空間。|耐心、誠懇與可觀察的改變。|關係與功名支持附記不代表固定成功率，求財還需合作。
知足|已有安穩成果时珍惜现有安排，減少自找的負擔。|先評估是否真的需要新增目標。|婚姻與既有生活象較支持；新創與外地投資仍需慎重考慮。
把握|正當且兼顧他人的決定可積極推進，勿三心兩意。|持續工作與實際準備才承接發展。|功名此科與後科有別，不因總體吉意保證本次錄取。
中和|避免偏激，守本分並把重點放在事件的核心。|用正直、平衡與持續努力建立承接。|中央可指核心機構或處事中道，不自動定位地址；事成可能較慢。
待機|不是眼前這個機會就放下強求，耐心等待合適支援。|聽取長輩意見，同時補足實力。|求財忌份外奢求，功名須名實相符；獨行與同行附記有別。
維持|不過度爭求，沿既有緣分與責任下功夫。|持續努力、家庭協調及不逞強。|婚姻解说同有美滿與有人阻擋難成，保留條件，不合成必成。
協調|停止反覆猶豫並修正過往問題，建立和諧與清楚消息。|彼此相處與長輩協調比生肖猜測重要。|解說既有等待雞犬又有立即決斷，分開訊息成熟與做法穩定兩層。
暫守|困難重重時縮減强求，固守正道並重新審查目標。|減少可能加劇損失的作法。|財務與爭訟附記偏保留；危險疾病字句不作病情或死亡判斷。
待機|急切與猶豫都可能失衡，從容準備並尋求援助。|貴人未到與靠自己努力兩種說法都需保留。|月中是多義時間語，不自行指定公曆或農曆；財利偏遲。
漸進|已有收成的跡象，克服餘下阻礙並慎選合作對象。|努力需持續，不能把希望當已驗收成果。|功名此科與後科、月光與月暗附記不同，保持各自條件。
收成|接受此前耕耘的成果，與不同立場的人學會體諒。|所得程度取決於先前投入。|君子小人是故事角色，不據此定性他人或推断懷孕。
把握|旺盛與明朗的意象支持努力，但需防自滿與盛衰。|真才實學與已有準備是主要承接條件。|本版有性別戲文附記，僅作文化資料；不由性別改判現實命運。
漸進|先想清楚有利且正當的方法，再等待轉明。|自我修正與認真經營，失敗後仍需檢討。|中旬、再試等傳統提示保留層次，不預造精準日期。
修正|避免過度自負與不切實際的要求，守分而改進作風。|能吃苦、提升能力與謹慎確認合作資訊。|財利與婚談附記保留，不能把人才不遇當終身標籤。
自決|面對眾說紛紜，要驗證資訊並自行衡量利害。|建立主見而非僅聽從他人或求籤。|獨立經營與合夥有別；關係能否和合仍由双方实际相處確認。
待機|願望不能立即完成，先穩定立場與長期累積。|保持恆心，避免為小利破壞原有準備。|婚姻需真誠與耐心，家中口舌須合作解決；外出宜缓。
暫守|先放下四處轉換的冲动，安定现有生活。|不輕舉妄動並優先保護家庭與既有安排。|本地與外地求財有別，東西南北不用于以名稱排除人或公司。
準備|用平日累積承接即將見到的結果，不反覆焦慮。|努力與能力須先到位。|婚姻難成與成則佳的附記並存，不能以事業成象替代關係意願。
漸進|發展有转好的空间，繼續正當做事與互助。|現在不理想不代表已有收益，要驗證實際變化。|合作重信義，現居與新移不同；財子不作確定懷孕或收入。
自助|孤單或支援不足時靠持續努力與恆心累積基礎。|先有耕種才能談收穫，不坐等神力。|財務與功名附記依勤勉而定，婚姻象義不能保證對方選擇。
修正|有價值但尚未顯露，先改善不足與補齊事實。|真相未明時別依錯誤假設制定計畫。|收支易空耗、功名較遲；對外變動與爭訟附記保留。
休整|放下過往糾纏與無效操心，保留身心與生活能力。|先處理可控制的負擔，必要時尋求现实支持。|功名與婚谈附記偏保留；病中意象不等於醫療診斷。
安定|先定心、選定做法，誠實而從容地完成工作。|維持穩定並接受合適提攜。|小財與大生意有別，功名仍需再努力，勿因吉意擴大風險。
暫守|計畫雖吸引人但條件未熟，先休整與重查隱含問題。|不要因別人催促而照做，保留判斷空間。|關係強勢會傷害相處，尊重双方選擇；不把病字當實際病情。
把握|正當努力與和合合作可以积极推进，成果可能較慢。|持续充實、取財有道並與人協調。|失物七日等是文化附記，未經事件資料計算不能視作期限。
修正|遮蔽再起时自省與再次準備，尋求可用的協助。|現有阻礙需要具體處理而非重複祈求。|婚談有不利及協調後可成兩條件；戶內象宜守，不推必然外出凶。
'''.strip().splitlines()
FIELDS = ['凡事','作事','家事','家運','婚姻','求兒','六甲','求財','功名','歲君','治病','出外','經商','來人','行舟','移居','失物','求雨','官事','六畜','耕作','築室','墳墓','討海','作塭','魚苗','月令','尋人','遠信']
FEATURES = {'supportive':r'大吉|清吉|吉慶|得利|有利|大利|如意|平安|和合|可成|允成|有成|得安|遂意', 'caution':r'不吉|不好|不佳|凶|危|險|難成|少吉|不足|無利|不遂|不可|不祥|破', 'waiting':r'待|遲|慢|晚|拖|暫|漸|先|後', 'assistance':r'貴人|提攜|扶|幫|長輩', 'harmony':r'和|團圓|成雙', 'effort':r'勤|用功|謹|守|尋', 'limited':r'輕|微|淡|小利|平平', 'conditional':r'若|如|則|者|無|有|再|二次|不則'}
def section(t,start,end):
 a=t.index(start)+len(start);ends=[i for s in end if (i:=t.find(s,a))>=0];return t[a:min(ends)] if ends else t[a:]
def main():
 assert len(REVIEW)==60
 text=(ROOT/'JS/oracle.js').read_text();p=json.JSONDecoder().raw_decode(text.split('var P = ',1)[1])[0]
 out=[];manifest=json.loads((SOURCE/'manifest.json').read_text())
 for poem,line in zip(p,REVIEW):
  n=poem['n'];t=(SOURCE/f'{n:02}.txt').read_text();h=(SOURCE/f'{n:02}.html').read_bytes();url=next(x['url'] for x in manifest if x['number']==n)
  assert poem['g'] in t[:180],(n,'wrong-page-title')
  body=section(t,'凡事',['籤詩故事']); start='凡事'+body; cats=[]
  for j,key in enumerate(FIELDS):
   m=re.search(re.escape(key)+r'\s*',start)
   if not m:
    cats.append({'name':key,'present':False,'textFeatureTags':[],'use':'source-field-absent-no-invention'});continue
   ends=[v.start() for k in FIELDS[j+1:]+['一、'] if (v:=re.search(re.escape(k)+r'\s*',start[m.end():]))]
   value=start[m.end():m.end()+min(ends)].strip() if ends else start[m.end():].strip()
   tags=[k for k,rx in FEATURES.items() if re.search(rx,value)]
   cats.append({'name':key,'present':True,'textFeatureTags':tags,'sourceTextSHA256':hashlib.sha256(value.encode()).hexdigest(),'traditionalTimingTokens':list(dict.fromkeys(re.findall(r'春|夏|秋|冬|月光|月暗|中旬|上下弦|半月|下半年|上半年|望後|(?:[一二三四五六七八九十子丑寅卯辰巳午未申酉戌亥]+)(?:月|日)',value))), 'use':'cultural-record-only' if key in ['求兒','六甲','治病','墳墓'] else 'literal-features-not-success-probability'})
  titles=re.findall(r'(?:^|\n)?[一二三四五六七八九十]+、([^\n]+)',body)
  mode,summary,condition,domains=line.split('|');audit=[]
  if n==5:audit.append('fs05舊網址轉到第6籤；補充資料採fs05-2。詩首兒／只異文沿原有校勘，原詩來源仍是香山財神廟。')
  if n==22:audit.append('本頁籤詩解析與第23籤相同且自稱丁酉；不納入該段。摘要採第22籤原詩、事項與本頁案例參考的太公段。')
  if n==28:audit.append('總體宜守、外出不利段與求財積極進取段不同向，摘要保留分歧，不刪掉反證。')
  if n==33:audit.append('解析後段與第13籤重複。本摘要採本詩及解析前段，不引用重複的命垣羅孛、生死年齡推斷。')
  if n in [15,23,40,41,43,60]:audit.append('本頁含不同情境或不同解法；條件逐項保留，不以總體吉凶覆蓋分歧。')
  absent=[x['name'] for x in cats if not x['present']]
  if absent:audit.append('本頁未刊以下事項：'+ '、'.join(absent)+'；不由別籤補造。')
  out.append({'number':n,'ganzhi':poem['g'],'canonicalPoem':poem['p'],'poemSource':poem['sourceUrl'],'supplementSource':url,'reviewedAt':'2026-10-02','sourceSHA256':hashlib.sha256(h).hexdigest(),'direction':mode,'summary':summary,'premises':condition,'domainNotes':domains,'categories':cats,'storyTitles':titles,'storyStatus':'廟方所列配籤典故名稱；不冒稱已完成歷史真偽考證','sourceAudit':audit,'editionMatch':'same-number-ganzhi-poem-with-explicit-variant' if n==5 else 'same-number-ganzhi-poem'})
 document={'schema':'jy.oracle-register/1','version':'20261003oracle1','profile':'DONGHAI_60_WITH_XIANGSHAN_5_POEM','scope':'六十甲子籤60首逐籤編輯摘要、完整29事項文字特徵、配籤典故名稱與來源異文；不是所有廟宇版本','policy':'摘要是本專案依所列廟方頁面逐籤整理；事項特徵是文字解析，不是吉凶計算定理。未收錄現代文章全文，文化時間詞不自動換算日曆。','records':out}
 (ROOT/'data/oracle').mkdir(parents=True,exist_ok=True);(ROOT/'data/oracle/temple-analysis-20261003.json').write_text(json.dumps(document,ensure_ascii=False,indent=2)+'\n')
 js='/* Individually reviewed temple register. Modern prose is independently summarized. */\n(function(root){\n"use strict";\nconst register='+json.dumps(document,ensure_ascii=False,separators=(',',':'))+';\nroot.JYOracleRegister=Object.freeze({version:register.version,profile:register.profile,scope:register.scope,policy:register.policy,get:n=>{const p=register.records.find(x=>x.number===n);return p?JSON.parse(JSON.stringify(p)):null;},all:()=>JSON.parse(JSON.stringify(register.records))});\n})(typeof window==="undefined"?globalThis:window);\n'
 (ROOT/'JS/oracle-register.js').write_text(js)
 print(json.dumps({'records':len(out),'categories':sum(len(x['categories']) for x in out),'storyTitles':sum(len(x['storyTitles']) for x in out),'sourceAudits':[x['number'] for x in out if x['sourceAudit']]}))
if __name__=='__main__':main()
