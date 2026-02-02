
// ==========================================
// Samsung S25 / Samsung Browser 單指滑動修正（僅 Samsung 生效）
// ==========================================
function isSamsungLike() {
  var ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  return /SamsungBrowser/i.test(ua) || /SM-/i.test(ua) || /SEC\//i.test(ua) || (/Android/i.test(ua) && /Chrome/i.test(ua) && /Samsung/i.test(ua));
}
window.__IS_SAMSUNG__ = isSamsungLike();

// === PATCH v4: safe text helper to avoid undefined ===
function safeText(v, fallback='—'){
  if(v===undefined || v===null || v==='undefined') return fallback;
  return v;
}
/**
 * 靜月之光能量占卜儀 v2.0 - 最終融合完整版
 * 包含：
 * 1. 完整城市資料庫 (TW/CN/HK/MO) 與真太陽時連動
 * 2. 塔羅牌擬真洗牌、環形抽牌、圖片路徑修正
 * 3. 八字排盤、大運流年
 * 4. 梅花易數 (64卦名)
 */

// ==========================================
// 1. 全局數據定義
// ==========================================
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const WUXING_MAP = {
    '甲':'木', '乙':'木', '寅':'木', '卯':'木',
    '丙':'火', '丁':'火', '巳':'火', '午':'火',
    '戊':'土', '己':'土', '辰':'土', '戌':'土', '丑':'土', '未':'土',
    '庚':'金', '辛':'金', '申':'金', '酉':'金',
    '壬':'水', '癸':'水', '亥':'水', '子':'水'
};

// ==========================================
// 十神計算器類
// ==========================================
class TenGodsCalculator {
    constructor() {
        this.TEN_GODS_MAP = {
            'same_element_same_yinyang': '比肩',
            'same_element_diff_yinyang': '劫財',
            'generate_me_same_yinyang': '偏印',
            'generate_me_diff_yinyang': '正印',
            'i_generate_same_yinyang': '食神',
            'i_generate_diff_yinyang': '傷官',
            'control_me_same_yinyang': '七殺',
            'control_me_diff_yinyang': '正官',
            'i_control_same_yinyang': '偏財',
            'i_control_diff_yinyang': '正財'
        };
    }
    
    // 獲取天干的五行和陰陽
    getHeavenlyStemInfo(stem) {
        const element = WUXING_MAP[stem] || '';
        const yangGan = ['甲', '丙', '戊', '庚', '壬'];
        const yinyang = yangGan.includes(stem) ? '陽' : '陰';
        return { element, yinyang };
    }
    
    // 獲取五行關係
    getElementRelation(dayElement, targetElement) {
        const generation = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
        const control = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
        
        if (dayElement === targetElement) {
            return 'same_element';
        } else if (generation[dayElement] === targetElement) {
            return 'i_generate';
        } else if (generation[targetElement] === dayElement) {
            return 'generate_me';
        } else if (control[dayElement] === targetElement) {
            return 'i_control';
        } else if (control[targetElement] === dayElement) {
            return 'control_me';
        }
        
        return 'unknown';
    }
    
    // 計算十神
    calculate(dayStem, targetStem) {
        if (!dayStem || !targetStem) return '未知';
        
        const day = this.getHeavenlyStemInfo(dayStem);
        const target = this.getHeavenlyStemInfo(targetStem);
        
        // 五行生剋關係
        const elementRelation = this.getElementRelation(day.element, target.element);
        
        // 陰陽關係
        const yinyangRelation = (day.yinyang === target.yinyang) ? 'same_yinyang' : 'diff_yinyang';
        
        // 組合關係鍵值
        const relationKey = `${elementRelation}_${yinyangRelation}`;
        
        return this.TEN_GODS_MAP[relationKey] || '未知';
    }
}

// ==========================================
// 藏干分析器類
// ==========================================
class HiddenStemsAnalyzer {
    constructor() {
        this.strengthRules = {
            '本氣': 1.0,
            '中氣': 0.7,
            '餘氣': 0.3,
            '墓氣': 0.3
        };
        
        // 地支藏干強度分配
        this.strengthDistribution = {
            '子': ['本氣'],
            '丑': ['本氣', '餘氣', '墓氣'],
            '寅': ['本氣', '中氣', '餘氣'],
            '卯': ['本氣'],
            '辰': ['本氣', '餘氣', '墓氣'],
            '巳': ['本氣', '中氣', '餘氣'],
            '午': ['本氣', '餘氣'],
            '未': ['本氣', '餘氣', '墓氣'],
            '申': ['本氣', '中氣', '餘氣'],
            '酉': ['本氣'],
            '戌': ['本氣', '餘氣', '墓氣'],
            '亥': ['本氣', '餘氣']
        };
        
        // 地支藏干對照表（從 bazi-system.js 或 data.js 獲取）
        this.hiddenStemsMap = {
            '子': ['癸'],
            '丑': ['己', '癸', '辛'],
            '寅': ['甲', '丙', '戊'],
            '卯': ['乙'],
            '辰': ['戊', '乙', '癸'],
            '巳': ['丙', '庚', '戊'],
            '午': ['丁', '己'],
            '未': ['己', '丁', '乙'],
            '申': ['庚', '壬', '戊'],
            '酉': ['辛'],
            '戌': ['戊', '辛', '丁'],
            '亥': ['壬', '甲']
        };
    }
    
    // 分析地支藏干
    analyzeBranch(branch, monthBranch = null) {
        if (!branch) return null;
        
        const hiddenStems = this.hiddenStemsMap[branch] || [];
        const strengthDist = this.strengthDistribution[branch] || [];
        
        const result = {
            '地支': branch,
            '五行': WUXING_MAP[branch] || '',
            '藏干': []
        };
        
        hiddenStems.forEach((stem, index) => {
            const strengthType = strengthDist[index] || '餘氣';
            const strength = this.strengthRules[strengthType] || 0.3;
            
            result['藏干'].push({
                '天干': stem,
                '五行': WUXING_MAP[stem] || '',
                '強度': strength,
                '類別': strengthType
            });
        });
        
        return result;
    }
    
    // 獲取藏干列表（簡化版，返回天干數組）
    getHiddenStems(branch) {
        return this.hiddenStemsMap[branch] || [];
    }
}

const BAGUA_DATA = {
    1: { name: '乾', symbol: '☰', nature: '天', lines: [1,1,1] },
    2: { name: '兌', symbol: '☱', nature: '澤', lines: [0,1,1] },
    3: { name: '離', symbol: '☲', nature: '火', lines: [1,0,1] },
    4: { name: '震', symbol: '☳', nature: '雷', lines: [0,0,1] },
    5: { name: '巽', symbol: '☴', nature: '風', lines: [1,1,0] },
    6: { name: '坎', symbol: '☵', nature: '水', lines: [0,1,0] },
    7: { name: '艮', symbol: '☶', nature: '山', lines: [1,0,0] },
    8: { name: '坤', symbol: '☷', nature: '地', lines: [0,0,0] }
};

const HEXAGRAM_NAMES = {
    '1_1': '乾為天', '1_2': '天澤履', '1_3': '天火同人', '1_4': '天雷無妄', '1_5': '天風姤', '1_6': '天水訟', '1_7': '天山遯', '1_8': '天地否',
    '2_1': '澤天夬', '2_2': '兌為澤', '2_3': '澤火革', '2_4': '澤雷隨', '2_5': '澤風大過', '2_6': '澤水困', '2_7': '澤山咸', '2_8': '澤地萃',
    '3_1': '火天大有', '3_2': '火澤睽', '3_3': '離為火', '3_4': '火雷噬嗑', '3_5': '火風鼎', '3_6': '火水未濟', '3_7': '火山旅', '3_8': '火地晉',
    '4_1': '雷天大壯', '4_2': '雷澤歸妹', '4_3': '雷火豐', '4_4': '震為雷', '4_5': '雷風恆', '4_6': '雷水解', '4_7': '雷山小過', '4_8': '雷地豫',
    '5_1': '風天小畜', '5_2': '風澤中孚', '5_3': '風火家人', '5_4': '風雷益', '5_5': '巽為風', '5_6': '風水渙', '5_7': '風山漸', '5_8': '風地觀',
    '6_1': '水天需', '6_2': '水澤節', '6_3': '水火既濟', '6_4': '水雷屯', '6_5': '水風井', '6_6': '坎為水', '6_7': '水山蹇', '6_8': '水地比',
    '7_1': '山天大畜', '7_2': '山澤損', '7_3': '山火賁', '7_4': '山雷頤', '7_5': '山風蠱', '7_6': '山水蒙', '7_7': '艮為山', '7_8': '山地剝',
    '8_1': '地天泰', '8_2': '地澤臨', '8_3': '地火明夷', '8_4': '地雷復', '8_5': '地風升', '8_6': '地水師', '8_7': '地山謙', '8_8': '坤為地'
};

// --- 塔羅牌數據 (對應 images/major_0.jpg 等) ---
const TAROT_CARDS = [];
const MAJORS_CN = ['愚人','魔術師','女祭司','皇后','皇帝','教皇','戀人','戰車','力量','隱士','命運之輪','正義','吊人','死神','節制','惡魔','高塔','星星','月亮','太陽','審判','世界'];
const SUITS_INFO = [
    { id: 'cups', name: '聖杯' }, 
    { id: 'pentacles', name: '錢幣' }, 
    { id: 'swords', name: '寶劍' }, 
    { id: 'wands', name: '權杖' }
];

// 生成塔羅牌數據
MAJORS_CN.forEach((name, i) => {
    TAROT_CARDS.push({ id: `major_${i}`, name: name, type: 'major', image: `images/major_${i}.jpg` });
});
SUITS_INFO.forEach(suit => {
    for (let i = 1; i <= 14; i++) {
        let rankName = (i===1)?'王牌':(i<=10)?['二','三','四','五','六','七','八','九','十'][i-2]:['侍者','騎士','皇后','國王'][i-11];
        // 特殊處理：權杖11的圖片文件名是 wands11.jpg（沒有底線）
        let imagePath = `images/${suit.id}_${i}.jpg`;
        if (suit.id === 'wands' && i === 11) {
            imagePath = 'images/wands11.jpg';
        }
        TAROT_CARDS.push({ id: `${suit.id}_${i}`, name: `${suit.name}${rankName}`, type: 'minor', suit: suit.name, image: imagePath });
    }
});

// ==========================================
// 2. 系統初始化
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // 確保頁面可捲動：清除 body 上可能殘留的 inline style（例如模態未正確關閉）
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('width');
    
    // Samsung 專用：加 class、全層 touch-action: pan-y、#page-scroll 強制可捲動（僅 Samsung 生效）
    if (window.__IS_SAMSUNG__) {
      document.documentElement.classList.add('samsung-scroll-fix');
      document.documentElement.style.touchAction = 'pan-y';
      document.body.style.touchAction = 'pan-y';
      var ps = document.getElementById('page-scroll');
      if (ps) {
        ps.style.touchAction = 'pan-y';
        ps.style.webkitOverflowScrolling = 'touch';
        ps.style.overflowY = 'auto';
      }
    }
    
    const system = new FortuneSystem();
    system.init();
    window.fortuneSystem = system;
    
    // 初始化城市 (修復重點)
    initCityAndSolarTime();
    
    bindEvents();
    
    // 懸浮鈕：每個頁面都顯示（強制顯示）
    ensureFloatingButtonsVisible();
    
    if (window.__IS_SAMSUNG__) console.log('靜月之光能量占卜儀 v2.0 已就緒 [Samsung 單指滑動修正已套用]');
    else console.log('靜月之光能量占卜儀 v2.0 已就緒');
});

/** Samsung 專用：在 console 印出 overflow/touch-action/鎖定來源，供 S25U 驗證 */
function debugScroll() {
  if (!window.__IS_SAMSUNG__) {
    console.log('[debugScroll] 非 Samsung 裝置，未套用 Samsung 修正');
    return;
  }
  var html = document.documentElement;
  var body = document.body;
  var ps = document.getElementById('page-scroll');
  var htmlStyle = html && window.getComputedStyle ? getComputedStyle(html) : null;
  var bodyStyle = body && window.getComputedStyle ? getComputedStyle(body) : null;
  console.log('[debugScroll] __IS_SAMSUNG__:', window.__IS_SAMSUNG__);
  console.log('[debugScroll] html.samsung-scroll-fix:', html && html.classList.contains('samsung-scroll-fix'));
  console.log('[debugScroll] html overflow:', htmlStyle ? htmlStyle.overflowY : html.style.overflow);
  console.log('[debugScroll] body overflow:', bodyStyle ? bodyStyle.overflowY : body.style.overflow);
  console.log('[debugScroll] body touch-action:', bodyStyle ? bodyStyle.touchAction : body.style.touchAction);
  console.log('[debugScroll] #page-scroll:', ps ? '存在' : '不存在', ps ? 'overflowY=' + getComputedStyle(ps).overflowY : '');
  console.log('[debugScroll] 本專案無 document/window/body 的 touchmove preventDefault 全域監聽');
}

if (typeof window !== 'undefined') window.debugScroll = debugScroll;

/** 強制懸浮鈕（蝦皮/賣貨便/客製）在每個頁面都顯示，覆蓋任何隱藏用的 CSS */
function ensureFloatingButtonsVisible() {
    const el = document.getElementById('floating-buttons') || document.querySelector('.floating-buttons');
    if (el) {
        el.style.setProperty('display', 'flex', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        el.style.setProperty('pointer-events', 'auto', 'important');
        el.style.setProperty('opacity', '1', 'important');
    }
}

// ==========================================
// 3. 城市與真太陽時連動 (完整資料庫)
// ==========================================
function initCityAndSolarTime() {
    const countrySelect = document.getElementById('birth-country');
    const citySelect = document.getElementById('birth-city');
    const coordInfo = document.getElementById('city-coordinates');
    const timeInput = document.getElementById('birth-time');
    const dateInput = document.getElementById('birth-date');
    
    // 完整的城市資料
    const CITIES = {
        'TW': [
            {n:'台北市', lat:25.0330, lng:121.5654}, {n:'新北市', lat:25.0172, lng:121.4625}, {n:'桃園市', lat:24.9936, lng:121.3009},
            {n:'台中市', lat:24.1477, lng:120.6736}, {n:'台南市', lat:22.9997, lng:120.288}, {n:'高雄市', lat:22.6273, lng:120.3014},
            {n:'基隆市', lat:25.1276, lng:121.7392}, {n:'新竹市', lat:24.8138, lng:120.9675}, {n:'嘉義市', lat:23.4800, lng:120.4491},
            {n:'宜蘭縣', lat:24.7595, lng:121.7511}, {n:'花蓮縣', lat:23.9872, lng:121.6016}, {n:'台東縣', lat:22.7583, lng:121.1444},
            {n:'南投縣', lat:23.9037, lng:120.6894}, {n:'雲林縣', lat:23.7092, lng:120.4313}, {n:'苗栗縣', lat:24.5602, lng:120.8214},
            {n:'彰化縣', lat:24.0518, lng:120.5161}, {n:'屏東縣', lat:22.6741, lng:120.4927}
        ],
        'CN': [
            {n:'北京', lat:39.9042, lng:116.4074}, {n:'上海', lat:31.2304, lng:121.4737}, {n:'廣州', lat:23.1291, lng:113.2644},
            {n:'深圳', lat:22.5431, lng:114.0579}, {n:'重慶', lat:29.5630, lng:106.5516}, {n:'成都', lat:30.5728, lng:104.0668},
            {n:'武漢', lat:30.5928, lng:114.3055}, {n:'天津', lat:39.0842, lng:117.2009}
        ],
        'HK': [
            {n:'香港 (通用)', lat:22.3193, lng:114.1694}, {n:'香港島', lat:22.2783, lng:114.1747},
            {n:'九龍', lat:22.3155, lng:114.1755}, {n:'新界', lat:22.3780, lng:114.1196}
        ],
        'MO': [{n:'澳門', lat:22.1987, lng:113.5439}],
        'other': [{n:'其他地區（預設東經120°）', lat:25.0, lng:120.0}]
    };

    function calculateSolarTime() {
        const timeVal = timeInput.value;
        const dateVal = dateInput.value;
        const lngSpan = document.getElementById('longitude');
        const lngText = lngSpan ? lngSpan.innerText : '';
        const trueSolarDisplay = document.getElementById('true-solar-time-display');
        const timeDiffDisplay = document.getElementById('time-diff');
        const finalTimeDisplay = document.getElementById('final-time');
        
        if (!timeVal || !lngText) return;
        const longitude = parseFloat(lngText);
        if (isNaN(longitude)) return;

        // 經度差1度=4分鐘，基準120度
        const diffLng = longitude - 120;
        const correctionMinutes = diffLng * 4; 
        
        const [h, m] = timeVal.split(':').map(Number);
        let totalMinutes = h * 60 + m + correctionMinutes;
        
        if (totalMinutes < 0) totalMinutes += 1440;
        if (totalMinutes >= 1440) totalMinutes -= 1440;
        
        const newH = Math.floor(totalMinutes / 60);
        const newM = Math.floor(totalMinutes % 60);
        const finalTimeStr = `${String(newH).padStart(2,'0')}:${String(newM).padStart(2,'0')}`;
        
        if(trueSolarDisplay) trueSolarDisplay.innerText = finalTimeStr;
        if(timeDiffDisplay) timeDiffDisplay.innerText = `${correctionMinutes>=0?'+':''}${correctionMinutes.toFixed(1)} 分鐘`;
        if(finalTimeDisplay) finalTimeDisplay.innerText = finalTimeStr;

        const inputTimeDisplay = document.getElementById('input-time');
        if(inputTimeDisplay) inputTimeDisplay.innerText = `${dateVal} ${timeVal}`;
        
        // 儲存計算結果供八字使用
        window.fortuneSystem.calculatedSolarTime = finalTimeStr;
    }

    function updateCities() {
        const country = countrySelect.value;
        citySelect.innerHTML = '<option value="">請選擇城市</option>';
        
        if(CITIES[country]) {
            CITIES[country].forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.n; opt.text = c.n;
                opt.dataset.lat = c.lat; opt.dataset.lng = c.lng;
                citySelect.appendChild(opt);
            });
            citySelect.disabled = false;
        } else {
            citySelect.innerHTML = '<option value="">無該地區數據</option>';
            citySelect.disabled = true;
        }
    }

    function updateCoords() {
        const selected = citySelect.options[citySelect.selectedIndex];
        const latSpan = document.getElementById('latitude');
        const lngSpan = document.getElementById('longitude');
        const coordDiv = document.getElementById('city-coordinates');
        const solarLocationText = document.getElementById('solar-location-text');

        if(selected && selected.dataset.lat) {
            latSpan.innerText = selected.dataset.lat;
            lngSpan.innerText = selected.dataset.lng;
            coordDiv.style.display = 'block';
            if (solarLocationText) solarLocationText.textContent = '已選 ' + selected.text + '（東經 ' + selected.dataset.lng + '°E）';
            calculateSolarTime();
        } else {
            if (solarLocationText) solarLocationText.textContent = '請先選擇出生地區與城市';
        }
    }

    countrySelect.addEventListener('change', function() {
        updateCities();
        var solarLocationText = document.getElementById('solar-location-text');
        if (solarLocationText) solarLocationText.textContent = countrySelect.value ? '請選擇城市' : '請先選擇出生地區與城市';
    });
    citySelect.addEventListener('change', updateCoords);
    timeInput.addEventListener('change', calculateSolarTime);
    timeInput.addEventListener('input', calculateSolarTime);
    dateInput.addEventListener('change', calculateSolarTime);

    updateCities();
}

// ==========================================
// 4. 命理系統核心
// ==========================================
class FortuneSystem {
    constructor() {
        this.currentStep = 1;
        this.userData = {};
        this.calculatedSolarTime = null;
        this.analysisResults = {}; // 初始化分析結果存儲
    }
    
    init() {
        this.updateProgress();
        this.showSection('input-section');
    }
    
