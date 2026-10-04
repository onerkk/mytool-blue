#!/usr/bin/env python3
"""Prepare the guarded R11 release from this complete R10-based project.

QA dependencies and browser downloads live outside the project and are not
included. Run after run-r11-validation.cjs and the final targeted tests.
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import zipfile
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT.parent.parent
DOC = ROOT / 'docs'
OUT = WORK / 'deliverables'
VERSION = '20261004native11'
NAMES = {
    'fullProject': 'mytool-full-project-20261004-r11.zip',
    'androidFullProject': 'mytool-full-project-20261004-r11.zip.down',
    'overlay': 'mytool-engines-20261004-r11.zip',
    'report': 'native-engine-status-20261004-r11.md',
}
EXCLUDED_META = {
    'docs/native-update-manifest-20261004-r11.json',
    'docs/release-files-20261004-r11.json',
    'docs/release-integrity-20261004-r11.json',
}


def read(name):
    return json.loads((ROOT / name).read_text())


def write(name, value):
    (ROOT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def now():
    return datetime.now(timezone.utc).isoformat()


def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def files():
    result = []
    for directory, dirs, names in os.walk(ROOT, followlinks=False):
        dirs[:] = [d for d in dirs if d not in {'node_modules', '__pycache__', '.git'}
                   and not (Path(directory) / d).is_symlink()]
        for name in names:
            path = Path(directory) / name
            if path.is_symlink():
                raise ValueError('Release cannot contain a file symlink: ' + str(path))
            result.append(path.relative_to(ROOT).as_posix())
    return sorted(result)


def require_pass(name):
    result = read(name)
    assert result.get('failed', 0) == 0, name
    if 'total' in result:
        assert result.get('passed', result.get('completed')) == result['total'], name
    for row in result.get('results', []):
        if 'status' in row:
            assert row['status'] == 'passed', (name, row)
        if 'pass' in row:
            assert row['pass'], (name, row)
    return result


def documents():
    reference = require_pass('docs/engine-and-reference-validation-20261004-r11.json')
    integrity = require_pass('docs/engine-integrity-validation-20261004-r10.json')
    assert len(reference['results']) == reference['passed'] == 18 and integrity['total'] == 45
    write('docs/engine-integrity-validation-20261004-r11.json', integrity)
    native = require_pass('docs/validation-20261004-r11-native-recheck.json')
    semantic = require_pass('docs/validation-20261004-r11-semantic-recheck.json')
    legacy = require_pass('docs/validation-20261004-r11-legacy.json')
    assert legacy['total'] == 78 and semantic['total'] == 12
    core = read('docs/validation-20261004-r11-core.json')
    if core['failed']:
        write('docs/validation-20261004-r11-core-initial.json', core)
    native_by_command = {r['command']: r for r in native['results']}
    updated = []
    for row in core['results']:
        if row['command'] in native_by_command and row['status'] == 'failed':
            row = dict(native_by_command[row['command']], firstAttempt=row)
        elif row['command'] == 'npm run test:r11':
            row = dict(row, log='docs/r11-final-targeted.log', finalGroups=18,
                       finalValidation='docs/engine-and-reference-validation-20261004-r11.json')
        elif row['command'] == 'npm run test:r10':
            row = dict(row, log='docs/r11-final-integrity.log', finalGroups=45,
                       finalValidation='docs/engine-integrity-validation-20261004-r11.json')
        assert row['status'] == 'passed'
        updated.append(row)
    core.update(results=updated, testedAt=now(), passed=7, failed=0,
                verificationMethod='The native combined prompt initially exceeded the unchanged 150000-character budget by 121. Cost-aware, lossless references fixed the excess. The entire native suite passed again. R11 and integrity checks also passed again after the final encoding changes; initial receipts are retained.')
    write('docs/validation-20261004-r11-core.json', core)
    for width in (390, 1280):
        require_pass(f'docs/validation-20261004-r11-browser-{width}.json')
        require_pass(f'docs/validation-20261004-r11-browser-visual-{width}.json')
    native_log = (ROOT / native['results'][0]['log']).read_text()
    native_groups = sum(line.startswith('PASS ') for line in native_log.splitlines())
    assert native_groups == 87, native_groups

    sources = read('docs/engine-source-catalog-20261004-r11.json')
    assert len(sources) == 70
    assert {s['id'] for s in sources if s.get('lastReviewedRelease') == VERSION} == {'qiongtong', 'pvradvanced'}
    scope = read('docs/native-scope-20261004-r10.json')
    scope.update(version=VERSION, testedAt=now(), sources=sources,
                 sourceReview='docs/engine-source-review-20261004-r11.md',
                 newValidation='docs/engine-and-reference-validation-20261004-r11.json',
                 arithmeticValidation='docs/engine-integrity-validation-20261004-r11.json')
    shared = '排除／否定人物範圍與跨子題代名詞一致；人物歧義保留候選；年齡原問與同次牌序不擅改'
    bazi = '窮通明示透干數量、年月日時柱與隔位逐條實算；不把日干算額外透干，不將字面命中當完整質性成立'
    vedic = 'Bhava教材矛盾雙公式、Hora/Ghati、時刻副星中點與起點口徑實算；31點位组×20分盤共620格完整可還原'
    audit_by_method = {a['method']: a for a in integrity['audits']}
    for kind, method in scope['methods'].items():
        method['implemented'].append(shared)
        method['lastSampleArithmeticAudit'] = audit_by_method[kind]
        if kind == 'bazi':
            method['implemented'].append(bazi)
            method['sampleCoverage']['qiongtongLiteralVersion'] = '20261004qiongtong4'
        if kind == 'vedic':
            method['implemented'].append(vedic)
            method['sampleCoverage'].update(specialLagnaFormulaModels=4, timedUpagrahaProfiles=2,
                                           timedPointsPerProfile=6, specialPointVargas=20,
                                           specialPointCells=620)
            method['evidenceLimits'].append('PVR Bhava引言與程序／印例矛盾保留雙算法，不能假稱唯一原典答案')
        method['evidenceLimits'].append('人物解析仍需處理語言歧義；沒有自動推知真實人物、年齡或第三人意願')
    scope['promptDelivery'].update(version='20261004prompt11',
        verification='docs/engine-integrity-validation-20261004-r11.json',
        referenceVerification='docs/engine-and-reference-validation-20261004-r11.json',
        dataPreservation=scope['promptDelivery']['dataPreservation'] + ' 特殊點620格矩陣可逐欄還原；長指標不比原值短時保留原值。',
        sameCast='舊人物注記錯綁時只修注記，保留原問題、原牌序、牌位及方向；精確年齡不能擅改問相對年齡或假称重抽')
    write('docs/native-scope-20261004-r11.json', scope)
    write('docs/native-scope-20261003.json', scope)
    coverage = read('data/engine-rule-coverage.json')
    coverage.update(release=VERSION, sourceReview='docs/engine-source-review-20261004-r11.md',
                    sourceReviewLatest='docs/native-scope-20261004-r11.json',
                    promptDeliveryVerification='docs/engine-integrity-validation-20261004-r11.json',
                    arithmeticAudit='docs/engine-integrity-validation-20261004-r11.json',
                    integrationVerificationR11=[f'docs/validation-20261004-r11-browser-{w}.json' for w in (390,1280)],
                    referenceVerification='docs/engine-and-reference-validation-20261004-r11.json')
    for method in coverage['methods']:
        method['implemented'].append(shared)
        if method['method'] == 'bazi': method['implemented'].append(bazi)
        if method['method'] == 'vedic': method['implemented'].append(vedic)
        method['implemented'] = list(dict.fromkeys(method['implemented']))
    write('data/engine-rule-coverage.json', coverage)

    labels = {'bazi':'八字','ziwei':'紫微','astro':'西洋占星','vedic':'印度占星','liuren':'六壬',
              'liuyao':'六爻','yijing':'易經','meihua':'梅花','name':'姓名','compat':'合盤',
              'personality':'人格','tarot':'塔羅','lenormand':'雷諾曼','ootk':'開鑰','oracle':'靈籤'}
    descriptions = {
        'bazi':'四柱、藏干十神根氣、格局救應、窮通120入口、小運與歲運交界；新增數量／柱位／隔位',
        'ziwei':'十二宮安星、三方四正、四化與宮干飛化、具名北派作用及多層運限',
        'astro':'行星、交點、五宮制、尊貴接納、行運次限回歸遷居、卜卦受阻與月亮全座模型',
        'vedic':'九曜、20分盤、六力宮力、AV、具名運法及歲時；新增副星口徑與620格特殊點',
        'liuren':'天地盤、天將、四課三傳九宗門、64課族、290神煞及天文時計／候選日',
        'liuyao':'八宮納甲、世應伏神、六親六神、月日空破墓、動變與有界應期',
        'yijing':'64卦384爻、原典彖象文言、朱子動爻、本之互綜錯與納甲',
        'meihua':'數字／時間／漢字起卦、原體、本互變、季節作用與印本數例',
        'name':'逐字筆畫與音義、五格與三才異表、原名及全部候選比較',
        'compat':'雙人各自八字／紫微、有方向作用與同期運限；未知輸入不造盤',
        'personality':'本站五軸32型、原始數值與選邊索引；不冒充經驗證心理測驗',
        'tarot':'78牌、原牌序、正逆位、具名牌陣與RWS／BookT分流',
        'lenormand':'36牌、分支、九宮及兩種大牌陣、合法鏡像與騎士步；人物指向本輪修正',
        'ootk':'五輪真實操作、代表牌、計數配對、元素尊貴與程序停止',
        'oracle':'60首原詩、逐籤版本、事項欄索引、抽籤與三聖筊；原廟缺文不造補',
    }
    method_rows = '\n'.join(f'| {labels[k]} | {descriptions[k]} | 通過 |' for k in labels)
    prompt_rows = '\n'.join(f"| {labels[p['method']]} | {p['characters']:,} | {p['parts']} | 否 |" for p in integrity['prompts'])
    audit_checks = sum(a.get('checks', 0) for a in integrity['audits'])
    text = f'''# R11 完整專案：人物錯綁修正與新增實算

版本 `{VERSION}`／`prompt11`／`brief11`，SW120。這是保留全部原素材、15個現有方法、累積修正與本輪新增計算的完整專案。本次具體修正與通過證據如下；仍需質性判讀、原典矛盾或未採用的歷史流派照實列明。

## 截圖問題的實際修正

原問題「年底前會出現非現任的肉體桃花嗎？她幾歲？」曾出現兩層模型不一致：子題把「非現任」中的「現任」當成人物，另一層則把她當尚未確認的新對象。現在「非現任」保留排除條件，「她」指回同一個被詢問的對象；不假稱這個人已經存在。

- 問題解析、人物圖、牌陣分支與預設完整純文字提示詞使用一致的指向與排除條件。明示現任、切回現任、多位女性和複數對象另有回歸案例，歧義不強定一人。
- 「她幾歲」仍保留精確年齡原問；資料不能支持精確歲數時明示不能確定，不擅改問「比我年輕嗎」，也不把牌號或宮位換成年齡。
- 舊紀錄若含錯誤人物注記，輸出會列出應修正的注記，保留原問題、原牌序、牌位及方向。修正注記不等於重抽；瀏覽器同次複製兩遍已比對實際牌號。
- 實際预設複製路径原先還漏掉人物約束，已一起補上。15個方法的正文與備援資料均驗證，沒有只改開發測試路徑。

## 本輪真正新增的引擎計算

八字核對《窮通寶鑑》指定段落，補上透干數量、指定柱位與隔位條件。二壬一庚不能只看有壬庚；丁出時干不能借年干丁；隔位按實際柱距核對，不直接宣布已解除合。120入口沿用同一條文核對器，所有背景與未定質性仍保留。

印度占星核對 PVR 作者教材，補上 Bhava 引言與印例矛盾的雙公式、時刻副星段中點與註腳段起點的兩個口徑，以及全部特殊點的20分盤星座及宮位。4個所選Lagna＋4個公式模型＋11個Upagraha＋兩版各6個時刻點，共620格完整實排。未知時辰或缺少真實日出日落不製造這些時刻點。

本次重新核對的是兩份命理文獻的上述指定段落；累積來源70筆，沒有冒稱本輪重新讀完70本全文。具體URL、算法與原典矛盾見 `engine-source-review-20261004-r11.md` 和 `engine-source-catalog-20261004-r11.json`。

## 15個現有方法與入口

| 方法 | 本版已交付的具名計算範圍 | 390手機／1280桌面 |
|---|---|---|
{method_rows}

R11所有方法共享人物／子題约束修正；新命理算法集中在本輪有原文與數例支持的八字、印度占星兩項。其餘方法的既有實算與界線保留，沒有把共用提示詞修正冒稱新增所有流派。

## 完整純文字與操作介面

預設複製完整文字，不要求上傳附件或購買AI。長文以同份正文分段，按段號貼齊後才分析；各段至多8,000 Unicode碼點、20,000 UTF-8位元組。這是本站保守分段政策，不保證任何AI的總上下文無限。明示所問詳細分盤或全部運期時仍保留已計算細表，未算年份明列。

本輪特殊點改為可還原矩陣，全部620格逐欄比對原值；重複政策只列首次完整值，參照比原值長則保留原值。雙人四盤合併提示詞原150,000字門檻通過，沒有提高門檻或刪除證據。原始精度仍在排盤JSON；閱讀用一般數值顯示至小數4位。

下列為同一固定盤例、問題「本次工作或關係該如何調整？」的实际正文，並非所有輸入的最大長度：

| 方法 | 正文字數（Unicode碼點） | 段數 | 附件必要 |
|---|---:|---:|---|
{prompt_rows}

手鍊引導與指定[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)連結保留並通過測試。理由須來自本題有效盤面、佩戴者及行動，不憑單張牌指定礦物，不捏造庫存、價格或療效，不承諾改運。程序中止或無有效盤面時不假推薦。最後兩行仍是賣場連結與「願你諸事順遂。」

手機和桌面各24個操作異常流程本輪重跑，包含缺CSS、主題、WebGL、動畫退出及返回；操作列可繼續使用。實際準備頁截圖可見「展開完整牌陣」。測試是本機Chrome for Testing 141的真實網頁操作，計數API用固定回應，不是假造遠端AI分析，也不是實體Android認證。

## 本輪驗證

| 驗證 | 實際通過 | 紀錄 |
|---|---:|---|
| R11人物／原文數例／無損還原／15方法複製 | 18組 | engine-and-reference-validation-20261004-r11.json |
| 完整性／錯盤阻擋／15原生資料與正文 | 45組，固定盤例{audit_checks}條查核 | engine-integrity-validation-20261004-r11.json |
| 根氣位置與BPHS原例 | 32組 | qa-r11-core/03.log |
| 補充算法與條文 | 57組 | qa-r11-core/04.log |
| 提示詞／月亮光圈／受阻 | 25＋5＋17組 | qa-r11-core/05.log |
| R8算法／推薦與操作返回 | 12組＋9方法 | qa-r11-core/06.log |
| 原生排盤、獨立印例與星曆交界 | 87組 | qa-r11-native-recheck/01.log |
| 原有回歸 | 78個命令 | validation-20261004-r11-legacy.json |
| 最後人物語法更新後的受影響回歸 | 12個命令 | validation-20261004-r11-semantic-recheck.json |
| 实际排盤／JSON／複製入口 | 每寬19案例，涵蓋15方法 | validation-20261004-r11-browser-390/1280.json及入口細表 |
| 实际同次抽牌與人物指向 | 每寬2案例 | question-reference-browser-20261004-r11-390/1280.json |
| 操作異常流程 | 每寬24案例 | validation-20261004-r11-browser-visual-390/1280.json及ritual细表 |

8個獨立Swiss固定盤與64個太陽月亮交界本輪重跑；先前166個全盤時點紀錄保留，沒有冒稱再重算166點。全程初次失敗與重查日誌保留：原有回歸9個命令缺QA依賴、1個舊版本斷言，補齊測試環境／更新實際版本後重查通過；新增資料使合併提示詞超出舊門檻121字，已用無損參照修正並重跑整個原生套件。新人物與預設正文遺漏亦有失敗重現及修正後紀錄。

發布另查程式語法、生成副本、根目錄鏡像、兩份SW120一致、所有R10檔案及原素材雜湊。每檔清單與界線見 `release-files-20261004-r11.json`、`release-integrity-20261004-r11.json`、`native-scope-20261004-r11.json`。

## 明列的界線

- 窮通強弱、清濁、得所、有效制化及整句古典斷語仍需綜合判讀；本輪數量／柱位命中不等於整句條件成立。
- Bhava公式矛盾分算；BPHS兩日／12ghatika名義時計差異也保留，沒有捏造唯一原典答案。
- 未採用的其他Dasha、Yoga、外格、人元司事、四化、神煞、漢易及各歷史占法不冒稱全部實作。Mathers末圈為具名重建；缺文與人物未知資訊不造補。
- 人物解析仍可能遇到語言歧義；排盤與算術測試通過不能保證所有自然語言、外部AI回答或現實預測零錯。

## 下載與使用

- 完整專案：`{NAMES['fullProject']}`，解壓得到 `mytool-blue-master`，包含原素材與累積修正。
- Android替代：`{NAMES['androidFullProject']}`，與完整ZIP位元相同；只移除檔名末尾 `.down` 再解壓。
- 可選累積更新：`{NAMES['overlay']}`，合併覆蓋原專案根目錄；這份不是完整素材包。

SW120；尚未部署線上網站。可重跑 `npm run test:r11`、`test:r10`、`test:r9`、`test:native`、`test:completion`、`test:prompt-budget`、`test:r8`。先安裝專案列出的測試依賴；瀏覽器測試另需Playwright與Chromium（`JY_CHROMIUM`可指定執行檔）。歷史報告留作版本證據，最新現況以本R11說明與scope為準。
'''
    (DOC / NAMES['report']).write_text(text)
    print(json.dumps({'stage':'documents','sources':len(sources),'R11':18,'integrity':45,
                      'native':native_groups,'legacyCommands':78,'sampleChecks':audit_checks}))


def package():
    baseline = json.loads((WORK / 'r10-baseline-sha.json').read_text())
    previous = read('docs/native-update-manifest-20261004-r10.json')
    initial = files()
    missing = sorted(set(baseline) - set(initial))
    assert not missing, missing
    hashes = {name:sha(ROOT/name) for name in initial}
    assets = [name for name in baseline if name.startswith(('assets/','IMG/','img/','images/','CSS/'))
              or (not name.startswith('docs/') and Path(name).suffix.lower() in {'.png','.jpg','.jpeg','.webp','.svg','.mp3','.glb','.woff','.woff2'})]
    assert all(hashes[name] == baseline[name] for name in assets), 'Original asset changed'
    changed = set(previous['changedFiles']) | {name for name in initial if baseline.get(name) != hashes[name]}
    syntax = sorted(name for name in changed if Path(name).suffix in {'.js','.cjs','.mjs'})
    for name in syntax:
        result = subprocess.run(['node','--check',str(ROOT/name)],capture_output=True,text=True)
        assert result.returncode == 0, (name,result.stderr)
    subprocess.run(['node','scripts/build-question-planner.cjs','--check'],cwd=ROOT,check=True)
    subprocess.run(['node','scripts/sync-recommendation-guides.cjs','--check'],cwd=ROOT,check=True)
    mirrors = []
    for path in sorted((ROOT/'JS').glob('*.js')):
        mirror = ROOT/path.name
        if mirror.exists():
            assert path.read_bytes() == mirror.read_bytes(), path.name
            mirrors.append(path.name)
    assert (ROOT/'sw.js').read_bytes() == (ROOT/'JS/sw.js').read_bytes()
    assert "const CACHE_NAME = 'jy-main-v120'" in (ROOT/'sw.js').read_text()
    write('docs/syntax-validation-20261004-r11.json',
          {'testedAt':now(),'version':VERSION,'passed':len(syntax),'total':len(syntax),
           'files':syntax,'method':'node --check on cumulative modified/new JavaScript; generated copies checked separately'})
    changed.update(EXCLUDED_META)
    changed.add('docs/syntax-validation-20261004-r11.json')
    tests = {
        'core':'docs/validation-20261004-r11-core.json',
        'R11':'docs/engine-and-reference-validation-20261004-r11.json',
        'integrity':'docs/engine-integrity-validation-20261004-r11.json',
        'legacy':'docs/validation-20261004-r11-legacy.json',
        'semantics':'docs/validation-20261004-r11-semantic-recheck.json',
        'browser':[f'docs/validation-20261004-r11-browser-{w}.json' for w in (390,1280)],
        'visual':[f'docs/validation-20261004-r11-browser-visual-{w}.json' for w in (390,1280)],
        'syntax':'docs/syntax-validation-20261004-r11.json',
    }
    release = dict(release=VERSION,cache='jy-main-v120',generatedAt=now(),
                   baseFiles=834,recoveredR10Files=len(baseline),changedFiles=sorted(changed),
                   sourceCount=70,tests=tests,coverageReport='docs/'+NAMES['report'],
                   **{k:v for k,v in NAMES.items() if k!='report'})
    write('docs/native-update-manifest-20261004-r11.json',release)
    record = dict(release=VERSION,cache='jy-main-v120',baseArchive=read('docs/release-files-20261004-r10.json')['baseArchive'],
                  packageType='complete-project-plus-optional-cumulative-overlay',
                  **{k:v for k,v in NAMES.items() if k!='report'},baseFileCount=834,
                  previousReleaseFilesRetained=len(baseline),
                  install='Full: extract mytool-blue-master. Optional cumulative overlay: merge at original root. Android .zip.down: remove only final .down.',
                  coverage='15 existing methods and named profiles; see docs/'+NAMES['report'],
                  generatedAt=now(),manifestExcludedFromOwnHashes=sorted(EXCLUDED_META),tests=tests,
                  files=[{'path':name,'bytes':(ROOT/name).stat().st_size,'sha256':sha(ROOT/name)} for name in files() if name not in EXCLUDED_META])
    write('docs/release-files-20261004-r11.json',record)
    write('docs/release-integrity-20261004-r11.json',
          {'release':VERSION,'checkedAt':now(),'sourceFilesRetained':len(baseline),
           'base834Retention':'All 1433 recovered R10 files retained, including its validated original834 files. Original834 was not downloaded again in R11.',
           'originalAssetsChecked':len(assets),'originalAssetHashMismatches':0,
           'mirrorCount':len(mirrors),'mirrors':mirrors,'mirrorMismatches':0,
           'serviceWorkerCopiesEqual':True,'cache':'jy-main-v120','syntaxFiles':len(syntax),
           'testReceipts':tests,'archiveVerification':'Build script requires safe unique paths, exact expected members, CRC success and per-file SHA256 before handing off. Post-build full archive hashes are in the standalone release report.',
           'runtimeDependencyPolicy':'QA-only node_modules symlink, Chromium binaries, font downloads and temporary files are excluded.'})

    complete = files()
    assert set(changed).issubset(set(complete)), sorted(set(changed)-set(complete))
    expected = {name:sha(ROOT/name) for name in complete}
    OUT.mkdir(exist_ok=True)
    archive_results = []
    for key, names, prefix in [('fullProject',complete,'mytool-blue-master/'),('overlay',sorted(changed),'')]:
        output = OUT/NAMES[key]
        with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6,allowZip64=True) as archive:
            for name in names: archive.write(ROOT/name,prefix+name)
        with zipfile.ZipFile(output) as archive:
            members=archive.namelist()
            assert len(members)==len(set(members))==len(names)
            assert set(members)=={prefix+name for name in names}
            assert all(not m.startswith('/') and '..' not in Path(m).parts for m in members)
            assert archive.testzip() is None
            for name in names:
                assert hashlib.sha256(archive.read(prefix+name)).hexdigest()==expected[name],name
        result={'kind':key,'filename':output.name,'files':len(names),'bytes':output.stat().st_size,
                'sha256':sha(output),'safePaths':True,'crcPassed':True,'perFileSHA256Passed':True}
        archive_results.append(result)
        print(json.dumps(result),flush=True)
    android=OUT/NAMES['androidFullProject']
    shutil.copyfile(OUT/NAMES['fullProject'],android)
    assert sha(android)==archive_results[0]['sha256']
    archive_results.append({'kind':'androidFullProject','filename':android.name,'bytes':android.stat().st_size,
                            'sha256':sha(android),'byteIdenticalToFullProject':True})
    report=(DOC/NAMES['report']).read_text()
    report+='\n## 發布後封裝校驗\n\n'
    for row in archive_results:
        report+=f"- `{row['filename']}`：{row['bytes']:,} bytes；SHA256 `{row['sha256']}`。\n"
    report+=f'\n完整專案{len(complete)}檔，累積更新{len(changed)}檔；安全路徑、CRC與逐檔SHA256均通過。原素材{len(assets)}檔與R10雜湊相同；{len(mirrors)}份根目錄鏡像與SW120兩份一致；{len(syntax)}份程式語法通過。\n'
    (OUT/NAMES['report']).write_text(report)
    (OUT/'archive-verification-20261004-r11.json').write_text(json.dumps({'release':VERSION,'checkedAt':now(),'archives':archive_results},indent=2))
    print(json.dumps({'stage':'release-complete','directory':str(OUT),'files':len(complete),
                      'overlayFiles':len(changed),'syntax':len(syntax),'assetsUnchanged':len(assets),
                      'mirrors':len(mirrors)}),flush=True)


if __name__=='__main__':
    os.chdir(ROOT)
    stage=sys.argv[1] if len(sys.argv)>1 else 'all'
    if stage in ('all','documents'): documents()
    if stage in ('all','package'): package()