    updateProgress() {
        document.querySelectorAll('.progress-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum <= this.currentStep);
        });
    }
    
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
        const target = document.getElementById(sectionId);
        if (target) {
            target.classList.add('active');
            try {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (e) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        const stepMap = { 'input-section':1, 'meihua-section':2, 'tarot-section':3, 'result-section':4 };
        if (stepMap[sectionId]) {
            this.currentStep = stepMap[sectionId];
            this.updateProgress();
        }
        ensureFloatingButtonsVisible();
        if(sectionId === 'result-section') {
            this.loadResults();
        }
        setTimeout(function () {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }, 100);
    }
    
    reset() {
        // 重置所有數據
        this.userData = {};
        this.calculatedSolarTime = null;
        this.analysisResults = {};
        this.currentStep = 1;

        // 表單：主表單 reset（姓名 id=name、生日、時間、性別、問題、國家／城市、真太陽時）
        var personalForm = document.getElementById('personal-form');
        if (personalForm) personalForm.reset();

        // 個別欄位補齊（id=name 非 user-name；問題、經緯度）
        var nameEl = document.getElementById('name');
        if (nameEl) nameEl.value = '';
        var qType = document.getElementById('question-type');
        if (qType) qType.value = '';
        var questionEl = document.getElementById('question');
        if (questionEl) questionEl.value = '';
        var lonEl = document.getElementById('longitude');
        if (lonEl) lonEl.textContent = '-';
        var latEl = document.getElementById('latitude');
        if (latEl) latEl.textContent = '-';

        // 性別 radio 取消選取
        document.querySelectorAll('input[name="gender"]').forEach(function (r) { r.checked = false; });

        // 結果區：問題與直接回答、機率
        var qDisplay = document.getElementById('question-display');
        if (qDisplay) qDisplay.innerHTML = '';
        var directAnswer = document.getElementById('direct-answer');
        if (directAnswer) directAnswer.textContent = '分析中...';
        var overallProb = document.getElementById('overall-probability');
        if (overallProb) overallProb.textContent = '0%';
        var meterFill = document.getElementById('meter-fill');
        if (meterFill) meterFill.style.width = '0%';
        var breakdownReasons = document.getElementById('probability-breakdown-reasons');
        if (breakdownReasons) breakdownReasons.innerHTML = '';

        // 水晶推薦
        var crystalTarget = document.getElementById('crystal-target-element');
        if (crystalTarget) crystalTarget.textContent = '—';
        var crystalStones = document.getElementById('crystal-stones-list');
        if (crystalStones) crystalStones.textContent = '—';
        var crystalReason = document.getElementById('crystal-reason-text');
        if (crystalReason) crystalReason.textContent = '—';
        var crystalWearing = document.getElementById('crystal-wearing-span');
        if (crystalWearing) crystalWearing.textContent = '—';
        var crystalTaboos = document.getElementById('crystal-taboos-span');
        if (crystalTaboos) crystalTaboos.textContent = '—';
        var crystalDisclaimer = document.getElementById('crystal-disclaimer-span');
        if (crystalDisclaimer) crystalDisclaimer.textContent = '本建議僅供能量校準參考，不具醫療或命運保證效力。';

        // 綜合結論
        var conclusionContent = document.getElementById('conclusion-content');
        if (conclusionContent) conclusionContent.innerHTML = '';

        // 八字：詳細分析區移除；大運時間軸清空
        var baziAdvanced = document.getElementById('bazi-advanced-analysis');
        if (baziAdvanced && baziAdvanced.parentNode) baziAdvanced.parentNode.removeChild(baziAdvanced);
        var dayunTimeline = document.getElementById('dayun-timeline');
        if (dayunTimeline) dayunTimeline.innerHTML = '';

        // 各維度結果區清空
        document.querySelectorAll('.bazi-result, .meihua-result, .tarot-result, .name-result').forEach(function (el) {
            if (el) el.innerHTML = '';
        });

        // 八字區塊內顯示還原
        var dayMaster = document.getElementById('day-master');
        if (dayMaster) dayMaster.textContent = '待計算';
        var wuxingBalance = document.getElementById('wuxing-balance');
        if (wuxingBalance) wuxingBalance.textContent = '待計算';
        var strength = document.getElementById('strength');
        if (strength) strength.textContent = '待計算';
        var favorableEl = document.getElementById('favorable-elements');
        if (favorableEl) favorableEl.textContent = '待計算';

        // 重新載入頁面，還原結果區 HTML 結構（十神／五行等），確保「全部資料清除」
        window.location.reload();
    }
    
    generateReport() {
        let report = '靜月之光能量占卜儀 v2.0\n';
        report += '='.repeat(50) + '\n\n';
        report += `生成時間：${new Date().toLocaleString('zh-TW')}\n\n`;

        if(this.userData.question) {
            report += '【諮詢問題】\n';
            report += `${this.userData.question}\n`;
            if(this.userData.questionType) report += `問題類型：${this.userData.questionType}\n`;
            report += '\n';
        }

        if(this.userData.birthDate || this.userData.birthTime || this.userData.name) {
            report += '【用戶資料】\n';
            if(this.userData.name) report += `姓名：${this.userData.name}\n`;
            if(this.userData.birthDate) report += `出生日期：${this.userData.birthDate}\n`;
            if(this.userData.birthTime) report += `出生時間：${this.userData.birthTime}\n`;
            if(this.userData.gender) report += `性別：${this.userData.gender === 'male' ? '男' : '女'}\n`;
            report += '\n';
        }
        
        // 八字分析
        if(this.analysisResults.bazi) {
            report += '【八字命理分析】\n';
            const bazi = this.analysisResults.bazi;
            if(bazi.fullData && bazi.fullData.fourPillars) {
                const fp = bazi.fullData.fourPillars;
                report += `四柱：${fp.year.gan}${fp.year.zhi} ${fp.month.gan}${fp.month.zhi} ${fp.day.gan}${fp.day.zhi} ${fp.hour.gan}${fp.hour.zhi}\n`;
            }
            if(bazi.fullData && bazi.fullData.analysis && bazi.fullData.analysis.personality) {
                const p = bazi.fullData.analysis.personality;
                report += `個性分析：${p.personality || ''}\n`;
            }
            report += '\n';
        }
        
        // 梅花易數
        if(this.analysisResults.meihua) {
            report += '【梅花易數分析】\n';
            const m = this.analysisResults.meihua;
            if(m.benGua) report += `本卦：${m.benGua.name || ''}\n`;
            if(m.huGua) report += `互卦：${m.huGua.name || ''}\n`;
            if(m.bianGua) report += `變卦：${m.bianGua.name || ''}\n`;
            if(m.interpretation) report += `解讀：${m.interpretation.substring(0, 200)}...\n`;
            report += '\n';
        }
        
        // 塔羅牌
        if(this.analysisResults.tarot && this.analysisResults.tarot.analysis) {
            report += '【塔羅牌分析】\n';
            const t = this.analysisResults.tarot.analysis;
            if(t.fortuneScore !== undefined) report += `機率評估：${t.fortuneScore}%\n`;
            if(t.summary) report += `摘要：${t.summary}\n`;
            report += '\n';
        }
        
        // 姓名學
        const nameData = this.analysisResults.nameology || this.analysisResults.name;
        if(nameData) {
            report += '【姓名學分析】\n';
            if(nameData.overallScore !== undefined) report += `總體評分：${nameData.overallScore}\n`;
            report += '\n';
        }

        // 綜合答案（若畫面已有）
        const directAnswer = document.getElementById('direct-answer');
        const probEl = document.getElementById('overall-probability');
        if(directAnswer && directAnswer.textContent) {
            report += '【直接回答】\n';
            report += `${directAnswer.textContent.trim()}\n`;
            if(probEl && probEl.textContent) report += `可能性評估：${probEl.textContent}\n`;
            const factorsList = document.getElementById('answer-factors-list');
            if(factorsList && factorsList.children.length) {
                report += '影響因子：\n';
                for(let i = 0; i < factorsList.children.length; i++) report += `  ${i+1}. ${factorsList.children[i].textContent}\n`;
            }
            const suggList = document.getElementById('answer-suggestions-list');
            if(suggList && suggList.children.length) {
                report += '關鍵建議：\n';
                for(let j = 0; j < suggList.children.length; j++) report += `  ${j+1}. ${suggList.children[j].textContent}\n`;
            }
            report += '\n';
        }

        // 水晶推薦
        const crystalEl = document.getElementById('crystal-stones-list');
        const crystalReason = document.getElementById('crystal-reason-text');
        if(crystalEl && crystalEl.textContent && crystalEl.textContent !== '—') {
            report += '【專屬校準處方】\n';
            report += `推薦配戴：${crystalEl.textContent}\n`;
            if(crystalReason && crystalReason.textContent && crystalReason.textContent !== '—') report += `功效：${crystalReason.textContent}\n`;
            report += '\n';
        }
        
        report += '='.repeat(50) + '\n';
        report += '本報告由靜月之光能量占卜儀自動生成，僅供參考。\n';
        report += '命運掌握在自己手中，請以理性判斷為主。\n';
        
        // 下載報告
        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `命理分析報告_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    loadResults() {
        if(!this.analysisResults) {
            this.analysisResults = {};
        }
        
        // 載入八字分析結果
        if(this.analysisResults.bazi) {
            setTimeout(() => {
                try {
                    this.displayBaziResult(this.analysisResults.bazi);
                } catch (e) {
                    console.error('[loadResults] Error displaying Bazi result:', e);
                }
            }, 100);
        } else {
            // 如果沒有八字結果，確保 UI 顯示等待狀態
            setTimeout(() => {
                const baziPane = document.getElementById('bazi-result');
                if (baziPane && baziPane.querySelector('#ui-gods-grid')) {
                    // UI 已經存在，保持等待狀態
                }
            }, 100);
        }
        
        // 載入梅花易數分析結果
        if(this.analysisResults.meihua) {
            setTimeout(() => {
                console.log('載入梅花易數結果:', this.analysisResults.meihua);
                this.displayMeihuaResult(this.analysisResults.meihua);
            }, 150);
        } else {
            // 如果沒有梅花易數結果，顯示提示
            setTimeout(() => {
                const meihuaPane = document.getElementById('meihua-result');
                if(meihuaPane && !meihuaPane.innerHTML.trim()) {
                    meihuaPane.innerHTML = '<div class="no-data-note"><i class="fas fa-info-circle"></i> 尚未完成梅花易數起卦，請先完成起卦計算。</div>';
                }
            }, 150);
        }
        
        // 載入塔羅牌分析結果
        if(this.analysisResults.tarot && TarotModule && TarotModule.displayTarotResult) {
            setTimeout(() => {
                TarotModule.displayTarotResult(this.analysisResults.tarot.analysis);
            }, 200);
        }
        
        // 載入紫微斗數星盤（依出生日期、時間、性別）
        setTimeout(() => {
            try {
                this.displayZiweiResult();
            } catch (e) {
                console.warn('[loadResults] 紫微斗數顯示失敗:', e);
            }
        }, 180);
        
        // 生成姓名學和交叉驗證結果
        setTimeout(() => {
            this.displayNameResult();
            this.displayCrossResult();
        }, 250);
    }
    
        displayBaziResult(baziData) {
        const baziPane = document.getElementById('bazi-result');

        if (!baziPane) return;

        // 修正：檢查 baziData 的結構，可能沒有 success 屬性
        if (!baziData) {
            baziPane.innerHTML = `<div class="error-message">八字分析失敗：未提供數據</div>`;
            return;
        }

        // 如果 baziData 有 success 屬性且為 false，才顯示錯誤
        if (baziData.success === false) {
            baziPane.innerHTML = `<div class="error-message">八字分析失敗：${baziData.message || '未知錯誤'}</div>`;
            return;
        }

        const baziResult = (baziData.fullData || baziData.data || baziData);
        
        // 確保分析數據存在，且一律依「當前八字」重新推算（不用單一結論）
        if (typeof BaziAnalyzer !== 'undefined') {
            try {
                const n = this.normalizeBaziResult(baziResult);
                const fp = n.pillars || {};
                const tg = n.tenGods || {};
                const analyzerInput = {
                    fourPillars: {
                        year:  { gan: fp.year?.stem || fp.year?.gan, zhi: fp.year?.branch || fp.year?.zhi },
                        month: { gan: fp.month?.stem || fp.month?.gan, zhi: fp.month?.branch || fp.month?.zhi },
                        day:   { gan: fp.day?.stem || fp.day?.gan, zhi: fp.day?.branch || fp.day?.zhi },
                        hour:  { gan: fp.hour?.stem || fp.hour?.gan, zhi: fp.hour?.branch || fp.hour?.zhi }
                    },
                    dayMaster: n.dayMaster || (fp.day && (fp.day.stem || fp.day.gan)),
                    elementStrength: baziResult.elementStrength || { bodyStrength: n.strengthText },
                    favorableElements: baziResult.favorableElements || { favorable: n.favorable || [], unfavorable: n.unfavorable || [] },
                    tenGods: {
                        yearStem:  (tg.year && (tg.year.stem || tg.year.gan)) || tg.yearStem,
                        monthStem: (tg.month && (tg.month.stem || tg.month.gan)) || tg.monthStem,
                        dayStem:   (tg.day && (tg.day.stem || tg.day.gan)) || tg.dayStem,
                        hourStem:  (tg.hour && (tg.hour.stem || tg.hour.gan)) || tg.hourStem,
                        yearBranch:  Array.isArray(tg.year?.branch) ? tg.year.branch : (tg.yearBranch || []),
                        monthBranch: Array.isArray(tg.month?.branch) ? tg.month.branch : (tg.monthBranch || []),
                        dayBranch:   Array.isArray(tg.day?.branch) ? tg.day.branch : (tg.dayBranch || []),
                        hourBranch:  Array.isArray(tg.hour?.branch) ? tg.hour.branch : (tg.hourBranch || [])
                    }
                };
                const analyzer = new BaziAnalyzer(analyzerInput);
                baziResult.analysis = {
                    personality: analyzer.analyzePersonality(),
                    career: analyzer.analyzeCareer(),
                    wealth: analyzer.analyzeWealth(),
                    relationship: analyzer.analyzeRelationship(),
                    health: analyzer.analyzeHealth()
                };
            } catch (e) {
                console.warn('無法生成詳細分析:', e);
            }
        }

        // ✅ UI Guard：如果新版 UI 占位區存在，就「填值」而不是覆蓋 innerHTML（避免輸入後 UI 被舊版文字破壞）
        const hasUiPlaceholders = !!baziPane.querySelector('#ui-gods-grid');
        if (hasUiPlaceholders) {
            try {
                // 調試：輸出原始數據結構
                if (window.DEBUG_BAZI) {
                    console.log('[displayBaziResult] 原始 baziResult:', baziResult);
                    console.log('[displayBaziResult] favorableElements:', baziResult.favorableElements);
                }
                this.fillBaziResultUI(baziPane, baziResult);
                // 一併更新大運流年（確保載入結果或重新顯示時大運正確）
                const fp = baziResult.fourPillars || baziResult.pillars || {};
                const yearGan = fp.year?.gan || fp.year?.stem;
                const monthZhi = fp.month?.zhi || fp.month?.branch;
                const dayGan = baziResult.dayMaster || fp.day?.gan || fp.day?.stem;
                const greatFortune = baziResult.greatFortune || baziData?.fullData?.greatFortune || baziData?.greatFortune;
                const gender = (baziResult.gender || baziData?.gender || '').toString().toLowerCase();
                if (yearGan && dayGan && greatFortune && typeof this.renderDayun === 'function') {
                    this.renderDayun(gender, yearGan, monthZhi, dayGan, greatFortune);
                }
                return;
            } catch (err) {
                console.error('[BaziUI] fill failed, fallback to legacy render', err);
                console.error('[BaziUI] Error details:', err.stack);
            }
        }

        // Legacy fallback (for older layouts)
        const normalized = this.normalizeBaziResult(baziResult);
        const pillars = normalized.pillars;
        const tenGods = normalized.tenGods;
        const hiddenStems = normalized.hiddenStems;
        const shensha = normalized.shensha;
        const fiveElements = normalized.fiveElements;
        const strength = normalized.strength;
        const yongshen = normalized.yongshen;
        const analysis = normalized.analysis;
        const career = normalized.career;
        const love = normalized.love;
        const health = normalized.health;

        let html = `
        <div class="result-section">
            <h3>四柱排盤</h3>
            <div class="pillars-grid">
                <div class="pillar">
                    <h4>年柱</h4>
                    <div class="pillar-text">${pillars.year.heavenlyStem}${pillars.year.earthlyBranch}</div>
                </div>
                <div class="pillar">
                    <h4>月柱</h4>
                    <div class="pillar-text">${pillars.month.heavenlyStem}${pillars.month.earthlyBranch}</div>
                </div>
                <div class="pillar">
                    <h4>日柱</h4>
                    <div class="pillar-text">${pillars.day.heavenlyStem}${pillars.day.earthlyBranch}</div>
                </div>
                <div class="pillar">
                    <h4>時柱</h4>
                    <div class="pillar-text">${pillars.hour.heavenlyStem}${pillars.hour.earthlyBranch}</div>
                </div>
            </div>
        </div>

        <div class="result-section">
            <h3>十神分析</h3>
            <div class="ten-gods-grid">
                <div class="god-row">
                    <span class="label">年柱：</span>
                    <span class="value">天干：${tenGods.year.stem}，藏干：${tenGods.year.branch.join('、')}</span>
                </div>
                <div class="god-row">
                    <span class="label">月柱：</span>
                    <span class="value">天干：${tenGods.month.stem}，藏干：${tenGods.month.branch.join('、')}</span>
                </div>
                <div class="god-row">
                    <span class="label">日柱：</span>
                    <span class="value">天干：${tenGods.day.stem}，藏干：${tenGods.day.branch.join('、')}</span>
                </div>
                <div class="god-row">
                    <span class="label">時柱：</span>
                    <span class="value">天干：${tenGods.hour.stem}，藏干：${tenGods.hour.branch.join('、')}</span>
                </div>
            </div>
        </div>

        <div class="result-section">
            <h3>神煞</h3>
            <div class="shensha-list">
                <p>${shensha.join('、') || '無'}</p>
            </div>
        </div>

        <div class="result-section">
            <h3>五行強弱</h3>
            <div class="five-elements-score">
                <p>${fiveElements}</p>
                <p>身強身弱：${strength}</p>
            </div>
        </div>

        <div class="result-section">
            <h3>用神忌神</h3>
            <div class="yongshen-info">
                <p>喜用：${yongshen}</p>
                <p>忌神：${analysis.taboo}</p>
            </div>
        </div>

        <div class="result-section">
            <h3>個性分析</h3>
            <div class="personality-analysis">
                <p><strong>優點：</strong>${analysis.personality.strengths}</p>
                <p><strong>缺點：</strong>${analysis.personality.weaknesses}</p>
            </div>
        </div>

        <div class="result-section">
            <h3>事業財運</h3>
            <div class="career-analysis">
                <p><strong>適合行業：</strong>${career.suitable}</p>
                <p><strong>財運建議：</strong>${career.wealth}</p>
            </div>
        </div>

        <div class="result-section">
            <h3>感情婚姻</h3>
            <div class="love-analysis">
                <p>${love}</p>
            </div>
        </div>

        <div class="result-section">
            <h3>健康狀況</h3>
            <div class="health-analysis">
                <p>${health}</p>
            </div>
        </div>
        `;

        baziPane.innerHTML = html;
    }
    normalizeBaziResult(baziResult) {
        // 兼容不同版本 BaziCalculator 的輸出（fourPillars/tenGods/elementStrength/favorableElements）
        const src = baziResult || {};
        const rawSrc = src.raw || src;

        // 四柱 - 兼容多種數據格式
        const fp = src.fourPillars || src.pillars || {};
        const pillars = {
            year:  { 
                stem: fp.year?.stem || fp.year?.gan || fp.year?.heavenlyStem || fp.yearStem || '-', 
                branch: fp.year?.branch || fp.year?.zhi || fp.year?.earthlyBranch || fp.yearBranch || '-' 
            },
            month: { 
                stem: fp.month?.stem || fp.month?.gan || fp.month?.heavenlyStem || fp.monthStem || '-', 
                branch: fp.month?.branch || fp.month?.zhi || fp.month?.earthlyBranch || fp.monthBranch || '-' 
            },
            day:   { 
                stem: fp.day?.stem || fp.day?.gan || fp.day?.heavenlyStem || fp.dayStem || '-', 
                branch: fp.day?.branch || fp.day?.zhi || fp.day?.earthlyBranch || fp.dayBranch || '-' 
            },
            hour:  { 
                stem: fp.hour?.stem || fp.hour?.gan || fp.hour?.heavenlyStem || fp.hourStem || '-', 
                branch: fp.hour?.branch || fp.hour?.zhi || fp.hour?.earthlyBranch || fp.hourBranch || '-' 
            }
        };

        // 十神（新版：yearStem / yearBranch[]）
        const tg = src.tenGods || {};
        const tenGods = {
            year:  { 
                stem: tg.yearStem || tg.year?.stem || tg.year?.heavenlyStem || '-', 
                branch: Array.isArray(tg.yearBranch) ? tg.yearBranch : (tg.year?.branch || tg.year?.earthlyBranch || [])
            },
            month: { 
                stem: tg.monthStem || tg.month?.stem || tg.month?.heavenlyStem || '-', 
                branch: Array.isArray(tg.monthBranch) ? tg.monthBranch : (tg.month?.branch || tg.month?.earthlyBranch || [])
            },
            day:   { 
                stem: tg.dayStem || tg.day?.stem || tg.day?.heavenlyStem || '-', 
                branch: Array.isArray(tg.dayBranch) ? tg.dayBranch : (tg.day?.branch || tg.day?.earthlyBranch || [])
            },
            hour:  { 
                stem: tg.hourStem || tg.hour?.stem || tg.hour?.heavenlyStem || '-', 
                branch: Array.isArray(tg.hourBranch) ? tg.hourBranch : (tg.hour?.branch || tg.hour?.earthlyBranch || [])
            }
        };

        // 藏干（新版：{year:[...], month:[...], day:[...], hour:[...] }）
        // 如果沒有 hiddenStems，嘗試從 fourPillars 和 EARTHLY_BRANCHES_DETAIL 獲取
        let hiddenStems = src.hiddenStems || {};
        
        // 檢查是否所有藏干都為空
        const hasHiddenStems = hiddenStems.year && hiddenStems.year.length > 0 ||
                               hiddenStems.month && hiddenStems.month.length > 0 ||
                               hiddenStems.day && hiddenStems.day.length > 0 ||
                               hiddenStems.hour && hiddenStems.hour.length > 0;
        
        if (!hasHiddenStems && (pillars.year.branch !== '-' || pillars.month.branch !== '-' || pillars.day.branch !== '-' || pillars.hour.branch !== '-')) {
            // 初始化 hiddenStemsAnalyzer（如果還沒有）
            if (!this.hiddenStemsAnalyzer) {
                this.hiddenStemsAnalyzer = new HiddenStemsAnalyzer();
            }
            
            // 優先使用 HiddenStemsAnalyzer
            hiddenStems = {
                year: pillars.year.branch !== '-' ? this.hiddenStemsAnalyzer.getHiddenStems(pillars.year.branch) : [],
                month: pillars.month.branch !== '-' ? this.hiddenStemsAnalyzer.getHiddenStems(pillars.month.branch) : [],
                day: pillars.day.branch !== '-' ? this.hiddenStemsAnalyzer.getHiddenStems(pillars.day.branch) : [],
                hour: pillars.hour.branch !== '-' ? this.hiddenStemsAnalyzer.getHiddenStems(pillars.hour.branch) : []
            };
            
            // 如果 HiddenStemsAnalyzer 沒有數據，嘗試從全局 EARTHLY_BRANCHES_DETAIL 獲取
            if ((!hiddenStems.year || !hiddenStems.year.length) && 
                (!hiddenStems.month || !hiddenStems.month.length) && 
                (!hiddenStems.day || !hiddenStems.day.length) && 
                (!hiddenStems.hour || !hiddenStems.hour.length) && 
                typeof EARTHLY_BRANCHES_DETAIL !== 'undefined') {
                hiddenStems = {
                    year: pillars.year.branch !== '-' ? (EARTHLY_BRANCHES_DETAIL[pillars.year.branch]?.hiddenStems || []) : [],
                    month: pillars.month.branch !== '-' ? (EARTHLY_BRANCHES_DETAIL[pillars.month.branch]?.hiddenStems || []) : [],
                    day: pillars.day.branch !== '-' ? (EARTHLY_BRANCHES_DETAIL[pillars.day.branch]?.hiddenStems || []) : [],
                    hour: pillars.hour.branch !== '-' ? (EARTHLY_BRANCHES_DETAIL[pillars.hour.branch]?.hiddenStems || []) : []
                };
            }
        }
        
        // 確保 hiddenStems 是數組格式
        if (!Array.isArray(hiddenStems.year)) hiddenStems.year = hiddenStems.year || [];
        if (!Array.isArray(hiddenStems.month)) hiddenStems.month = hiddenStems.month || [];
        if (!Array.isArray(hiddenStems.day)) hiddenStems.day = hiddenStems.day || [];
        if (!Array.isArray(hiddenStems.hour)) hiddenStems.hour = hiddenStems.hour || [];

        // 五行強弱（新版：elementStrength.strengths / counts；若在 fullData 內則一併讀取）
        const elementStrength = src.elementStrength || rawSrc.fullData?.elementStrength || {};
        const strengths = elementStrength.strengths || elementStrength.scores || {};
        const counts = elementStrength.counts || elementStrength.count || {};

        // 喜忌 - 確保正確提取數據（若在 fullData 內則一併讀取）
        const favObj = src.favorableElements || rawSrc.fullData?.favorableElements || {};
        let favorable = [];
        let unfavorable = [];
        
        // 優先從 favorableElements.favorable 和 favorableElements.unfavorable 讀取
        if (favObj.favorable) {
            favorable = Array.isArray(favObj.favorable) ? favObj.favorable : [favObj.favorable];
        } else if (favObj.good) {
            favorable = Array.isArray(favObj.good) ? favObj.good : [favObj.good];
        } else if (src.favorable) {
            favorable = Array.isArray(src.favorable) ? src.favorable : [src.favorable];
        }
        
        if (favObj.unfavorable) {
            unfavorable = Array.isArray(favObj.unfavorable) ? favObj.unfavorable : [favObj.unfavorable];
        } else if (favObj.bad) {
            unfavorable = Array.isArray(favObj.bad) ? favObj.bad : [favObj.bad];
        } else if (src.unfavorable) {
            unfavorable = Array.isArray(src.unfavorable) ? src.unfavorable : [src.unfavorable];
        } else if (src.unfavorableElements) {
            unfavorable = Array.isArray(src.unfavorableElements) ? src.unfavorableElements : [src.unfavorableElements];
        }

        // 神煞/格局
        const specialStars = src.specialStars || src.shensha || src.shenSha || [];
        const pattern = src.pattern || '';

        // 日主 / 身強弱
        const dayMaster = src.dayMaster || pillars.day.stem || '';
        const strengthText = elementStrength.bodyStrength || src.strength || src.dayMasterStrength || '';

        return { pillars, tenGods, hiddenStems, strengths, counts, favorable, unfavorable, specialStars, pattern, dayMaster, strengthText, raw: src };
    }
    fillBaziResultUI(baziPane, baziResult) {
        const n = this.normalizeBaziResult(baziResult);
        const calibrated = !!(baziResult.baziCalibrated || baziResult.fullData?.baziCalibrated);
        const tengodsCard = baziPane.querySelector('.analysis-card-tengods');
        if (tengodsCard) {
            const hdr = tengodsCard.querySelector('.analysis-header');
            let badge = tengodsCard.querySelector('.bazi-calibration-badge');
            if (calibrated) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'bazi-calibration-badge';
                    badge.style.cssText = 'margin-left:8px;font-size:0.75rem;color:rgba(212,175,55,0.9);background:rgba(212,175,55,0.15);padding:2px 6px;border-radius:4px;';
                    badge.textContent = '易兌校正';
                    if (hdr) hdr.appendChild(badge);
                }
                badge.style.display = '';
            } else if (badge) badge.style.display = 'none';
        }
        
        // 調試：檢查數據（僅在開發時啟用）
        if (window.DEBUG_BAZI) {
            console.log('[fillBaziResultUI] Normalized data:', n);
            console.log('[fillBaziResultUI] Pillars:', n.pillars);
            console.log('[fillBaziResultUI] TenGods:', n.tenGods);
            console.log('[fillBaziResultUI] HiddenStems:', n.hiddenStems);
            console.log('[fillBaziResultUI] DayMaster:', n.dayMaster);
        }

        // ✅ 十神與藏干（四柱）
        const godsGrid = baziPane.querySelector('#ui-gods-grid');
        if (!godsGrid) {
            console.warn('[fillBaziResultUI] #ui-gods-grid not found');
            return;
        }
        
        const cols = godsGrid.querySelectorAll('.gods-column');
        if (cols.length === 0) {
            console.warn('[fillBaziResultUI] No .gods-column found');
            return;
        }
        
        const order = ['year', 'month', 'day', 'hour'];
        const dayGan = n.dayMaster || n.pillars.day.stem || '';
        
        if (!dayGan) {
            console.warn('[fillBaziResultUI] DayMaster not found:', dayGan);
        }
        
        // 初始化藏干分析器
        if (!this.hiddenStemsAnalyzer) {
            this.hiddenStemsAnalyzer = new HiddenStemsAnalyzer();
        }

        cols.forEach((col, idx) => {
            const key = order[idx] || 'day';
            const pillarStem = n.pillars[key]?.stem || '';
            const pillarBranch = n.pillars[key]?.branch || '';
            
            if (window.DEBUG_BAZI) {
                console.log(`[fillBaziResultUI] Processing ${key}: stem=${pillarStem}, branch=${pillarBranch}`);
            }
            
            // 計算天干十神
            let stemTen = (n.tenGods[key]?.stem || '');
            if (!stemTen || stemTen === '-') {
                if (pillarStem && pillarStem !== '-' && dayGan) {
                    stemTen = this.getTenGodFromStem(pillarStem, dayGan);
                } else {
                    stemTen = '';
                    if (window.DEBUG_BAZI) {
                        console.warn(`[fillBaziResultUI] Cannot calculate stemTen for ${key}: pillarStem=${pillarStem}, dayGan=${dayGan}`);
                    }
                }
            }
            
            // 處理地支藏干的十神
            let branchTenArr = Array.isArray(n.tenGods[key]?.branch) ? n.tenGods[key].branch : [];
            let hiddenStems = Array.isArray(n.hiddenStems[key]) ? n.hiddenStems[key] : [];
            
            // 如果沒有藏干數據，從地支獲取
            if (hiddenStems.length === 0 && pillarBranch && pillarBranch !== '-') {
                hiddenStems = this.hiddenStemsAnalyzer.getHiddenStems(pillarBranch);
            }
            
            // 如果還是沒有，嘗試從全局數據獲取
            if (hiddenStems.length === 0 && pillarBranch && pillarBranch !== '-' && typeof EARTHLY_BRANCHES_DETAIL !== 'undefined') {
                hiddenStems = EARTHLY_BRANCHES_DETAIL[pillarBranch]?.hiddenStems || [];
            }
            
            // 如果還是沒有，嘗試從 bazi-system.js 的數據獲取
            if (hiddenStems.length === 0 && pillarBranch && pillarBranch !== '-' && typeof EARTHLY_BRANCHES_DETAIL === 'undefined') {
                // 嘗試從其他可能的全局變量獲取
                if (typeof BAZI_DATA !== 'undefined' && BAZI_DATA.branchHiddenStems) {
                    const branchData = BAZI_DATA.branchHiddenStems[pillarBranch];
                    if (branchData) {
                        hiddenStems = [branchData.main, ...(branchData.others || [])].filter(s => s);
                    }
                }
            }
            
            // 如果沒有地支十神數據，從藏干計算
            if (branchTenArr.length === 0 && hiddenStems.length > 0 && dayGan) {
                branchTenArr = hiddenStems.map(s => this.getTenGodFromStem(s, dayGan));
            }
            
            // 去重並過濾空值
            branchTenArr = [...new Set(branchTenArr)].filter(t => t && t !== '-' && t !== '未知' && t !== '');
            const branchTen = branchTenArr.length > 0 ? branchTenArr.join('、') : '';

            const items = col.querySelectorAll('.gods-item');
            if (items[0]) {
                items[0].textContent = stemTen || '';
            }
            if (items[1]) {
                items[1].textContent = branchTen || '';
            }
        });
        
        // 檢查是否有有效數據，如果沒有則隱藏整個「十神與藏干詳解」卡片
        const hasValidData = Array.from(cols).some((col, idx) => {
            const key = order[idx] || 'day';
            const items = col.querySelectorAll('.gods-item');
            const stemText = items[0]?.textContent?.trim() || '';
            const branchText = items[1]?.textContent?.trim() || '';
            return stemText && stemText !== '-' && stemText !== '' || branchText && branchText !== '-' && branchText !== '';
        });
        
        if (!hasValidData) {
            const godsCard = godsGrid.closest('.analysis-card');
            if (godsCard) {
                console.warn('[fillBaziResultUI] No valid data found, hiding 十神與藏干詳解 card');
                godsCard.style.display = 'none';
            }
        }

        // ✅ 五行強弱分佈（以 strengths 估算百分比）
        const elementsBar = baziPane.querySelector('#ui-elements-bar');
        if (elementsBar) {
            const map = { '金': '金', '木': '木', '水': '水', '火': '火', '土': '土' };
            const vals = {
                '金': Number(n.strengths['金'] ?? n.strengths['metal'] ?? 0) || 0,
                '木': Number(n.strengths['木'] ?? n.strengths['wood'] ?? 0) || 0,
                '水': Number(n.strengths['水'] ?? n.strengths['water'] ?? 0) || 0,
                '火': Number(n.strengths['火'] ?? n.strengths['fire'] ?? 0) || 0,
                '土': Number(n.strengths['土'] ?? n.strengths['earth'] ?? 0) || 0
            };
            const total = Object.values(vals).reduce((a, b) => a + b, 0) || 1;

            const rows = elementsBar.querySelectorAll('.element-row');
            rows.forEach(row => {
                const labelEl = row.querySelector('.element-label');
                const fillEl = row.querySelector('.progress-fill') || row.querySelector('.bar-fill');
                const valueEl = row.querySelector('.element-value');
                const key = labelEl ? (labelEl.textContent || '').trim() : '';
                const k = map[key] || key;
                const v = vals[k] ?? 0;
                const pct = Math.max(0, Math.min(100, (v / total) * 100));

                if (fillEl) {
                    fillEl.style.width = pct.toFixed(0) + '%';
                    // 強制觸發重繪
                    fillEl.style.display = 'none';
                    fillEl.offsetHeight; // 觸發重排
                    fillEl.style.display = '';
                }
                if (valueEl) valueEl.textContent = pct.toFixed(0) + '%';
            });
        }

        // ✅ 喜用神與神煞
        const shenshaBox = baziPane.querySelector('#ui-shensha-content');
        if (shenshaBox) {
            // 從多個可能的數據源讀取喜用神和忌神
            let fav = Array.isArray(n.favorable) ? n.favorable : [];
            let bad = Array.isArray(n.unfavorable) ? n.unfavorable : [];
            
            // 如果沒有數據，嘗試從原始結果中讀取
            if (fav.length === 0 && baziResult.favorableElements) {
                if (Array.isArray(baziResult.favorableElements.favorable)) {
                    fav = baziResult.favorableElements.favorable;
                } else if (baziResult.favorableElements.favorable) {
                    fav = [baziResult.favorableElements.favorable];
                } else if (Array.isArray(baziResult.favorableElements)) {
                    fav = baziResult.favorableElements;
                }
            }
            if (bad.length === 0 && baziResult.favorableElements) {
                if (Array.isArray(baziResult.favorableElements.unfavorable)) {
                    bad = baziResult.favorableElements.unfavorable;
                } else if (baziResult.favorableElements.unfavorable) {
                    bad = [baziResult.favorableElements.unfavorable];
                }
            }
            
            // 最後嘗試：從 normalized 數據的 raw 屬性讀取
            if (fav.length === 0 && n.raw && n.raw.favorableElements) {
                if (Array.isArray(n.raw.favorableElements.favorable)) {
                    fav = n.raw.favorableElements.favorable;
                } else if (n.raw.favorableElements.favorable) {
                    fav = [n.raw.favorableElements.favorable];
                }
            }
            if (bad.length === 0 && n.raw && n.raw.favorableElements) {
                if (Array.isArray(n.raw.favorableElements.unfavorable)) {
                    bad = n.raw.favorableElements.unfavorable;
                } else if (n.raw.favorableElements.unfavorable) {
                    bad = [n.raw.favorableElements.unfavorable];
                }
            }
            
            // 過濾空值
            fav = fav.filter(x => x && String(x).trim() !== '');
            bad = bad.filter(x => x && String(x).trim() !== '');
            
            // 處理神煞數據（支援 shenShaByPillar 易兌格式）
            let stars = [];
            let shenShaByPillar = null;
            if (baziResult.specialStars && baziResult.specialStars.shenShaByPillar) {
                shenShaByPillar = baziResult.specialStars.shenShaByPillar;
            }
            if (Array.isArray(n.specialStars) && n.specialStars.length > 0) {
                stars = n.specialStars;
            } else if (baziResult.specialStars) {
                if (Array.isArray(baziResult.specialStars.specialNotes)) {
                    stars = baziResult.specialStars.specialNotes;
                } else if (baziResult.specialStars.specialNotes) {
                    stars = [baziResult.specialStars.specialNotes];
                }
            }

            // 生成神煞詳解 HTML（日/月/年神煞）
            const mkShenShaDetail = (sp) => {
                if (!sp || (!sp.day?.length && !sp.month?.length && !sp.year?.length)) return '';
                const fmt = (arr) => (arr || []).map(x => `${x.name}【${x.loc || '空'}】`).join('、');
                const parts = [];
                if (sp.day && sp.day.length) parts.push('<div><strong>日神煞：</strong>' + fmt(sp.day) + '</div>');
                if (sp.month && sp.month.length) parts.push('<div><strong>月神煞：</strong>' + fmt(sp.month) + '</div>');
                if (sp.year && sp.year.length) parts.push('<div><strong>年神煞：</strong>' + fmt(sp.year) + '</div>');
                return parts.length ? '<div style="margin-top:0.5rem;font-size:0.85rem;line-height:1.5;">' + parts.join('') + '</div>' : '';
            };

            // 生成標籤 HTML，使用與 HTML 匹配的結構
            // 檢查是否已經嘗試過讀取數據（通過檢查 normalized 數據）
            const hasTriedReading = n.favorable !== undefined || n.unfavorable !== undefined || baziResult.favorableElements;
            
            const mkFavTags = (arr, hasData) => {
                if (!hasData) {
                    // 如果還沒有嘗試讀取數據，顯示「計算中」
                    return '<span class="bazi-tag tag-favorable">計算中</span>';
                }
                if (!arr || arr.length === 0) {
                    // 如果已經讀取但為空，顯示「無」
                    return '<span class="bazi-tag" style="opacity:0.5">無</span>';
                }
                return arr.map(t => `<span class="bazi-tag tag-favorable">${t}</span>`).join('');
            };
            
            const mkBadTags = (arr, hasData) => {
                if (!hasData) {
                    // 如果還沒有嘗試讀取數據，顯示「計算中」
                    return '<span class="bazi-tag tag-unfavorable">計算中</span>';
                }
                if (!arr || arr.length === 0) {
                    // 如果已經讀取但為空，顯示「無」
                    return '<span class="bazi-tag" style="opacity:0.5">無</span>';
                }
                return arr.map(t => `<span class="bazi-tag tag-unfavorable">${t}</span>`).join('');
            };
            
            const mkStarTags = (arr) => {
                if (!arr || arr.length === 0) return '<span class="bazi-tag tag-star">無明顯神煞</span>';
                // 從神煞文字中提取關鍵詞
                const starKeywords = [];
                arr.forEach(note => {
                    if (typeof note === 'string') {
                        if (note.includes('貴人')) starKeywords.push('貴人');
                        if (note.includes('文昌')) starKeywords.push('文昌');
                        if (note.includes('驛馬')) starKeywords.push('驛馬');
                        if (note.includes('桃花')) starKeywords.push('桃花');
                        if (note.includes('天乙')) starKeywords.push('天乙貴人');
                        if (note.includes('天德')) starKeywords.push('天德');
                        if (note.includes('月德')) starKeywords.push('月德');
                    }
                });
                if (starKeywords.length === 0) return '<span class="bazi-tag tag-star">無明顯神煞</span>';
                return [...new Set(starKeywords)].map(s => `<span class="bazi-tag tag-star">${s}</span>`).join('');
            };

            // 檢查是否已經有數據（用於判斷顯示「計算中」還是「無」）
            const hasFavData = fav.length > 0 || baziResult.favorableElements !== undefined;
            const hasBadData = bad.length > 0 || baziResult.favorableElements !== undefined;
            
            const mkAuxiliarySection = (r) => {
                const data = r.fullData || r;
                const lp = data.lifePalace; const fo = data.fetalOrigin; const fb = data.fetalBreath; const bp = data.bodyPalace;
                const wb = data.weighingBone; const zw = data.ziweiRef;
                if (!lp && !fo && !fb && !bp && !wb && !zw) return '';
                let html = '<div style="margin-top:1.2rem; padding-top:1rem; border-top:1px solid rgba(212,175,55,0.2);">';
                html += '<p style="font-size:0.9rem; margin-bottom:8px; color:rgba(255,255,255,0.6);"><i class="fas fa-compass"></i> 命宮／胎元／胎息／身宮</p>';
                html += '<div style="display:flex; flex-wrap:wrap; gap:0.6rem; margin-bottom:0.8rem;">';
                if (lp) html += `<span class="bazi-tag tag-star">命宮${lp.gan}${lp.zhi}${lp.nayin ? '('+lp.nayin+')' : ''}</span>`;
                if (fo) html += `<span class="bazi-tag tag-star">胎元${fo.gan}${fo.zhi}${fo.nayin ? '('+fo.nayin+')' : ''}</span>`;
                if (fb) html += `<span class="bazi-tag tag-star">胎息${fb.gan}${fb.zhi}${fb.nayin ? '('+fb.nayin+')' : ''}</span>`;
                if (bp) html += `<span class="bazi-tag tag-star">身宮${bp.gan}${bp.zhi}${bp.nayin ? '('+bp.nayin+')' : ''}</span>`;
                html += '</div>';
                if (zw && (zw.mingZhu || zw.shenZhu)) {
                    html += '<p style="font-size:0.9rem; margin-bottom:5px; color:rgba(255,255,255,0.6);"><i class="fas fa-star"></i> 紫微對照</p>';
                    html += '<div style="margin-bottom:0.8rem;">';
                    if (zw.mingZhu) html += `<span class="bazi-tag tag-star">命主：${zw.mingZhu}</span>`;
                    if (zw.shenZhu) html += `<span class="bazi-tag tag-star">身主：${zw.shenZhu}</span>`;
                    html += '</div>';
                }
                if (wb && wb.display) {
                    html += '<p style="font-size:0.9rem; margin-bottom:5px; color:rgba(255,255,255,0.6);"><i class="fas fa-balance-scale"></i> 袁天罡稱骨</p>';
                    html += `<div style="font-size:0.95rem;">${wb.display} — ${wb.comment || ''}</div>`;
                }
                html += '</div>';
                return html;
            };
            
            // 使用與 HTML 完全匹配的結構
            shenshaBox.innerHTML = `
                <div style="margin-bottom: 1rem;">
                    <p style="font-size:0.9rem; margin-bottom:5px; color:rgba(255,255,255,0.6);">喜用神：</p>
                    <div class="tag-container">
                        ${mkFavTags(fav, hasFavData)}
                    </div>
                </div>
                <div style="margin-bottom: 1rem;">
                    <p style="font-size:0.9rem; margin-bottom:5px; color:rgba(255,255,255,0.6);">忌神：</p>
                    <div class="tag-container">
                        ${mkBadTags(bad, hasBadData)}
                    </div>
                </div>
                ${mkAuxiliarySection(baziResult)}
            `;
            
            // 調試輸出
            console.log('[fillBaziResultUI] 喜用神數據:', fav, 'hasData:', hasFavData);
            console.log('[fillBaziResultUI] 忌神數據:', bad, 'hasData:', hasBadData);
            console.log('[fillBaziResultUI] 神煞數據:', stars);
            console.log('[fillBaziResultUI] baziResult.favorableElements:', baziResult.favorableElements);
            console.log('[fillBaziResultUI] normalized favorable:', n.favorable);
            console.log('[fillBaziResultUI] normalized unfavorable:', n.unfavorable);
        }

    }

    displayZiweiResult() {
        const ziweiPane = document.getElementById('ziwei-result');
        if (!ziweiPane) return;
        if (typeof ZiweiSystem === 'undefined' || !ZiweiSystem.calculate || !ZiweiSystem.renderHTML) {
            ziweiPane.innerHTML = '<p class="no-data-note"><i class="fas fa-info-circle"></i> 紫微斗數模組未載入（iztro 庫）。</p>';
            return;
        }
        const u = this.userData || {};
        const birthDate = u.birthDate || (this.analysisResults.bazi && (this.analysisResults.bazi.birthDate || (this.analysisResults.bazi.fullData && this.analysisResults.bazi.fullData.birthDate)));
        const birthTime = u.birthTime || (this.analysisResults.bazi && this.analysisResults.bazi.birthTime) || '12:00';
        const gender = u.gender || (this.analysisResults.bazi && this.analysisResults.bazi.gender) || 'male';
        if (!birthDate) {
            ziweiPane.innerHTML = '<p class="no-data-note"><i class="fas fa-info-circle"></i> 請先填寫出生日期、時間與性別，完成分析後顯示紫微星盤。</p>';
            return;
        }
        const astrolabe = ZiweiSystem.calculate(birthDate, birthTime, gender);
        if (astrolabe) this.analysisResults.ziwei = astrolabe;
        ziweiPane.innerHTML = ZiweiSystem.renderHTML(astrolabe);
    }

    
    displayMeihuaResult(meihuaData) {
        console.log('displayMeihuaResult 被調用，數據:', meihuaData);
        const meihuaPane = document.getElementById('meihua-result');
        if(!meihuaPane) {
            console.error('找不到 meihua-result 元素');
            return;
        }

        if(!meihuaData) {
            console.error('梅花易數數據為空');
            meihuaPane.innerHTML = '<div class="no-data-note"><i class="fas fa-info-circle"></i> 尚未完成梅花易數起卦，請先完成起卦計算。</div>';
            return;
        }

        try {
            // 基本資料保護
            const ben = meihuaData.benGua || {};
            const hu  = meihuaData.huGua  || {};
            const bian= meihuaData.bianGua|| {};

            // 若資料缺失，直接提示
            if(!ben || !hu || !bian || !ben.name || !hu.name || !bian.name) {
                meihuaPane.innerHTML = '<div class="error-note"><i class="fas fa-exclamation-triangle"></i> 梅花易數數據不完整，請重新起卦。</div>';
                return;
            }

            // 處理體用關係 - 轉換為中文顯示
            let bodyUse = meihuaData.bodyUseRelation || meihuaData.bodyUse || '';
            let bodyUseText = '';
            if (typeof bodyUse === 'object' && bodyUse !== null) {
                // 提取體用關係的中文描述
                const bodyGua = bodyUse.bodyGua || bodyUse.tiGua || '';
                const useGua = bodyUse.useGua || bodyUse.yongGua || '';
                const relation = bodyUse.relationship || bodyUse.relation || '';
                const elementAnalysis = bodyUse.elementAnalysis || '';
                
                if (bodyGua && useGua) {
                    bodyUseText = `體卦：${bodyGua}，用卦：${useGua}`;
                    if (relation) {
                        bodyUseText += `，${relation}`;
                    }
                    if (elementAnalysis) {
                        bodyUseText += `，${elementAnalysis}`;
                    }
                } else if (relation) {
                    bodyUseText = relation;
                } else {
                    bodyUseText = JSON.stringify(bodyUse);
                }
            } else if (bodyUse) {
                bodyUseText = String(bodyUse);
            }
            
            // 計算卦象正面/負面百分比
            const fortune = meihuaData.fortune || meihuaData.judgment || '';
            let fortuneScore = 50; // 預設中性
            let fortuneExplanation = '';
            
            if (fortune) {
                if (fortune.includes('大吉')) {
                    fortuneScore = 85;
                    fortuneExplanation = '卦象顯示大吉，表示當前情況非常有利，發展順利，成功機率高。';
                } else if (fortune.includes('吉') || fortune.includes('小吉')) {
                    fortuneScore = 65;
                    fortuneExplanation = '卦象顯示吉，表示當前情況較為有利，有良好的發展趨勢，但需持續努力。';
                } else if (fortune.includes('凶') || fortune.includes('大凶')) {
                    fortuneScore = 25;
                    fortuneExplanation = '卦象顯示凶，表示當前情況不利，需要謹慎應對，避免衝動決策。';
                } else if (fortune.includes('平') || fortune.includes('中')) {
                    fortuneScore = 50;
                    fortuneExplanation = '卦象顯示平，表示當前情況穩定，無明顯吉凶，需要觀察等待。';
                }
            }
            
            // 根據體用關係調整分數
            if (bodyUseText) {
                if (bodyUseText.includes('比和')) {
                    fortuneScore = Math.min(100, fortuneScore + 10);
                    fortuneExplanation += ' 體用比和，表示內外和諧，有利於穩定發展。';
                } else if (bodyUseText.includes('相生')) {
                    fortuneScore = Math.min(100, fortuneScore + 5);
                    fortuneExplanation += ' 體用相生，表示能量流動順暢，有助於目標達成。';
                } else if (bodyUseText.includes('相剋') || bodyUseText.includes('相克')) {
                    fortuneScore = Math.max(0, fortuneScore - 10);
                    fortuneExplanation += ' 體用相剋，表示存在衝突，需要調和平衡。';
                }
            }
            
            const moving  = (meihuaData.movingLine !== undefined && meihuaData.movingLine !== null) ? `動爻：第${meihuaData.movingLine}爻` : '';

            const card = (title, data) => {
                const symbol = data.symbol || data.hexagramSymbol || '';
                const name   = data.name || '未命名';
                return `
                    <div class="hex-card">
                        <div class="hex-card-top">
                            <div class="hex-title">${title}</div>
                            <div class="hex-symbol">${symbol}</div>
                            <div class="hex-name">${name}</div>
                        </div>
                        <div class="hex-lines">
                            ${this.renderHexagramForResult(data)}
                        </div>
                        <div class="hex-meta">
                            <span class="chip"><i class="fas fa-layer-group"></i> 上卦：${(data.upperTrigramName || data.upperTrigram?.name || '')}</span>
                            <span class="chip"><i class="fas fa-layer-group"></i> 下卦：${(data.lowerTrigramName || data.lowerTrigram?.name || '')}</span>
                        </div>
                    </div>
                `;
            };

            // 處理卦象摘要 - 移除JSON字符串
            let interpretation = meihuaData.interpretation || meihuaData.analysisText || meihuaData.summary || '';
            // 移除摘要中的JSON字符串
            if (interpretation) {
                interpretation = interpretation.replace(/\{"[^"]+":"[^"]+",[^}]+\}/g, '');
                interpretation = interpretation.replace(/bodyGua|useGua|relationship|elementAnalysis/g, '');
            }
            
            if (!interpretation || interpretation.trim() === '' || interpretation.includes('尚無摘要') || interpretation.includes('重新起卦')) {
                // 如果有卦象數據，生成基本摘要
                if (ben.name && hu.name && bian.name) {
                    interpretation = `本卦：${ben.name}，互卦：${hu.name}，變卦：${bian.name}。`;
                    if (bodyUseText) {
                        interpretation += `體用關係：${bodyUseText}。`;
                    }
                    if (fortune) {
                        interpretation += `吉凶判斷：${fortune}。`;
                    }
                    if (fortuneExplanation) {
                        interpretation += ` ${fortuneExplanation}`;
                    }
                } else {
                    interpretation = '（尚無摘要，建議回到「梅花易數」步驟重新起卦）';
                }
            }

            let html = `
                <div class="meihua-analysis-ui">
                    <div class="dimension-header compact">
                        <h4><i class="fas fa-yin-yang"></i> 梅花易數卦象</h4>
                        <span class="dimension-badge">可視化</span>
                    </div>

                    <div class="hex-card-grid">
                        ${card('本卦', ben)}
                        ${card('互卦', hu)}
                        ${card('變卦', bian)}
                    </div>

                    <div class="meihua-chips-row">
                        ${bodyUseText ? `<span class="chip highlight"><i class="fas fa-balance-scale"></i> 體用：${bodyUseText}</span>` : ''}
                        ${fortune ? `<span class="chip ${fortune.includes('大吉') || fortune.includes('吉') ? 'good' : fortune.includes('凶') ? 'bad' : ''}"><i class="fas fa-star"></i> 吉凶：${fortune}</span>` : ''}
                        ${moving ? `<span class="chip"><i class="fas fa-bolt"></i> ${moving}</span>` : ''}
                    </div>
                    ${(typeof MeihuaRules !== 'undefined') ? (() => {
                        let extra = '';
                        if (MeihuaRules.getTiYongHint && meihuaData.tiYong) {
                            const hint = MeihuaRules.getTiYongHint(meihuaData.tiYong);
                            if (hint) extra += `<p><i class="fas fa-balance-scale"></i> ${hint}</p>`;
                        }
                        if (MeihuaRules.getTypeAdvice) {
                            const qType = (window.fortuneSystem && window.fortuneSystem.userData && window.fortuneSystem.userData.questionType) || '';
                            const mhAdvice = MeihuaRules.getTypeAdvice(meihuaData, qType || 'general');
                            if (mhAdvice.advice) extra += `<p><i class="fas fa-compass"></i> ${mhAdvice.advice}</p>`;
                            if (mhAdvice.timing) extra += `<p><i class="fas fa-clock"></i> ${mhAdvice.timing}</p>`;
                        }
                        return extra ? `<div class="meihua-type-advice" style="margin-top: 1rem; padding: 0.75rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px;">${extra}</div>` : '';
                    })() : ''}

                    <div class="analysis-card" style="margin-top: 1rem;">
                        <div class="analysis-header">
                            <i class="fas fa-chart-line"></i> 卦象評估
                        </div>
                        <div style="padding: 1rem;">
                            <div style="text-align: center; margin-bottom: 1rem;">
                                <div style="font-size: 2.5rem; font-weight: bold; color: var(--gold-primary); margin-bottom: 0.5rem;">${fortuneScore}%</div>
                                <div style="font-size: 1.2rem; color: ${fortuneScore >= 60 ? '#4CAF50' : fortuneScore >= 40 ? '#FF9800' : '#F44336'}; margin-bottom: 0.5rem;">
                                    ${fortuneScore >= 60 ? '正面' : fortuneScore >= 40 ? '中性' : '負面'}
                                </div>
                                <div style="width: 100%; height: 12px; background: rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; margin-bottom: 0.5rem;">
                                    <div style="width: ${fortuneScore}%; height: 100%; background: linear-gradient(90deg, ${fortuneScore >= 60 ? '#4CAF50' : fortuneScore >= 40 ? '#FF9800' : '#F44336'}, var(--gold-bright)); transition: width 0.3s;"></div>
                                </div>
                            </div>
                            <div style="padding: 1rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px; line-height: 1.6;">
                                ${fortuneExplanation || '卦象分析：此卦象顯示當前情況的整體趨勢，建議結合具體問題進行解讀。'}
                            </div>
                        </div>
                    </div>

                    <div class="meihua-summary-card" style="margin-top: 1rem;">
                        <div class="summary-title"><i class="fas fa-scroll"></i> 卦象摘要</div>
                        <div class="summary-text">
                            ${interpretation}
                        </div>
                        <details class="summary-more">
                            <summary>展開更多</summary>
                            <div class="summary-more-body">
                                <div class="muted">提示：若希望更完整的卦辭/象辭/爻辭呈現，可在下一版加入《易經》文本資料表。</div>
                            </div>
                        </details>
                    </div>
                </div>
            `;

            meihuaPane.innerHTML = html;
        } catch(e) {
            console.error('顯示梅花易數結果失敗:', e);
            meihuaPane.innerHTML = '<div class="error-note"><i class="fas fa-exclamation-triangle"></i> 顯示結果時發生錯誤，請重新起卦。</div>';
        }
    }
    
    renderHexagramForResult(hexagramData) {
        if (!hexagramData || !hexagramData.lines) {
            return '<div class="gua-visual">卦象數據缺失</div>';
        }
        
        const lines = hexagramData.lines;
        let linesHtml = '';
        // 注意：lines[0] 是初爻 (最下面)，但 HTML 堆疊是從上到下。
        // 所以我們使用 CSS flex-direction: column-reverse 來解決，這裡依序輸出即可。
        lines.forEach((isYang, index) => { 
            const type = isYang ? 'yang' : 'yin';
            // 添加 data-index 方便調試或加樣式
            linesHtml += `<div class="yao ${type}" data-index="${index+1}"></div>`; 
        });
        return `<div class="gua-visual">${linesHtml}</div>`;
    }
    
    displayNameResult() {
        const namePane = document.getElementById('name-result');
        if(!namePane) return;

        const name = document.getElementById('name') ? document.getElementById('name').value.trim() : '';
        const birthYear = this.userData.birthDate ? new Date(this.userData.birthDate).getFullYear() : null;
        const gender = this.userData.gender || 'male';

        if(!name || name === '') {
            namePane.innerHTML = `
                <div class="name-analysis-result">
                    <div class="dimension-header compact">
                        <h4><i class="fas fa-signature"></i> 姓名學分析</h4>
                        <span class="dimension-badge">缺少資料</span>
                    </div>
                    <div class="no-name-note"><i class="fas fa-info-circle"></i> 未提供姓名，無法進行姓名學分析。</div>
                </div>`;
            return;
        }

        let analysis = null;

        // 使用完整的姓名學系統（若有八字喜忌則一併做聯動驗證）
        const baziFav = this.analysisResults?.bazi?.favorableElements || null;
        if (typeof NameAnalysisSystem !== 'undefined') {
            try {
                const nameAnalyzer = new NameAnalysisSystem();
                analysis = nameAnalyzer.analyzeFullName(name, birthYear, gender, baziFav);
            } catch (e) {
                console.error('姓名學分析錯誤:', e);
                analysis = { error: '姓名學分析發生錯誤，請確認資料與系統載入。' };
            }
        } else {
            analysis = { error: '姓名學系統未載入，請確認 nameology-system.js 已正確引用。' };
        }

        if (!analysis || analysis.error) {
            namePane.innerHTML = `
                <div class="name-analysis-result">
                    <div class="dimension-header compact">
                        <h4><i class="fas fa-signature"></i> 姓名學分析</h4>
                        <span class="dimension-badge">錯誤</span>
                    </div>
                    <div class="error-note"><i class="fas fa-exclamation-triangle"></i> ${analysis && analysis.error ? analysis.error : '未知錯誤'}</div>
                </div>`;
            return;
        }

        // 保存分析結果
        if(!this.analysisResults) this.analysisResults = {};
        this.analysisResults.nameology = analysis;

        // 若先前已有八字結果而姓名學未帶 baziLink，則當場做聯動驗證並附上
        if (!analysis.baziLink && this.analysisResults.bazi?.favorableElements && typeof NameAnalysisSystem !== 'undefined') {
            try {
                const nameAnalyzer = new NameAnalysisSystem();
                analysis.baziLink = nameAnalyzer.evaluateWithBazi(analysis, this.analysisResults.bazi.favorableElements);
            } catch (e) { /* 忽略 */ }
        }

        const safe = (v, fallback='') => (v === undefined || v === null) ? fallback : v;
        const fmtLuck = (luck) => {
            if(!luck) return '';
            const s = String(luck);
            const cls = s.includes('大吉') || s.includes('吉') ? 'good' : s.includes('凶') ? 'bad' : '';
            return `<span class="chip ${cls}"><i class="fas fa-star"></i> ${s}</span>`;
        };

        // 處理五格分析數據
        const patterns = analysis.fivePatterns || analysis.patterns || {};
        const order = [
            { key:'heaven', label:'天格', icon:'fa-cloud' },
            { key:'person', label:'人格', icon:'fa-user' },
            { key:'earth',  label:'地格', icon:'fa-mountain' },
            { key:'outer',  label:'外格', icon:'fa-compass' },
            { key:'total',  label:'總格', icon:'fa-infinity' }
        ];

        const patternCards = order.map(o => {
            // 嘗試多種可能的數據結構
            let p = patterns[o.key] || {};
            if (!p || (typeof p !== 'object' && typeof p !== 'number') || (typeof p === 'object' && Object.keys(p).length === 0)) {
                // 嘗試從numerologyAnalysis獲取
                if (analysis.numerologyAnalysis && analysis.numerologyAnalysis[o.key]) {
                    p = analysis.numerologyAnalysis[o.key];
                } else {
                    // 嘗試直接從analysis獲取
                    const altKey = o.key === 'heaven' ? 'heavenly' : 
                                  o.key === 'person' ? 'person' : 
                                  o.key === 'earth' ? 'earthly' : 
                                  o.key === 'outer' ? 'outer' : 'total';
                    p = analysis[altKey + 'Pattern'] || analysis[altKey] || {};
                }
            }
            
            // 如果p是數字，轉換為對象
            if (typeof p === 'number') {
                const numerology = analysis.numerologyAnalysis && analysis.numerologyAnalysis[o.key];
                if (numerology) {
                    p = numerology;
                } else {
                    p = { number: p };
                }
            }
            
            const num = safe(p.number || p.num || p.value, '—');
            const ele = safe(p.element || p.wuxing || p.fiveElement || (patterns[o.key + 'Element'] ? patterns[o.key + 'Element'] : null), '');
            const luck = safe(p.luck || p.fortune || p.auspiciousness, '');
            const mean = safe(p.meaning || p.description || p.interpretation, '');
            
            return `
                <div class="pattern-card" style="padding: 1rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <div style="font-weight: bold; color: var(--gold-primary);"><i class="fas ${o.icon}"></i> ${o.label}</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--gold-bright);">${num}</div>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
                        ${ele ? `<span class="bazi-tag tag-favorable" style="padding: 0.25rem 0.5rem;"><i class="fas fa-leaf"></i> ${ele}</span>` : ''}
                        ${luck ? fmtLuck(luck) : ''}
                    </div>
                    ${mean ? `
                        <details style="margin-top: 0.5rem;">
                            <summary style="cursor: pointer; color: var(--gold-primary);">解讀</summary>
                            <div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(212, 175, 55, 0.05); border-radius: 4px; line-height: 1.6;">${mean}</div>
                        </details>` : ''}
                </div>
            `;
        }).join('');

        const overallScore = safe(analysis.overallScore, safe(analysis.totalScore, '—'));
        const zodiac = safe(analysis.basicInfo && analysis.basicInfo.zodiac, '');

        // 處理三才配置數據
        const talents = analysis.threeTalents || analysis.sancai || analysis.threeTalent || null;
        let talentsHtml = '';
        if (talents && (talents.configuration || talents.elements || talents.combination || talents.luck || talents.description || talents.meaning)) {
            const config = safe(talents.configuration || talents.combination, '');
            const elements = safe(talents.elements || (talents.heavenElement && talents.personalityElement && talents.earthElement ? `${talents.heavenElement}${talents.personalityElement}${talents.earthElement}` : ''), '');
            const luck = safe(talents.luck, '');
            const desc = safe(talents.description || talents.meaning, '');
            const relations = safe(talents.elementRelations, '');
            const sancaiType = talents.sancaiType || '';
            const sancaiLuck = talents.sancaiLuck || '';
            const energyFlow = talents.energyFlow || '';
            const sancaiTrait = talents.sancaiTrait || '';
            const dim = talents.dimensionScores || null;
            const dimHtml = dim && typeof dim.穩定性 === 'number' ? `<div style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem;"><span class="bazi-tag" style="padding: 0.35rem 0.75rem;">穩定性 ${dim.穩定性}</span><span class="bazi-tag" style="padding: 0.35rem 0.75rem;">發展性 ${dim.發展性}</span><span class="bazi-tag" style="padding: 0.35rem 0.75rem;">協調性 ${dim.協調性}</span></div>` : '';
            // 只顯示一則解讀：優先 sancaiTrait（生克類型），無則用 config 的 description，避免重複
            const singleDesc = sancaiTrait ? sancaiTrait : desc;
            
            talentsHtml = `
                <div class="analysis-card">
                    <div class="analysis-header">
                        <i class="fas fa-project-diagram"></i> 三才配置
                    </div>
                    <div style="padding: 1rem;">
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
                            ${config ? `<span class="bazi-tag tag-favorable" style="padding: 0.5rem 1rem;"><i class="fas fa-layer-group"></i> ${config}</span>` : ''}
                            ${elements ? `<span class="bazi-tag tag-favorable" style="padding: 0.5rem 1rem;"><i class="fas fa-leaf"></i> ${elements}</span>` : ''}
                            ${luck ? `<span class="bazi-tag ${String(luck).includes('吉') ? 'tag-favorable' : String(luck).includes('凶') ? 'tag-unfavorable' : ''}" style="padding: 0.5rem 1rem;"><i class="fas fa-star"></i> ${luck}</span>` : ''}
                            ${sancaiType ? `<span class="bazi-tag" style="padding: 0.5rem 1rem;"><i class="fas fa-link"></i> ${sancaiType}</span>` : ''}
                            ${sancaiLuck ? `<span class="bazi-tag ${sancaiLuck === '吉' || sancaiLuck === '中吉' ? 'tag-favorable' : sancaiLuck === '凶' ? 'tag-unfavorable' : ''}" style="padding: 0.5rem 1rem;">${sancaiLuck}</span>` : ''}
                            ${energyFlow ? `<span class="bazi-tag" style="padding: 0.5rem 1rem;">${energyFlow}</span>` : ''}
                        </div>
                        ${singleDesc ? `<div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(212, 175, 55, 0.05); border-radius: 4px; line-height: 1.6; font-size: 0.9rem;">${singleDesc}</div>` : ''}
                        ${relations ? `<div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(212, 175, 55, 0.05); border-radius: 4px; line-height: 1.6; font-size: 0.9rem; color: rgba(255,255,255,0.7);">五行關係：${relations}</div>` : ''}
                        ${dimHtml}
                    </div>
                </div>
            `;
        }

        const step4Done = analysis.step4Completed === true;
        namePane.innerHTML = `
            <div class="analysis-grid-container">
                <div class="analysis-card">
                    <div class="analysis-header">
                        <i class="fas fa-signature"></i> 姓名學分析
                    </div>
                    <div style="padding: 1rem;">
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
                            <span class="bazi-tag tag-favorable" style="padding: 0.5rem 1rem;"><i class="fas fa-user"></i> 姓名：<strong>${safe(analysis.basicInfo && analysis.basicInfo.fullName, name)}</strong></span>
                            ${zodiac ? `<span class="bazi-tag tag-favorable" style="padding: 0.5rem 1rem;"><i class="fas fa-paw"></i> 生肖：${zodiac}</span>` : ''}
                            <span class="bazi-tag tag-favorable" style="padding: 0.5rem 1rem;"><i class="fas fa-chart-line"></i> 綜合評分：<strong>${overallScore}/100</strong></span>
                            ${step4Done && analysis.baziLink && analysis.baziLink.verdictLabel ? `<span class="bazi-tag ${analysis.baziLink.verdictLabel === '吉名' ? 'tag-favorable' : analysis.baziLink.verdictLabel === '凶名' ? 'tag-unfavorable' : ''}" style="padding: 0.5rem 1rem;"><i class="fas fa-gavel"></i> 最終裁定：<strong>${analysis.baziLink.verdictLabel}</strong></span>` : ''}
                        </div>
                    </div>
                </div>

                <div class="analysis-card">
                    <div class="analysis-header">
                        <i class="fas fa-sitemap"></i> 五格分析
                    </div>
                    <div style="padding: 1rem;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            ${patternCards}
                        </div>
                    </div>
                </div>

                ${talentsHtml}
                ${(analysis.baziLink && analysis.baziLink.verdict) ? `
                <div class="analysis-card">
                    <div class="analysis-header">
                        <i class="fas fa-link"></i> 與八字聯動（第四步裁定）
                    </div>
                    <div style="padding: 1rem;">
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span class="bazi-tag ${analysis.baziLink.verdictLabel === '吉名' ? 'tag-favorable' : analysis.baziLink.verdictLabel === '凶名' ? 'tag-unfavorable' : ''}" style="padding: 0.5rem 1rem;">最終裁定：<strong>${analysis.baziLink.verdictLabel || analysis.baziLink.verdict}</strong></span>
                        </div>
                        <ul style="margin: 0; padding-left: 1.2rem; line-height: 1.6; font-size: 0.9rem; color: rgba(255,255,255,0.85);">
                            ${(analysis.baziLink.strategyNotes || []).map(n => `<li>${n}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                ` : ''}

                <div class="analysis-card">
                    <div class="analysis-header">
                        <i class="fas fa-lightbulb"></i> 建議
                    </div>
                    <div class="text-content" style="padding: 1rem; line-height: 1.6;">
                        ${safe(analysis.recommendation, '建議以「人格」與「總格」作為主軸，並結合八字五行喜用神，避免單一維度過度解讀。')}
                    </div>
                </div>
                <div class="analysis-card" style="border-left: 4px solid var(--gold-primary, #d4af37); background: rgba(212, 175, 55, 0.08);">
                    <div class="analysis-header" style="font-size: 0.95rem;">
                        <i class="fas fa-exclamation-circle"></i> 重要說明
                    </div>
                    <div class="text-content" style="padding: 1rem; line-height: 1.6; color: rgba(255,255,255,0.9);">
                        ${safe(analysis.disclaimer, '姓名吉凶的最終判斷必須與使用者的八字喜用神結合，請綜合判斷。本分析僅供參考，不取代專業命理建議。')}
                    </div>
                </div>
            </div>
        `;
    }
    
    displayCrossResult() {
        return; /* 跨系統證據區塊已移除，不再輸出 DOM */
        const crossPane = document.getElementById('cross-result');
        if(!crossPane) return;

        const bazi   = this.analysisResults && this.analysisResults.bazi;
        const meihua = this.analysisResults && this.analysisResults.meihua;
        const tarot  = this.analysisResults && this.analysisResults.tarot;
        const nameol = this.analysisResults && this.analysisResults.nameology;

        const hasBazi = !!bazi;
        const hasMeihua = !!meihua;
        const hasTarot = !!tarot;
        const hasName = !!nameol;

        const chip = (ok, label) => `
            <span class="chip ${ok ? 'good' : 'muted'}">
                <i class="fas fa-${ok ? 'check-circle' : 'circle'}"></i> ${label}
            </span>
        `;

        const clamp = (n) => Math.max(0, Math.min(100, n));
        let completeness = 0;
        completeness += hasBazi ? 25 : 0;
        completeness += hasMeihua ? 25 : 0;
        completeness += hasTarot ? 25 : 0;
        completeness += hasName ? 25 : 0;

        // 估算一致性（簡化）：吉凶傾向 + 成功率/分數
        let consistency = 50;
        try{
            let score = 0;
            let count = 0;

            if(hasTarot && tarot.analysis && typeof tarot.analysis.overallProbability === 'number'){
                score += tarot.analysis.overallProbability; count++;
            }
            if(hasName && typeof nameol.overallScore === 'number'){
                score += nameol.overallScore; count++;
            }
            if(hasMeihua){
                const f = (meihua.fortune || meihua.judgment || '');
                if(String(f).includes('大吉')) { score += 75; count++; }
                else if(String(f).includes('吉')) { score += 65; count++; }
                else if(String(f).includes('凶')) { score += 35; count++; }
                else if(String(f).trim() !== '') { score += 50; count++; }
            }
            if(hasBazi && bazi.fiveElements){
                // 喜用神有資料 => 略加權
                score += (bazi.favorableElements && bazi.favorableElements.length ? 60 : 50);
                count++;
            }

            if(count>0) consistency = score / count;
        }catch(e){
            console.warn('cross consistency calc error', e);
        }

        completeness = clamp(completeness);
        consistency = clamp(Math.round(consistency));

        const bar = (label, value) => `
            <div class="bar-row">
                <div class="bar-label">${label}</div>
                <div class="bar-track"><div class="bar-fill" style="width:${value}%"></div></div>
                <div class="bar-value">${value}%</div>
            </div>
        `;

        // 計算各模組的機率
        const getProbability = (module, type) => {
            if (type === 'bazi' && hasBazi) {
                if (bazi.fortuneScore !== undefined) return bazi.fortuneScore;
                if (bazi.overallProbability !== undefined) return bazi.overallProbability;
                return 50; // 預設值
            }
            if (type === 'meihua' && hasMeihua) {
                const f = (meihua.fortune || meihua.judgment || '');
                if(String(f).includes('大吉')) return 75;
                else if(String(f).includes('吉')) return 65;
                else if(String(f).includes('凶')) return 35;
                else if(String(f).trim() !== '') return 50;
                return 50;
            }
            if (type === 'tarot' && hasTarot && tarot.analysis) {
                if (tarot.analysis.fortuneScore !== undefined) return tarot.analysis.fortuneScore;
                if (tarot.analysis.overallProbability !== undefined) return tarot.analysis.overallProbability;
                return 50;
            }
            if (type === 'name' && hasName) {
                if (nameol.overallScore !== undefined) return nameol.overallScore;
                return 50;
            }
            return null;
        };

        const baziProb = getProbability(bazi, 'bazi');
        const meihuaProb = getProbability(meihua, 'meihua');
        const tarotProb = getProbability(tarot, 'tarot');
        const nameProb = getProbability(nameol, 'name');

        const commonThemes = [];
        if(hasMeihua && (meihua.bodyUseRelation || meihua.bodyUse)) commonThemes.push(`梅花：體用「${meihua.bodyUseRelation || meihua.bodyUse}」`);
        if(hasTarot && tarot.analysis && tarot.analysis.keyThemes && tarot.analysis.keyThemes.length) commonThemes.push(`塔羅：${tarot.analysis.keyThemes.slice(0,3).join('、')}`);
        if(hasBazi && bazi.favorableElements && bazi.favorableElements.length) commonThemes.push(`八字：喜用「${bazi.favorableElements.join('、')}」`);
        if(hasName && nameol.threeTalents && nameol.threeTalents.luck) commonThemes.push(`姓名：三才「${nameol.threeTalents.luck}」`);

        const probCard = (label, prob, hasData) => {
            if (!hasData) return '';
            return `
                <div style="padding: 1rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-weight: bold; color: var(--gold-primary);">${label}</span>
                        <span style="font-size: 1.5rem; font-weight: bold; color: var(--gold-bright);">${prob}%</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${prob}%; height: 100%; background: linear-gradient(90deg, var(--gold-primary), var(--gold-bright)); transition: width 0.3s;"></div>
                    </div>
                </div>
            `;
        };

        crossPane.innerHTML = `
            <div class="analysis-grid-container">
                <div class="analysis-card">
                    <div class="analysis-header">
                        <i class="fas fa-crosshairs"></i> 交叉驗證
                    </div>
                    <div style="padding: 1rem;">
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
                            ${chip(hasBazi,'八字')}
                            ${chip(hasMeihua,'梅花')}
                            ${chip(hasTarot,'塔羅')}
                            ${chip(hasName,'姓名')}
                        </div>

                        <div style="margin-bottom: 1rem;">
                            ${bar('完成度', completeness)}
                            ${bar('一致性', consistency)}
                        </div>
                    </div>
                </div>

                <div class="analysis-card">
                    <div class="analysis-header">
                        <i class="fas fa-chart-pie"></i> 各模組機率
                    </div>
                    <div style="padding: 1rem;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            ${probCard('八字', baziProb, hasBazi)}
                            ${probCard('梅花易數', meihuaProb, hasMeihua)}
                            ${probCard('塔羅', tarotProb, hasTarot)}
                            ${probCard('姓名學', nameProb, hasName)}
                        </div>
                    </div>
                </div>

                <div class="analysis-card">
                    <div class="analysis-header">
                        <i class="fas fa-link"></i> 共同指向
                    </div>
                    <div style="padding: 1rem;">
                        ${commonThemes.length > 0 ? `
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                ${commonThemes.map(t => `<div style="padding: 0.75rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px; border-left: 3px solid var(--gold-primary);"><i class="fas fa-check-circle"></i> ${t}</div>`).join('')}
                            </div>
                        ` : '<div style="color: rgba(255,255,255,0.6); padding: 1rem; text-align: center;">目前可用資料不足，請先完成各模組分析後再查看交叉驗證。</div>'}
                    </div>
                </div>

                <div class="analysis-card">
                    <div class="analysis-header">
                        <i class="fas fa-clipboard-check"></i> 判讀規則
                    </div>
                    <div class="text-content" style="padding: 1rem; line-height: 1.6;">
                        本區以「可用資料」做整合展示，不會輸出 <code>null</code> 或 <code>undefined</code>。若某模組尚未完成，會以「缺資料」呈現。
                    </div>
                </div>
            </div>
        `;
    }
    
    validateAndRunStep1() {
        const qType = document.getElementById('question-type');
        const question = document.getElementById('question');
        const birthDate = document.getElementById('birth-date');
        if (!qType || !qType.value) { alert('請選擇問題類型'); return false; }
        if (!question || !String(question.value || '').trim()) { alert('請輸入諮詢問題'); return false; }
        if (!birthDate || !birthDate.value) { alert('請填寫出生日期'); return false; }
        this.userData.questionType = qType.value;
        this.userData.question = String(question.value || '').trim();
        this.userData.name = (document.getElementById('name')?.value || '').trim();
        this.userData.birthDate = birthDate.value;
        this.userData.birthTime = document.getElementById('birth-time')?.value || '12:00';
        this.userData.gender = document.querySelector('input[name="gender"]:checked')?.value || 'male';
        this.userData.useSolarTime = document.getElementById('true-solar-time')?.checked || false;
        if (!this.userData.gender) { alert('請選擇性別'); return false; }
        const country = document.getElementById('birth-country')?.value;
        const city = document.getElementById('birth-city')?.value;
        if (!country || !city) { alert('請選擇出生地區與城市'); return false; }
        return true;
    }
    
    runBackgroundCalculations() {
        try {
            const useSolarTime = this.userData.useSolarTime || false;
            const longitude = parseFloat(document.getElementById('longitude')?.textContent) || 121.5654;
            let timeStr = this.userData.birthTime || '12:00';
            if (!timeStr.includes(':')) timeStr = timeStr.length >= 4 ? timeStr.substring(0,2)+':'+timeStr.substring(2) : '12:00';
            const fullBirthDate = `${this.userData.birthDate}T${(timeStr.length===5 ? timeStr+':00' : timeStr)}`;
            if (typeof BaziCalculator !== 'undefined') {
                const calculator = new BaziCalculator();
                const fullBaziData = calculator.calculateBazi(fullBirthDate, this.userData.gender, useSolarTime, longitude, { userName: this.userData.name, birthDate: this.userData.birthDate });
                const baziData = { year: { gan: fullBaziData.fourPillars.year.gan, zhi: fullBaziData.fourPillars.year.zhi }, month: { gan: fullBaziData.fourPillars.month.gan, zhi: fullBaziData.fourPillars.month.zhi }, day: { gan: fullBaziData.fourPillars.day.gan, zhi: fullBaziData.fourPillars.day.zhi }, hour: { gan: fullBaziData.fourPillars.hour.gan, zhi: fullBaziData.fourPillars.hour.zhi }, elementStrength: fullBaziData.elementStrength, favorableElements: fullBaziData.favorableElements };
                this.analysisResults = this.analysisResults || {};
                this.analysisResults.bazi = { data: baziData, fullData: fullBaziData, birthDate: this.userData.birthDate, birthTime: this.userData.birthTime, gender: this.userData.gender };
            }
            /* 梅花易數由使用者在梅花易數頁自行起卦，不在此預先執行 */
        } catch (e) { console.error('背景計算錯誤:', e); }
    }
    
    calculateBazi() {
        const grid = document.getElementById('bazi-grid');
        if(grid) grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 正在排盤分析中...</div>';

        setTimeout(() => {
            try {
                this.userData.name = (document.getElementById('name')?.value || '').trim();
                this.userData.birthDate = document.getElementById('birth-date')?.value || '';
                this.userData.birthTime = document.getElementById('birth-time')?.value || '';
                this.userData.gender = document.querySelector('input[name="gender"]:checked')?.value || 'male';
                this.userData.useSolarTime = document.getElementById('true-solar-time') ? document.getElementById('true-solar-time').checked : false;

                // 驗證輸入
                if (!this.userData.birthDate || !this.userData.birthTime) {
                    throw new Error('請填寫完整的出生日期和時間');
                }

                const useSolarTime = document.getElementById('true-solar-time')?.checked || false;
                const longitude = parseFloat(document.getElementById('longitude')?.textContent) || 121.5654;
                
                // 確保時間格式正確（HH:MM）
                let timeStr = this.userData.birthTime;
                if (!timeStr.includes(':')) {
                    // 如果時間格式不對，嘗試修正
                    if (timeStr.length === 4) {
                        timeStr = `${timeStr.substring(0, 2)}:${timeStr.substring(2)}`;
                    } else {
                        throw new Error('時間格式錯誤，請使用 HH:MM 格式（例如：10:30）');
                    }
                }
                
                const fullBirthDate = `${this.userData.birthDate}T${timeStr}:00`;
                
                // 驗證日期格式
                const testDate = new Date(fullBirthDate);
                if (isNaN(testDate.getTime())) {
                    throw new Error(`無效的日期格式：${fullBirthDate}。請檢查日期和時間格式是否正確。`);
                }
                
                // 使用完整的八字計算系統
                if (typeof BaziCalculator !== 'undefined') {
                    const calculator = new BaziCalculator();
                    const fullBaziData = calculator.calculateBazi(
                        fullBirthDate, 
                        this.userData.gender, 
                        useSolarTime, 
                        longitude,
                        { userName: this.userData.name, birthDate: this.userData.birthDate }
                    );
                    
                    // 轉換為舊格式以兼容現有顯示
                    const baziData = {
                        year: { gan: fullBaziData.fourPillars.year.gan, zhi: fullBaziData.fourPillars.year.zhi },
                        month: { gan: fullBaziData.fourPillars.month.gan, zhi: fullBaziData.fourPillars.month.zhi },
                        day: { gan: fullBaziData.fourPillars.day.gan, zhi: fullBaziData.fourPillars.day.zhi },
                        hour: { gan: fullBaziData.fourPillars.hour.gan, zhi: fullBaziData.fourPillars.hour.zhi },
                        elementStrength: fullBaziData.elementStrength, // 添加五行強度數據
                        favorableElements: fullBaziData.favorableElements // 添加喜用神數據
                    };
                    
                    this.renderBaziGrid(baziData);
                    this.renderBaziDetails(baziData);
                    this.renderDayun(this.userData.gender, baziData.year.gan, baziData.month, baziData.day?.gan, fullBaziData.greatFortune);
                    this.renderAdvancedAnalysis(fullBaziData);
                    
                    document.getElementById('time-correction-info').style.display = 'block';
                    
                    // 確保 fullBaziData 包含 tenGods 和 hiddenStems
                    if (!fullBaziData.tenGods && typeof calculator.calculateTenGods === 'function') {
                        fullBaziData.tenGods = calculator.calculateTenGods(fullBaziData.fourPillars, fullBaziData.dayMaster || fullBaziData.fourPillars.day.gan);
                    }
                    if (!fullBaziData.hiddenStems && typeof calculator.calculateHiddenStems === 'function') {
                        fullBaziData.hiddenStems = calculator.calculateHiddenStems(fullBaziData.fourPillars);
                    }
                    
                    // 保存完整分析結果
                    if(!this.analysisResults) {
                        this.analysisResults = {};
                    }
                    this.analysisResults.bazi = {
                        data: baziData,
                        fullData: fullBaziData,
                        birthDate: this.userData.birthDate,
                        birthTime: this.userData.birthTime,
                        gender: this.userData.gender,
                        solarTime: this.calculatedSolarTime
                    };
                    
                    // 更新結果頁面的 UI（如果結果頁面已顯示）
                    setTimeout(() => {
                        const baziPane = document.getElementById('bazi-result');
                        if (baziPane && baziPane.querySelector('#ui-gods-grid')) {
                            this.displayBaziResult(this.analysisResults.bazi);
                        }
                    }, 100);
                } else {
                    // 降級到舊的計算方法
                    const useTime = useSolarTime && this.calculatedSolarTime 
                                    ? this.calculatedSolarTime : this.userData.birthTime;
                    const baziData = this.internalCalculateBazi(this.userData.birthDate, useTime);
                    this.renderBaziGrid(baziData);
                    this.renderBaziDetails(baziData);
                    let fallbackGreatFortune = null;
                    if (typeof BaziCalculator !== 'undefined') {
                        const calc = new BaziCalculator();
                        const fourPillars = { year: baziData.year, month: baziData.month, day: baziData.day, hour: baziData.hour };
                        const t = useTime || this.userData.birthTime || '12:00';
                        const fullBirth = `${this.userData.birthDate}T${t.length === 5 ? t + ':00' : t}`;
                        fallbackGreatFortune = calc.calculateGreatFortune(fullBirth, this.userData.gender, fourPillars);
                    }
                    this.renderDayun(this.userData.gender, baziData.year.gan, baziData.month, baziData.day?.gan, fallbackGreatFortune);
                    
                    document.getElementById('time-correction-info').style.display = 'block';
                    
                    if(!this.analysisResults) {
                        this.analysisResults = {};
                    }
                    this.analysisResults.bazi = {
                        data: baziData,
                        birthDate: this.userData.birthDate,
                        birthTime: useTime,
                        gender: this.userData.gender,
                        solarTime: this.calculatedSolarTime
                    };
                }
            } catch (e) {
                console.error('八字計算錯誤:', e);
                console.error('錯誤堆棧:', e.stack);
                if(grid) {
                    grid.innerHTML = '<div class="error">計算失敗：' + (e.message || '未知錯誤') + '<br>請檢查控制台獲取詳細信息</div>';
                }
                // 顯示錯誤詳情
                alert('八字計算失敗：' + (e.message || '未知錯誤') + '\n\n請檢查：\n1. 日期格式是否正確\n2. 時間格式是否正確\n3. 瀏覽器控制台是否有更多錯誤信息');
            }
        }, 500);
    }
    
    renderAdvancedAnalysis(fullBaziData) {
        // [PATCH] 安全字串化：避免 undefined.join / undefined 屬性導致整段初始化中斷
        const safeArr = (v) => Array.isArray(v) ? v : (v == null ? [] : [v]);
        const safeJoin = (v, sep = '、') => safeArr(v).filter(x => x !== undefined && x !== null && String(x).trim() !== '').map(x => String(x)).join(sep);
        const safeText = (v, fallback = '—') => (v === undefined || v === null || String(v).trim() === '') ? fallback : String(v);
        if(!fullBaziData || typeof fullBaziData !== 'object'){
            return `<div class="analysis-section"><div class="analysis-header"><h3>八字進階分析</h3></div><div class="analysis-content"><p>尚未取得八字資料，請先完成【八字計算】再生成分析。</p></div></div>`;
        }
        fullBaziData.analysis = fullBaziData.analysis || {};

        // 創建或更新詳細分析區域（插入結果區 bazi-result，手機／桌面皆可見，含桃花婚姻分析）
        let analysisContainer = document.getElementById('bazi-advanced-analysis');
        if (!analysisContainer) {
            analysisContainer = document.createElement('div');
            analysisContainer.id = 'bazi-advanced-analysis';
            analysisContainer.className = 'bazi-advanced-analysis';
        }
        const baziResult = document.getElementById('bazi-result');
        if (baziResult) {
            if (!baziResult.contains(analysisContainer)) {
                baziResult.appendChild(analysisContainer);
            }
        } else {
            const baziDetails = document.getElementById('bazi-details');
            if (baziDetails && baziDetails.parentNode && !analysisContainer.parentNode) {
                baziDetails.parentNode.insertBefore(analysisContainer, baziDetails.nextSibling);
            }
        }
        
        let html = '<div class="advanced-analysis-section">';
        html += '<h3><i class="fas fa-chart-line"></i> 詳細命理分析</h3>';
        
        // 十神分析 - 使用標準化數據
        const normalized = this.normalizeBaziResult(fullBaziData);
        html += '<div class="analysis-group">';
        html += '<h4>十神分析</h4>';
        html += '<div class="ten-gods-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">';
        const pillars = [
            {key: 'year', name: '年'},
            {key: 'month', name: '月'},
            {key: 'day', name: '日'},
            {key: 'hour', name: '時'}
        ];
        pillars.forEach(pillar => {
            const stemTen = normalized.tenGods[pillar.key]?.stem || '-';
            const branchTen = Array.isArray(normalized.tenGods[pillar.key]?.branch) ? normalized.tenGods[pillar.key].branch : [];
            const hiddenStems = normalized.hiddenStems[pillar.key] || [];
            
            // 如果沒有十神數據，嘗試計算
            let displayStemTen = stemTen;
            let displayBranchTen = branchTen;
            if (stemTen === '-' && fullBaziData.fourPillars) {
                const pillarData = fullBaziData.fourPillars[pillar.key];
                if (pillarData && fullBaziData.day) {
                    const dayGan = fullBaziData.day.gan || fullBaziData.fourPillars.day.gan;
                    displayStemTen = this.getTenGodFromStem(pillarData.gan, dayGan);
                }
            }
            if (displayBranchTen.length === 0 && hiddenStems.length > 0 && fullBaziData.day) {
                const dayGan = fullBaziData.day.gan || fullBaziData.fourPillars.day.gan;
                displayBranchTen = hiddenStems.map(s => this.getTenGodFromStem(s, dayGan));
            }
            
            html += `<div class="ten-god-item" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.3);">`;
            html += `<div class="pillar-name" style="font-weight: bold; margin-bottom: 0.5rem; color: var(--gold-primary);">${pillar.name}柱</div>`;
            html += `<div style="display: flex; flex-direction: row; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">`;
            html += `<span style="padding: 0.25rem 0.5rem; background: rgba(212, 175, 55, 0.2); border-radius: 4px; color: #ffffff;">${displayStemTen}</span>`;
            if (displayBranchTen.length > 0) {
                displayBranchTen.forEach(h => {
                    html += `<span style="padding: 0.25rem 0.5rem; background: rgba(212, 175, 55, 0.1); border-radius: 4px; color: #ffffff;">${h}</span>`;
                });
            } else {
                html += `<span style="padding: 0.25rem 0.5rem; color: rgba(255,255,255,0.5);">-</span>`;
            }
            html += `</div>`;
            html += `</div>`;
        });
        html += '</div>';
        html += '</div>';
        
        // 神煞分析（戰略修正：只顯示實際存在的，修正格式）
        const specialStars = fullBaziData.specialStars;
        const starList = [];
        
        // 檢查每個神煞是否實際存在於命盤中
        const fourPillars = fullBaziData.fourPillars;
        const allBranches = [fourPillars.year.zhi, fourPillars.month.zhi, fourPillars.day.zhi, fourPillars.hour.zhi];
        const allStems = [fourPillars.year.gan, fourPillars.month.gan, fourPillars.day.gan, fourPillars.hour.gan];
        
        Object.entries(specialStars).forEach(([key, value]) => {
            if (value === true || value) {
                // 只處理實際存在的值
                if (key.includes('PeachBlossom')) {
                    // 檢查桃花地支是否在命盤中
                    if (allBranches.includes(value)) {
                        starList.push(`桃花：${value}`);
                    }
                } else if (key.includes('Nobleman')) {
                    starList.push('天乙貴人');
                } else if (key.includes('Academic')) {
                    starList.push('文昌');
                } else if (key.includes('Horse')) {
                    // 檢查驛馬地支是否在命盤中
                    if (allBranches.includes(value)) {
                        starList.push(`驛馬：${value}`);
                    }
                } else if (key.includes('Blade')) {
                    starList.push('羊刃');
                } else if (key.includes('Canopy')) {
                    // 檢查華蓋地支是否在命盤中
                    if (allBranches.includes(value)) {
                        starList.push(`華蓋：${value}`);
                    }
                }
            }
        });
        
        if (starList.length > 0) {
            html += '<div class="analysis-group">';
            html += '<h4>神煞</h4>';
            html += `<div class="special-stars">${safeJoin(starList,'、')}</div>`;
            html += '</div>';
        }
        
        // 移除五行強弱和喜用神的文字顯示（因為UI已經顯示了）
        
        // 十二長生／星運／自坐／空亡（易兌格式）
        if (fullBaziData.longevity && typeof fullBaziData.longevity === 'object') {
            const ziZuo = fullBaziData.longevity.ziZuo || {};
            const voidBy = fullBaziData.voidEmptiness && fullBaziData.voidEmptiness.byPillar ? fullBaziData.voidEmptiness.byPillar : {};
            const hasAny = ['year','month','day','hour'].some(p => fullBaziData.longevity[p] != null);
            if (hasAny || Object.keys(ziZuo).length || Object.keys(voidBy).length) {
                html += '<div class="analysis-group longevity-group">';
                html += '<h4><i class="fas fa-leaf"></i> 星運／自坐／空亡</h4>';
                html += '<div class="longevity-grid">';
                ['year','month','day','hour'].forEach(pillar => {
                    const pillarName = { year: '年', month: '月', day: '日', hour: '時' }[pillar];
                    const star = fullBaziData.longevity[pillar];
                    const zz = ziZuo[pillar];
                    const vv = voidBy[pillar];
                    const parts = [];
                    if (star) parts.push('星運:' + star);
                    if (zz) parts.push('自坐:' + zz);
                    if (vv) parts.push('空亡:' + vv);
                    if (parts.length) {
                        html += `<div class="longevity-item"><span class="longevity-pillar-name">${pillarName}柱</span><span class="longevity-value">${parts.join('，')}</span></div>`;
                    }
                });
                html += '</div></div>';
            }
        }
        
        // 身強身弱依據（dm_strength.reasons）與規則追溯（rules_trace）— 推論依據 UI 美化
        const dm = fullBaziData.elementStrength && fullBaziData.elementStrength.dm_strength;
        const trace = fullBaziData.favorableElements && fullBaziData.favorableElements.rules_trace;
        if ((dm && dm.reasons && dm.reasons.length) || (trace && trace.length)) {
            html += '<div class="analysis-group reasoning-basis-card">';
            html += '<div class="reasoning-basis-header"><i class="fas fa-sitemap"></i><h4>推論依據</h4></div>';
            if (dm && dm.reasons && dm.reasons.length) {
                html += '<div class="reasoning-subsection"><div class="reasoning-subtitle"><i class="fas fa-balance-scale"></i><span>身強／身弱</span></div><div class="reasoning-list reasoning-strength">';
                dm.reasons.forEach(r => { html += `<div class="reasoning-item"><i class="fas fa-circle" aria-hidden="true"></i><span>${r}</span></div>`; });
                html += '</div></div>';
            }
            if (trace && trace.length) {
                html += '<div class="reasoning-subsection"><div class="reasoning-subtitle"><i class="fas fa-project-diagram"></i><span>喜忌規則追溯</span></div><div class="reasoning-list reasoning-rules">';
                trace.forEach(t => {
                    const ruleMatch = t.match(/\s*\(rule:\s*([^)]+)\)\s*$/);
                    const label = ruleMatch ? ruleMatch[1] : '';
                    const text = ruleMatch ? t.replace(/\s*\(rule:\s*[^)]+\)\s*$/, '').trim() : t;
                    html += `<div class="reasoning-item"><i class="fas fa-chevron-right" aria-hidden="true"></i><span>${text}</span>${label ? `<span class="reasoning-rule-tag">${label}</span>` : ''}</div>`;
                });
                html += '</div></div>';
            }
            html += '</div>';
        }
        
        // 命理分析（依八字推算，不用單一結論；傳入與 displayBaziResult 一致的 analyzerInput 格式）
        if (typeof BaziAnalyzer !== 'undefined') {
            try {
                const n = this.normalizeBaziResult(fullBaziData);
                const fp = n.pillars || {};
                const tg = n.tenGods || {};
                const analyzerInput = {
                    fourPillars: {
                        year:  { gan: fp.year?.stem || fp.year?.gan, zhi: fp.year?.branch || fp.year?.zhi },
                        month: { gan: fp.month?.stem || fp.month?.gan, zhi: fp.month?.branch || fp.month?.zhi },
                        day:   { gan: fp.day?.stem || fp.day?.gan, zhi: fp.day?.branch || fp.day?.zhi },
                        hour:  { gan: fp.hour?.stem || fp.hour?.gan, zhi: fp.hour?.branch || fp.hour?.zhi }
                    },
                    dayMaster: n.dayMaster || (fp.day && (fp.day.stem || fp.day.gan)),
                    elementStrength: fullBaziData.elementStrength || { bodyStrength: n.strengthText },
                    favorableElements: fullBaziData.favorableElements || { favorable: n.favorable || [], unfavorable: n.unfavorable || [] },
                    tenGods: {
                        yearStem:  (tg.year && (tg.year.stem || tg.year.gan)) || tg.yearStem,
                        monthStem: (tg.month && (tg.month.stem || tg.month.gan)) || tg.monthStem,
                        dayStem:   (tg.day && (tg.day.stem || tg.day.gan)) || tg.dayStem,
                        hourStem:  (tg.hour && (tg.hour.stem || tg.hour.gan)) || tg.hourStem,
                        yearBranch:  Array.isArray(tg.year?.branch) ? tg.year.branch : (tg.yearBranch || []),
                        monthBranch: Array.isArray(tg.month?.branch) ? tg.month.branch : (tg.monthBranch || []),
                        dayBranch:   Array.isArray(tg.day?.branch) ? tg.day.branch : (tg.dayBranch || []),
                        hourBranch:  Array.isArray(tg.hour?.branch) ? tg.hour.branch : (tg.hourBranch || [])
                    }
                };
                const analyzer = new BaziAnalyzer(analyzerInput);
                const personality = analyzer.analyzePersonality();
                const career = analyzer.analyzeCareer();
                const wealth = analyzer.analyzeWealth();
                const relationship = analyzer.analyzeRelationship();
                const health = analyzer.analyzeHealth();
                
                // 保存分析數據到 fullBaziData.analysis，供結果分析頁面使用
                if (!fullBaziData.analysis) {
                    fullBaziData.analysis = {};
                }
                fullBaziData.analysis.personality = personality;
                fullBaziData.analysis.career = career;
                fullBaziData.analysis.wealth = wealth;
                fullBaziData.analysis.relationship = relationship;
                fullBaziData.analysis.health = health;
                
                // 同時更新 analysisResults 中的數據
                if (this.analysisResults && this.analysisResults.bazi && this.analysisResults.bazi.fullData) {
                    if (!this.analysisResults.bazi.fullData.analysis) {
                        this.analysisResults.bazi.fullData.analysis = {};
                    }
                    this.analysisResults.bazi.fullData.analysis.personality = personality;
                    this.analysisResults.bazi.fullData.analysis.career = career;
                    this.analysisResults.bazi.fullData.analysis.wealth = wealth;
                    this.analysisResults.bazi.fullData.analysis.relationship = relationship;
                    this.analysisResults.bazi.fullData.analysis.health = health;
                }
                
                // 個性分析 - 使用卡片式 UI（每段開頭顯示八字依據）
                html += '<div class="analysis-group" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">';
                html += '<div class="analysis-card" style="padding: 1.5rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.3);">';
                html += '<h4 style="margin-bottom: 1rem; color: var(--gold-primary);"><i class="fas fa-user-circle"></i> 個性分析</h4>';
                html += `<div class="personality-analysis">`;
                if (personality.chartBasis && personality.chartBasis.trim() !== '') {
                    html += `<p style="margin-bottom: 0.75rem; font-size: 0.9rem; color: rgba(255,255,255,0.7); border-left: 3px solid rgba(212, 175, 55, 0.5); padding-left: 0.5rem;">${personality.chartBasis}</p>`;
                }
                html += `<div style="margin-bottom: 0.5rem;"><strong style="color: var(--gold-bright);">${personality.dayMaster}${personality.element}</strong> <span style="color: rgba(255,255,255,0.6);">(${personality.yinYang})</span></div>`;
                html += `<p style="margin-bottom: 1rem; line-height: 1.6;">${personality.personality}</p>`;
                html += `<div class="traits" style="display: flex; flex-direction: column; gap: 0.5rem;">`;
                html += `<div class="strengths" style="padding: 0.5rem; background: rgba(76, 175, 80, 0.2); border-radius: 4px;"><strong>優點：</strong>${safeJoin(personality.strengths,'、')}</div>`;
                html += `<div class="weaknesses" style="padding: 0.5rem; background: rgba(244, 67, 54, 0.2); border-radius: 4px;"><strong>缺點：</strong>${safeJoin(personality.weaknesses,'、')}</div>`;
                html += `</div>`;
                html += '</div>';
                html += '</div>';
                
                // 事業分析 - 使用卡片式 UI（每段開頭顯示八字依據）
                html += '<div class="analysis-card" style="padding: 1.5rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.3);">';
                html += '<h4 style="margin-bottom: 1rem; color: var(--gold-primary);"><i class="fas fa-briefcase"></i> 事業分析</h4>';
                html += `<div class="career-analysis">`;
                if (career.chartBasis && career.chartBasis.trim() !== '') {
                    html += `<p style="margin-bottom: 0.75rem; font-size: 0.9rem; color: rgba(255,255,255,0.7); border-left: 3px solid rgba(212, 175, 55, 0.5); padding-left: 0.5rem;">${career.chartBasis}</p>`;
                }
                html += `<div style="margin-bottom: 0.5rem;"><strong>適合行業：</strong><span style="display: inline-flex; flex-wrap: wrap; gap: 0.25rem;">${career.suitableCareers.slice(0, 8).map(c => `<span style="padding: 0.25rem 0.5rem; background: rgba(212, 175, 55, 0.2); border-radius: 4px;">${c}</span>`).join('')}</span></div>`;
                html += `<p style="margin-top: 0.5rem; line-height: 1.6;"><strong>發展方向：</strong>${safeText(career.developmentDirection || career.careerAdvice)}</p>`;
                html += '</div>';
                html += '</div>';
                html += '</div>';
                
                // 財運分析（重點式，與感情婚姻同風格）
                const hasWealthSource = wealth.wealthSource && wealth.wealthSource.trim() !== '';
                const hasWealthMethod = wealth.wealthMethod && wealth.wealthMethod.trim() !== '' && wealth.wealthMethod !== '—';
                const hasWealthSummary = wealth.summary && wealth.summary.trim() !== '';

                if (hasWealthSource || hasWealthMethod || hasWealthSummary) {
                    html += '<div class="analysis-card" style="padding: 1.5rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.3);">';
                    html += '<h4 style="margin-bottom: 1rem; color: var(--gold-primary);"><i class="fas fa-coins"></i> 財運分析</h4>';
                    html += '<div class="wealth-analysis">';
                    if (wealth.chartBasis && wealth.chartBasis.trim() !== '') {
                        html += `<p style="margin-bottom: 0.75rem; font-size: 0.9rem; color: rgba(255,255,255,0.7); border-left: 3px solid rgba(212, 175, 55, 0.5); padding-left: 0.5rem;">${wealth.chartBasis}</p>`;
                    }
                    if (hasWealthSource) {
                        html += `<div style="margin-bottom: 0.5rem;"><strong>財星：</strong><span style="color: rgba(255,255,255,0.9);">${wealth.wealthSource}</span></div>`;
                    }
                    if (hasWealthMethod) {
                        html += `<div style="margin-bottom: 0.5rem;"><strong>得財方式：</strong>${wealth.wealthMethod}</div>`;
                    }
                    if (hasWealthSummary) {
                        html += `<p style="line-height: 1.6; margin-top: 0.5rem;"><strong>建議：</strong>${wealth.summary}</p>`;
                    }
                    html += '</div>';
                    html += '</div>';
                }
                
                // 感情婚姻（桃花婚姻分析：夫妻宮、配偶星、桃花星、婚姻穩定性）
                const hasSpouseStar = relationship?.spouseAnalysis?.presence && relationship.spouseAnalysis.presence !== '未顯示' && relationship.spouseAnalysis.presence !== 'undefined';
                const hasMarriageStability = relationship?.marriageStability?.stability && relationship.marriageStability.stability !== '未顯示' && relationship.marriageStability.stability !== 'undefined';
                const hasPeachBlossom = relationship?.peachBlossom?.hasPeachBlossom || (relationship?.peachBlossom?.impact && relationship.peachBlossom.impact !== '');
                
                if (hasSpouseStar || hasMarriageStability || hasPeachBlossom || (relationship?.summary && relationship.summary.trim() !== '')) {
                    html += '<div class="analysis-card" style="padding: 1.5rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.3);">';
                    html += '<h4 style="margin-bottom: 1rem; color: var(--gold-primary);"><i class="fas fa-heart"></i> 感情婚姻</h4>';
                    html += `<div class="relationship-analysis">`;
                    if (relationship.chartBasis && relationship.chartBasis.trim() !== '') {
                        html += `<p style="margin-bottom: 0.75rem; font-size: 0.9rem; color: rgba(255,255,255,0.7); border-left: 3px solid rgba(212, 175, 55, 0.5); padding-left: 0.5rem;">${relationship.chartBasis}</p>`;
                    }
                    if (hasSpouseStar) {
                        html += `<div style="margin-bottom: 0.5rem;"><strong>配偶星：</strong>${relationship.spouseAnalysis.presence}</div>`;
                    }
                    if (hasPeachBlossom) {
                        html += `<div style="margin-bottom: 0.5rem;"><strong>桃花：</strong>${relationship.peachBlossom?.hasPeachBlossom ? '<span style="color: #f44336;">有</span> ' : ''}<span style="color: rgba(255,255,255,0.6);">${relationship.peachBlossom?.impact || ''}</span></div>`;
                    }
                    if (hasMarriageStability) {
                        html += `<p style="line-height: 1.6;"><strong>婚姻穩定性：</strong>${relationship.marriageStability.stability}</p>`;
                    }
                    if (relationship?.summary && relationship.summary.trim() !== '' && (!hasSpouseStar && !hasMarriageStability && !hasPeachBlossom)) {
                        html += `<p style="line-height: 1.6;">${relationship.summary}</p>`;
                    } else if (relationship?.summary && relationship.summary.trim() !== '') {
                        html += `<p style="line-height: 1.6; margin-top: 0.5rem;"><strong>建議：</strong>${relationship.summary}</p>`;
                    }
                    html += '</div>';
                    html += '</div>';
                }
                html += '</div>';
                
                // 健康分析 - 使用卡片式 UI，只顯示有數據的項目
                const hasConstitution = health.constitution && health.constitution !== 'undefined' && health.constitution.trim() !== '';
                const hasWeakOrgans = health.weakOrgans && Array.isArray(health.weakOrgans) && health.weakOrgans.length > 0;
                const hasHealthAdvice = health.healthAdvice && health.healthAdvice !== 'undefined' && health.healthAdvice.trim() !== '';
                
                if (hasConstitution || hasWeakOrgans || hasHealthAdvice) {
                    html += '<div class="analysis-group" style="margin-top: 1rem;">';
                    html += '<div class="analysis-card" style="padding: 1.5rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.3);">';
                    html += '<h4 style="margin-bottom: 1rem; color: var(--gold-primary);"><i class="fas fa-heartbeat"></i> 健康分析</h4>';
                    html += `<div class="health-analysis">`;
                    if (hasConstitution) {
                        html += `<div style="margin-bottom: 0.5rem;"><strong>體質：</strong>${health.constitution}</div>`;
                    }
                    if (hasWeakOrgans) {
                        html += `<div style="margin-bottom: 0.5rem;"><strong>需注意：</strong><span style="display: inline-flex; flex-wrap: wrap; gap: 0.25rem;">${safeJoin(health.weakOrgans,'、').split('、').filter(o => o && o.trim() !== '').map(o => `<span style="padding: 0.25rem 0.5rem; background: rgba(244, 67, 54, 0.2); border-radius: 4px;">${o}</span>`).join('')}</span></div>`;
                    }
                    if (hasHealthAdvice) {
                        html += `<p style="line-height: 1.6;"><strong>建議：</strong>${health.healthAdvice}</p>`;
                    }
                    html += '</div>';
                    html += '</div>';
                    html += '</div>';
                }
            } catch (e) {
                console.error('命理分析錯誤:', e);
            }
        }
        
        html += '</div>';
        analysisContainer.innerHTML = html;
    }

    internalCalculateBazi(dateStr, timeStr) {
        const date = new Date(dateStr + 'T' + timeStr);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();

        let yearOffset = year - 1900 + 36;
        if (month < 2 || (month === 2 && day < 4)) yearOffset -= 1;
        const getIdx = (n, mod) => ((n % mod) + mod) % mod;
        const yearGan = HEAVENLY_STEMS[getIdx(year - 4, 10)];
        const yearZhi = EARTHLY_BRANCHES[getIdx(year - 4, 12)];

        let monthZhiIdx = (month + 12 - 2) % 12 + 2; 
        if (monthZhiIdx >= 12) monthZhiIdx -= 12;
        const yearGanIdx = HEAVENLY_STEMS.indexOf(yearGan);
        const monthGanStart = (yearGanIdx % 5) * 2 + 2; 
        let monthOffset = month - 2;
        if (monthOffset < 0) monthOffset += 12;
        const monthGan = HEAVENLY_STEMS[(monthGanStart + monthOffset) % 10];
        const monthZhi = EARTHLY_BRANCHES[monthZhiIdx];

        const baseDate = new Date("1900-01-31");
        const diffTime = Math.abs(date - baseDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const dayGan = HEAVENLY_STEMS[(0 + diffDays) % 10];
        const dayZhi = EARTHLY_BRANCHES[(4 + diffDays) % 12];

        let hourZhiIdx = Math.floor((hour + 1) / 2) % 12;
        const dayGanIdx = HEAVENLY_STEMS.indexOf(dayGan);
        const hourGanStart = (dayGanIdx % 5) * 2;
        const hourGan = HEAVENLY_STEMS[(hourGanStart + hourZhiIdx) % 10];
        const hourZhi = EARTHLY_BRANCHES[hourZhiIdx];

        return { year: { gan: yearGan, zhi: yearZhi }, month: { gan: monthGan, zhi: monthZhi }, day: { gan: dayGan, zhi: dayZhi }, hour: { gan: hourGan, zhi: hourZhi } };
    }

    renderBaziGrid(data) {
        const grid = document.getElementById('bazi-grid');
        if (!grid) return;
        
        // 標準化數據以獲取十神
        const normalized = this.normalizeBaziResult(data);
        
        // 計算十神 - 使用數據中的 tenGods 如果存在，否則計算
        const getTenGod = (stem, dayGan, pillarIdx) => {
            // 如果數據中有 tenGods，優先使用
            if (data.tenGods) {
                const keys = ['yearStem', 'monthStem', 'dayStem', 'hourStem'];
                if (pillarIdx >= 0 && pillarIdx < 4) {
                    const tenGod = data.tenGods[keys[pillarIdx]];
                    if (tenGod) return tenGod;
                }
            }
            
            // 降級：計算十神
            const dayWx = WUXING_MAP[dayGan];
            const stemWx = WUXING_MAP[stem];
            const relation = this.getWuxingRelation(dayWx, stemWx);
            const tenGodMap = {
                'same': '比肩', 'rob': '劫財',
                'generate': '食神', 'drain': '傷官',
                'wealth': '正財', 'partialWealth': '偏財',
                'officer': '正官', 'kill': '七殺',
                'seal': '正印', 'partialSeal': '偏印'
            };
            return tenGodMap[relation] || '';
        };
        
        // 獲取藏干十神
        const getHiddenTenGods = (zhi, dayGan, pillarIdx) => {
            // 如果數據中有 tenGods，優先使用
            if (data.tenGods) {
                const keys = ['yearBranch', 'monthBranch', 'dayBranch', 'hourBranch'];
                if (pillarIdx >= 0 && pillarIdx < 4) {
                    const hiddenGods = data.tenGods[keys[pillarIdx]];
                    if (Array.isArray(hiddenGods) && hiddenGods.length > 0) {
                        return hiddenGods;
                    }
                }
            }
            
            // 降級：計算藏干十神
            const hiddenStems = getHiddenStems(zhi);
            return hiddenStems.map(s => getTenGod(s, dayGan, -1));
        };
        
        // 獲取藏干
        const getHiddenStems = (zhi) => {
            const hiddenMap = {
                '子': ['癸'], '丑': ['己','癸','辛'], '寅': ['甲','丙','戊'],
                '卯': ['乙'], '辰': ['戊','乙','癸'], '巳': ['丙','戊','庚'],
                '午': ['丁','己'], '未': ['己','丁','乙'], '申': ['庚','壬','戊'],
                '酉': ['辛'], '戌': ['戊','辛','丁'], '亥': ['壬','甲']
            };
            return hiddenMap[zhi] || [];
        };
        
        const getColor = (c) => { 
            const map = { '木':'wood', '火':'fire', '土':'earth', '金':'metal', '水':'water' }; 
            return map[WUXING_MAP[c]] || ''; 
        };
        
        const pillars = [
            {t:'年柱', d:data.year, key:'year'},
            {t:'月柱', d:data.month, key:'month'},
            {t:'日柱', d:data.day, key:'day'},
            {t:'時柱', d:data.hour, key:'hour'}
        ];
        
        // 使用與結果分析頁面完全一致的 UI 結構
        const dayGan = data.day.gan || normalized.dayMaster || '';
        
        // 初始化藏干分析器
        if (!this.hiddenStemsAnalyzer) {
            this.hiddenStemsAnalyzer = new HiddenStemsAnalyzer();
        }
        
        // 計算每個柱的十神和藏干（使用與 fillBaziResultUI 相同的邏輯）
        const calculatePillarTenGods = (key, pillarData) => {
            const pillarStem = pillarData.gan || '';
            const pillarBranch = pillarData.zhi || '';
            
            // 計算天干十神
            let stemTen = normalized.tenGods[key]?.stem || '';
            if (!stemTen || stemTen === '-') {
                if (pillarStem && pillarStem !== '-' && dayGan) {
                    stemTen = this.getTenGodFromStem(pillarStem, dayGan);
                } else {
                    stemTen = '';
                }
            }
            
            // 處理地支藏干的十神
            let branchTenArr = Array.isArray(normalized.tenGods[key]?.branch) ? normalized.tenGods[key].branch : [];
            let hiddenStems = Array.isArray(normalized.hiddenStems[key]) ? normalized.hiddenStems[key] : [];
            
            // 如果沒有藏干數據，從地支獲取
            if (hiddenStems.length === 0 && pillarBranch && pillarBranch !== '-') {
                hiddenStems = this.hiddenStemsAnalyzer.getHiddenStems(pillarBranch);
            }
            
            // 如果還是沒有，嘗試從全局數據獲取
            if (hiddenStems.length === 0 && pillarBranch && pillarBranch !== '-' && typeof EARTHLY_BRANCHES_DETAIL !== 'undefined') {
                hiddenStems = EARTHLY_BRANCHES_DETAIL[pillarBranch]?.hiddenStems || [];
            }
            
            // 如果還是沒有，嘗試從 bazi-system.js 的數據獲取
            if (hiddenStems.length === 0 && pillarBranch && pillarBranch !== '-' && typeof EARTHLY_BRANCHES_DETAIL === 'undefined') {
                if (typeof BAZI_DATA !== 'undefined' && BAZI_DATA.branchHiddenStems) {
                    const branchData = BAZI_DATA.branchHiddenStems[pillarBranch];
                    if (branchData) {
                        hiddenStems = [branchData.main, ...(branchData.others || [])].filter(s => s);
                    }
                }
            }
            
            // 如果沒有地支十神數據，從藏干計算
            if (branchTenArr.length === 0 && hiddenStems.length > 0 && dayGan) {
                branchTenArr = hiddenStems.map(s => this.getTenGodFromStem(s, dayGan));
            }
            
            // 去重並過濾空值
            branchTenArr = [...new Set(branchTenArr)].filter(t => t && t !== '-' && t !== '未知' && t !== '');
            const branchTen = branchTenArr.length > 0 ? branchTenArr.join('、') : '';
            
            return { stemTen: stemTen || '', branchTen: branchTen || '' };
        };
        
        grid.innerHTML = `
            <div class="analysis-grid-container bazi-grid-analysis">
                <div class="analysis-card analysis-card-tengods">
                    <div class="analysis-header">
                        <i class="fas fa-sitemap"></i> 十神與藏干詳解
                    </div>
                    <div class="gods-detail-grid" id="bazi-calc-gods-grid">
                        ${pillars.map((p) => {
                            const tenGods = calculatePillarTenGods(p.key, p.d);
                            return `
                                <div class="gods-column">
                                    <span class="gods-col-title">${p.t}</span>
                                    <span class="gods-item">${tenGods.stemTen || '-'}</span>
                                    <span class="gods-item">${tenGods.branchTen || '-'}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="analysis-row-wuxing-shensha">
                    <div class="analysis-card analysis-card-wuxing">
                        <div class="analysis-header">
                            <i class="fas fa-chart-pie"></i> 五行強弱分佈
                        </div>
                        <div class="element-bar-group" id="bazi-elements-bar">
                            ${this.renderElementBars(data)}
                        </div>
                    </div>
                    <div class="analysis-card analysis-card-shensha">
                        <div class="analysis-header">
                            <i class="fas fa-star"></i> 喜用與神煞
                        </div>
                        <div id="bazi-shensha-content">
                            ${this.renderShenshaContent(data)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderElementBars(data) {
        if (!data.elementStrength || !data.elementStrength.strengths) {
            return '<p>計算中...</p>';
        }
        
        const elements = ['金', '木', '水', '火', '土'];
        const elementMap = { '金': 'gold', '木': 'wood', '水': 'water', '火': 'fire', '土': 'earth' };
        const total = Object.values(data.elementStrength.strengths).reduce((a, b) => a + b, 0);
        
        return elements.map(el => {
            const strength = data.elementStrength.strengths[el] || 0;
            const percentage = total > 0 ? (strength / total * 100).toFixed(1) : 0;
            const elClass = elementMap[el] || '';
            return `
                <div class="element-row">
                    <span class="element-label el-${elClass}">${el}</span>
                    <div class="progress-track">
                        <div class="progress-fill bg-${elClass}" style="width: ${percentage}%;"></div>
                    </div>
                    <span class="element-value">${percentage}%</span>
                </div>
            `;
        }).join('');
    }
    
    renderShenshaContent(data) {
        const safeArr = (v) => Array.isArray(v) ? v : (v == null ? [] : [v]);
        const safeJoin = (v, sep = '、') => safeArr(v).filter(x => x !== undefined && x !== null && String(x).trim() !== '').map(x => String(x)).join(sep);
        
        const favorable = data.favorableElements?.favorable || [];
        const unfavorable = data.favorableElements?.unfavorable || [];
        
        return `
            <div style="margin-bottom: 1rem;">
                <p style="font-size:0.9rem; margin-bottom:5px; color:rgba(255,255,255,0.6);">喜用神：</p>
                <div class="tag-container">
                    ${favorable.length > 0 ? favorable.map(f => `<span class="bazi-tag tag-favorable">${f}</span>`).join('') : '<span class="bazi-tag">計算中</span>'}
                </div>
            </div>
            <div style="margin-bottom: 1rem;">
                <p style="font-size:0.9rem; margin-bottom:5px; color:rgba(255,255,255,0.6);">忌神：</p>
                <div class="tag-container">
                    ${unfavorable.length > 0 ? unfavorable.map(u => `<span class="bazi-tag tag-unfavorable">${u}</span>`).join('') : '<span class="bazi-tag">計算中</span>'}
                </div>
            </div>
        `;
    }
    
    getTenGodFromStem(stem, dayGan) {
        // 優先使用全局的 TEN_GODS_MAP（如果存在）
        if (typeof TEN_GODS_MAP !== 'undefined' && TEN_GODS_MAP[dayGan] && TEN_GODS_MAP[dayGan][stem]) {
            return TEN_GODS_MAP[dayGan][stem];
        }
        
        // 使用新的 TenGodsCalculator
        if (!this.tenGodsCalculator) {
            this.tenGodsCalculator = new TenGodsCalculator();
        }
        const result = this.tenGodsCalculator.calculate(dayGan, stem);
        if (result && result !== '未知') {
            return result;
        }
        
        // 降級到基於五行關係的計算（保留舊邏輯作為備用）
        const dayWx = WUXING_MAP[dayGan];
        const stemWx = WUXING_MAP[stem];
        if (!dayWx || !stemWx) return '-';
        
        const relation = this.getWuxingRelation(dayGan, stem, dayWx, stemWx);
        const tenGodMap = {
            'same': '比肩', 'rob': '劫財',
            'generate': '食神', 'drain': '傷官',
            'wealth': '正財', 'partialWealth': '偏財',
            'officer': '正官', 'kill': '七殺',
            'seal': '正印', 'partialSeal': '偏印'
        };
        return tenGodMap[relation] || '-';
    }
    
    getWuxingRelation(dayGan, targetGan, dayWx, targetWx) {
        // 同一天干
        if (dayGan === targetGan) return 'same';
        
        // 同五行但不同天干（陰陽不同）
        if (dayWx === targetWx) {
            // 判斷陰陽：甲丙戊庚壬為陽，乙丁己辛癸為陰
            const yangGan = ['甲', '丙', '戊', '庚', '壬'];
            const dayIsYang = yangGan.includes(dayGan);
            const targetIsYang = yangGan.includes(targetGan);
            return (dayIsYang === targetIsYang) ? 'same' : 'rob';
        }
        
        // 生我者為印（正印/偏印）
        const generate = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
        if (generate[targetWx] === dayWx) {
            const yangGan = ['甲', '丙', '戊', '庚', '壬'];
            const dayIsYang = yangGan.includes(dayGan);
            const targetIsYang = yangGan.includes(targetGan);
            return (dayIsYang === targetIsYang) ? 'seal' : 'partialSeal';
        }
        
        // 我生者為食傷（食神/傷官）
        if (generate[dayWx] === targetWx) {
            const yangGan = ['甲', '丙', '戊', '庚', '壬'];
            const dayIsYang = yangGan.includes(dayGan);
            const targetIsYang = yangGan.includes(targetGan);
            return (dayIsYang === targetIsYang) ? 'generate' : 'drain';
        }
        
        // 克我者為官殺（正官/七殺）
        const overcome = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };
        if (overcome[targetWx] === dayWx) {
            const yangGan = ['甲', '丙', '戊', '庚', '壬'];
            const dayIsYang = yangGan.includes(dayGan);
            const targetIsYang = yangGan.includes(targetGan);
            return (dayIsYang === targetIsYang) ? 'officer' : 'kill';
        }
        
        // 我克者為財（正財/偏財）
        if (overcome[dayWx] === targetWx) {
            const yangGan = ['甲', '丙', '戊', '庚', '壬'];
            const dayIsYang = yangGan.includes(dayGan);
            const targetIsYang = yangGan.includes(targetGan);
            return (dayIsYang === targetIsYang) ? 'wealth' : 'partialWealth';
        }
        
        return '-';
    }

    renderBaziDetails(data) {
        const elementsHtml = this.renderElementBars(data);
        const shenshaHtml = this.renderShenshaContent(data);
        // 更新五行強弱分佈：同時支援 index 的 #ui-elements-bar 與動態產生的 #bazi-elements-bar
        const elementsBar = document.getElementById('ui-elements-bar') || document.getElementById('bazi-elements-bar');
        if (elementsBar) {
            if (elementsBar.id === 'ui-elements-bar') {
                const rows = elementsBar.querySelectorAll('.element-row');
                const map = { '金': '金', '木': '木', '水': '水', '火': '火', '土': '土' };
                if (data.elementStrength && data.elementStrength.strengths && rows.length) {
                    const vals = data.elementStrength.strengths;
                    const total = Object.values(vals).reduce((a, b) => a + (Number(b) || 0), 0) || 1;
                    rows.forEach(row => {
                        const labelEl = row.querySelector('.element-label');
                        const fillEl = row.querySelector('.progress-fill') || row.querySelector('.bar-fill');
                        const valueEl = row.querySelector('.element-value');
                        const key = (labelEl && labelEl.textContent || '').trim();
                        const k = map[key] || key;
                        const v = Number(vals[k]) || 0;
                        const pct = Math.max(0, Math.min(100, (v / total) * 100));
                        if (fillEl) fillEl.style.width = pct.toFixed(0) + '%';
                        if (valueEl) valueEl.textContent = pct.toFixed(0) + '%';
                    });
                }
            } else {
                elementsBar.innerHTML = elementsHtml;
            }
        }
        // 更新喜用與神煞：同時支援 #ui-shensha-content 與 #bazi-shensha-content
        const shenshaContent = document.getElementById('ui-shensha-content') || document.getElementById('bazi-shensha-content');
        if (shenshaContent) {
            shenshaContent.innerHTML = shenshaHtml;
        }
        
        // 保留舊的詳細信息顯示（如果元素存在）
        const dayMasterEl = document.getElementById('day-master');
        if (dayMasterEl) {
            const dm = data.day.gan;
            const dmWx = WUXING_MAP[dm];
            dayMasterEl.innerHTML = `<b>${dm}</b> (${dmWx})`;
        }
    }

    /**
     * 運勢品質：使用 QualityMapper（與 utils/quality_mapper.py 對齊）。
     * cycle 可有 level（大吉/中吉/…）或 score；若無則以 levelFromGanzhi 推估，再無則 fallback。
     * @param {Object} cycle - { gan, zhi, ageStart, ageEnd, index, level?, score? }
     * @returns {{ label: string, class: string }}
     */
    getCycleQuality(cycle) {
        if (typeof QualityMapper !== 'undefined' && QualityMapper.getCycleQuality) {
            return QualityMapper.getCycleQuality(cycle, QualityMapper.DEFAULT_QUALITY);
        }
        const fb = { label: '平', class: 'neutral' };
        return fb;
    }

    renderDayun(gender, yearGan, monthPillar, dayMaster, greatFortune) {
        const timeline = document.getElementById('dayun-timeline');
        if (!timeline) return;

        const getColor = (c) => { const map = { '木':'#4CAF50', '火':'#F44336', '土':'#795548', '金':'#FF9800', '水':'#2196F3' }; return map[WUXING_MAP[c]] || '#333'; };
        const hasDayMaster = typeof dayMaster === 'string' && dayMaster.length > 0;
        const computeScore = typeof QualityMapper !== 'undefined' && QualityMapper.computeDayunScore;

        let html = '';
        if (greatFortune && (greatFortune.start_age_detail != null || greatFortune.startAge != null || greatFortune.direction)) {
            const startDetail = greatFortune.start_age_detail || (greatFortune.startAge != null ? greatFortune.startAge + '歲' : '');
            const dir = greatFortune.direction || '';
            html += '<div class="dayun-meta startLuckInfo" style="margin-bottom: 0.75rem; padding: 0.5rem; background: rgba(212,175,55,0.1); border-radius: 4px; font-size: 0.9rem; color: rgba(255,255,255,0.85);">起運：' + startDetail + (dir ? '；大運' + dir : '') + '</div>';
        }

        if (greatFortune && Array.isArray(greatFortune.fortunes) && greatFortune.fortunes.length > 0) {
            for (let i = 0; i < greatFortune.fortunes.length; i++) {
                const f = greatFortune.fortunes[i];
                const gan = f.gan;
                const zhi = f.zhi;
                const ageStart = f.ageStart;
                const ageEnd = f.ageEnd;
                const isCurrent = !!f.isCurrent;
                let level = f.fortuneLevel || null;
                let score = undefined;
                if (!level && hasDayMaster && computeScore) {
                    score = QualityMapper.computeDayunScore(gan, zhi, dayMaster);
                } else if (!level && typeof QualityMapper !== 'undefined' && QualityMapper.levelFromGanzhi) {
                    level = QualityMapper.levelFromGanzhi(gan, zhi);
                }
                const cycle = { gan, zhi, ageStart, ageEnd, index: i, level, score };
                const cycleWithLevel = { ...cycle, level: f.fortuneLevel || cycle.level };
                const q = this.getCycleQuality(cycleWithLevel);
                const qLabel = (q && q.label && String(q.label).trim()) ? q.label : '平';
                const qClass = (q && q.class) ? q.class : 'neutral';
                const ageStr = `${ageStart}–${ageEnd}歲`;
                const currentClass = isCurrent ? ' dayun-item--current' : '';
                const currentBadge = isCurrent ? '<span class="dayun-current-badge">當下大運</span>' : '';
                const fortuneTypeLabel = f.fortuneType || '中性';
                const fortuneTypeClass = fortuneTypeLabel === '喜用神大運' ? 'fav' : fortuneTypeLabel === '忌神大運' ? 'unfav' : 'mixed';
                const fortuneTypeBadge = `<span class="dayun-fortune-type dayun-fortune-type--${fortuneTypeClass}">${fortuneTypeLabel}</span>`;
                const tenGodsLabel = (f.tenGodsLabel && f.tenGodsLabel.trim() !== '') ? `<span class="dayun-ten-gods">${f.tenGodsLabel}</span>` : '';
                const remarkTitle = (f.fortuneRemark && String(f.fortuneRemark).trim()) ? ` title="${f.fortuneRemark.replace(/"/g, '&quot;')}"` : '';
                html += `<div class="dayun-item fortune-item${currentClass}"${remarkTitle}>${currentBadge}${fortuneTypeBadge}<div class="age">${ageStr}</div><div class="pillar"><div style="color:${getColor(gan)}">${gan}</div><div style="color:${getColor(zhi)}">${zhi}</div></div>${tenGodsLabel}<span class="dayun-quality dayun-quality--${qClass}">${qLabel}</span></div>`;
            }
        } else {
            const yangStems = ['甲', '丙', '戊', '庚', '壬'];
            const isYearGanYang = yangStems.includes(yearGan);
            const forward = (gender === 'male') ? isYearGanYang : !isYearGanYang;
            let sGan = HEAVENLY_STEMS.indexOf(monthPillar?.gan);
            let sZhi = EARTHLY_BRANCHES.indexOf(monthPillar?.zhi);
            if (sGan < 0 || sZhi < 0) return;

            let currentAge = null;
            if (this.userData && this.userData.birthDate) {
                const birthYear = new Date(this.userData.birthDate + 'T12:00:00').getFullYear();
                currentAge = new Date().getFullYear() - birthYear;
            }

            for (let i = 1; i <= 8; i++) {
                const idxG = forward ? (sGan + i) % 10 : (sGan - i + 10) % 10;
                const idxZ = forward ? (sZhi + i) % 12 : (sZhi - i + 12) % 12;
                const gan = HEAVENLY_STEMS[idxG];
                const zhi = EARTHLY_BRANCHES[idxZ];
                const ageStart = 3 + (i - 1) * 10;
                const ageEnd = ageStart + 9;
                let level = null;
                let score = undefined;
                if (hasDayMaster && computeScore) {
                    score = QualityMapper.computeDayunScore(gan, zhi, dayMaster);
                } else if (typeof QualityMapper !== 'undefined' && QualityMapper.levelFromGanzhi) {
                    level = QualityMapper.levelFromGanzhi(gan, zhi);
                }
                const cycle = { gan, zhi, ageStart, ageEnd, index: i - 1, level, score };
                const isCurrent = currentAge != null && currentAge >= ageStart && currentAge <= ageEnd;
                const q = this.getCycleQuality(cycle);
                const qLabel = (q && q.label && String(q.label).trim()) ? q.label : '平';
                const ageStr = `${ageStart}–${ageEnd}歲`;
                const currentClass = isCurrent ? ' dayun-item--current' : '';
                const currentBadge = isCurrent ? '<span class="dayun-current-badge">當下大運</span>' : '';
                const fortuneTypeBadge = '<span class="dayun-fortune-type dayun-fortune-type--mixed">中性</span>';
                html += `<div class="dayun-item fortune-item${currentClass}">${currentBadge}${fortuneTypeBadge}<div class="age">${ageStr}</div><div class="pillar"><div style="color:${getColor(gan)}">${gan}</div><div style="color:${getColor(zhi)}">${zhi}</div></div><span class="dayun-quality dayun-quality--${q.class}">${qLabel}</span></div>`;
            }
        }

        timeline.innerHTML = html;
    }
}

// ==========================================
// 5. 梅花易數模組 (修復版)
// ==========================================
const MeihuaModule = {
    // 實例化計算器
    calculator: new PlumBlossomCalculator(),

    renderHexagram: function(containerId, hexagramData, nameId = null) {
        const container = document.getElementById(containerId);
        if(!container) return;
        
        // 獲取 lines 陣列 (從新版數據結構中獲取)
        const lines = hexagramData.lines || [1,1,1,1,1,1]; 
        
        let linesHtml = '';
        // 注意：lines[0] 是初爻 (最下面)，但 HTML 堆疊是從上到下。
        // 所以我們使用 CSS flex-direction: column-reverse 來解決，這裡依序輸出即可。
        lines.forEach((isYang, index) => { 
            const type = isYang ? 'yang' : 'yin';
            // 添加 data-index 方便調試或加樣式
            linesHtml += `<div class="yao ${type}" data-index="${index+1}"></div>`; 
        });
        
        container.innerHTML = `<div class="gua-visual">${linesHtml}</div>`;
        
        if(nameId) {
            const nameEl = document.getElementById(nameId);
            if(nameEl) nameEl.innerText = hexagramData.name;
        }
    },

    calculateTime: function() {
        console.log('時間起卦 (含秒數)...');
        try {
            // 1. 獲取當前時間顯示在 UI
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
            
            const dateEl = document.getElementById('meihua-date');
            const timeEl = document.getElementById('meihua-time');
            if(dateEl) dateEl.value = dateStr;
            if(timeEl) timeEl.value = timeStr; // 顯示秒數，讓用戶知道變了

            // 2. 調用核心算法 (method='time' 會自動抓取 new Date() 含秒)
            const result = this.calculator.divine('time');
            
            console.log('計算結果:', result);
            this.displayResults(result);
        } catch(e) {
            console.error('calculateTime 錯誤:', e);
            alert("計算時發生錯誤：" + e.message);
        }
    },

    calculateNumber: function() {
        console.log('數字起卦...');
        try {
            const n1 = parseInt(document.getElementById('number1').value) || 0;
            const n2 = parseInt(document.getElementById('number2').value) || 0;
            const n3 = parseInt(document.getElementById('number3').value) || 0;
            
            if(n1 === 0 || n2 === 0) { 
                alert("請輸入有效的數字！"); 
                return; 
            }
            
            const result = this.calculator.divine('number', { numbers: [n1, n2, n3] });
            console.log('數字起卦結果:', result);
            this.displayResults(result);
        } catch(e) {
            console.error('calculateNumber 錯誤:', e);
            alert("計算時發生錯誤：" + e.message);
        }
    },

    calculateCharacter: function() {
        console.log('漢字起卦...');
        try {
            const text = document.getElementById('meihua-character').value.trim();
            if(!text) { 
                alert("請輸入漢字！"); 
                return; 
            }
            
            const result = this.calculator.divine('character', { text: text });
            console.log('漢字起卦結果:', result);
            this.displayResults(result);
        } catch(e) {
            console.error('calculateCharacter 錯誤:', e);
            alert("計算時發生錯誤：" + e.message);
        }
    },

    displayResults: function(result) {
        console.log('顯示梅花易數結果:', result);
        
        // 渲染三個卦圖
        this.renderHexagram('ben-hexagram', result.benGua, 'ben-name');
        this.renderHexagram('hu-hexagram', result.huGua, 'hu-name');
        this.renderHexagram('bian-hexagram', result.bianGua, 'bian-name');
        
        // 更新文字資訊
        document.getElementById('dongyao').innerText = `動爻：第 ${result.movingLine} 爻`;
        document.getElementById('tiyong-relation').innerText = `體用：${result.tiYong.relation}`;
        document.getElementById('fortune-judgment').innerText = `${result.tiYong.judgment} / 本卦${result.benGua.luck}`;
        
        const desc = `本卦為【${result.benGua.name}】，${result.benGua.nature}。\n` +
                     `變卦為【${result.bianGua.name}】，${result.bianGua.nature}。\n` +
                     `分析：${result.tiYong.relation}，${result.tiYong.judgment}。`;
        
        document.getElementById('hexagram-interpretation').innerText = desc;
        
        // 保存結果到全局
        if(window.fortuneSystem) {
            if(!window.fortuneSystem.analysisResults) window.fortuneSystem.analysisResults = {};
            window.fortuneSystem.analysisResults.meihua = result;
            console.log('梅花易數結果已保存到全局:', result);
        }
    }
};

// ==========================================
// 6. 塔羅牌模組
// ==========================================
const TarotModule = {
    deck: [],
    drawnCards: [],
    init: function() { 
        // [FIX] 先嘗試使用 TAROT_CARDS（若不足 78 張則由 TAROT_DATA 重建完整牌庫）
        this.deck = (typeof TAROT_CARDS !== 'undefined' && Array.isArray(TAROT_CARDS)) ? [...TAROT_CARDS] : []; 
        this.drawnCards = []; 
        try {
            if ((!this.deck || this.deck.length < 78) && typeof TAROT_DATA !== 'undefined' && TAROT_DATA && typeof TAROT_DATA === 'object') {
                this.deck = this.buildDeckFromTarotData(TAROT_DATA);
            }
        } catch (e) {
            console.warn('[Tarot] buildDeckFromTarotData failed, fallback to TAROT_CARDS:', e);
            this.deck = (typeof TAROT_CARDS !== 'undefined' && Array.isArray(TAROT_CARDS)) ? [...TAROT_CARDS] : [];
        }
    },
    
    // [FIX] 由 TAROT_DATA 重建完整 78 張牌（若 TAROT_CARDS 不完整）
    buildDeckFromTarotData: function(db) {
        const deck = [];
        try {
            const suitBase = { major: 0, wands: 22, cups: 36, swords: 50, pentacles: 64 };
            Object.keys(db || {}).forEach((k, i) => {
                const v = db[k] || {};
                let suit = 'major';
                let number = null;
                let id = i;

                if (typeof k === 'string' && k.indexOf('_') !== -1) {
                    const parts = k.split('_');
                    suit = parts[0] || 'major';
                    number = parseInt(parts[1], 10);
                    if (!isNaN(number)) {
                        if (suit === 'major') id = number;
                        else if (typeof suitBase[suit] === 'number') id = suitBase[suit] + number;
                    }
                } else if (String(k).match(/^\d+$/)) {
                    suit = 'major';
                    number = parseInt(k, 10);
                    id = number;
                }

                const rawName = (v.name || v.nameEn || ('Card ' + k));
                const name = String(rawName).split('(')[0].trim();

                deck.push({
                    id: id,
                    key: k,
                    name: name,
                    number: (number !== null && !isNaN(number)) ? number : id,
                    suit: suit,
                    image: (function(){
                        try {
                            if (typeof k === 'string') {
                                // e.g. major_0 / wands_1 ...
                                return 'images/' + k + '.jpg';
                            }
                            // numeric key: treat as major
                            const n = (number !== null && !isNaN(number)) ? number : id;
                            return 'images/major_' + String(n) + '.jpg';
                        } catch (e) { return 'images/back.jpg'; }
                    })(),
                    element: v.element || '',
                    upright: v.upright || v.meaning || '',
                    reversed: v.reversed || '',
                    meaning: v.meaning || v.upright || '',
                    celticMeaning: v.celticMeaning || ''
                });
            });
        } catch (e) {
            console.error('[Tarot] buildDeckFromTarotData error:', e);
        }
        // 依 id 排序（確保 major 0-21、四花色 1-14）
        deck.sort((a, b) => {
            const ai = (typeof a.id === 'number') ? a.id : parseInt(a.id, 10);
            const bi = (typeof b.id === 'number') ? b.id : parseInt(b.id, 10);
            if (!isNaN(ai) && !isNaN(bi)) return ai - bi;
            return String(a.id).localeCompare(String(b.id));
        });
        return deck;
    },

    initDrawCircle: function() {
        const circle = document.getElementById('draw-circle');
        circle.innerHTML = ''; this.drawnCards = []; 
        document.getElementById('cards-left').innerText = '10';
        document.getElementById('finish-draw').disabled = true;
        
        // 根據屏幕寬度和高度動態調整圓圈半徑，確保手機上完整顯示且不超出
        const screenWidth = window.innerWidth || document.documentElement.clientWidth;
        const screenHeight = window.innerHeight || document.documentElement.clientHeight;
        const isMobile = screenWidth <= 768;
        
        let radius;
        if (screenWidth <= 375) {
            // 小屏幕手機（如 iPhone SE）
            radius = Math.min(70, screenWidth * 0.18, screenHeight * 0.12);
        } else if (screenWidth <= 480) {
            // 中等手機屏幕
            radius = Math.min(85, screenWidth * 0.20, screenHeight * 0.14);
        } else if (screenWidth <= 768) {
            // 大手機/小平板
            radius = Math.min(110, screenWidth * 0.22, screenHeight * 0.16);
        } else {
            // 桌面屏幕
            radius = 220;
        }
        
        // 確保圓圈不會超出容器（考慮卡片寬度和padding）
        const circleElement = circle;
        const computedStyle = window.getComputedStyle(circleElement);
        const padding = parseInt(computedStyle.paddingLeft || '15') + parseInt(computedStyle.paddingRight || '15');
        const maxRadius = (Math.min(screenWidth - padding, screenHeight * 0.5) / 2) - 30; // 30px 為卡片寬度的一半
        radius = Math.min(radius, maxRadius);
        
        // [FIX] 改為「扇形排牌」可點選（配合 tarot.css 的 .fan-container/.fan-card）
        try {
            // 移除虛線圓圈視覺（使用扇形排牌）
            circle.style.border = 'none';
            circle.style.width = '100%';
            circle.style.maxWidth = '100%';
            circle.style.height = (isMobile ? '300px' : '460px');
            circle.style.margin = '0 auto';
            circle.style.overflow = 'visible';
            circle.style.position = 'relative';
        } catch (e) {}

        const fan = document.createElement('div');
        fan.className = 'fan-container';
        circle.appendChild(fan);

        /* 扇形空間：上一版（32/38 張、±72/±68°） */
        const total = (screenWidth <= 480) ? 32 : ((screenWidth <= 768) ? 38 : 60);
        const startAngle = (screenWidth <= 480) ? -72 : ((screenWidth <= 768) ? -68 : -60);
        const endAngle = (screenWidth <= 480) ? 72 : ((screenWidth <= 768) ? 68 : 60);
        const span = (endAngle - startAngle);
        for (let i = 0; i < total; i++) {
            const card = document.createElement('div');
            card.className = 'fan-card';
            card.style.left = '50%';
            const angle = startAngle + (span * (i / Math.max(1, (total - 1))));
            card.style.transform = `translateX(-50%) rotate(${angle}deg)`;
            card.style.zIndex = String(i + 1);
            card.addEventListener('click', (e) => this.handleDrawCard(e.currentTarget));
            fan.appendChild(card);
        }
    },
    handleDrawCard: function(cardElement) {
        if(this.drawnCards.length >= 10) return;
        let randomIndex; let cardData;
        const sourceDeck = (this.deck && this.deck.length) ? this.deck : (typeof TAROT_CARDS !== 'undefined' && Array.isArray(TAROT_CARDS) ? TAROT_CARDS : []);
        do { randomIndex = Math.floor(Math.random() * sourceDeck.length); cardData = sourceDeck[randomIndex]; } while(this.drawnCards.some(c => c.id === cardData.id));
        const isRev = (Math.random() > 0.5);
        this.drawnCards.push({ ...cardData, isReversed: isRev, orientation: isRev ? 'reversed' : 'upright' });
        try{ cardElement.classList.add('selected'); }catch(e){}
        cardElement.style.opacity = '0'; cardElement.style.pointerEvents = 'none';
        const left = 10 - this.drawnCards.length; document.getElementById('cards-left').innerText = left;
        if(left === 0) { document.getElementById('finish-draw').disabled = false; setTimeout(() => this.finishDraw(), 800); }
    },
    autoDraw: function() {
        const sourceDeck = (this.deck && this.deck.length) ? this.deck : (typeof TAROT_CARDS !== 'undefined' && Array.isArray(TAROT_CARDS) ? TAROT_CARDS : []);
        while(this.drawnCards.length < 10) {
            let randomIndex = Math.floor(Math.random() * sourceDeck.length); let cardData = sourceDeck[randomIndex];
            if(!this.drawnCards.some(c => c.id === cardData.id)) {
                const isRev = (Math.random() > 0.5);
                this.drawnCards.push({ ...cardData, isReversed: isRev, orientation: isRev ? 'reversed' : 'upright' });
            }
        }
        document.getElementById('cards-left').innerText = '0'; this.finishDraw();
    },
    finishDraw: function() {
        document.getElementById('draw-area').style.display = 'none';
        document.getElementById('spread-area').style.display = 'block';
        this.renderSpread();
    },
    renderSpread: function() {
        const slots = document.querySelectorAll('.spread-position');
        slots.forEach((slot, index) => {
            if(index >= this.drawnCards.length) return;
            const cardData = this.drawnCards[index];
            const cardEl = slot.querySelector('.tarot-card');
            const flipEl = cardEl.querySelector('.card-flip');
            const frontDiv = cardEl.querySelector('.card-face.front');
            
            // 確保卡片初始狀態是背面朝上
            if(flipEl) flipEl.classList.remove('flipped');
            
            // 設置正面圖片與牌義資訊（牌名、正逆位、大意、此位置意義）
            if(frontDiv && cardData) {
                frontDiv.innerHTML = '';
                var imgWrap = document.createElement('div');
                imgWrap.className = 'card-front-img-wrap' + (cardData.isReversed ? ' reversed' : '');
                var img = document.createElement('img');
                img.src = cardData.image || 'images/back.jpg';
                img.alt = cardData.name || '塔羅牌';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.onerror = function() {
                    if (cardData.image && cardData.image.indexOf('wands_11') >= 0) this.src = 'images/wands11.jpg';
                    else { this.src = 'images/back.jpg'; this.style.opacity = '0.5'; }
                };
                img.onload = function() { this.style.opacity = '1'; };
                imgWrap.appendChild(img);
                frontDiv.appendChild(imgWrap);

                cardEl.setAttribute('data-card-index', String(index));
            }
        });

        // 手動翻牌：在牌陣容器上使用事件委派，點擊任一張牌（或牌內 img/div）皆可翻牌
        var spreadArea = document.getElementById('spread-area');
        if (spreadArea) {
            var oldSpread = spreadArea.getAttribute('data-flip-bound');
            if (oldSpread) spreadArea.removeEventListener('click', TarotModule._flipCardDelegate);
            var delegate = function(e) {
                if (e.target.closest('button')) return;
                var card = e.target.closest('.tarot-card');
                if (!card) return;
                var flip = card.querySelector('.card-flip');
                if (flip) {
                    flip.classList.toggle('flipped');
                    if (TarotModule && TarotModule.updateAnalyzeButtonState) TarotModule.updateAnalyzeButtonState();
                }
            };
            TarotModule._flipCardDelegate = delegate;
            spreadArea.addEventListener('click', delegate);
            spreadArea.setAttribute('data-flip-bound', '1');
        }

        // 進行分析按鈕：初始為禁用，須全部翻牌後才可點
        const analyzeBtn = document.getElementById('proceed-to-result');
        if(analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.setAttribute('title', '請先翻完所有牌才能進行分析');
        }
        if(TarotModule && TarotModule.updateAnalyzeButtonState) TarotModule.updateAnalyzeButtonState();

        // 全部翻牌按鈕（翻完後會啟用「進行分析」）
        const flipAllBtn = document.getElementById('flip-all');
        if(flipAllBtn) {
            const newFlipBtn = flipAllBtn.cloneNode(true);
            flipAllBtn.parentNode.replaceChild(newFlipBtn, flipAllBtn);
            newFlipBtn.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('.spread-area .card-flip').forEach(flip => {
                    flip.classList.add('flipped');
                });
                if(TarotModule && TarotModule.updateAnalyzeButtonState) TarotModule.updateAnalyzeButtonState();
            });
        }

        // 進行分析按鈕點擊（僅在全部翻牌後可執行）
        const analyzeBtnForClick = document.getElementById('proceed-to-result');
        if(analyzeBtnForClick) {
            const newAnalyzeBtn = analyzeBtnForClick.cloneNode(true);
            analyzeBtnForClick.parentNode.replaceChild(newAnalyzeBtn, analyzeBtnForClick);
            newAnalyzeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if(TarotModule && TarotModule.performAnalysis) TarotModule.performAnalysis();
            });
        }
    },
    /** 是否已全部翻牌（10 張皆有 .flipped） */
    areAllCardsFlipped: function() {
        var flips = document.querySelectorAll('.spread-area .card-flip');
        if(flips.length !== 10) return false;
        for(var i = 0; i < flips.length; i++) {
            if(!flips[i].classList.contains('flipped')) return false;
        }
        return true;
    },
    /** 依翻牌狀態更新「進行分析」按鈕：全部翻完才啟用 */
    updateAnalyzeButtonState: function() {
        var btn = document.getElementById('proceed-to-result');
        if(!btn) return;
        var allFlipped = this.areAllCardsFlipped && this.areAllCardsFlipped();
        btn.disabled = !allFlipped;
        btn.setAttribute('title', allFlipped ? '可進行分析' : '請先翻完所有牌才能進行分析');
    },
    performAnalysis: function() {
        // 須先完成抽牌
        if(!this.drawnCards || this.drawnCards.length === 0) {
            alert('請先完成抽牌！');
            return;
        }
        // 須全部翻完牌才能分析（沒翻完不知道是什麼牌）
        if(!this.areAllCardsFlipped || !this.areAllCardsFlipped()) {
            alert('請先翻完所有牌，才能進行分析。');
            return;
        }

        const questionEl = document.getElementById('question');
        const question = questionEl ? questionEl.value : '未提供問題';
        console.log('問題:', question);
        
        try {
            const analysis = this.generateCelticCrossAnalysis(this.drawnCards, question);
            console.log('分析結果:', analysis);
            
            // 保存分析結果
            if(window.fortuneSystem) {
                if(!window.fortuneSystem.analysisResults) {
                    window.fortuneSystem.analysisResults = {};
                }
                window.fortuneSystem.analysisResults.tarot = {
                    cards: this.drawnCards,
                    question: question,
                    analysis: analysis
                };
            }
            
            // 跳轉到結果頁面
            if(window.fortuneSystem) {
                window.fortuneSystem.showSection('result-section');
                // 延遲顯示結果，確保頁面已切換
                setTimeout(() => {
                    if(this.displayTarotResult) {
                        this.displayTarotResult(analysis);
                    } else {
                        console.error('displayTarotResult 方法不存在');
                    }
                }, 300);
            } else {
                console.error('window.fortuneSystem 不存在');
            }
        } catch(error) {
            console.error('分析過程出錯:', error);
            alert('分析過程出錯，請查看控制台獲取詳細信息。');
        }
    },
    generateCelticCrossAnalysis: function(cards, question) {
        // 使用金色黎明系統進行完整解讀
        if (typeof GoldenDawnCelticCross !== 'undefined') {
            try {
                const reader = new GoldenDawnCelticCross();
                const ud = window.fortuneSystem?.userData;
                const querentInfo = {
                    name: ud?.name || '詢問者',
                    gender: ud?.gender || 'unknown',
                    questionType: ud?.questionType || ''
                };
                
                // 為每張牌添加正逆位信息（簡化：隨機決定）
                const cardsWithOrientation = cards.map(card => ({
                    ...card,
                    reversed: Math.random() > 0.5 // 50%機率逆位
                }));
                
                const fullReading = reader.readCelticCross(cardsWithOrientation, question, querentInfo);
                
                // 轉換為原有格式以保持兼容性
                const analysis = {
                    question: question,
                    positions: [],
                    overall: fullReading.finalInterpretation.summary,
                    advice: fullReading.finalInterpretation.finalAdvice,
                    // 添加新的詳細分析
                    goldenDawn: {
                        crossAnalysis: fullReading.analysis.crossAnalysis,
                        pillarAnalysis: fullReading.analysis.pillarAnalysis,
                        elementAnalysis: fullReading.analysis.elementAnalysis,
                        storyline: fullReading.analysis.storyline,
                        recommendations: fullReading.recommendations,
                        finalInterpretation: fullReading.finalInterpretation
                    }
                };
                
                // 轉換位置解讀
                Object.values(fullReading.positions).forEach((pos, idx) => {
                    analysis.positions.push({
                        position: idx + 1,
                        positionName: pos.position.name,
                        card: pos.card.name,
                        cardId: pos.card.id,
                        meaning: pos.interpretation.combined,
                        orientation: pos.interpretation.orientation,
                        detailed: pos.detailed,
                        advice: pos.advice
                    });
                });
                
                return analysis;
            } catch (error) {
                console.error('金色黎明解讀系統錯誤，使用簡化版本:', error);
                // 降級到簡化版本
            }
        }
        
        // 簡化版本（原有邏輯）
        const positions = [
            '核心現況', '阻礙因素', '過去基礎', '未來發展', '可能結果',
            '近期未來', '自我態度', '環境影響', '希望恐懼', '最終結果'
        ];
        
        let analysis = {
            question: question,
            positions: [],
            overall: '',
            advice: ''
        };
        
        // 為每個位置生成解釋
        cards.forEach((card, index) => {
            const positionName = positions[index] || `位置${index + 1}`;
            analysis.positions.push({
                position: index + 1,
                positionName: positionName,
                card: card.name,
                cardId: card.id,
                meaning: this.getCardMeaning(card, positionName, question)
            });
        });
        
        // 生成整體分析
        analysis.overall = this.generateOverallAnalysis(cards, question);
        analysis.advice = this.generateAdvice(cards, question);
        
        return analysis;
    },
    getCardMeaning: function(card, position, question) {
        // 根據牌和位置生成解釋
        const meanings = {
            '核心現況': '這張牌代表您當前情況的核心本質',
            '阻礙因素': '這張牌顯示可能阻礙您前進的因素',
            '過去基礎': '這張牌反映過去對現在情況的影響',
            '未來發展': '這張牌預示未來的發展方向',
            '可能結果': '這張牌顯示可能出現的結果',
            '近期未來': '這張牌代表近期可能發生的事情',
            '自我態度': '這張牌反映您對問題的內在態度',
            '環境影響': '這張牌顯示外部環境的影響',
            '希望恐懼': '這張牌揭示您內心的希望與恐懼',
            '最終結果': '這張牌預示最終的結果'
        };
        
        return meanings[position] || `這張牌在${position}位置上的意義`;
    },
    generateOverallAnalysis: function(cards, question) {
        // 根據問題和牌陣生成整體分析
        let analysis = `針對您的問題「${question}」，凱爾特十字牌陣顯示：\n\n`;
        
        // 分析核心牌（位置1）
        if(cards[0]) {
            analysis += `核心現況（${cards[0].name}）：這張牌揭示了您當前情況的本質。`;
        }
        
        // 分析阻礙（位置2）
        if(cards[1]) {
            analysis += `\n\n阻礙因素（${cards[1].name}）：可能影響您達成目標的因素。`;
        }
        
        // 分析最終結果（位置10）
        if(cards[9]) {
            analysis += `\n\n最終結果（${cards[9].name}）：預示問題的最終走向。`;
        }
        
        return analysis;
    },
    generateAdvice: function(cards, question) {
        // 生成行動建議
        let advice = '建議：\n';
        advice += '1. 專注於核心現況，理解當前情況的本質\n';
        advice += '2. 注意可能出現的阻礙，提前做好準備\n';
        advice += '3. 保持積極的態度，相信最終會有好的結果\n';
        advice += '4. 根據牌陣的指引，採取適當的行動';
        
        return advice;
    },
    displayTarotResult: function(analysis) {
        console.log('顯示塔羅牌結果:', analysis);
        
        // 1. 更新問題顯示
        const questionDisplay = document.getElementById('question-display');
        if(questionDisplay) {
            questionDisplay.innerHTML = `<p class="question-text">${analysis.question}</p>`;
        }
        
        // 2. 更新直接回答（使用整體分析的摘要）
        const directAnswer = document.getElementById('direct-answer');
        if(directAnswer) {
            // 從整體分析中提取簡短回答
            const overall = analysis.overall || '';
            const shortAnswer = overall ? (overall.split('\n')[0] || overall.substring(0, 200)) : '請完成塔羅牌分析';
            directAnswer.textContent = shortAnswer;
            directAnswer.style.color = '#4CAF50';
        }
        
        // 3. 計算並更新可能性評估（基於牌陣的積極性）
        const probabilityValue = document.getElementById('overall-probability');
        const meterFill = document.getElementById('meter-fill');
        if(probabilityValue && meterFill) {
            // 簡單的概率計算：基於牌陣中積極牌的比例
            const positiveCards = ['聖杯', '權杖', '太陽', '星星', '世界', '皇后', '皇帝', '教皇'];
            let positiveCount = 0;
            analysis.positions.forEach(pos => {
                if(positiveCards.some(p => pos.card.includes(p))) {
                    positiveCount++;
                }
            });
            const probability = Math.round((positiveCount / analysis.positions.length) * 100);
            
            probabilityValue.textContent = `${probability}%`;
            meterFill.style.width = `${probability}%`;
            meterFill.style.backgroundColor = probability >= 50 ? '#4CAF50' : probability >= 25 ? '#FF9800' : '#F44336';
        }
        
        // 4. 更新塔羅牌詳細分析 - 使用卡片式UI
        const tarotPane = document.getElementById('tarot-result');
        if(!tarotPane) {
            console.error('找不到 tarot-result 元素');
            return;
        }
        
        let html = '<div class="analysis-grid-container">';
        
        // 問題卡片
        html += '<div class="analysis-card">';
        html += '<div class="analysis-header">';
        html += '<i class="fas fa-question-circle"></i> 問題分析';
        html += '</div>';
        html += `<div class="text-content" style="padding: 1rem;">${analysis.question || '未提供問題'}</div>`;
        html += '</div>';
        
        // 如果有金色黎明系統的詳細分析，顯示更豐富的內容
        if (analysis.goldenDawn) {
            const gd = analysis.goldenDawn;
            
            // 整體主題卡片
            if (gd.finalInterpretation) {
                html += '<div class="analysis-card">';
                html += '<div class="analysis-header">';
                html += '<i class="fas fa-lightbulb"></i> 整體主題';
                html += '</div>';
                html += `<div class="text-content" style="padding: 1rem; line-height: 1.6;">${gd.finalInterpretation.overallTheme}</div>`;
                html += '</div>';
            }
            
            // 元素分析卡片
            if (gd.elementAnalysis) {
                html += '<div class="analysis-card">';
                html += '<div class="analysis-header">';
                html += '<i class="fas fa-fire"></i> 元素分析';
                html += '</div>';
                html += '<div style="padding: 1rem;">';
                const elements = gd.elementAnalysis.distribution;
                html += '<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">';
                Object.entries(elements).forEach(([element, data]) => {
                    const elementNames = { fire: '火', water: '水', air: '風', earth: '土' };
                    html += `<span class="bazi-tag tag-favorable" style="padding: 0.5rem 1rem;">${elementNames[element] || element}：${data.count}張</span>`;
                });
                html += '</div>';
                if (gd.elementAnalysis.dominantElement) {
                    html += `<p style="margin-top: 0.5rem;"><strong>主導元素：</strong>${gd.elementAnalysis.dominantElement.element}（${gd.elementAnalysis.dominantElement.count}張）</p>`;
                }
                html += '</div>';
                html += '</div>';
            }
            
            // 故事線卡片
            if (gd.storyline) {
                html += '<div class="analysis-card">';
                html += '<div class="analysis-header">';
                html += '<i class="fas fa-book"></i> 故事線';
                html += '</div>';
                html += '<div style="padding: 1rem;">';
                html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">';
                gd.storyline.chapters.forEach(chapter => {
                    html += '<div style="padding: 1rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.3);">';
                    html += `<div style="font-weight: bold; margin-bottom: 0.5rem; color: var(--gold-primary);">${chapter.position}. ${chapter.positionName}</div>`;
                    html += `<div style="color: rgba(255,255,255,0.8);">${chapter.cardName}（${chapter.orientation}）</div>`;
                    html += '</div>';
                });
                html += '</div>';
                html += '</div>';
                html += '</div>';
            }
        }
        
        // 位置分析卡片
        html += '<div class="analysis-card">';
        html += '<div class="analysis-header">';
        html += '<i class="fas fa-cross"></i> 位置解讀';
        html += '</div>';
        html += '<div style="padding: 1rem;">';
        
        // 位置分析 - 使用卡片式UI
        html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">';
        analysis.positions.forEach(pos => {
            var posName = pos.positionName || pos.position || ('位置' + (pos.index || 0));
            var posIdx = pos.index != null ? pos.index : (pos.position && typeof pos.position === 'number' ? pos.position : '');
            html += '<div style="padding: 1rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.3);">';
            html += `<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">`;
            html += `<span style="padding: 0.25rem 0.5rem; background: rgba(212, 175, 55, 0.3); border-radius: 4px; font-weight: bold;">${posIdx}</span>`;
            html += `<span style="font-weight: bold; color: var(--gold-primary);">${posName}</span>`;
            html += `</div>`;
            if (pos.positionMeaning) {
                html += `<div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem;">${pos.positionMeaning}</div>`;
            }
            html += `<div style="margin-bottom: 0.5rem;">`;
            html += `<span style="font-weight: 600;">${pos.card || '-'}</span>`;
            if (pos.orientation) {
                html += `<span style="margin-left: 0.5rem; padding: 0.25rem 0.5rem; background: ${pos.orientation === '逆位' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)'}; border-radius: 4px; font-size: 0.9rem;">${pos.orientation}</span>`;
            }
            html += `</div>`;
            html += `<div style="color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 0.5rem;">${pos.meaning || '-'}</div>`;
            if (pos.advice) {
                html += `<div style="padding: 0.5rem; background: rgba(212, 175, 55, 0.1); border-radius: 4px; border-left: 3px solid var(--gold-primary);"><i class="fas fa-lightbulb"></i> ${pos.advice}</div>`;
            }
            html += '</div>';
        });
        html += '</div>';
        html += '</div>';
        
        // 整體分析卡片
        html += '<div class="analysis-card" style="margin-top: 1rem;">';
        html += '<div class="analysis-header">';
        html += '<i class="fas fa-chart-line"></i> 整體分析';
        html += '</div>';
        html += `<div class="text-content" style="padding: 1rem; line-height: 1.6;">${(analysis.overall || '').replace(/\n/g, '<br>')}</div>`;
        html += '</div>';
        
        // 建議卡片
        html += '<div class="analysis-card" style="margin-top: 1rem;">';
        html += '<div class="analysis-header">';
        html += '<i class="fas fa-lightbulb"></i> 建議';
        html += '</div>';
        html += `<div class="text-content" style="padding: 1rem; line-height: 1.6;">${(analysis.advice || '').replace(/\n/g, '<br>')}</div>`;
        html += '</div>';
        
        // 如果有金色黎明系統的建議，顯示更詳細的建議
        if (analysis.goldenDawn && analysis.goldenDawn.recommendations) {
            const rec = analysis.goldenDawn.recommendations;
            html += '<div class="analysis-card" style="margin-top: 1rem;">';
            html += '<div class="analysis-header">';
            html += '<i class="fas fa-list-check"></i> 詳細建議';
            html += '</div>';
            html += '<div style="padding: 1rem;">';
            
            if (rec.immediate && rec.immediate.length > 0) {
                html += '<div style="margin-bottom: 1rem;">';
                html += '<h6 style="color: var(--gold-primary); margin-bottom: 0.5rem;">立即行動</h6>';
                html += '<ul style="list-style: none; padding: 0;">';
                rec.immediate.forEach(item => {
                    html += `<li style="padding: 0.5rem; margin-bottom: 0.5rem; background: rgba(76, 175, 80, 0.1); border-radius: 4px; border-left: 3px solid #4CAF50;"><i class="fas fa-check-circle"></i> ${item}</li>`;
                });
                html += '</ul>';
                html += '</div>';
            }
            
            if (rec.shortTerm && rec.shortTerm.length > 0) {
                html += '<div style="margin-bottom: 1rem;">';
                html += '<h6 style="color: var(--gold-primary); margin-bottom: 0.5rem;">短期策略</h6>';
                html += '<ul style="list-style: none; padding: 0;">';
                rec.shortTerm.forEach(item => {
                    html += `<li style="padding: 0.5rem; margin-bottom: 0.5rem; background: rgba(212, 175, 55, 0.1); border-radius: 4px; border-left: 3px solid var(--gold-primary);"><i class="fas fa-clock"></i> ${item}</li>`;
                });
                html += '</ul>';
                html += '</div>';
            }
            
            if (rec.affirmations && rec.affirmations.length > 0) {
                html += '<div style="margin-bottom: 1rem;">';
                html += '<h6 style="color: var(--gold-primary); margin-bottom: 0.5rem;">肯定語</h6>';
                html += '<ul style="list-style: none; padding: 0;">';
                rec.affirmations.forEach(item => {
                    html += `<li style="padding: 0.5rem; margin-bottom: 0.5rem; background: rgba(212, 175, 55, 0.1); border-radius: 4px; border-left: 3px solid var(--gold-primary);"><i class="fas fa-quote-left"></i> "${item}"</li>`;
                });
                html += '</ul>';
                html += '</div>';
            }
            
            html += '</div>';
            html += '</div>';
        }
        
        html += '</div>';
        
        tarotPane.innerHTML = html;
        
        // 5. 更新綜合結論
        const conclusionContent = document.getElementById('conclusion-content');
        if(conclusionContent) {
            const overall = analysis.overall || '請完成塔羅牌分析';
            conclusionContent.innerHTML = `<p>${overall.replace(/\n/g, '<br>')}</p>`;
        }
        
        // 6. 更新行動計劃
        const planItems = document.getElementById('plan-items');
        if(planItems) {
            const advice = analysis.advice || '';
            const advicePoints = advice ? advice.split('\n').filter(p => p.trim()) : [];
            planItems.innerHTML = advicePoints.map(point => 
                `<div class="plan-item"><i class="fas fa-check-circle"></i> ${point.trim()}</div>`
            ).join('');
        }
        
        // 7. 生成並更新時機建議
        const timingItems = document.getElementById('timing-items');
        if(timingItems) {
            const timingSuggestions = this.generateTimingSuggestions(analysis);
            timingItems.innerHTML = timingSuggestions;
        }
        
        // 8. 生成並更新靜月分析師總結
        const poeticSummary = document.getElementById('poetic-summary');
        const finalAdvice = document.getElementById('final-advice');
        if(poeticSummary) {
            const summary = this.generatePoeticSummary(analysis);
            poeticSummary.innerHTML = `<p>${summary}</p>`;
        }
        if(finalAdvice) {
            const advice = this.generateFinalAdvice(analysis);
            finalAdvice.innerHTML = `<p>${advice}</p>`;
        }
        
        // 9. 切換到塔羅牌標籤
        const tarotTab = document.querySelector('.dimension-tab[data-dimension="tarot"]');
        if(tarotTab) {
            document.querySelectorAll('.dimension-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.dimension-pane').forEach(p => p.classList.remove('active'));
            tarotTab.classList.add('active');
            tarotPane.classList.add('active');
        }
        
        console.log('塔羅牌結果顯示完成');
    },
    generateTimingSuggestions: function(analysis) {
        // 基於牌陣生成時機建議
        const suggestions = [];
        
        // 分析近期未來（位置6）
        if(analysis.positions[5]) {
            const card = analysis.positions[5].card;
            if(card.includes('聖杯') || card.includes('權杖')) {
                suggestions.push({
                    time: '近期（1-2週內）',
                    suggestion: '當前是採取行動的有利時機，把握機會主動出擊。',
                    icon: 'fas fa-calendar-week'
                });
            } else if(card.includes('寶劍') || card.includes('錢幣')) {
                suggestions.push({
                    time: '近期（1-2週內）',
                    suggestion: '需要謹慎評估，避免衝動決策，等待更合適的時機。',
                    icon: 'fas fa-hourglass-half'
                });
            }
        }
        
        // 分析未來發展（位置4）
        if(analysis.positions[3]) {
            const card = analysis.positions[3].card;
            if(card.includes('太陽') || card.includes('世界')) {
                suggestions.push({
                    time: '中期（1-3個月）',
                    suggestion: '未來發展趨勢良好，持續努力將看到明顯進展。',
                    icon: 'fas fa-calendar-alt'
                });
            } else if(card.includes('死神') || card.includes('高塔')) {
                suggestions.push({
                    time: '中期（1-3個月）',
                    suggestion: '可能面臨轉變期，需要做好心理準備和應對計劃。',
                    icon: 'fas fa-exclamation-triangle'
                });
            }
        }
        
        // 分析最終結果（位置10）
        if(analysis.positions[9]) {
            const card = analysis.positions[9].card;
            if(card.includes('世界') || card.includes('太陽') || card.includes('星星')) {
                suggestions.push({
                    time: '長期（3-6個月）',
                    suggestion: '最終結果將是積極正面的，保持信心和耐心。',
                    icon: 'fas fa-calendar-check'
                });
            }
        }
        
        // 如果沒有特定建議，提供通用建議
        if(suggestions.length === 0) {
            suggestions.push({
                time: '近期',
                suggestion: '根據牌陣指引，選擇適合自己的節奏，不必過於急躁。',
                icon: 'fas fa-clock'
            });
            suggestions.push({
                time: '中期',
                suggestion: '持續關注發展動向，適時調整策略和方向。',
                icon: 'fas fa-calendar-alt'
            });
        }
        
        return suggestions.map(s => `
            <div class="timing-item">
                <div class="timing-icon"><i class="${s.icon}"></i></div>
                <div class="timing-content">
                    <div class="timing-period">${s.time}</div>
                    <div class="timing-text">${s.suggestion}</div>
                </div>
            </div>
        `).join('');
    },
    generatePoeticSummary: function(analysis) {
        // 生成詩意總結
        const question = analysis.question;
        const positions = analysis.positions;
        
        // 分析牌陣的整體能量
        const positiveCards = ['聖杯', '權杖', '太陽', '星星', '世界', '皇后', '皇帝'];
        const neutralCards = ['正義', '隱士', '命運之輪', '節制'];
        const challengingCards = ['寶劍', '死神', '高塔', '惡魔'];
        
        let positiveCount = 0;
        let challengingCount = 0;
        
        positions.forEach(pos => {
            if(positiveCards.some(p => pos.card.includes(p))) positiveCount++;
            if(challengingCards.some(c => pos.card.includes(c))) challengingCount++;
        });
        
        let summary = '';
        
        if(positiveCount > challengingCount) {
            summary = `在靜月的指引下，您的問題如夜空中的星辰，閃爍著希望的光芒。牌陣顯示，您正走在正確的道路上，雖然可能遇到一些波折，但整體趨勢是積極向上的。`;
        } else if(challengingCount > positiveCount) {
            summary = `靜月之光穿透雲層，照亮前行的道路。雖然當前可能面臨一些挑戰和考驗，但這些都是成長的必經之路。牌陣提醒您，保持內心的平靜與堅定，風雨過後必見彩虹。`;
        } else {
            summary = `在靜月的見證下，您的問題如陰陽平衡的太極，既有機遇也有挑戰。牌陣顯示，未來的走向取決於您當下的選擇和行動。保持中正平和的心態，順應自然之道，將能找到最佳的解決方案。`;
        }
        
        // 根據核心現況（位置1）添加具體描述
        if(positions[0]) {
            const coreCard = positions[0].card;
            if(coreCard.includes('聖杯')) {
                summary += ` 當前您的情感與直覺正在引導您，相信內心的聲音。`;
            } else if(coreCard.includes('權杖')) {
                summary += ` 您充滿行動力和熱情，這是推動事情發展的重要動力。`;
            } else if(coreCard.includes('寶劍')) {
                summary += ` 需要運用理性思維和清晰的判斷力來處理當前情況。`;
            } else if(coreCard.includes('錢幣')) {
                summary += ` 務實和穩定的態度將幫助您建立堅實的基礎。`;
            }
        }
        
        return summary;
    },
    generateFinalAdvice: function(analysis) {
        // 生成最終建議
        const positions = analysis.positions;
        let advice = '';
        
        // 基於整體分析生成建議
        const overall = analysis.overall;
        
        advice = `靜月分析師在此為您提供最終指引：\n\n`;
        
        // 基於核心現況（位置1）
        if(positions[0]) {
            advice += `首先，請專注於理解當前情況的本質。${positions[0].card}提醒您，${positions[0].meaning.substring(0, 50)}...\n\n`;
        }
        
        // 基於阻礙因素（位置2）
        if(positions[1]) {
            advice += `其次，要警惕可能的阻礙。${positions[1].card}顯示，${positions[1].meaning.substring(0, 50)}... 提前做好準備，將能更好地應對挑戰。\n\n`;
        }
        
        // 基於最終結果（位置10）
        if(positions[9]) {
            advice += `最後，關於最終結果，${positions[9].card}預示著${positions[9].meaning.substring(0, 50)}... 保持信心，持續努力，您將看到希望的曙光。\n\n`;
        }
        
        advice += `記住，命運掌握在自己手中。牌陣只是指引，真正的力量來自於您的行動和選擇。願靜月之光永遠照亮您前行的道路。`;
        
        return advice.replace(/\n/g, '<br>');
    }
};

// ==========================================
// 7. 事件綁定
// ==========================================
function bindEvents() {
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', function() {
            const next = this.dataset.next;
            if (!window.fortuneSystem) return;
            if (next === 'meihua-section') {
                if (!window.fortuneSystem.validateAndRunStep1()) return;
                var overlay = document.getElementById('global-loading-overlay');
                if (overlay) { overlay.removeAttribute('hidden'); overlay.setAttribute('aria-busy', 'true'); }
                setTimeout(function() {
                    try {
                        window.fortuneSystem.runBackgroundCalculations();
                    } finally {
                        if (overlay) { overlay.setAttribute('hidden', ''); overlay.setAttribute('aria-busy', 'false'); }
                        window.fortuneSystem.showSection('meihua-section');
                    }
                }, 50);
            } else {
                window.fortuneSystem.showSection(next);
                if (next === 'bazi-section') window.fortuneSystem.calculateBazi();
            }
        });
    });
    
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', function() { 
            if(window.fortuneSystem) {
                const prevSection = this.dataset.prev;
                if(prevSection) {
                    window.fortuneSystem.showSection(prevSection);
                } else {
                    const currentSection = document.querySelector('.section.active')?.id;
                    if(currentSection === 'result-section') {
                        window.fortuneSystem.showSection('tarot-section');
                    } else if(currentSection === 'tarot-section') {
                        window.fortuneSystem.showSection('meihua-section');
                    } else if(currentSection === 'meihua-section') {
                        window.fortuneSystem.showSection('input-section');
                    } else if(currentSection === 'bazi-section') {
                        window.fortuneSystem.showSection('input-section');
                    }
                }
            }
        });
    });
    
    // 複製結果摘要按鈕
    const copySummaryBtn = document.getElementById('copy-result-summary');
    if(copySummaryBtn) {
        copySummaryBtn.addEventListener('click', function() {
            var parts = [];
            var q = document.getElementById('question-display');
            if(q && q.innerText) parts.push('【問題】' + q.innerText.trim());
            var ans = document.getElementById('direct-answer');
            if(ans && ans.innerText) parts.push('【直接回答】' + ans.innerText.trim());
            var prob = document.getElementById('overall-probability');
            if(prob && prob.innerText) parts.push('【可能性評估】' + prob.innerText.trim());
            var factors = document.getElementById('answer-factors-list');
            if(factors && factors.children.length) {
                var list = [];
                for(var i = 0; i < factors.children.length; i++) list.push((i+1) + '. ' + factors.children[i].innerText);
                parts.push('【影響因子】\n' + list.join('\n'));
            }
            var sugg = document.getElementById('answer-suggestions-list');
            if(sugg && sugg.children.length) {
                var list = [];
                for(var j = 0; j < sugg.children.length; j++) list.push((j+1) + '. ' + sugg.children[j].innerText);
                parts.push('【關鍵建議】\n' + list.join('\n'));
            }
            var text = parts.length ? parts.join('\n\n') : '尚無分析結果可複製';
            var done = function(){ copySummaryBtn.innerHTML = '<i class="fas fa-check"></i> 已複製'; setTimeout(function(){ copySummaryBtn.innerHTML = '<i class="fas fa-copy"></i> 複製摘要'; }, 1500); };
            var copyFn = window.copyToClipboard;
            if(copyFn && typeof copyFn === 'function') {
                copyFn(text).then(done).catch(function(){ alert('複製失敗，請手動選擇文字複製'); });
            } else if(navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done).catch(function(){ alert('複製失敗'); });
            } else { alert('此瀏覽器不支援一鍵複製，請使用「生成完整報告」下載後複製'); }
        });
    }

    // 生成完整報告按鈕
    const generateReportBtn = document.getElementById('generate-report');
    if(generateReportBtn) {
        generateReportBtn.addEventListener('click', function() {
            if(window.fortuneSystem && window.fortuneSystem.generateReport) {
                window.fortuneSystem.generateReport();
            } else {
                // 簡單的報告生成功能
                const reportContent = window.fortuneSystem ? window.fortuneSystem.generateSimpleReport() : '報告生成功能尚未實現';
                const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `命理分析報告_${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        });
    }
    
    // 重新開始按鈕
    const startOverBtn = document.getElementById('start-over');
    if(startOverBtn) {
        startOverBtn.addEventListener('click', function() {
            if(confirm('確定要重新開始嗎？這將清除所有已輸入的資料和分析結果。')) {
                if(window.fortuneSystem && window.fortuneSystem.reset) {
                    window.fortuneSystem.reset();
                } else {
                    // 簡單的重置功能
                    window.location.reload();
                }
            }
        });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); const id = this.getAttribute('href').substring(1);
            if(window.fortuneSystem) window.fortuneSystem.showSection(id);
        });
    });

    const baziBtn = document.getElementById('calculate-bazi');
    if(baziBtn) baziBtn.addEventListener('click', () => window.fortuneSystem.calculateBazi());
    
    var qTypePlaceholders = { love:'例如：這段感情能否開花結果？現任是正緣嗎？', career:'例如：今年有機會升遷嗎？轉職時機適合嗎？', wealth:'例如：投資運勢如何？正財偏財哪方面較旺？', health:'例如：近期健康需注意什麼？哪些部位需保養？', general:'例如：今年整體運勢如何？有哪些機會與挑戰？', relationship:'例如：與某人的關係如何改善？貴人在何方？', family:'例如：家庭關係能否和睦？購屋時機適合嗎？', other:'請具體描述您的問題...' };
    var qTypeEl = document.getElementById('question-type');
    var qEl = document.getElementById('question');
    var hintEl = document.getElementById('question-type-hint');
    if(qTypeEl && qEl) {
        var syncPlaceholder = function() {
            var ph = qTypePlaceholders[qTypeEl.value] || '請輸入您想詢問的問題...';
            qEl.placeholder = ph;
            if(hintEl) hintEl.textContent = ph ? '問題方向提示：' + ph : '依類型選擇後，下方會有問題方向提示';
        };
        qTypeEl.addEventListener('change', function() {
            syncPlaceholder();
        });
        if(qTypeEl.value) syncPlaceholder();
        var charHint = document.getElementById('question-char-hint');
        if(charHint) {
            var updateCharCount = function() {
                var len = (qEl.value || '').length;
                var max = qEl.getAttribute('maxlength') || 500;
                charHint.textContent = len + '/' + max + ' 字';
            };
            qEl.addEventListener('input', updateCharCount);
            qEl.addEventListener('change', updateCharCount);
            updateCharCount();
        }
    }


    // [PATCH v9] 保證「隨機起卦」UI 永遠存在（避免 index.html 被舊版覆蓋導致缺元件）
    try {
        const meihuaSection = document.getElementById('meihua-section');
        if (meihuaSection) {
            const tabs = meihuaSection.querySelector('.method-tabs');
            const hasRandomTab = tabs && tabs.querySelector('[data-method="random"]');
            if (tabs && !hasRandomTab) {
                const btn = document.createElement('button');
                btn.className = 'method-tab';
                btn.setAttribute('data-method', 'random');
                btn.innerHTML = '<i class="fas fa-random"></i> 隨機起卦';
                tabs.appendChild(btn);
            }

            const hasRandomContent = meihuaSection.querySelector('#random-method');
            if (!hasRandomContent) {
                const methodContainer = meihuaSection.querySelector('.method-content-container');
                if (methodContainer) {
                    const div = document.createElement('div');
                    div.className = 'method-content';
                    div.id = 'random-method';
                    div.innerHTML = `
                        <div class="method-form">
                            <div class="form-group">
                                <label><i class="fas fa-random"></i> 隨機起卦</label>
                                <small style="color: var(--text-muted); display:block; margin-top:5px;">每次按下都會重新隨機產生上卦 / 下卦 / 動爻。</small>
                            </div>
                            <button class="btn btn-primary" id="calculate-random-hexagram">
                                <i class="fas fa-dice"></i> 隨機起卦
                            </button>
                        </div>`;
                    methodContainer.appendChild(div);
                }
            }
        }
    } catch (e) {
        console.warn('[PATCH v9] ensure random meihua ui failed:', e);
    }

    document.querySelectorAll('.method-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.method-tab').forEach(t => t.classList.remove('active')); this.classList.add('active');
            document.querySelectorAll('.method-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`${this.dataset.method}-method`); if(target) target.classList.add('active');
            
            // 如果切換到時間起卦，更新顯示當前時間
            if(this.dataset.method === 'time') {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hour = String(now.getHours()).padStart(2, '0');
                const minute = String(now.getMinutes()).padStart(2, '0');
                const second = String(now.getSeconds()).padStart(2, '0');
                
                const dateEl = document.getElementById('meihua-date');
                const timeEl = document.getElementById('meihua-time');
                if(dateEl) dateEl.value = `${year}-${month}-${day}`;
                if(timeEl) timeEl.value = `${hour}:${minute}:${second}`;
            }
        });
    });

    // 梅花易數按鈕事件綁定（僅用 click，避免 touchstart preventDefault 阻擋單指滑動）
    const numBtn = document.getElementById('calculate-number-hexagram');
    if(numBtn) {
        numBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('數字起卦按鈕被點擊');
            MeihuaModule.calculateNumber();
        });
    } else {
        console.error('找不到 calculate-number-hexagram 按鈕');
    }
    
    const timeBtn = document.getElementById('calculate-time-hexagram');
    if(timeBtn) {
        timeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('時間起卦按鈕被點擊');
            MeihuaModule.calculateTime();
        });
    } else {
        console.error('找不到 calculate-time-hexagram 按鈕');
    }
    
    const charBtn = document.getElementById('calculate-character-hexagram');
    if(charBtn) {
        charBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('漢字起卦按鈕被點擊');
            MeihuaModule.calculateCharacter();
        });
    } else {
        console.error('找不到 calculate-character-hexagram 按鈕');
    }

    // 直接初始化抽牌區域
    const drawArea = document.getElementById('draw-area');
    if(drawArea) {
        drawArea.style.display = 'block';
        TarotModule.initDrawCircle();
    }
    
    const autoDrawBtn = document.getElementById('auto-draw');
    if(autoDrawBtn) autoDrawBtn.addEventListener('click', () => TarotModule.autoDraw());
    const finishDrawBtn = document.getElementById('finish-draw');
    if(finishDrawBtn) finishDrawBtn.addEventListener('click', () => TarotModule.finishDraw());
    
    // 跳過梅花易數按鈕
    const skipMeihuaBtn = document.getElementById('skip-meihua');
    if(skipMeihuaBtn) {
        skipMeihuaBtn.addEventListener('click', () => {
            if(window.fortuneSystem) window.fortuneSystem.showSection('tarot-section');
        });
    }
    // 跳過塔羅牌按鈕
    const skipTarotBtn = document.getElementById('skip-tarot');
    if(skipTarotBtn) {
        skipTarotBtn.addEventListener('click', () => {
            if(window.fortuneSystem) window.fortuneSystem.showSection('result-section');
        });
    }
    
    // 進行分析按鈕（在 renderSpread 中會重新綁定，這裡不需要）
    // 注意：此按鈕在牌陣顯示時才會出現，所以主要在 renderSpread 中綁定
    
    // 四維度分析標籤頁切換（含鍵盤導覽）
    var dimensionTabs = document.querySelectorAll('.dimension-tab');
    dimensionTabs.forEach((tab, idx) => {
        tab.addEventListener('keydown', function(e) {
            if(e.key === 'ArrowLeft' && idx > 0) { dimensionTabs[idx-1].click(); dimensionTabs[idx-1].focus(); e.preventDefault(); }
            if(e.key === 'ArrowRight' && idx < dimensionTabs.length - 1) { dimensionTabs[idx+1].click(); dimensionTabs[idx+1].focus(); e.preventDefault(); }
        });
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const dimension = this.dataset.dimension;
            
            // 移除所有活動狀態
            document.querySelectorAll('.dimension-tab').forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            document.querySelectorAll('.dimension-pane').forEach(p => p.classList.remove('active'));
            
            // 添加當前活動狀態
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            const pane = document.getElementById(`${dimension}-pane`);
            if(pane) {
                pane.classList.add('active');
                
                // 如果切換到梅花易數標籤，檢查是否需要顯示數據
                if(dimension === 'meihua') {
                    const meihuaPane = document.getElementById('meihua-result');
                    if(meihuaPane && (!meihuaPane.innerHTML || meihuaPane.innerHTML.trim() === '' || meihuaPane.innerHTML.includes('<!--'))) {
                        if(window.fortuneSystem && window.fortuneSystem.analysisResults && window.fortuneSystem.analysisResults.meihua) {
                            window.fortuneSystem.displayMeihuaResult(window.fortuneSystem.analysisResults.meihua);
                        } else {
                            meihuaPane.innerHTML = '<div class="no-data-note"><i class="fas fa-info-circle"></i> 尚未完成梅花易數起卦，或已跳過此步驟。</div>';
                        }
                    }
                }
                // 如果切換到紫微斗數標籤，檢查是否需要顯示數據
                if(dimension === 'ziwei' && window.fortuneSystem && typeof window.fortuneSystem.displayZiweiResult === 'function') {
                    window.fortuneSystem.displayZiweiResult();
                }
                // 如果切換到塔羅牌標籤，檢查是否需要顯示數據
                if(dimension === 'tarot') {
                    const tarotPane = document.getElementById('tarot-result');
                    if(tarotPane && (!tarotPane.innerHTML || tarotPane.innerHTML.trim() === '')) {
                        var hasTarot = window.fortuneSystem && window.fortuneSystem.analysisResults && window.fortuneSystem.analysisResults.tarot && window.fortuneSystem.analysisResults.tarot.analysis;
                        if(!hasTarot) {
                            tarotPane.innerHTML = '<div class="no-data-note"><i class="fas fa-info-circle"></i> 尚未完成塔羅抽牌，或已跳過此步驟。機率評估將依八字與梅花易數計算。</div>';
                        }
                    }
                }
            }
        });
    });
}


/* =========================================================
 * [PATCH A4] 機率輸出 + 防呆修復 + 事件綁定補齊
 * - 修復：梅花數字/漢字/隨機起卦參數呼叫錯誤
 * - 修復：隨機起卦按鈕 click/touch 綁定
 * - 修復：塔羅快速抽牌 click/touch 綁定與逆位生成
 * - 改造：分析結果頁（direct-answer / question-display / overall-probability...）改為「四維度機率」輸出，不再使用模板建議
 * ========================================================= */
;(function(){
  'use strict';

  function $(id){ return document.getElementById(id); }
  function setText(id, text, fallback){
    const el = $(id);
    if(!el) return;
    const t = (text === null || text === undefined || text === '') ? (fallback || '—') : String(text);
    el.textContent = t;
  }
  function setHTML(id, html, fallback){
    const el = $(id);
    if(!el) return;
    el.innerHTML = (html === null || html === undefined || html === '') ? (fallback || '') : html;
  }
  function clamp(n,min,max){
    n = Number(n);
    if(!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  }
  function domainHint(question){
    const q = String(question || '');
    if (/桃花|感情|戀|告白|結婚|復合|伴侶/.test(q)) return 'love';
    if (/工作|事業|升遷|轉職|面試|業績/.test(q)) return 'career';
    if (/錢|財|投資|收入|負債|買賣/.test(q)) return 'money';
    if (/健康|病|疼|手術|恢復/.test(q)) return 'health';
    return 'general';
  }
  function avg(nums){
    const xs = (nums || []).filter(n => Number.isFinite(Number(n)));
    if(!xs.length) return 0;
    return xs.reduce((a,b)=>a+Number(b),0)/xs.length;
  }

  // -------------------------
  // 梅花易數：修復參數呼叫 + 隨機起卦
  // -------------------------
  try{
    if (typeof MeihuaModule !== 'undefined' && MeihuaModule && MeihuaModule.calculator && MeihuaModule.calculator.divine) {

      MeihuaModule.calculateTime = function(){
        try{
          const now = new Date();
          const dateStr = now.toISOString().split('T')[0];
          const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
          const dateEl = $('meihua-date'); const timeEl = $('meihua-time');
          if(dateEl) dateEl.value = dateStr;
          if(timeEl) timeEl.value = timeStr;
          const result = this.calculator.divine('', 'time', {});
          this.displayResults(result);
        }catch(e){
          console.error('Meihua.calculateTime error:', e);
          alert('時間起卦錯誤：' + (e && e.message ? e.message : e));
        }
      };

      MeihuaModule.calculateNumber = function(){
        try{
          const n1 = parseInt(($('number1')||{}).value) || 0;
          const n2 = parseInt(($('number2')||{}).value) || 0;
          const n3 = parseInt(($('number3')||{}).value) || 0;
          if(!n1 || !n2){ alert('請輸入有效的數字！'); return; }
          const result = this.calculator.divine('', 'number', { numbers: [n1, n2, n3] });
          this.displayResults(result);
        }catch(e){
          console.error('Meihua.calculateNumber error:', e);
          alert('數字起卦錯誤：' + (e && e.message ? e.message : e));
        }
      };

      MeihuaModule.calculateCharacter = function(){
        var self = this;
        var charEl = $('meihua-character');
        if (charEl) charEl.blur();
        // IME 未提交時 value 可能仍空：延遲一 tick 再讀，讓 compositionend 有機會寫入
        setTimeout(function(){
          try{
            var raw = (charEl ? (charEl.value || '') : (($('characters')||{}).value || ''));
            var text = String(raw).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').trim();
            if(!text){ alert('請輸入漢字內容！（1～3 個字）'); return; }
            var result = self.calculator.divine('', 'character', { text: text });
            self.displayResults(result);
          }catch(e){
            console.error('Meihua.calculateCharacter error:', e);
            alert('漢字起卦錯誤：' + (e && e.message ? e.message : e));
          }
        }, 0);
      };

      if(!MeihuaModule.calculateRandom){
        MeihuaModule.calculateRandom = function(){
          try{
            const result = this.calculator.divine('', 'random', {});
            this.displayResults(result);
          }catch(e){
            console.error('Meihua.calculateRandom error:', e);
            alert('隨機起卦錯誤：' + (e && e.message ? e.message : e));
          }
        };
      }
    }
  }catch(e){
    console.error('[PATCH] Meihua override failed:', e);
  }

  // 事件綁定：隨機起卦按鈕（僅用 click，避免阻擋單指滑動）
  function bindMeihuaRandomButton(){
    const btn = $('calculate-random-hexagram');
    if(!btn) return;
    const handler = function(ev){
      try{
        if(ev){ ev.preventDefault(); ev.stopPropagation(); }
        if(typeof MeihuaModule !== 'undefined' && MeihuaModule && MeihuaModule.calculateRandom){
          MeihuaModule.calculateRandom();
        }
      }catch(e){
        console.error('random-hexagram handler error:', e);
        alert('隨機起卦出錯：' + (e && e.message ? e.message : e));
      }
    };
    btn.addEventListener('click', handler);
  }

function setupMeihuaRandomDomGuard(){
    if(window.__jingyueMeihuaRandomGuardInstalled) return;
    window.__jingyueMeihuaRandomGuardInstalled = true;

    const ensure = () => {
        const step3 = $('meihua-step3');
        if(!step3) return;

        // Ensure method tab button exists (if method-buttons section still exists)
        const methodButtons = step3.querySelector('.method-buttons');
        if(methodButtons && !methodButtons.querySelector('[data-method="random-method"]')){
            const randomTab = document.createElement('button');
            randomTab.className = 'method-btn';
            randomTab.setAttribute('data-method', 'random-method');
            randomTab.innerHTML = '<i class="fas fa-random"></i> 隨機起卦';
            methodButtons.appendChild(randomTab);
        }

        // Ensure a stable slot exists (so even if other DOM blocks are cleared, button can be re-attached)
        let slot = step3.querySelector('#meihua-random-guard-slot');
        if(!slot){
            slot = document.createElement('div');
            slot.id = 'meihua-random-guard-slot';
            slot.style.display = 'flex';
            slot.style.justifyContent = 'center';
            slot.style.gap = '10px';
            slot.style.margin = '12px 0';
            slot.style.flexWrap = 'wrap';

            if(methodButtons && methodButtons.parentNode){
                methodButtons.parentNode.insertBefore(slot, methodButtons.nextSibling);
            }else{
                step3.insertBefore(slot, step3.firstChild);
            }
        }

        // Ensure main random button exists
        let btn = $('calculate-random-hexagram');
        if(!btn){
            btn = document.createElement('button');
            btn.id = 'calculate-random-hexagram';
            btn.type = 'button';
            btn.className = 'btn-primary random-hexagram-btn';
            btn.textContent = '🎲 隨機起卦';
            slot.appendChild(btn);
        }else{
            // If the button exists but got moved outside step3 by a re-render, try to bring it back
            if(!step3.contains(btn)){
                slot.appendChild(btn);
            }
        }

        // (Re)bind handler if DOM got recreated
        if(btn && !btn.dataset.bound){
            try{ bindMeihuaRandomButton(); }catch(e){}
        }
    };

    const attachObserver = () => {
        const step3 = $('meihua-step3');
        if(!step3) return;

        ensure();

        const obs = new MutationObserver(() => {
            ensure();
        });

        obs.observe(step3, { childList:true, subtree:true });
    };

    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', attachObserver);
    }else{
        attachObserver();
    }
}




  // -------------------------
  // 塔羅：快速抽牌補齊 + 逆位 + 以 GoldenDawnCelticCross 產生機率
  // -------------------------
  function secureBool(){
    try{
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const arr = new Uint8Array(1);
        crypto.getRandomValues(arr);
        return (arr[0] % 2) === 1;
      }
    }catch(e){}
    return Math.random() >= 0.5;
  }

  try{
    if(typeof TarotModule !== 'undefined' && TarotModule){
      // 強制顯示快速抽牌按鈕（避免被意外隱藏）
      const autoBtn = $('auto-draw');
      if(autoBtn) { autoBtn.style.display = ''; autoBtn.style.pointerEvents = 'auto'; }

      TarotModule.autoDraw = function(){
        try{
          const sourceDeck = (this.deck && Array.isArray(this.deck) && this.deck.length) 
            ? this.deck 
            : ((typeof TAROT_CARDS !== 'undefined' && Array.isArray(TAROT_CARDS)) ? TAROT_CARDS : []);
          if(!sourceDeck || sourceDeck.length === 0){
            alert('塔羅牌資料未載入，無法抽牌。'); return;
          }
          this.drawnCards = [];
          const seen = new Set();
          let guard = 0;
          while(this.drawnCards.length < 10 && guard < 5000){
            guard++;
            const ridx = Math.floor(Math.random() * sourceDeck.length);
            const c = sourceDeck[ridx];
            const cid = (c && c.id !== undefined && c.id !== null) ? c.id : null;
            if(!c || cid === null || seen.has(cid)) continue;
            seen.add(cid);
            const isRev = secureBool();
            this.drawnCards.push(Object.assign({}, c, { isReversed: isRev, orientation: isRev ? 'reversed' : 'upright' }));
          }
          const left = $('cards-left'); if(left) left.innerText = '0';
          this.finishDraw();
        }catch(e){
          console.error('Tarot.autoDraw error:', e);
          alert('快速抽牌錯誤：' + (e && e.message ? e.message : e));
        }
      };

      // generateCelticCrossAnalysis：改用 GoldenDawnCelticCross，並返回 fortuneScore/positions
      TarotModule.generateCelticCrossAnalysis = function(cards, question){
        const q = (question || '').trim() || '未提供問題';
        try{
          if(typeof GoldenDawnCelticCross !== 'undefined'){
            const reader = new GoldenDawnCelticCross();
            const ud = window.fortuneSystem && window.fortuneSystem.userData;
            const querentInfo = {
              name: (ud && ud.name) ? ud.name : '詢問者',
              gender: (ud && ud.gender) ? ud.gender : 'unknown',
              questionType: (ud && ud.questionType) ? ud.questionType : ''
            };
            const gd = reader.analyze(cards, q, querentInfo);
            return {
              question: q,
              fortuneScore: clamp(gd.fortuneScore,0,100),
              positions: gd.positions || [],
              overall: gd.summary || ('塔羅機率評估：' + clamp(gd.fortuneScore,0,100) + '%'),
              domain: gd.domain || domainHint(q)
            };
          }
        }catch(e){
          console.error('GoldenDawn analyze error:', e);
        }
        // fallback：至少不空白
        return {
          question: q,
          fortuneScore: 50,
          positions: (cards||[]).slice(0,10).map((c,i)=>({ index:i+1, position:'位置'+(i+1), positionMeaning:'', card: c.name||c.id||('第'+(i+1)+'張'), orientation: c.isReversed?'逆位':'正位', meaning:'牌義資料不足', delta:0 })),
          overall: '塔羅機率評估：50%（資料不足，已使用降級模式）',
          domain: domainHint(q)
        };
      };

      // displayTarotResult：使用卡片式UI美化
      TarotModule.displayTarotResult = function(analysis){
        try{
          // 問題顯示
          setHTML('question-display', `<p class="question-text">${analysis && analysis.question ? analysis.question : '未提供問題'}</p>`, '<p class="question-text">未提供問題</p>');

          // 直接答案改為機率摘要
          const tarotProb = clamp((analysis && analysis.fortuneScore) ? analysis.fortuneScore : 50, 0, 100);
          setText('direct-answer', `塔羅機率：${tarotProb}%（以凱爾特十字 10 位解讀量化）`, '塔羅機率：—');

          // 更新總體機率儀表（先用塔羅，總合由 renderProbabilityDashboard 再覆蓋）
          const probEl = $('overall-probability');
          const fillEl = $('meter-fill');
          if(probEl) probEl.textContent = String(tarotProb) + '%';
          if(fillEl) fillEl.style.width = String(tarotProb) + '%';

          // 塔羅結果區：使用卡片式UI美化
          const tarotPane = $('tarot-result');
          if(tarotPane){
            const pos = Array.isArray(analysis.positions) ? analysis.positions : [];
            let html = '<div class="analysis-grid-container">';
            
            // 問題卡片
            html += '<div class="analysis-card">';
            html += '<div class="analysis-header">';
            html += '<i class="fas fa-question-circle"></i> 問題分析';
            html += '</div>';
            html += `<div class="text-content" style="padding: 1rem;">${analysis.question || '未提供問題'}</div>`;
            html += '</div>';
            
            // 機率卡片
            html += '<div class="analysis-card">';
            html += '<div class="analysis-header">';
            html += '<i class="fas fa-chart-pie"></i> 機率評估';
            html += '</div>';
            html += `<div class="text-content" style="padding: 1rem; text-align: center;">`;
            html += `<div style="font-size: 2rem; font-weight: bold; color: var(--gold-primary); margin-bottom: 0.5rem;">${tarotProb}%</div>`;
            html += `<div style="color: rgba(255,255,255,0.7);">本系統以牌義關鍵詞量化</div>`;
            html += `</div>`;
            html += '</div>';
            
            // 位置解讀卡片
            html += '<div class="analysis-card">';
            html += '<div class="analysis-header">';
            html += '<i class="fas fa-cross"></i> 位置解讀';
            html += '</div>';
            html += '<div style="padding: 1rem;">';
            html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">';
            pos.forEach(function(p){
              const position = p.position || p.positionName || ('位置' + (p.index || ''));
              const orientation = p.orientation || '—';
              const card = p.card || '—';
              const meaning = p.meaning || '—';
              const advice = p.advice || '';
              
              html += '<div style="padding: 1rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.3);">';
              html += `<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">`;
              html += `<span style="padding: 0.25rem 0.5rem; background: rgba(212, 175, 55, 0.3); border-radius: 4px; font-weight: bold;">${p.index || ''}</span>`;
              html += `<span style="font-weight: bold; color: var(--gold-primary);">${position}</span>`;
              html += `</div>`;
              html += `<div style="margin-bottom: 0.5rem;">`;
              html += `<span style="font-weight: 600;">${card}</span>`;
              html += `<span style="margin-left: 0.5rem; padding: 0.25rem 0.5rem; background: ${orientation === '逆位' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)'}; border-radius: 4px; font-size: 0.9rem;">${orientation}</span>`;
              html += `</div>`;
              html += `<div style="color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 0.5rem;">${meaning}</div>`;
              if (advice) {
                html += `<div style="padding: 0.5rem; background: rgba(212, 175, 55, 0.1); border-radius: 4px; border-left: 3px solid var(--gold-primary);"><i class="fas fa-lightbulb"></i> ${advice}</div>`;
              }
              html += '</div>';
            });
            html += '</div>';
            html += '</div>';
            html += '</div>';
            
            // 整體分析卡片
            if (analysis.overall) {
              html += '<div class="analysis-card" style="margin-top: 1rem;">';
              html += '<div class="analysis-header">';
              html += '<i class="fas fa-chart-line"></i> 整體分析';
              html += '</div>';
              html += `<div class="text-content" style="padding: 1rem; line-height: 1.6;">${(analysis.overall || '').replace(/\n/g, '<br>')}</div>`;
              html += '</div>';
            }
            
            // 建議卡片
            if (analysis.advice) {
              html += '<div class="analysis-card" style="margin-top: 1rem;">';
              html += '<div class="analysis-header">';
              html += '<i class="fas fa-lightbulb"></i> 建議';
              html += '</div>';
              html += `<div class="text-content" style="padding: 1rem; line-height: 1.6;">${(analysis.advice || '').replace(/\n/g, '<br>')}</div>`;
              html += '</div>';
            }
            
            html += '</div>';
            tarotPane.innerHTML = html;
          }

          // 呼叫全局機率總覽（四維度交叉）
          if(window.fortuneSystem && window.fortuneSystem.renderProbabilityDashboard){
            window.fortuneSystem.renderProbabilityDashboard();
          }
        }catch(e){
          console.error('displayTarotResult error:', e);
        }
      };

      // 綁定快速抽牌（僅用 click，避免 touchstart 阻擋單指滑動）
      const autoDrawBtn = $('auto-draw');
      if(autoDrawBtn){
        const handler = function(e){
          try{ e.preventDefault(); e.stopPropagation(); }catch(_){}
          if(TarotModule && TarotModule.autoDraw) TarotModule.autoDraw();
        };
        autoDrawBtn.addEventListener('click', handler);
      }
    }
  }catch(e){
    console.error('[PATCH] Tarot override failed:', e);
  }

  // -------------------------
  // 分析結果頁：四維度機率彙總（A4）
  // -------------------------
  function calcMeihuaProb(meihua){
    try{
      if(!meihua) return null;
      let score = 50;
      const strength = (meihua.tiYong && Number(meihua.tiYong.strength)) || 0;
      score += clamp(strength * 25, -25, 25);
      const luck = (meihua.benGua && meihua.benGua.luck) ? String(meihua.benGua.luck) : '';
      if(luck.indexOf('大吉')>=0) score += 12;
      else if(luck.indexOf('吉')>=0) score += 6;
      if(luck.indexOf('大凶')>=0) score -= 12;
      else if(luck.indexOf('凶')>=0) score -= 6;
      return clamp(Math.round(score),0,100);
    }catch(e){ return null; }
  }
  function calcNameProb(nameology){
    try{
      if(!nameology) return null;
      const analysis = nameology.analysis || nameology;
      const s = analysis.overallScore;
      if(Number.isFinite(Number(s))) return clamp(Math.round(Number(s)),0,100);
      return null;
    }catch(e){ return null; }
  }
  function calcTarotProb(tarot){
    try{
      if(!tarot) return null;
      const a = tarot.analysis || tarot;
      const s = a.fortuneScore;
      if(Number.isFinite(Number(s))) return clamp(Math.round(Number(s)),0,100);
      return null;
    }catch(e){ return null; }
  }
  function calcBaziProb(bazi, question){
    try{
      if(!bazi) return null;
      // 目前以可用性優先：先提供穩定分數，避免 undefined 擴散；後續可再加權
      const d = domainHint(question || '');
      let base = 50;
      if(bazi.fullData && bazi.fullData.strength){
        // strength 若是 0-100 直接採用；若是其他尺度則降級
        const st = Number(bazi.fullData.strength);
        if(Number.isFinite(st) && st>=0 && st<=100) base = st;
      }
      // domain 微調（保守）
      if(d==='love') base += 2;
      if(d==='career') base += 2;
      if(d==='money') base += 2;
      if(d==='health') base -= 2;
      return clamp(Math.round(base),0,100);
    }catch(e){ return null; }
  }

  // FortuneSystem 新增/覆寫 renderProbabilityDashboard
  try{
    if(typeof FortuneSystem !== 'undefined'){
      FortuneSystem.prototype.renderProbabilityDashboard = function(){
        try{
          const question = ($('question') && $('question').value) ? $('question').value.trim() : '';
          // 本次分析使用（緊湊單行，網頁與手機同步）
          var inputCard = $('input-summary-card');
          var inputContent = $('input-summary-content');
          if (inputCard && inputContent) {
            var u = this.userData || {};
            var inputParts = [];
            if (u.gender) inputParts.push(u.gender === 'male' ? '男' : '女');
            if (u.birthDate) inputParts.push(u.birthDate);
            if (u.birthTime) inputParts.push(u.birthTime);
            if (inputParts.length) {
              var solarNote = ($('true-solar-time') && $('true-solar-time').checked) ? '是' : (u.useSolarTime ? '是' : '否');
              inputParts.push('真太陽時' + solarNote);
              var lat = $('latitude') ? ($('latitude').innerText || '').trim() : '';
              var lng = $('longitude') ? ($('longitude').innerText || '').trim() : '';
              if (lat && lng) inputParts.push(lat + '°N,' + lng + '°E');
              inputContent.textContent = inputParts.join(' · ');
              inputCard.style.display = 'flex';
              inputCard.classList.remove('input-summary-expanded');
            } else {
              inputCard.style.display = 'none';
            }
          }
          // 顯示問題（避免空白）
          if($('question-display')){
            setHTML('question-display', `<p class="question-text">${question || '未提供問題（機率評估仍可計算）'}</p>`);
          }

          const r = (this.analysisResults || {});
          if (!r.ziwei && typeof ZiweiSystem !== 'undefined' && ZiweiSystem.calculate) {
            var u = this.userData || {};
            var bd = u.birthDate || (r.bazi && (r.bazi.birthDate || (r.bazi.fullData && r.bazi.fullData.birthDate)));
            var bt = u.birthTime || (r.bazi && r.bazi.birthTime) || '12:00';
            var g = u.gender || (r.bazi && r.bazi.gender) || 'male';
            if (bd) try { this.analysisResults.ziwei = ZiweiSystem.calculate(bd, bt, g); } catch (e) {}
          }
          var dataForScoring = {
            bazi: r.bazi || r.fullBaziData,
            nameology: r.nameology,
            meihua: r.meihua,
            tarot: r.tarot,
            ziwei: this.analysisResults.ziwei || r.ziwei
          };
          let parts = [];
          let overall = 0;
          let breakdownWithReasons = [];

          if (typeof buildSummaryReport === 'function') {
            try {
              var report = buildSummaryReport(dataForScoring, question, { referenceDate: new Date(), questionType: (this.userData && this.userData.questionType) ? this.userData.questionType : '' });
              if (report.breakdown && report.breakdown.length > 0) {
                overall = report.overallPercent || 0;
                breakdownWithReasons = report.breakdown;
                parts = report.breakdown.map(function(b){ return { key: b.method, prob: b.score, reason: b.reason || '' }; });
              }
            } catch (e) { if (window.console) console.warn('ScoringEngine buildSummaryReport failed, using fallback:', e); }
          }

          if (parts.length === 0) {
            var tarotProb = calcTarotProb(r.tarot);
            var meihuaProb = calcMeihuaProb(r.meihua);
            var nameProb = calcNameProb(r.nameology);
            var baziProb = calcBaziProb(r.bazi || r.fullBaziData, question);
            parts = [
              { key:'八字', prob:baziProb },
              { key:'姓名學', prob:nameProb },
              { key:'梅花易數', prob:meihuaProb },
              { key:'塔羅', prob:tarotProb }
            ];
            if (dataForScoring.ziwei && dataForScoring.ziwei.palaces && typeof calculateCategoryScore === 'function' && typeof getCategory === 'function') {
              try {
                var catZ = getCategory(question, (this.userData && this.userData.questionType) ? this.userData.questionType : '');
                var zRes = calculateCategoryScore('ziwei', dataForScoring.ziwei, catZ, {});
                parts.push({ key: '紫微斗數', prob: zRes.score, reason: zRes.reason || '' });
              } catch (e) {}
            }
            parts = parts.filter(function(x){ return Number.isFinite(Number(x.prob)); });
            overall = parts.length ? clamp(Math.round(avg(parts.map(function(p){ return p.prob; }))),0,100) : 0;
          }

          /* Always populate breakdownWithReasons with dynamic reason from ScoringEngine when missing */
          if (breakdownWithReasons.length === 0 && parts.length > 0 && typeof calculateCategoryScore === 'function' && typeof getCategory === 'function') {
            try {
              var cat = getCategory(question, (this.userData && this.userData.questionType) ? this.userData.questionType : '');
              var scoreOpts = { referenceDate: new Date() };
              breakdownWithReasons = [];
              parts.forEach(function(p){
                var sys = (p.key === '八字') ? 'bazi' : (p.key === '姓名學') ? 'name' : (p.key === '梅花易數') ? 'meihua' : (p.key === '塔羅') ? 'tarot' : (p.key === '紫微斗數') ? 'ziwei' : null;
                var data = (sys === 'bazi') ? dataForScoring.bazi : (sys === 'name') ? dataForScoring.nameology : (sys === 'meihua') ? dataForScoring.meihua : (sys === 'tarot') ? dataForScoring.tarot : (sys === 'ziwei') ? dataForScoring.ziwei : null;
                var res = sys && data ? calculateCategoryScore(sys, data, cat, scoreOpts) : { score: p.prob, reason: '' };
                breakdownWithReasons.push({ method: p.key, score: res.score != null ? res.score : p.prob, reason: res.reason || '' });
              });
              parts = breakdownWithReasons.map(function(b){ return { key: b.method, prob: b.score, reason: b.reason || '' }; });
            } catch (e) { if (window.console) console.warn('ScoringEngine fallback reason failed:', e); }
          }

          // 融合引擎：若可用則使用 generateDirectAnswer（結論同時供直接回答與綜合結論使用）
          var useFusion = (typeof FusionEngine !== 'undefined' && FusionEngine && FusionEngine.generateDirectAnswer);
          var displayConclusion = '';
          if (useFusion && parts.length > 0) {
            try {
              var tarotForFusion = dataForScoring.tarot || {};
              if (this.analysisResults && this.analysisResults.tarot) {
                var t = this.analysisResults.tarot;
                if (!tarotForFusion.cards && !tarotForFusion.tarotCards && !tarotForFusion.drawnCards) {
                  tarotForFusion = Object.assign({}, tarotForFusion, {
                    cards: t.cards || t.tarotCards || t.drawnCards,
                    tarotCards: t.tarotCards || t.cards || t.drawnCards,
                    drawnCards: t.drawnCards || t.cards || t.tarotCards,
                    analysis: t.analysis || t
                  });
                }
              }
              if (typeof window !== 'undefined' && window.currentTarotDeck && Array.isArray(window.currentTarotDeck) && window.currentTarotDeck.length > 0 && !(tarotForFusion.cards && tarotForFusion.cards.length)) {
                tarotForFusion = Object.assign({}, tarotForFusion, { cards: window.currentTarotDeck, drawnCards: window.currentTarotDeck });
              }
              var userCategory = (this.userData && this.userData.questionType) ? String(this.userData.questionType).toLowerCase() : '';
              var fusionData = {
                bazi: dataForScoring.bazi,
                meihua: dataForScoring.meihua,
                tarot: tarotForFusion,
                ziwei: dataForScoring.ziwei,
                nameology: dataForScoring.nameology,
                question: question,
                questionType: userCategory || ''
              };
              if (typeof console !== 'undefined') {
                console.log('[Category Debug] user.category / questionType=', userCategory, 'questionText=', (question || '').slice(0, 60));
                if (!userCategory && (question || '').length > 0) console.warn('[Category Debug] category 缺失，將由 getQuestionType(question) 推斷，可能 fallback 到 general');
              }
              var fusionOut = FusionEngine.generateDirectAnswer(fusionData);
              if (typeof console !== 'undefined' && fusionOut) {
                console.log('[結果頁渲染前] selectedTemplateId/category=', fusionOut.selectedTemplateId || fusionOut.category, 'appliedWeights=', fusionOut.appliedWeights || {}, 'topFactors=', (fusionOut.factors || []).slice(0, 3).map(function (f) { return typeof f === 'string' ? f.slice(0, 30) : (f && f.name); }), 'missingEvidence=', fusionOut.missingEvidence || [], 'evidenceUsed=', fusionOut.evidenceUsed || []);
                if ((fusionOut.category === 'general' || !fusionOut.category) && userCategory && userCategory !== 'general' && userCategory !== 'other') console.warn('[Category Debug] 題型應為 ' + userCategory + ' 但 resultGenerator 回傳 category=' + (fusionOut.category || 'general') + '，請檢查傳參');
              }
              var categoryBanner = document.getElementById('category-warning-banner');
              if (categoryBanner) {
                if (!userCategory && (question || '').trim().length > 0) {
                  categoryBanner.textContent = '請選擇問題類型（目前依問題文字推斷）';
                  categoryBanner.style.display = 'block';
                } else {
                  categoryBanner.textContent = '';
                  categoryBanner.style.display = 'none';
                }
              }
              if (fusionOut && fusionOut.evidenceUsed && fusionOut.evidenceUsed.length === 1 && categoryBanner) {
                categoryBanner.textContent = (categoryBanner.textContent ? categoryBanner.textContent + ' ' : '') + '證據不足：目前僅引用單一系統，建議補抽塔羅或起梅花卦以完成多維交叉。';
                categoryBanner.style.display = 'block';
              }
              displayConclusion = fusionOut.conclusion || '';
              // 直接回答區塊不重複顯示問題；結論優先，原理參考縮小顯示於後
              var forDirectAnswer = displayConclusion.replace(/^您問的是[：:][「"]([^」"]*)[」"]。?\s*/g, '');
              setText('direct-answer', forDirectAnswer);
              var principleEl = document.getElementById('direct-answer-principle');
              if (principleEl) {
                if (fusionOut.principleRef && fusionOut.principleRef.length) {
                  principleEl.textContent = '(原理參考) ' + fusionOut.principleRef;
                  principleEl.style.display = 'block';
                  principleEl.setAttribute('aria-hidden', 'false');
                } else {
                  principleEl.textContent = '';
                  principleEl.style.display = 'none';
                  principleEl.setAttribute('aria-hidden', 'true');
                }
              }
              if (fusionOut.probabilityValue != null && Number.isFinite(fusionOut.probabilityValue)) {
                overall = Math.round(fusionOut.probabilityValue);
              }
              var factorsEl = $('answer-factors');
              var factorsList = $('answer-factors-list');
              if (factorsEl && factorsList && fusionOut.factors && fusionOut.factors.length) {
                factorsList.innerHTML = fusionOut.factors.map(function(f){ return '<li>' + (f || '').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</li>'; }).join('');
                factorsEl.style.display = 'block';
                var factorsSummaryEl = document.getElementById('factors-summary');
                if (factorsSummaryEl) {
                  var firstTwo = fusionOut.factors.slice(0, 2).map(function(f){ return (f || '').replace(/<[^>]+>/g,'').slice(0, 40); }).join('；');
                  factorsSummaryEl.textContent = firstTwo ? (firstTwo + '…（點擊展開完整）') : '點擊展開完整影響因子';
                }
              }
              var suggEl = $('answer-suggestions');
              var suggList = $('answer-suggestions-list');
              if (suggEl && suggList && fusionOut.suggestions && fusionOut.suggestions.length) {
                suggList.innerHTML = fusionOut.suggestions.map(function(s){ return '<li>' + (s || '').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</li>'; }).join('');
                suggEl.style.display = 'block';
              }
              /* 手機預設收合、桌機預設展開；橫豎切換時更新（resize 只綁一次） */
              function syncDetailsOpen() {
                var isWide = typeof window !== 'undefined' && window.innerWidth > 768;
                var df = document.getElementById('details-factors');
                var ds = document.getElementById('details-suggestions');
                if (df) { if (isWide) df.setAttribute('open', ''); else df.removeAttribute('open'); }
                if (ds) { if (isWide) ds.setAttribute('open', ''); else ds.removeAttribute('open'); }
              }
              syncDetailsOpen();
              if (typeof window !== 'undefined' && !window._resultDetailsResizeBound) {
                window._resultDetailsResizeBound = true;
                window.addEventListener('resize', syncDetailsOpen);
              }
              if (fusionOut.missingEvidence && fusionOut.missingEvidence.length > 0) {
                var missingNote = '缺少證據：' + fusionOut.missingEvidence.join('、') + '，機率為區間估計，僅供參考。';
                if (breakdownWithReasons.length === 0) breakdownWithReasons = [{ method: '說明', score: null, reason: missingNote }];
                else breakdownWithReasons.push({ method: '說明', score: null, reason: missingNote });
              }
              if (fusionOut.conflictSource) {
                var cfNote = fusionOut.conflictSource.indexOf('缺少證據') >= 0 ? fusionOut.conflictSource : '（系統間有差異：' + fusionOut.conflictSource + '，故以區間呈現）';
                if (breakdownWithReasons.length === 0) breakdownWithReasons = [{ method: '提示', score: overall, reason: cfNote }];
                else if (!fusionOut.missingEvidence || fusionOut.missingEvidence.length === 0) breakdownWithReasons.push({ method: '說明', score: null, reason: cfNote });
              }
            } catch (e) { if (window.console) console.warn('FusionEngine generateDirectAnswer failed:', e); }
          }
          if (!useFusion || parts.length === 0) {
            var weightNote = parts.length ? ' 整合方式：加權平均（八字、姓名學、梅花、塔羅、紫微等）。' : '';
            displayConclusion = parts.length ? `多維度機率彙總：整體成功率約 ${overall}%（以可用維度加權）。${weightNote}` : '尚未完成任何命理計算，無法生成機率彙總。';
            setText('direct-answer', displayConclusion);
            var hidePrinciple = document.getElementById('direct-answer-principle');
            if (hidePrinciple) { hidePrinciple.textContent = ''; hidePrinciple.style.display = 'none'; hidePrinciple.setAttribute('aria-hidden', 'true'); }
            var hideFactors = $('answer-factors');
            var hideSugg = $('answer-suggestions');
            if (hideFactors) hideFactors.style.display = 'none';
            if (hideSugg) hideSugg.style.display = 'none';
          }

          // 儀表（避免 NaN/undefined）
          const probEl = $('overall-probability');
          const fillEl = $('meter-fill');
          const safeOverall = Number.isFinite(Number(overall)) ? Math.round(Number(overall)) : 0;
          if(probEl) probEl.textContent = parts.length ? (safeOverall + '%') : '—';
          if(fillEl) fillEl.style.width = parts.length ? (safeOverall + '%') : '0%';

          // 各維度評分與理由（顯示在可能性評估下方）
          const reasonsEl = $('probability-breakdown-reasons');
          if (reasonsEl) {
            if (breakdownWithReasons.length > 0) {
              let html = '';
              breakdownWithReasons.forEach(function(b){
                const score = Number.isFinite(Number(b.score)) ? Math.round(Number(b.score)) : (b.score != null ? b.score : 50);
                const safeScore = (score >= 0 && score <= 100) ? score : 50;
                const color = safeScore >= 60 ? '#4CAF50' : safeScore >= 40 ? '#FF9800' : '#F44336';
                html += '<div class="score-reason-block">';
                html += '<div class="score-reason-header"><span>' + (b.method || '') + '</span><span>' + safeScore + '%</span></div>';
                html += '<div class="score-reason-bar"><div class="score-reason-fill" style="width:' + safeScore + '%;background:' + color + ';"></div></div>';
                html += '<div class="score-reason-text">' + (b.reason ? String(b.reason).replace(/</g,'&lt;').replace(/>/g,'&gt;') : '') + '</div>';
                html += '</div>';
              });
              reasonsEl.innerHTML = html;
            } else if (parts.length > 0) {
              let html = '';
              parts.forEach(function(p){
                const rawScore = p.prob != null ? p.prob : 50;
                const score = Number.isFinite(Number(rawScore)) ? Math.round(Number(rawScore)) : 50;
                const safeScore = (score >= 0 && score <= 100) ? score : 50;
                const color = safeScore >= 60 ? '#4CAF50' : safeScore >= 40 ? '#FF9800' : '#F44336';
                html += '<div class="score-reason-block">';
                html += '<div class="score-reason-header"><span>' + (p.key || '') + '</span><span>' + safeScore + '%</span></div>';
                html += '<div class="score-reason-bar"><div class="score-reason-fill" style="width:' + safeScore + '%;background:' + color + ';"></div></div>';
                if (p.reason) html += '<div class="score-reason-text">' + String(p.reason).replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>';
                html += '</div>';
              });
              reasonsEl.innerHTML = html;
            } else {
              reasonsEl.innerHTML = '';
            }
          }

          // 開運配戴建議：優先走每顆水晶一張卡片（CrystalsKB + 證據正規化 + 選品 + 專屬文案）
          try {
            var qText = ($('question') && $('question').value) ? String($('question').value).trim() : '';
            var baziForCrystal = dataForScoring.bazi;
            var qType = (this.userData && this.userData.questionType) ? this.userData.questionType : '';
            var crystalOpts = { bazi: dataForScoring.bazi, tarot: dataForScoring.tarot, meihua: dataForScoring.meihua, ziwei: dataForScoring.ziwei, nameology: dataForScoring.nameology, questionType: qType };
            var cardResult = (typeof getCrystalRecommendationCards === 'function') ? getCrystalRecommendationCards(baziForCrystal, qText, crystalOpts) : null;
            var cardsContainer = $('crystal-cards-container');
            var legacyBlock = $('crystal-legacy-block');
            if (cardResult && cardResult.cards && cardResult.cards.length > 0) {
              if (cardsContainer) {
                cardsContainer.style.display = 'block';
                var html = '';
                cardResult.cards.forEach(function (card) {
                  var badgeClass = card.conclusionLevel === '強推' ? 'strong' : (card.conclusionLevel === '可選' ? 'optional' : 'avoid');
                  html += '<div class="crystal-card">';
                  html += '<div class="crystal-card-header"><span class="crystal-card-name">' + (card.crystal && card.crystal.name ? String(card.crystal.name).replace(/</g,'&lt;') : '') + '</span>';
                  html += '<span class="crystal-card-badges"><span class="crystal-badge ' + badgeClass + '">' + (card.conclusionLevel || '') + '</span>';
                  if (card.crystal && card.crystal.intensity >= 4) html += '<span class="crystal-badge">高強度</span>';
                  if (card.riskFlags && card.riskFlags.indexOf('sleep_sensitive') >= 0) html += '<span class="crystal-badge">睡前取下</span>';
                  html += '</span></div>';
                  html += '<div class="crystal-card-section"><strong>推薦結論：</strong>' + (card.conclusion || '').replace(/</g,'&lt;') + '</div>';
                  if (card.mingliBackground) html += '<div class="crystal-card-section"><strong>命理背景：</strong>' + (card.mingliBackground || '').replace(/</g,'&lt;') + '</div>';
                  if (card.whyThisCrystal) html += '<div class="crystal-card-section"><strong>為什麼選這顆：</strong>' + (card.whyThisCrystal || '').replace(/</g,'&lt;') + '</div>';
                  html += '<div class="crystal-card-section"><strong>配戴方式：</strong>' + (card.wearText || '').replace(/</g,'&lt;') + '</div>';
                  html += '<div class="crystal-card-section"><strong>注意事項：</strong>' + (card.cautionsText || '').replace(/</g,'&lt;') + '</div>';
                  if (card.alternatives && card.alternatives.length) html += '<div class="crystal-card-section"><strong>替代方案：</strong>' + card.alternatives.join('、').replace(/</g,'&lt;') + '</div>';
                  html += '</div>';
                });
                cardsContainer.innerHTML = html;
              }
              if (legacyBlock) legacyBlock.style.display = 'none';
              if ($('crystal-disclaimer-span')) $('crystal-disclaimer-span').textContent = cardResult.disclaimer || '本建議僅供能量校準參考，不具醫療或命運保證效力。';
            } else {
              if (cardsContainer) { cardsContainer.style.display = 'none'; cardsContainer.innerHTML = ''; }
              if (legacyBlock) legacyBlock.style.display = 'block';
              var rec = (typeof getCrystalRecommendation === 'function') ? getCrystalRecommendation(baziForCrystal, qText, { tarot: dataForScoring.tarot, meihua: dataForScoring.meihua, ziwei: dataForScoring.ziwei, nameology: dataForScoring.nameology, questionType: qType }) : null;
              if (rec && (rec.targetElement || rec.suggestedStones)) {
                if ($('crystal-target-element')) $('crystal-target-element').textContent = rec.targetElement || '—';
                if ($('crystal-stones-list')) $('crystal-stones-list').textContent = (rec.suggestedStones && rec.suggestedStones.length) ? rec.suggestedStones.join('、') : '—';
                if ($('crystal-reason-text')) $('crystal-reason-text').textContent = rec.reasonText || '—';
                if ($('crystal-wearing-span')) $('crystal-wearing-span').textContent = rec.wearingMethod || '—';
                if ($('crystal-taboos-span')) $('crystal-taboos-span').textContent = rec.taboos || '—';
                if ($('crystal-disclaimer-span')) $('crystal-disclaimer-span').textContent = rec.disclaimer || '本建議僅供能量校準參考，不具醫療或命運保證效力。';
                var wearEl = $('crystal-wearing-text'), taboosEl = $('crystal-taboos-text');
                if (wearEl) wearEl.style.display = (rec.wearingMethod ? 'block' : 'none');
                if (taboosEl) taboosEl.style.display = (rec.taboos ? 'block' : 'none');
              } else {
                if ($('crystal-target-element')) $('crystal-target-element').textContent = '—';
                if ($('crystal-stones-list')) $('crystal-stones-list').textContent = '—';
                if ($('crystal-reason-text')) $('crystal-reason-text').textContent = '—';
                if ($('crystal-wearing-span')) $('crystal-wearing-span').textContent = '—';
                if ($('crystal-taboos-span')) $('crystal-taboos-span').textContent = '—';
                if ($('crystal-disclaimer-span')) $('crystal-disclaimer-span').textContent = '本建議僅供能量校準參考，不具醫療或命運保證效力。';
                if ($('crystal-wearing-text')) $('crystal-wearing-text').style.display = 'none';
                if ($('crystal-taboos-text')) $('crystal-taboos-text').style.display = 'none';
              }
            }
          } catch (e) { if (window.console) console.warn('Crystal recommendation fill failed:', e); }

          // 綜合結論：預設只顯示標題與大機率%，點擊「🔽 點擊展開完整分析」才顯示詳情
          if($('conclusion-content')){
            var fullConclusion = displayConclusion ? displayConclusion.replace(/</g,'&lt;').replace(/>/g,'&gt;') : '以上機率由多維度交叉驗證得出，供您綜合判斷。';
            let html = '<div class="analysis-grid-container conclusion-grid">';
            html += '<div class="analysis-card conclusion-card">';
            html += '<div class="analysis-header"><i class="fas fa-chart-pie"></i> 整體機率</div>';
            html += '<div class="conclusion-body">';
            html += '<div class="conclusion-meter-only"><span class="conclusion-meter-value conclusion-meter-big">' + (parts.length ? (overall + '%') : '—') + '</span></div>';
            html += '<details class="conclusion-details" id="conclusion-details">';
            html += '<summary class="conclusion-details-summary">🔽 點擊展開完整分析</summary>';
            html += '<div class="conclusion-details-content">' + fullConclusion + '</div>';
            html += '</details>';
            html += '</div></div></div>';
            $('conclusion-content').innerHTML = html;
          }

          // 靜月分析師 / 問題分析 / 時機建議：改成「機率說明」避免空白
          if($('poetic-summary')) $('poetic-summary').innerHTML = parts.length
            ? `本次以「${parts.map(p=>p.key).join(' / ')}」可用結果進行交叉平均，輸出整體機率 ${overall}%。`
            : '尚未取得可用的命理輸入結果。';

          if($('final-advice')) $('final-advice').innerHTML = parts.length
            ? '提示：此頁僅提供多維度機率高低與各系統量化來源。若要提升準確度，請確保四個維度都完成計算。'
            : '請先完成至少一個維度計算（八字 / 姓名學 / 梅花易數 / 塔羅）。';

        }catch(e){
          console.error('renderProbabilityDashboard error:', e);
          // 最小 fallback，避免卡住
          setText('direct-answer', '分析過程發生錯誤，但頁面已回復可操作狀態。');
        }
      };

      // 讓 loadResults 一定會刷新機率區塊
      const _origLoadResults = FortuneSystem.prototype.loadResults;
      FortuneSystem.prototype.loadResults = function(){
        const r = _origLoadResults ? _origLoadResults.apply(this, arguments) : undefined;
        try{ if(this.renderProbabilityDashboard) this.renderProbabilityDashboard(); }catch(e){}
        return r;
      };

      // 交叉驗證：若舊方法存在，改走機率儀表（避免空白/throw）
      FortuneSystem.prototype.displayCrossResult = function(){
        try{
          if(this.renderProbabilityDashboard) this.renderProbabilityDashboard();
        }catch(e){
          console.error('displayCrossResult patched error:', e);
        }
      };
    }
  }catch(e){
    console.error('[PATCH] FortuneSystem override failed:', e);
  }

  // DOM Ready 後再綁定（避免元素尚未生成）
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      bindMeihuaRandomButton();
      setupMeihuaRandomDomGuard();
    });
  }else{
    bindMeihuaRandomButton();
    setupMeihuaRandomDomGuard();
  }

})();

// ============================================
// 電商導流功能 - 客製表單模態框處理
// ============================================
(function() {
  'use strict';
  
  // 複製到剪貼板的跨平台兼容函數（供全域使用）
  function copyToClipboard(text) {
    return new Promise((resolve, reject) => {
      // 方法1: 使用現代 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          resolve(true);
        }).catch(() => {
          // 如果失敗，嘗試備用方法
          fallbackCopy(text) ? resolve(true) : reject(false);
        });
      } else {
        // 方法2: 使用傳統方法（備用）
        fallbackCopy(text) ? resolve(true) : reject(false);
      }
    });
  }
  
  // 備用複製方法
  function fallbackCopy(text) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('Fallback copy failed:', err);
      return false;
    }
  }
  window.copyToClipboard = function(t) { return copyToClipboard(t); };

  // 開啟郵件客戶端的跨平台兼容函數
  function openEmailClient(email, subject, body) {
    // 構建 mailto 連結
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // 方法1: 使用 window.location.href (最兼容)
    try {
      window.location.href = mailtoLink;
    } catch (e) {
      console.warn('window.location.href failed, trying window.open');
      
      // 方法2: 使用 window.open (備用方案)
      try {
        window.open(mailtoLink, '_blank');
      } catch (e2) {
        console.warn('window.open failed, trying createElement');
        
        // 方法3: 創建臨時連結並點擊 (最後備用)
        try {
          const link = document.createElement('a');
          link.href = mailtoLink;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
          }, 100);
        } catch (e3) {
          console.error('All email methods failed:', e3);
        }
      }
    }
  }
  
  function initCustomOrderModal() {
    const modal = document.getElementById('custom-order-modal');
    const openBtn = document.getElementById('btn-custom-order');
    const floatingBtn = document.getElementById('floating-btn-custom');
    const closeBtn = document.getElementById('close-custom-modal');
    const cancelBtn = document.getElementById('cancel-custom-form');
    const form = document.getElementById('custom-order-form');
    const overlay = modal?.querySelector('.modal-overlay');
    
    if (!modal) return;
    
    // 開啟模態框的函數（用 class 鎖 body，避免 inline 蓋掉頁面捲動）
    function openModal() {
      modal.classList.add('active');
      document.body.classList.add('custom-modal-open');
    }
    
    // 關閉模態框的函數
    function closeModal() {
      modal.classList.remove('active');
      document.body.classList.remove('custom-modal-open');
      if (window.__IS_SAMSUNG__) {
        document.body.style.touchAction = 'pan-y';
        var ps = document.getElementById('page-scroll');
        if (ps) { ps.style.touchAction = 'pan-y'; ps.style.webkitOverflowScrolling = 'touch'; ps.style.overflowY = 'auto'; }
      }
      // 重置表單和顯示區域
      if (form) {
        form.reset();
        // 恢復所有表單元素顯示
        const formGroups = form.querySelectorAll('.form-group-custom, .form-actions-custom');
        formGroups.forEach(group => {
          group.style.display = '';
        });
      }
      const emailDisplay = document.getElementById('email-content-display');
      if (emailDisplay) {
        emailDisplay.style.display = 'none';
      }
    }
    
    // 綁定開啟按鈕
    if (openBtn) {
      openBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
      });
    }
    
    // 綁定浮動按鈕（右下角聊聊）
    if (floatingBtn) {
      floatingBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
      });
    }
    
    // 綁定關閉按鈕
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
    }
    
    if (overlay) {
      overlay.addEventListener('click', closeModal);
    }
    
    // ESC 鍵關閉
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
    
    // Google Apps Script 表單提交處理
    if (form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const statusEl = document.getElementById('form-status');
        const submitBtn = document.getElementById('submit-custom-form');
        const originalBtnText = submitBtn?.innerHTML;
        
        // 獲取表單數據
        const fd = new FormData(e.target);
        const name = (fd.get('name') || '').trim();
        const birthday = fd.get('birthday') || '';
        const question = (fd.get('question') || '').trim();
        const budget = fd.get('budget') || '';
        
        // 驗證必填欄位
        if (!question) {
          if (statusEl) {
            statusEl.style.display = 'block';
            statusEl.style.background = 'rgba(244, 67, 54, 0.2)';
            statusEl.style.borderColor = '#f44336';
            statusEl.style.color = '#f44336';
            statusEl.textContent = '❌ 請填寫「想解決的問題」';
          }
          return;
        }
        
        // 顯示載入狀態
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 發送中...';
        }
        
        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.style.background = 'rgba(212, 175, 55, 0.2)';
          statusEl.style.borderColor = 'var(--gold-primary)';
          statusEl.style.color = 'var(--gold-primary)';
          statusEl.textContent = '📧 正在發送...';
        }
        
        console.log('📧 正在通過 Google Apps Script 發送郵件...');
        
        try {
          const result = await sendEmailViaGAS(name, birthday, question, budget);
          
          if (result.ok) {
            // 發送成功
            if (statusEl) {
              statusEl.style.background = 'rgba(16, 185, 129, 0.2)';
              statusEl.style.borderColor = '#10b981';
              statusEl.style.color = '#10b981';
              statusEl.textContent = '✅ 已送出！我會盡快回覆您';
            }
            
            console.log('✅ 郵件已成功發送');
            
            // 顯示成功提示
            showEmailSentSuccess();
            
            // 重置表單
            e.target.reset();
            
            // 2秒後關閉模態框
            setTimeout(() => {
              closeModal();
            }, 2000);
          } else {
            // 發送失敗
            const errorMsg = result.error || 'unknown';
            
            // 如果是未配置錯誤，顯示更友好的提示
            if (errorMsg.includes('未配置')) {
              if (statusEl) {
                statusEl.style.background = 'rgba(255, 193, 7, 0.2)';
                statusEl.style.borderColor = '#ffc107';
                statusEl.style.color = '#ffc107';
                statusEl.innerHTML = '⚠️ Google Apps Script 尚未配置<br><small style="font-size: 0.85rem;">請檢查 GAS_URL 是否正確設置</small>';
              }
              console.warn('⚠️ Google Apps Script 未配置');
            } else {
              if (statusEl) {
                statusEl.style.background = 'rgba(244, 67, 54, 0.2)';
                statusEl.style.borderColor = '#f44336';
                statusEl.style.color = '#f44336';
                statusEl.textContent = '❌ 送出失敗：' + errorMsg;
              }
              console.error('❌ 郵件發送失敗:', errorMsg);
            }
            
            // 恢復按鈕
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalBtnText;
            }
          }
        } catch (err) {
          // 錯誤處理
          if (statusEl) {
            statusEl.style.background = 'rgba(244, 67, 54, 0.2)';
            statusEl.style.borderColor = '#f44336';
            statusEl.style.color = '#f44336';
            statusEl.textContent = '❌ 送出失敗：' + err;
          }
          console.error('❌ 表單提交錯誤:', err);
          
          // 恢復按鈕
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
        }
      });
    }
    
    // ============================================
    // 郵件發送配置 - Google Apps Script（推薦方案）
    // ============================================
    // 請按照以下步驟設置：
    // 1. 前往 https://script.google.com/ 或 Google Drive → 新增 → 更多 → Google Apps Script
    // 2. 貼上 google-apps-script.js 的代碼
    // 3. 部署為網頁應用程式（執行身份：我，存取權：任何人）
    // 4. 複製 Web App URL 並貼到下面的 GAS_URL
    // ============================================
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbyRXvUlrJRKXz8v4oDmHTNN5_kfISt3wIM3hpjLZC4IlNRGht9PjHqF55WJ9HiRIMyC/exec';
    
    // 檢查 Google Apps Script 是否已配置
    const isGASConfigured = GAS_URL && 
                             GAS_URL.trim() !== '' && 
                             GAS_URL.includes('script.google.com') && 
                             GAS_URL.includes('/exec');
    
    // 通過 Google Apps Script 發送郵件
    async function sendEmailViaGAS(name, birthday, question, budget) {
      if (!isGASConfigured) {
        console.warn('⚠️ Google Apps Script 未配置');
        return { ok: false, error: 'Google Apps Script 未配置' };
      }
      
      try {
        const payload = {
          name: name,
          birthday: birthday,
          question: question,
          budget: budget
        };
        
        // 使用表單提交方式避免 CORS 問題（適用於本地文件）
        // 創建隱藏表單並提交
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = GAS_URL;
        form.style.display = 'none';
        form.target = '_blank'; // 在新視窗打開，避免頁面跳轉
        
        // 添加表單字段
        Object.keys(payload).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = payload[key] || '';
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        
        // 提交表單
        form.submit();
        
        // 延遲移除表單（給時間讓請求發送）
        setTimeout(() => {
          try {
            if (form.parentNode) {
              document.body.removeChild(form);
            }
          } catch (e) {
            // 忽略移除錯誤
          }
        }, 2000);
        
        console.log('📧 使用表單提交方式發送郵件（避免 CORS）');
        
        // 表單提交無法獲取回應，假設成功
        // Google Apps Script 會處理請求並發送郵件
        return { ok: true };
      } catch (err) {
        console.error('❌ 郵件發送失敗:', err);
        return { ok: false, error: String(err) };
      }
    }
    
    // FormSubmit 表單提交處理（最簡單可靠的方法）
    function handleFormSubmitFormSubmit() {
      const form = document.getElementById('custom-order-form');
      const submitBtn = document.getElementById('submit-custom-form');
      
      if (!form) return;
      
      // 表單提交前的處理
      form.addEventListener('submit', function(e) {
        // 顯示載入狀態
        if (submitBtn) {
          const originalBtnText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 發送中...';
          
          // 3秒後恢復按鈕（防止重複提交）
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }, 3000);
        }
        
        // 驗證表單
        const name = document.getElementById('custom-name')?.value.trim();
        const birthday = document.getElementById('custom-birthday')?.value;
        const question = document.getElementById('custom-question')?.value.trim();
        const budget = document.getElementById('custom-budget')?.value;
        
        if (!name || !birthday || !question || !budget) {
          e.preventDefault();
          alert('請填寫所有必填欄位');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 送出詢問';
          }
          return false;
        }
        
        console.log('📧 正在通過 FormSubmit 發送郵件...');
        
        // 表單會自動提交到 FormSubmit，不需要阻止預設行為
        // 顯示成功提示
        setTimeout(() => {
          showEmailSentSuccess();
          // 2秒後關閉模態框
          setTimeout(() => {
            closeModal();
          }, 2000);
        }, 500);
      });
    }
    
    // 統一的表單提交處理函數（保留作為備用）
    async function handleFormSubmit() {
      // 如果使用 FormSubmit，這個函數不會被調用
      // 保留作為備用方案
      console.log('使用備用提交處理...');
    }
    
    // 顯示郵件發送成功提示
    function showEmailSentSuccess() {
      const successMsg = document.createElement('div');
      successMsg.className = 'success-message-popup';
      successMsg.innerHTML = `
        <div class="success-message-content">
          <i class="fas fa-check-circle" style="color: #10b981; font-size: 4rem;"></i>
          <h3 style="margin-top: 1rem;">已成功送出！</h3>
          <p style="font-size: 1.1rem; margin: 0.5rem 0;">您的詢問已送出</p>
          <p style="font-size: 0.95rem; margin-top: 1rem; color: var(--text-muted);">
            我們會盡快回覆您
          </p>
        </div>
      `;
      
      document.body.appendChild(successMsg);
      
      // 3秒後自動消失
      setTimeout(() => {
        successMsg.style.opacity = '0';
        successMsg.style.transform = 'translateY(-20px)';
        setTimeout(() => {
          if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
          }
        }, 300);
      }, 3000);
    }
    
    // 顯示郵件客戶端已開啟提示
    function showEmailClientOpenedMessage() {
      const successMsg = document.createElement('div');
      successMsg.className = 'success-message-popup';
      successMsg.innerHTML = `
        <div class="success-message-content">
          <i class="fas fa-envelope-open" style="color: var(--gold-primary); font-size: 4rem;"></i>
          <h3 style="margin-top: 1rem;">郵件客戶端已開啟</h3>
          <p style="font-size: 1.1rem; margin: 0.5rem 0;">郵件內容已自動填入</p>
          <p style="font-size: 0.95rem; margin-top: 0.5rem; color: var(--text-muted);">
            請檢查您的郵件應用程式（Gmail、Outlook 等）
          </p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem; color: var(--text-secondary);">
            如果沒有自動開啟，郵件內容已複製到剪貼板，請手動貼上
          </p>
        </div>
      `;
      
      document.body.appendChild(successMsg);
      
      // 5秒後自動消失
      setTimeout(() => {
        successMsg.style.opacity = '0';
        successMsg.style.transform = 'translateY(-20px)';
        setTimeout(() => {
          if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
          }
        }, 300);
      }, 5000);
    }
    
    // 顯示手動複製介面（僅在發送失敗時使用）
    function showManualCopyInterface(emailSubject, emailBody) {
      const emailDisplay = document.getElementById('email-content-display');
      const emailSubjectDisplay = document.getElementById('email-subject-display');
      const emailBodyDisplay = document.getElementById('email-body-display');
      const openEmailLink = document.getElementById('open-email-link');
      
      if (emailDisplay && emailSubjectDisplay && emailBodyDisplay) {
        // 更新顯示內容
        emailSubjectDisplay.textContent = emailSubject;
        emailBodyDisplay.value = emailBody;
        
        const mailtoLink = `mailto:onerkk@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        if (openEmailLink) openEmailLink.href = mailtoLink;

        const emailInstructions = emailDisplay.querySelector('.email-instructions');
        if (emailInstructions) {
          emailInstructions.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>
            <p><strong>⚠️ 自動發送失敗</strong></p>
            <p>郵件內容已自動複製到剪貼板，請點擊下方連結開啟郵件客戶端：</p>
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem;">
              <li>點擊下方連結，郵件客戶端會自動填入收件人與內容</li>
              <li>確認後點擊發送</li>
            </ol>
            <p class="email-alt-link" style="margin-top: 1rem;">請點擊：<a href="#" id="open-email-link" target="_blank" rel="noopener">開啟郵件客戶端</a>（設備支援時會自動填入）</p>
          `;
          var newLink = document.getElementById('open-email-link');
          if (newLink) newLink.href = mailtoLink;
        }
        
        // 顯示郵件內容區域，隱藏表單
        emailDisplay.style.display = 'block';
        if (form) {
          const formGroups = form.querySelectorAll('.form-group-custom, .form-actions-custom');
          formGroups.forEach(group => {
            group.style.display = 'none';
          });
        }
        
        // 滾動到郵件內容區域
        setTimeout(() => {
          emailDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        
        // 自動複製主旨與內容到剪貼板（收件人由 mailto 連結提供）
        const fullEmailContent = `主旨：${emailSubject}\n\n${emailBody}`;
        copyToClipboard(fullEmailContent).then(() => {
          showCopySuccess();
          console.log('✅ 郵件內容已複製到剪貼板');
        }).catch(err => {
          console.warn('⚠️ 複製失敗', err);
        });
        
        // 嘗試開啟郵件客戶端
        setTimeout(() => {
          openEmailClient('onerkk@gmail.com', emailSubject, emailBody);
        }, 500);
      }
    }
    
    // 顯示複製成功提示
    function showCopySuccess() {
      const btn = document.getElementById('copy-body-btn');
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> 已複製！';
        btn.style.background = 'rgba(16, 185, 129, 0.2)';
        btn.style.borderColor = '#10b981';
        btn.style.color = '#10b981';
        
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.style.color = '';
        }, 2000);
      }
    }
    
    // 顯示成功訊息提示框
    function showSuccessMessage() {
      // 創建成功提示框
      const successMsg = document.createElement('div');
      successMsg.className = 'success-message-popup';
      successMsg.innerHTML = `
        <div class="success-message-content">
          <i class="fas fa-check-circle"></i>
          <h3>郵件內容已準備好！</h3>
          <p>內容已自動複製到剪貼板</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem; color: var(--text-muted);">
            請開啟郵件應用程式，貼上內容並發送
          </p>
        </div>
      `;
      
      document.body.appendChild(successMsg);
      
      // 3秒後自動消失
      setTimeout(() => {
        successMsg.style.opacity = '0';
        successMsg.style.transform = 'translateY(-20px)';
        setTimeout(() => {
          if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
          }
        }, 300);
      }, 3000);
    }
    
    // 綁定複製按鈕事件
    function initCopyButtons() {
      // 複製主旨
      const copySubjectBtn = document.getElementById('copy-subject-btn');
      if (copySubjectBtn) {
        copySubjectBtn.addEventListener('click', async function() {
          const subject = document.getElementById('email-subject-display')?.textContent || '';
          try {
            await copyToClipboard(subject);
            showCopySuccess();
          } catch (err) {
            alert('複製失敗，請手動選擇並複製');
          }
        });
      }
      
      // 複製內容
      const copyBodyBtn = document.getElementById('copy-body-btn');
      if (copyBodyBtn) {
        copyBodyBtn.addEventListener('click', async function() {
          const body = document.getElementById('email-body-display')?.value || '';
          try {
            await copyToClipboard(body);
            showCopySuccess();
          } catch (err) {
            alert('複製失敗，請手動選擇並複製');
          }
        });
      }
      
      // 複製收件人
      const copyToBtn = document.querySelector('[data-copy="onerkk@gmail.com"]');
      if (copyToBtn) {
        copyToBtn.addEventListener('click', async function() {
          try {
            await copyToClipboard('onerkk@gmail.com');
            const originalHTML = copyToBtn.innerHTML;
            copyToBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyToBtn.style.color = '#10b981';
            setTimeout(() => {
              copyToBtn.innerHTML = originalHTML;
              copyToBtn.style.color = '';
            }, 1500);
          } catch (err) {
            alert('複製失敗，請手動選擇並複製');
          }
        });
      }
    }
    
    // 初始化複製按鈕
    initCopyButtons();
  }
  
  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomOrderModal);
  } else {
    initCustomOrderModal();
  }
})();
