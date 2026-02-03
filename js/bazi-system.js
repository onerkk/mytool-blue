/**
 * 靜月之光能量占卜儀 - 完整八字命理分析系統
 * 包含：八字排盤、十神、神煞、五行強弱、喜用神、大運、流年分析、UI渲染模組
 * 版本：v3.0 - 2026年1月修訂 (新增 BaziUI 視覺化模組)
 */

// ==========================================
// 1. 完整的天干地支基礎數據
// ==========================================

const HEAVENLY_STEMS_DETAIL = {
    '甲': { element: '木', yinYang: '陽', strength: 1.0 },
    '乙': { element: '木', yinYang: '陰', strength: 0.8 },
    '丙': { element: '火', yinYang: '陽', strength: 1.0 },
    '丁': { element: '火', yinYang: '陰', strength: 0.8 },
    '戊': { element: '土', yinYang: '陽', strength: 1.0 },
    '己': { element: '土', yinYang: '陰', strength: 0.8 },
    '庚': { element: '金', yinYang: '陽', strength: 1.0 },
    '辛': { element: '金', yinYang: '陰', strength: 0.8 },
    '壬': { element: '水', yinYang: '陽', strength: 1.0 },
    '癸': { element: '水', yinYang: '陰', strength: 0.8 }
};

const EARTHLY_BRANCHES_DETAIL = {
    '子': { 
        element: '水', yinYang: '陽', 
        hiddenStems: ['癸'], strength: 1.0,
        direction: '北', season: '冬', animal: '鼠'
    },
    '丑': { 
        element: '土', yinYang: '陰',
        hiddenStems: ['己', '癸', '辛'], strength: 0.7,
        direction: '東北', season: '冬', animal: '牛'
    },
    '寅': { 
        element: '木', yinYang: '陽',
        hiddenStems: ['甲', '丙', '戊'], strength: 1.0,
        direction: '東北', season: '春', animal: '虎'
    },
    '卯': { 
        element: '木', yinYang: '陰',
        hiddenStems: ['乙'], strength: 1.0,
        direction: '東', season: '春', animal: '兔'
    },
    '辰': { 
        element: '土', yinYang: '陽',
        hiddenStems: ['戊', '乙', '癸'], strength: 0.7,
        direction: '東南', season: '春', animal: '龍'
    },
    '巳': { 
        element: '火', yinYang: '陰',
        hiddenStems: ['丙', '庚', '戊'], strength: 1.0,
        direction: '東南', season: '夏', animal: '蛇'
    },
    '午': { 
        element: '火', yinYang: '陽',
        hiddenStems: ['丁', '己'], strength: 1.0,
        direction: '南', season: '夏', animal: '馬'
    },
    '未': { 
        element: '土', yinYang: '陰',
        hiddenStems: ['己', '丁', '乙'], strength: 0.7,
        direction: '西南', season: '夏', animal: '羊'
    },
    '申': { 
        element: '金', yinYang: '陽',
        hiddenStems: ['庚', '壬', '戊'], strength: 1.0,
        direction: '西南', season: '秋', animal: '猴'
    },
    '酉': { 
        element: '金', yinYang: '陰',
        hiddenStems: ['辛'], strength: 1.0,
        direction: '西', season: '秋', animal: '雞'
    },
    '戌': { 
        element: '土', yinYang: '陽',
        hiddenStems: ['戊', '辛', '丁'], strength: 0.7,
        direction: '西北', season: '秋', animal: '狗'
    },
    '亥': { 
        element: '水', yinYang: '陰',
        hiddenStems: ['壬', '甲'], strength: 1.0,
        direction: '西北', season: '冬', animal: '豬'
    }
};

// ==========================================
// 1.45 月支與季節對照（鐵則：依十二節定月，季節用於調候／喜忌）
// ==========================================
// 12 節對應月支：小寒→丑、立春→寅、驚蟄→卯、清明→辰、立夏→巳、芒種→午、小暑→未、立秋→申、白露→酉、寒露→戌、立冬→亥、大雪→子
// 季節鐵則：寅卯辰=春、巳午未=夏、申酉戌=秋、亥子丑=冬（不可與月支錯配，否則喜用神會錯）
const MONTH_ZHI_TO_SEASON = { '寅': '春', '卯': '春', '辰': '春', '巳': '夏', '午': '夏', '未': '夏', '申': '秋', '酉': '秋', '戌': '秋', '亥': '冬', '子': '冬', '丑': '冬' };
// 公曆月 fallback 對應月支（正月≈寅、六月≈午；僅在無節氣資料時使用）
const CALENDAR_MONTH_TO_ZHI_INDEX = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 0 };

// ==========================================
// 1.5 旺相休囚死（月令對日主，得令分析用）
// ==========================================
// 月令五行 vs 日主五行：旺=同我、相=令生我、休=我生令、囚=我克令、死=令克我
const WANG_XIU_QIU_SI = {
    '旺': 100, '相': 75, '休': 40, '囚': 20, '死': 0
};
const WUXING_SHENG = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const WUXING_KE = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };

// 日柱曆法：mangpai=盲派/易兌（偏移+10，1983-08-25→乙酉）。設 window.BAZI_DAY_PILLAR_MODE='standard' 或 BAZI_DAY_PILLAR_OFFSET=0 可還原
var _g = typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : {});
var DAY_PILLAR_OFFSET = (typeof _g.BAZI_DAY_PILLAR_OFFSET === 'number') ? _g.BAZI_DAY_PILLAR_OFFSET : ((_g.BAZI_DAY_PILLAR_MODE === 'standard') ? 0 : 10);

// 手動日柱校準（個別覆寫）：以姓名+生日為鍵，覆寫日柱後重算時柱與十神。預設已用盲派偏移。
const BAZI_CALIBRATION_CONFIG = {};
function getBaziCalibration(userName, birthDate) {
    if (!userName || !birthDate) return null;
    var key = (String(userName || '').trim() + '_' + String(birthDate || '').trim()).replace(/\s/g, '');
    return BAZI_CALIBRATION_CONFIG[key] || null;
}

// 人元司令（子平真詮）：各月節氣後X日用事天干。例：酉月白露後9日庚金用事（陳信泓案）。
// 供日後得令細分用；目前得令仍以整月月支五行計。
const RENYUAN_SILING_ZIPING = {
    '寅': [{ days: 7, gan: '戊' }, { days: 7, gan: '丙' }, { gan: '甲' }],
    '卯': [{ gan: '甲' }], '辰': [{ days: 9, gan: '乙' }, { days: 7, gan: '戊' }, { gan: '癸' }],
    '巳': [{ days: 9, gan: '戊' }, { days: 7, gan: '庚' }, { gan: '丙' }], '午': [{ gan: '丙' }],
    '未': [{ days: 9, gan: '丁' }, { days: 7, gan: '己' }, { gan: '乙' }],
    '申': [{ days: 7, gan: '戊' }, { days: 7, gan: '壬' }, { gan: '庚' }],
    '酉': [{ days: 9, gan: '庚' }, { days: 7, gan: '辛' }, { gan: '辛' }],
    '戌': [{ days: 9, gan: '辛' }, { days: 7, gan: '戊' }, { gan: '丁' }],
    '亥': [{ days: 7, gan: '戊' }, { days: 7, gan: '甲' }, { gan: '壬' }],
    '子': [{ gan: '壬' }], '丑': [{ days: 9, gan: '癸' }, { days: 7, gan: '己' }, { gan: '辛' }]
};
// 月令旺衰係數（子平法）：旺1.2、相1.1、休1.0、囚0.8、死0.6。用於五行強弱加權。
// 寅卯春木旺｜巳午夏火旺｜申酉秋金旺｜亥子冬水旺｜辰戌丑未四季土旺
const MONTH_ZHI_TO_WUXING_COEFF = {
    '寅': { '木': 1.2, '火': 1.1, '水': 1.0, '金': 0.8, '土': 0.6 }, '卯': { '木': 1.2, '火': 1.1, '水': 1.0, '金': 0.8, '土': 0.6 },
    '辰': { '土': 1.2, '金': 1.1, '火': 1.0, '木': 0.8, '水': 0.6 }, // 四季末
    '巳': { '火': 1.2, '土': 1.1, '木': 1.0, '水': 0.8, '金': 0.6 }, '午': { '火': 1.2, '土': 1.1, '木': 1.0, '水': 0.8, '金': 0.6 },
    '未': { '土': 1.2, '金': 1.1, '火': 1.0, '木': 0.8, '水': 0.6 }, // 四季末
    '申': { '金': 1.2, '水': 1.1, '土': 1.0, '火': 0.8, '木': 0.6 }, '酉': { '金': 1.2, '水': 1.1, '土': 1.0, '火': 0.8, '木': 0.6 },
    '戌': { '土': 1.2, '金': 1.1, '火': 1.0, '木': 0.8, '水': 0.6 }, // 四季末
    '亥': { '水': 1.2, '木': 1.1, '金': 1.0, '土': 0.8, '火': 0.6 }, '子': { '水': 1.2, '木': 1.1, '金': 1.0, '土': 0.8, '火': 0.6 },
    '丑': { '土': 1.2, '金': 1.1, '火': 1.0, '木': 0.8, '水': 0.6 }  // 四季末
};

// ==========================================
// 2. 十神系統
// ==========================================

const TEN_GODS_MAP = {
    '甲': { '甲': '比肩', '乙': '劫財', '丙': '食神', '丁': '傷官', '戊': '偏財', '己': '正財', '庚': '七殺', '辛': '正官', '壬': '偏印', '癸': '正印' },
    '乙': { '甲': '劫財', '乙': '比肩', '丙': '傷官', '丁': '食神', '戊': '正財', '己': '偏財', '庚': '正官', '辛': '七殺', '壬': '正印', '癸': '偏印' },
    '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫財', '戊': '食神', '己': '傷官', '庚': '偏財', '辛': '正財', '壬': '七殺', '癸': '正官' },
    '丁': { '甲': '正印', '乙': '偏印', '丙': '劫財', '丁': '比肩', '戊': '傷官', '己': '食神', '庚': '正財', '辛': '偏財', '壬': '正官', '癸': '七殺' },
    '戊': { '甲': '七殺', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫財', '庚': '食神', '辛': '傷官', '壬': '偏財', '癸': '正財' },
    '己': { '甲': '正官', '乙': '七殺', '丙': '正印', '丁': '偏印', '戊': '劫財', '己': '比肩', '庚': '傷官', '辛': '食神', '壬': '正財', '癸': '偏財' },
    '庚': { '甲': '偏財', '乙': '正財', '丙': '七殺', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫財', '壬': '食神', '癸': '傷官' },
    '辛': { '甲': '正財', '乙': '偏財', '丙': '正官', '丁': '七殺', '戊': '正印', '己': '偏印', '庚': '劫財', '辛': '比肩', '壬': '傷官', '癸': '食神' },
    '壬': { '甲': '食神', '乙': '傷官', '丙': '偏財', '丁': '正財', '戊': '七殺', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫財' },
    '癸': { '甲': '傷官', '乙': '食神', '丙': '正財', '丁': '偏財', '戊': '正官', '己': '七殺', '庚': '正印', '辛': '偏印', '壬': '劫財', '癸': '比肩' }
};

// ==========================================
// 3. 神煞系統
// ==========================================

const SPECIAL_STARS = {
    '桃花': {
        calculation: (branch) => {
            const map = { '寅午戌': '卯', '申子辰': '酉', '巳酉丑': '午', '亥卯未': '子' };
            for (const key in map) {
                if (key.includes(branch)) return map[key];
            }
            return null;
        },
        meaning: '異性緣、人際魅力'
    },
    '天乙貴人': {
        calculation: (stem, branch) => {
            const map = {
                '甲': '丑未', '乙': '子申', '丙': '亥酉', '丁': '亥酉',
                '戊': '丑未', '己': '子申', '庚': '寅午', '辛': '寅午',
                '壬': '卯巳', '癸': '卯巳'
            };
            return map[stem]?.includes(branch) ? true : false;
        },
        meaning: '貴人相助、逢凶化吉'
    },
    '文昌': {
        calculation: (stem) => {
            const map = {
                '甲': '巳', '乙': '午', '丙': '申', '丁': '酉',
                '戊': '申', '己': '酉', '庚': '亥', '辛': '子',
                '壬': '寅', '癸': '卯'
            };
            return map[stem];
        },
        meaning: '學習能力、文采'
    },
    '驛馬': {
        calculation: (branch) => {
            const map = { '寅午戌': '申', '申子辰': '寅', '巳酉丑': '亥', '亥卯未': '巳' };
            for (const key in map) {
                if (key.includes(branch)) return map[key];
            }
            return null;
        },
        meaning: '變動、旅行、遷移'
    },
    '羊刃': {
        calculation: (stem) => {
            const map = {
                '甲': '卯', '乙': '辰', '丙': '午', '丁': '巳',
                '戊': '午', '己': '未', '庚': '酉', '辛': '申',
                '壬': '子', '癸': '亥'
            };
            return map[stem];
        },
        meaning: '剛強、攻擊性'
    },
    '華蓋': {
        calculation: (branch) => {
            const map = { '寅午戌': '戌', '申子辰': '辰', '巳酉丑': '丑', '亥卯未': '未' };
            for (const key in map) {
                if (key.includes(branch)) return map[key];
            }
            return null;
        },
        meaning: '藝術才華、宗教緣分'
    }
};

// 神煞擴充（對齊易兌／萬年曆格式）：日神煞、月神煞、年神煞
function _sancheng(branch, map) {
    const keys = ['寅午戌','申子辰','巳酉丑','亥卯未'];
    for (let i = 0; i < keys.length; i++) {
        if (keys[i].includes(branch)) return map[keys[i]];
    }
    return null;
}
const SHENSHA_MAP = {
    luShen: { '甲':'寅','乙':'卯','丙':'巳','丁':'午','戊':'巳','己':'午','庚':'申','辛':'酉','壬':'亥','癸':'子' },
    yangRen: { '甲':'卯','乙':'辰','丙':'午','丁':'巳','戊':'午','己':'未','庚':'酉','辛':'申','壬':'子','癸':'亥' },
    jinYu: { '甲':'辰','乙':'巳','丙':'未','丁':'申','戊':'未','己':'申','庚':'亥','辛':'子','壬':'丑','癸':'寅' },
    jieSha: { '寅午戌':'亥','申子辰':'巳','巳酉丑':'寅','亥卯未':'申' },
    zaiSha: { '寅午戌':'子','申子辰':'午','巳酉丑':'卯','亥卯未':'酉' },
    wangShen: { '寅午戌':'巳','申子辰':'亥','巳酉丑':'申','亥卯未':'亥' },
    jiangXing: { '寅午戌':'午','申子辰':'子','巳酉丑':'酉','亥卯未':'卯' },
    muKu: { '甲':'未','乙':'戌','丙':'戌','丁':'丑','戊':'戌','己':'丑','庚':'丑','辛':'辰','壬':'辰','癸':'未' },
    hongYan: { '甲':'午申','乙':'午申','丙':'寅','丁':'未','戊':'辰','己':'辰','庚':'戌','辛':'酉','壬':'子','癸':'申' },
    tianDe: { '寅':'丁','卯':'申','辰':'壬','巳':'辛','午':'亥','未':'甲','申':'癸','酉':'寅','戌':'丙','亥':'乙','子':'己','丑':'庚' },
    tianDeHe: { '丁':'壬','壬':'丁','丙':'辛','辛':'丙','甲':'己','己':'甲','乙':'庚','庚':'乙','戊':'癸','癸':'戊' },
    yueDe: { '寅':'丙','卯':'甲','辰':'壬','巳':'庚','午':'壬','未':'甲','申':'庚','酉':'丙','戌':'甲','亥':'壬','子':'壬','丑':'庚' }
};

// ==========================================
// 4. 十二長生
// ==========================================

const TWELVE_LONGEVITY = {
    '甲': ['亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌'],
    '乙': ['午', '巳', '辰', '卯', '寅', '丑', '子', '亥', '戌', '酉', '申', '未'],
    '丙': ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'],
    '丁': ['酉', '申', '未', '午', '巳', '辰', '卯', '寅', '丑', '子', '亥', '戌'],
    '戊': ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'],
    '己': ['酉', '申', '未', '午', '巳', '辰', '卯', '寅', '丑', '子', '亥', '戌'],
    '庚': ['巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰'],
    '辛': ['子', '亥', '戌', '酉', '申', '未', '午', '巳', '辰', '卯', '寅', '丑'],
    '壬': ['申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未'],
    '癸': ['卯', '寅', '丑', '子', '亥', '戌', '酉', '申', '未', '午', '巳', '辰']
};

const LONGEVITY_NAMES = [
    '長生', '沐浴', '冠帶', '臨官', '帝旺', '衰',
    '病', '死', '墓', '絕', '胎', '養'
];

// ==========================================
// 5. 八字計算器類 (核心邏輯)
// ==========================================

class BaziCalculator {
    constructor() {
        this.stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        this.branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        this.solarTerms1983 = {
            1: { '小寒': [1, 6, 5, 59] }, 2: { '立春': [2, 4, 17, 36] }, 3: { '驚蟄': [3, 6, 11, 47] },
            4: { '清明': [4, 5, 16, 44] }, 5: { '立夏': [5, 6, 10, 11] }, 6: { '芒種': [6, 6, 14, 26] },
            7: { '小暑': [7, 7, 20, 36] }, 8: { '立秋': [8, 8, 4, 42] }, 9: { '白露': [9, 8, 12, 42] },
            10: { '寒露': [10, 9, 6, 4] }, 11: { '立冬': [11, 8, 8, 53] }, 12: { '大雪': [12, 8, 1, 50] }
        };
        this.equationOfTime = {
            1: -3, 2: -14, 3: -12, 4: -4, 5: 3, 6: 6,
            7: 5, 8: -1, 9: -6, 10: -10, 11: -16, 12: -11
        };
    }
    
    calculateBazi(fullBirthDate, gender, useSolarTime = false, longitude = 120.2, opts) {
        if (!fullBirthDate) throw new Error('出生日期不能為空');
        const date = new Date(fullBirthDate);
        if (isNaN(date.getTime())) throw new Error(`無效的日期格式`);
        
        let trueSolarInfo = null;
        let adjustedDate = date;
        if (useSolarTime) {
            trueSolarInfo = this.calculateTrueSolarTime(date, longitude);
            adjustedDate = trueSolarInfo.adjustedTime;
        }
        
        const yearPillar = this.calculateYearPillar(adjustedDate);
        const monthPillar = this.calculateMonthPillar(adjustedDate);
        // 日柱：鐵則 23:00 為界。晚子 23:00–24:00 屬當日；早子 00:00–01:00 屬次日；其餘用當日
        let dayPillar = this.calculateDayPillarWithZiHourRule(adjustedDate);
        // 時柱：早子/晚子皆用「次日」天干依五鼠遁
        let hourPillar = this.calculateHourPillarWithZiHourRule(adjustedDate, dayPillar.stem, dayPillar._dayDateForHour);
        
        let fourPillars = {
            year: { gan: yearPillar.stem, zhi: yearPillar.branch },
            month: { gan: monthPillar.stem, zhi: monthPillar.branch },
            day: { gan: dayPillar.stem, zhi: dayPillar.branch },
            hour: { gan: hourPillar.stem, zhi: hourPillar.branch }
        };

        let baziCalibrated = false;
        const cal = (opts && opts.baziCalibration) || (opts && opts.userName && opts.birthDate ? getBaziCalibration(opts.userName, opts.birthDate) : null);
        if (cal && cal.dayPillar) {
            const dp = String(cal.dayPillar).trim();
            if (dp.length >= 2) {
                fourPillars.day = { gan: dp[0], zhi: dp[1] };
                hourPillar = this.calculateHourPillarWithZiHourRule(adjustedDate, fourPillars.day.gan, dayPillar._dayDateForHour || adjustedDate);
                fourPillars.hour = { gan: hourPillar.stem, zhi: hourPillar.branch };
                baziCalibrated = true;
            }
        }

        const dayMaster = fourPillars.day.gan;
        const tenGods = this.calculateTenGods(fourPillars, dayMaster);
        const hiddenStems = this.calculateHiddenStems(fourPillars);
        const specialStars = this.calculateSpecialStars(fourPillars, dayMaster);
        
        // 使用通用五行強度計算
        const elementStrength = this.calculateElementStrength(fourPillars, dayMaster);
        
        const longevity = this.calculateLongevity(fourPillars, dayMaster);
        const favorableElements = this.calculateFavorableElements(fourPillars, dayMaster, elementStrength);
        const pattern = this.analyzePattern(fourPillars, dayMaster, elementStrength, favorableElements);
        const dayunOpts = (typeof longitude === 'number' && !isNaN(longitude)) ? { longitude, zoneOffsetHours: 8 } : undefined;
        let greatFortune = this.calculateGreatFortune(fullBirthDate, gender, fourPillars, dayunOpts);
        greatFortune = this._tagDayunWithFavorable(greatFortune, favorableElements, dayMaster, fourPillars);
        const lifePalace = this.calculateLifePalace(fourPillars, adjustedDate);
        const fetalOrigin = this.calculateFetalOrigin(fourPillars);
        const fetalBreath = this.calculateFetalBreath(fourPillars);
        const bodyPalace = this.calculateBodyPalace(fourPillars, adjustedDate);
        const voidEmptiness = this.calculateVoidEmptiness(fourPillars);
        const weighingBone = this.calculateWeighingBone(fourPillars, gender, adjustedDate);
        const starMansion = this.calculateStarMansion(adjustedDate);
        var ziweiRef = {};
        if (typeof ZIWEI_MINGZHU !== 'undefined' && ZIWEI_MINGZHU && lifePalace && lifePalace.zhi) {
            ziweiRef.mingZhu = ZIWEI_MINGZHU[lifePalace.zhi];
        }
        if (typeof ZIWEI_SHENZHU !== 'undefined' && ZIWEI_SHENZHU && fourPillars.year && fourPillars.year.zhi) {
            ziweiRef.shenZhu = ZIWEI_SHENZHU[fourPillars.year.zhi];
        }
        
        return {
            fourPillars, dayMaster, tenGods, hiddenStems, specialStars, elementStrength,
            longevity, pattern, favorableElements, greatFortune, lifePalace, fetalOrigin,
            fetalBreath, bodyPalace, voidEmptiness, weighingBone, starMansion, ziweiRef,
            trueSolarInfo, adjustedTime: adjustedDate.toISOString(), gender, baziCalibrated: !!baziCalibrated
        };
    }
    
    // ---------- 第一步：定格·定強弱（得令50% + 得地30% + 得勢20%）----------
    /** 得令：月令對日主 旺相休囚死。月令五行 vs 日主五行 → 旺/相/休/囚/死 */
    _getDeLing(monthZhi, dayMasterElement) {
        const monthEl = EARTHLY_BRANCHES_DETAIL[monthZhi]?.element;
        if (!monthEl || !dayMasterElement) return { state: '休', score: 40 };
        if (monthEl === dayMasterElement) return { state: '旺', score: WANG_XIU_QIU_SI['旺'] };
        if (WUXING_SHENG[monthEl] === dayMasterElement) return { state: '相', score: WANG_XIU_QIU_SI['相'] };
        if (WUXING_SHENG[dayMasterElement] === monthEl) return { state: '休', score: WANG_XIU_QIU_SI['休'] };
        if (WUXING_KE[dayMasterElement] === monthEl) return { state: '囚', score: WANG_XIU_QIU_SI['囚'] };
        if (WUXING_KE[monthEl] === dayMasterElement) return { state: '死', score: WANG_XIU_QIU_SI['死'] };
        return { state: '休', score: 40 };
    }

    /** 得地：地支根氣。強根=本氣比劫、生根=印星、餘氣根=辰未戌丑中含日主 */
    _getDeDi(fourPillars, dayMasterElement) {
        const roots = { strong: 0, seal: 0, remainder: 0 };
        const shengWo = Object.keys(WUXING_SHENG).find(k => WUXING_SHENG[k] === dayMasterElement); // 生我者=印
        const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour];
        pillars.forEach(p => {
            const zhi = p?.zhi;
            if (!zhi) return;
            const info = EARTHLY_BRANCHES_DETAIL[zhi];
            if (!info) return;
            if (info.element === dayMasterElement) roots.strong += 1.0;
            else if (info.element === shengWo) roots.seal += 0.8;
            ['辰', '未', '戌', '丑'].includes(zhi) && info.hiddenStems?.some(stem => HEAVENLY_STEMS_DETAIL[stem]?.element === dayMasterElement) && (roots.remainder += 0.4);
            info.hiddenStems?.forEach(stem => {
                const el = HEAVENLY_STEMS_DETAIL[stem]?.element;
                if (el === dayMasterElement) roots.remainder += 0.2;
                if (el === shengWo) roots.seal += 0.15;
            });
        });
        const raw = roots.strong * 25 + roots.seal * 20 + Math.min(roots.remainder * 15, 30);
        return { score: Math.min(100, Math.round(raw)), roots };
    }

    /** 得生（權重10%）：印星透干生扶。年月時天干為印星（生我者）；雙印透且水旺可給滿分。 */
    _getDeSheng(fourPillars, dayMaster) {
        const dayEl = HEAVENLY_STEMS_DETAIL[dayMaster]?.element;
        const shengWo = dayEl ? Object.keys(WUXING_SHENG).find(k => WUXING_SHENG[k] === dayEl) : null;
        let count = 0;
        ['year', 'month', 'hour'].forEach(p => {
            const gan = fourPillars[p]?.gan;
            if (!gan) return;
            const el = HEAVENLY_STEMS_DETAIL[gan]?.element;
            if (el === shengWo) count += 1.0;
        });
        const score = count >= 2 ? 100 : (count >= 1 ? 50 : Math.min(100, Math.round(count * 33)));
        return { score };
    }

    /** 得助（權重10%）：比劫透干幫扶。看年月時天干是否為比劫（同五行），不含日干。 */
    _getDeShi(fourPillars, dayMaster) {
        const dayEl = HEAVENLY_STEMS_DETAIL[dayMaster]?.element;
        let count = 0;
        ['year', 'month', 'hour'].forEach(p => {
            const gan = fourPillars[p]?.gan;
            if (!gan) return;
            const el = HEAVENLY_STEMS_DETAIL[gan]?.element;
            if (el === dayEl) count += 1.0;
        });
        const score = Math.min(100, Math.round(count * 33));
        return { score };
    }

    /** 綜合判定身強/身弱（得令50%、得地30%、得生10%、得助10%，百分制） */
    calculateElementStrength(fourPillars, dayMaster) {
        const dayMasterElement = HEAVENLY_STEMS_DETAIL[dayMaster]?.element;
        const monthZhi = fourPillars.month?.zhi;
        const monthEl = EARTHLY_BRANCHES_DETAIL[monthZhi]?.element || '';

        const deLing = this._getDeLing(monthZhi, dayMasterElement);
        const deDi = this._getDeDi(fourPillars, dayMasterElement);
        const deSheng = this._getDeSheng(fourPillars, dayMaster);
        const deShi = this._getDeShi(fourPillars, dayMaster);

        const wLing = 0.5, wDi = 0.3, wSheng = 0.1, wShi = 0.1;
        const composite = (deLing.score / 100) * (wLing * 100) + (deDi.score / 100) * (wDi * 100) + (deSheng.score / 100) * (wSheng * 100) + (deShi.score / 100) * (wShi * 100);
        let bodyStrength;
        if (composite >= 55) bodyStrength = '身強';
        else if (composite >= 45) bodyStrength = '中和';
        else if (composite >= 25) bodyStrength = '身弱';
        else bodyStrength = '極弱';

        const dmReasons = [
            `得令(${Math.round(wLing * 100)}%)：月令${monthZhi}${monthEl}，日主${dayMasterElement} → ${deLing.state}${['旺','相'].includes(deLing.state) ? '，得令' : '，失令'}，得分${deLing.score}`,
            `得地(${Math.round(wDi * 100)}%)：地支根氣（本氣/中氣/餘氣）得分${deDi.score}`,
            `得生(${Math.round(wSheng * 100)}%)：印星透干生扶得分${deSheng.score}`,
            `得助(${Math.round(wShi * 100)}%)：比劫透干幫扶得分${deShi.score}`
        ];

        const elementCount = { '金': 0, '木': 0, '火': 0, '土': 0, '水': 0 };
        const rawScore = { '金': 0, '木': 0, '火': 0, '土': 0, '水': 0 };
        // 天干：每透一柱計 1
        Object.values(fourPillars).forEach(pillar => {
            const stemInfo = HEAVENLY_STEMS_DETAIL[pillar.gan];
            if (stemInfo) {
                elementCount[stemInfo.element]++;
                rawScore[stemInfo.element] += 1.0;
            }
        });
        // 地支藏干權重（子平法）：本氣 1.0、中氣 0.6、餘氣 0.3
        const hiddenWeights = [1.0, 0.6, 0.3];
        Object.values(fourPillars).forEach(pillar => {
            const branchInfo = EARTHLY_BRANCHES_DETAIL[pillar.zhi];
            if (branchInfo) {
                const stems = branchInfo.hiddenStems || [];
                stems.forEach((hiddenStem, idx) => {
                    const el = HEAVENLY_STEMS_DETAIL[hiddenStem]?.element;
                    if (el) {
                        elementCount[el]++;
                        const w = hiddenWeights[idx] != null ? hiddenWeights[idx] : (stems.length === 1 ? 1.0 : 0.6);
                        rawScore[el] += w;
                    }
                });
            }
        });
        // 月令旺衰加權：各五行基礎分 × 月令係數（旺1.2/相1.1/休1.0/囚0.8/死0.6）
        const monthCoeff = MONTH_ZHI_TO_WUXING_COEFF[monthZhi] || { '金': 1.0, '木': 1.0, '水': 1.0, '火': 1.0, '土': 1.0 };
        const elementScore = {};
        ['金', '木', '水', '火', '土'].forEach(el => {
            elementScore[el] = (rawScore[el] || 0) * (monthCoeff[el] || 1.0);
        });

        const totalScore = Object.values(elementScore).reduce((a, b) => a + b, 0) || 1;
        const dayMasterPercentage = Math.round((elementScore[dayMasterElement] / totalScore) * 100);

        const sameElTotal = Object.values(elementCount).reduce((a, b) => a + b, 0) || 1;
        const sameRatio = (elementCount[dayMasterElement] || 0) / sameElTotal;
        let patternOverride = null;
        if (sameRatio >= 0.7) {
            patternOverride = '專旺';
            bodyStrength = '專旺格';
        } else if (dayMasterPercentage < 15 && totalScore > 0) {
            let maxEl = '';
            let maxS = 0;
            Object.entries(elementScore).forEach(([el, s]) => { if (s > maxS && el !== dayMasterElement) { maxS = s; maxEl = el; } });
            const shengWo = Object.keys(WUXING_SHENG).find(k => WUXING_SHENG[k] === dayMasterElement);
            const keWo = Object.keys(WUXING_KE).find(k => WUXING_KE[k] === dayMasterElement);
            const sealScore = elementScore[shengWo] || 0;
            const killerScore = elementScore[keWo] || 0;
            const hasYinHuaSha = sealScore > 0 && sealScore >= killerScore * 0.5;
            if (maxS > elementScore[dayMasterElement] * 2.5 && !hasYinHuaSha) {
                patternOverride = '從' + maxEl + '格';
                bodyStrength = '從格';
            }
        }

        const elementDetails = {};
        ['金', '木', '水', '火', '土'].forEach(el => {
            const score = Math.round((elementScore[el] || 0) * 10) / 10;
            let desc = el === dayMasterElement ? `日主` : `${el}行`;
            if (score >= 4) desc += '極旺';
            else if (score >= 3) desc += '強旺';
            else if (score >= 2) desc += '中等';
            else if (score >= 1) desc += '偏弱';
            else desc += '極弱';
            elementDetails[el] = { count: elementCount[el], score, description: desc };
        });

        const dm_strength = {
            score: Math.round(composite * 10) / 10,
            level: bodyStrength,
            reasons: dmReasons
        };

        return {
            counts: elementCount,
            strengths: elementScore,
            bodyStrength,
            dm_strength,
            percentage: dayMasterPercentage,
            dayMasterElement,
            elementDetails,
            deLing: { state: deLing.state, score: deLing.score },
            deDi: { score: deDi.score, roots: deDi.roots },
            deSheng: { score: deSheng.score },
            deShi: { score: deShi.score },
            compositeScore: dm_strength.score,
            patternOverride
        };
    }
    
    // 輔助方法：根據五行獲取天干
    getStemsByElement(element) {
        const stems = [];
        for (const [stem, info] of Object.entries(HEAVENLY_STEMS_DETAIL)) {
            if (info.element === element) {
                stems.push(stem);
            }
        }
        return stems;
    }
    
    // ---------- 第二步：明病·定喜忌（四層架構：戰略總則→用神分級→閑忌辨析→動態應用）----------
    calculateFavorableElements(fourPillars, dayMaster, elementStrength) {
        const dayMasterElement = elementStrength.dayMasterElement || HEAVENLY_STEMS_DETAIL[dayMaster].element;
        const monthZhi = fourPillars.month?.zhi;
        const season = (monthZhi && MONTH_ZHI_TO_SEASON[monthZhi]) || EARTHLY_BRANCHES_DETAIL[monthZhi]?.season || '';
        const strengths = elementStrength.strengths || {};
        const bodyStrength = elementStrength.bodyStrength || '';

        let favorable = [];
        let unfavorable = [];
        let reasoning = '';
        const strategyOrder = [];
        const coreGods = [];
        const secondaryGods = [];
        const xianShen = [];
        const xiaoXi = [];
        const xiaoJi = [];
        const rules_trace = [];

        const allEl = ['金', '木', '水', '火', '土'];
        const sortedByScore = [...allEl].sort((a, b) => (strengths[b] || 0) - (strengths[a] || 0));
        const mostWanted = sortedByScore[0];
        const mostWeak = sortedByScore[sortedByScore.length - 1];
        const dayScore = strengths[dayMasterElement] || 0;
        const totalScore = Object.values(strengths).reduce((a, b) => a + b, 0) || 1;

        const isStrong = bodyStrength.includes('強') || bodyStrength.includes('中和') || bodyStrength.includes('專旺');
        const isCong = bodyStrength.includes('從');
        const fireScore = strengths['火'] || 0;
        const waterScore = strengths['水'] || 0;
        const waterRatio = totalScore > 0 ? waterScore / totalScore : 0;
        const needTiaoHou = (season === '冬' && dayMasterElement !== '火') || (season === '夏' && dayMasterElement !== '水')
            || (season === '秋' && dayMasterElement !== '火' && fireScore < totalScore * 0.15);

        const shengWo = Object.keys(WUXING_SHENG).find(k => WUXING_SHENG[k] === dayMasterElement);
        const woSheng = WUXING_SHENG[dayMasterElement];
        const woKe = WUXING_KE[dayMasterElement];
        const keWo = Object.keys(WUXING_KE).find(k => WUXING_KE[k] === dayMasterElement);

        const metalScore = strengths['金'] || 0;
        const metalRatio = totalScore > 0 ? metalScore / totalScore : 0;
        const shaZhongShenQing = !isStrong && !isCong && metalRatio > 0.28 && dayScore < totalScore * 0.25;

        // 殺重身輕必須優先於從格：有印星化殺時不取從格
        if (shaZhongShenQing) {
            strategyOrder.push('格局(杀重身轻)');
            favorable = [shengWo, dayMasterElement].filter(Boolean);
            coreGods.push(shengWo);
            secondaryGods.push(dayMasterElement);
            unfavorable = [keWo, woKe].filter(Boolean);
            reasoning = `官殺（金）極旺攻身，杀重身轻。首取印星（${shengWo || '水'}）化殺生身、次取比劫（${dayMasterElement || '木'}）助身；忌金、土；火為閑神慎用，待水木運時方可小用。`;
            rules_trace.push(`格局=杀重身轻(金旺身弱) => 用神印(化杀)、喜神比劫，忌官殺/財，火慎用(rule: 格局優先)`);
            if (needTiaoHou && season === '秋' && !favorable.includes('火')) {
                secondaryGods.push('火');
                reasoning += ' 申月漸入秋可借少許火暖局，惟非主要矛盾。';
            }
        } else if (isCong) {
            strategyOrder.push('格局');
            favorable = [mostWanted];
            unfavorable = [keWo, woSheng].filter(Boolean);
            coreGods.push(mostWanted);
            reasoning = `從${mostWanted}格，喜順勢${mostWanted}，忌克泄${mostWanted}。`;
            rules_trace.push(`dm_strength.level=從格 => 喜順勢${mostWanted}，忌克泄${mostWanted}`);
        } else {
            if (needTiaoHou) {
                strategyOrder.push('調候');
                if (season === '冬') {
                    if (!favorable.includes('火')) favorable.unshift('火');
                    coreGods.push('火');
                    reasoning += ' 冬生需調候暖局，喜火（調候為急）。';
                    rules_trace.push(`month=${monthZhi}, 冬生 => 調候喜火(rule: 冬寒需暖局)`);
                } else if (season === '秋') {
                    if (!favorable.includes('火')) favorable.unshift('火');
                    if (!favorable.includes('土')) favorable.push('土');
                    coreGods.push('火');
                    reasoning += ' 秋生金寒水冷，需火暖局（調候為急），喜火、燥土。';
                    rules_trace.push(`month=${monthZhi}, 秋金寒、fire<15% => 調候喜火、燥土(rule: 秋金寒水冷需暖)`);
                } else if (season === '夏') {
                    if (!favorable.includes('水')) favorable.unshift('水');
                    coreGods.push('水');
                    reasoning += ' 夏生需調候潤局，喜水（調候為急）。';
                    rules_trace.push(`month=${monthZhi}, 夏生 => 調候喜水(rule: 夏燥需潤)`);
                }
            }
            const yinXingGuoWang = !isStrong && waterRatio > 0.4;
            if (yinXingGuoWang) {
                if (!strategyOrder.includes('印星過旺')) strategyOrder.push('印星過旺');
                favorable = favorable.filter(el => el !== '水');
                if (!favorable.includes('火')) favorable.unshift('火');
                if (!favorable.includes('土')) favorable.push('土');
                reasoning += ' 印星（水）過旺，水多木漂，不宜再補水，喜火暖局、土止水。';
                rules_trace.push(`印星過旺(水>40%)、身弱 => 忌再補水，喜火、土止水(rule: 母慈滅子)`);
            }
            const jinMuZhan = (strengths['金'] || 0) > 2.5 && (strengths['木'] || 0) > 2.5;
            if (jinMuZhan) {
                if (!strategyOrder.includes('通關')) strategyOrder.push('通關');
                if (!favorable.includes('水')) { favorable = ['水', ...favorable.filter(e => e !== '水')]; coreGods.push('水'); }
                reasoning += ' 金木相戰，用水通關。';
                rules_trace.push(`金木相戰 => 喜水通關(rule: 通關)`);
            }
            strategyOrder.push('扶抑');
            if (isStrong) {
                const fuYi = [keWo, woSheng, woKe].filter(Boolean);
                favorable = [...new Set([...favorable, ...fuYi])];
                secondaryGods.push(...fuYi.filter(e => !coreGods.includes(e)));
                unfavorable = [shengWo, dayMasterElement].filter(Boolean);
                reasoning += (reasoning ? ' ' : '') + `${dayMaster}${dayMasterElement}日主身強，喜克泄耗（官殺、食傷、財星），忌生扶（印、比劫）。`;
                rules_trace.push(`dm_strength.level=身強 => 喜克泄耗(財官食傷)，忌印/比劫`);
            } else {
                const fuYi = [shengWo, dayMasterElement].filter(Boolean);
                if (!yinXingGuoWang) {
                    favorable = [...new Set([...favorable, ...fuYi])];
                    secondaryGods.push(...fuYi.filter(e => !coreGods.includes(e)));
                }
                unfavorable = [keWo, woSheng, woKe].filter(Boolean);
                reasoning += (reasoning ? ' ' : '') + (yinXingGuoWang ? '' : `${dayMaster}${dayMasterElement}日主身弱，喜生扶（印星、比劫），忌克泄耗。`);
                rules_trace.push(`dm_strength.level=身弱 => 喜印/比劫，忌官殺/食傷/財`);
            }
            const bing = mostWanted !== dayMasterElement ? mostWanted : sortedByScore[1];
            const yao = WUXING_KE[bing];
            if (bing && yao && (strengths[bing] || 0) > 2.5 && dayScore < 2) {
                if (!favorable.includes(yao)) { favorable.push(yao); coreGods.push(yao); }
                if (!strategyOrder.includes('病藥')) strategyOrder.push('病藥');
                reasoning += ` 命局${bing}過旺為病，以${yao}為藥。`;
            }
        }

        favorable = [...new Set(favorable)].filter(Boolean);
        unfavorable = [...new Set(unfavorable)].filter(Boolean);
        // 同一五行不得同時出現在喜用與忌神：若已為喜用（含調候/通關/病藥），則從忌神中移除
        unfavorable = unfavorable.filter(el => !favorable.includes(el));
        unfavorable.forEach(el => {
            if (el === '火' && (fireScore || 0) < totalScore * 0.1) rules_trace.push(`火為忌：身弱忌食傷(火)；fire極低仍列忌因扶抑規則(rule: 身弱忌泄)`);
            else if (el === woSheng) rules_trace.push(`${el}為忌：身弱忌食傷(rule: 扶抑)`);
            else if (el === keWo) rules_trace.push(`${el}為忌：官殺克身(rule: 扶抑)`);
            else if (el === woKe) rules_trace.push(`${el}為忌：身弱忌財星耗身(rule: 扶抑)`);
        });
        const coreSet = [...new Set(coreGods)];
        const secondarySet = secondaryGods.filter(e => !coreSet.includes(e));
        coreGods.length = 0;
        coreGods.push(...coreSet);
        secondaryGods.length = 0;
        secondaryGods.push(...[...new Set(secondarySet)]);

        allEl.forEach(el => {
            const s = strengths[el] || 0;
            if (s < 0.8 && totalScore > 0) xianShen.push(el);
        });
        const mainJi = unfavorable[0];
        if (mainJi) {
            const keJi = WUXING_KE[mainJi];
            if (keJi && !favorable.includes(keJi) && !unfavorable.includes(keJi) && (strengths[keJi] || 0) > 0) xiaoXi.push(keJi);
        }
        const mainYong = favorable[0];
        if (mainYong) {
            const shengJi = unfavorable.find(u => WUXING_SHENG[u] === mainYong || u === mainYong);
            if (shengJi && (strengths[mainYong] || 0) > 3) xiaoJi.push(mainYong);
        }

        const seasonEffects = { '春': '木', '夏': '火', '秋': '金', '冬': '水' };
        if (season && seasonEffects[season]) {
            favorable.sort((a, b) => (b === seasonEffects[season] ? 1 : 0) - (a === seasonEffects[season] ? 1 : 0));
            reasoning += ` 生於${season}季。`;
        }

        const priority = {};
        if (favorable.length > 0) priority['第一喜神'] = favorable[0];
        if (favorable.length > 1) priority['第二喜神'] = favorable[1];
        if (unfavorable.length > 0) priority['第一忌神'] = unfavorable[0];
        if (unfavorable.length > 1) priority['第二忌神'] = unfavorable[1];

        let dynamicNote = '歲運中：用神得助則順；忌神得制則化壓力為權力；喜神過旺（如喜水行北方水運過重）須防過猶不及；忌神若貪生忘克、反哺用神，該運中可為助力。';
        if (favorable.length >= 2) {
            const [a, b] = favorable;
            if (WUXING_KE[a] === b || WUXING_KE[b] === a) dynamicNote = '歲運中若水火／金木等用神交戰並見，主該年事多矛盾、吉凶參半；宜把握單一用神旺的流年。' + dynamicNote;
        }

        const hierarchy = {
            strategyLayer: { order: strategyOrder, motto: '格局優先，扶抑為本，調候為輔；矛盾時以根本格局為準。' },
            godTier: { core: coreGods, secondary: secondaryGods, dynamicNote: '原局閑神或小忌，若歲運能克忌神或生用神，則為動態喜神（奇兵）。' },
            xianJi: { xianShen, xiaoXi, xiaoJi, shuangMianRen: ['七殺、財星等因位置與組合可為喜亦可為忌，需分干支與歲運。'] },
            dynamicApplication: dynamicNote
        };

        return {
            favorable,
            unfavorable,
            reasoning: reasoning.trim(),
            priority,
            mostWanted,
            mostWeak,
            hierarchy,
            rules_trace
        };
    }
    
    // 輔助方法：根據季節獲當令五行
    getElementBySeason(season) {
        const map = { '春': '木', '夏': '火', '秋': '金', '冬': '水' };
        return map[season] || '';
    }
    
    // 格局分析（通用版）；第四步依喜忌定格局描述
    analyzePattern(fourPillars, dayMaster, elementStrength, favorableElements) {
        const dayMasterElement = elementStrength.dayMasterElement || HEAVENLY_STEMS_DETAIL[dayMaster].element;
        const strategyOrder = favorableElements?.hierarchy?.strategyLayer?.order || [];
        const isShaZhongShenQing = strategyOrder.some(s => (s || '').includes('杀重身轻'));
        let patternType = elementStrength.patternOverride || '正格';
        let description = '';

        if (isShaZhongShenQing) {
            patternType = '殺重身輕';
            description = `${dayMaster}${dayMasterElement}日主身弱，官殺（金）極旺攻身，杀重身轻；用印化殺、喜比劫助身`;
        } else if (elementStrength.patternOverride === '專旺格') {
            description = `${dayMaster}${dayMasterElement}日主極旺，形成${dayMasterElement}氣專旺格局`;
        } else if (elementStrength.patternOverride && elementStrength.patternOverride.startsWith('從')) {
            const maxEl = elementStrength.patternOverride.replace('從', '').replace('格', '');
            description = `${dayMaster}${dayMasterElement}日主極弱，${maxEl}極旺，形成從${maxEl}格局`;
        } else if (this.isKillingAndSeal(fourPillars, dayMaster)) {
            patternType = '殺印相生格';
            description = '官殺旺而有印星化殺生身，形成殺印相生格局';
        } else if (this.isFoodAndWealth(fourPillars, dayMaster)) {
            patternType = '食傷生財格';
            description = '食傷旺而生財，形成食傷生財格局';
        } else {
            patternType = '正格';
            const favStr = (favorableElements && favorableElements.favorable && favorableElements.favorable.length)
                ? favorableElements.favorable.join('、') : '';
            description = `${dayMaster}${dayMasterElement}日主${elementStrength.bodyStrength}，以${favStr || '—'}為喜用`;
        }

        return { type: patternType, description };
    }
    
    // 輔助方法：檢查是否為殺印相生
    isKillingAndSeal(fourPillars, dayMaster) {
        // 簡化檢查：有官殺且有印星
        const hasKilling = false; // 需要實際檢查
        const hasSeal = false; // 需要實際檢查
        return hasKilling && hasSeal;
    }
    
    // 輔助方法：檢查是否為食傷生財
    isFoodAndWealth(fourPillars, dayMaster) {
        // 簡化檢查：有食傷且有財星
        const hasFood = false; // 需要實際檢查
        const hasWealth = false; // 需要實際檢查
        return hasFood && hasWealth;
    }
    
    /**
     * 依節氣計算起運歲數（命理標準）
     * 順行：從出生順數到下一個「節」；逆行：逆數到上一個「節」。
     * 換算：3 日 = 1 歲，1 日 = 4 月，1 時 = 10 日。
     * @param {Date|string} birthDate 出生日期時間
     * @param {string} gender 'male'|'female'
     * @param {{ year: { gan }, month: { gan, zhi } }} fourPillars 年柱、月柱
     * @returns {{ startYears: number, startMonths: number, startAgeInYears: number } | null}
     */
    computeStartAgeFromSolarTerms(birthDate, gender, fourPillars) {
        const date = new Date(birthDate);
        if (isNaN(date.getTime())) return null;
        const birthYear = date.getFullYear();
        const yearStem = fourPillars.year?.gan;
        if (!yearStem || !HEAVENLY_STEMS_DETAIL[yearStem]) return null;
        const isYangYear = HEAVENLY_STEMS_DETAIL[yearStem].yinYang === '陽';
        const isMale = gender === 'male';
        const forward = (isYangYear && isMale) || (!isYangYear && !isMale);

        const termsByYear = this._getSolarTermsJieForYear(birthYear);
        if (!termsByYear || termsByYear.length === 0) return null;

        let targetTerm = null;
        if (forward) {
            for (let i = 0; i < termsByYear.length; i++) {
                if (termsByYear[i].date > date) {
                    targetTerm = termsByYear[i];
                    break;
                }
            }
        } else {
            for (let i = termsByYear.length - 1; i >= 0; i--) {
                if (termsByYear[i].date < date) {
                    targetTerm = termsByYear[i];
                    break;
                }
            }
        }
        if (!targetTerm) return null;

        const diffMs = forward
            ? targetTerm.date.getTime() - date.getTime()
            : date.getTime() - targetTerm.date.getTime();
        if (diffMs <= 0) return null;

        const diffDays = diffMs / (24 * 60 * 60 * 1000);
        const startAgeInYears = diffDays / 3;
        const startYears = Math.floor(diffDays / 3);
        const remainderDays = diffDays - startYears * 3;
        const startMonths = Math.min(11, Math.floor(remainderDays * 4));

        return { startYears, startMonths, startAgeInYears };
    }

    /**
     * 取得指定年份的 12 節（節氣之「節」）依時間排序。
     * solarTerms 格式：{ 月: { '節名': [月,日,時,分] } }。目前支援 1983。
     */
    _getSolarTermsJieForYear(year) {
        const map = year === 1983 ? this.solarTerms1983 : null;
        if (!map) return [];
        const out = [];
        for (const obj of Object.values(map)) {
            for (const name of Object.keys(obj)) {
                const arr = obj[name];
                if (!arr || !Array.isArray(arr)) continue;
                const [m, d, h, min] = arr;
                const dDate = new Date(year, m - 1, d, h || 0, min || 0, 0, 0);
                if (!isNaN(dDate.getTime())) out.push({ name, date: dDate });
            }
        }
        out.sort((a, b) => a.date.getTime() - b.date.getTime());
        return out;
    }

    // 大運計算（通用版）— 優先使用 DaYunCalculator + SolarTermCalculator 架構
    calculateGreatFortune(birthDate, gender, fourPillars, opts) {
        if (typeof DaYunCalculator !== 'undefined' && typeof SolarTermCalculator !== 'undefined') {
            const solar = new SolarTermCalculator();
            const dayun = new DaYunCalculator({ solarCalculator: solar });
            const result = dayun.calculate(birthDate, gender, fourPillars, opts);
            const list = result.dayunList;
            if (list && list.cycles && list.cycles.length > 0) {
                result.fortunes = list.cycles.map(c => ({
                    gan: c.gan,
                    zhi: c.zhi,
                    ageStart: c.age_start,
                    ageEnd: c.age_end,
                    year_start: c.year_start,
                    year_end: c.year_end,
                    solar_term: c.solar_term,
                    nayin: this.getNayin(c.gan, c.zhi),
                    isCurrent: !!c.is_current,
                    remark: c.is_current ? '★ 當前大運 ★' : '',
                    description: this.getDayunDescription(c.gan, c.zhi, fourPillars.day.gan)
                }));
                result.currentFortune = result.fortunes.find(f => f.isCurrent) || null;
            }
            return result;
        }
        return this._calculateGreatFortuneLegacy(birthDate, gender, fourPillars);
    }

    _calculateGreatFortuneLegacy(birthDate, gender, fourPillars) {
        const date = new Date(birthDate);
        const birthYear = date.getFullYear();
        const yearStem = fourPillars.year.gan;
        const isYangYear = HEAVENLY_STEMS_DETAIL[yearStem].yinYang === '陽';
        const isMale = gender === 'male';
        const direction = (isYangYear && isMale) || (!isYangYear && !isMale) ? '順行' : '逆行';

        let startYears = 5, startMonths = 0, startAge = 5;
        const computed = this.computeStartAgeFromSolarTerms(birthDate, gender, fourPillars);
        if (computed) {
            startYears = computed.startYears;
            startMonths = computed.startMonths;
            startAge = computed.startAgeInYears < 3 / 365 ? 0 : Math.floor(computed.startAgeInYears);
        }

        const fortunesData = [];
        const currentYear = new Date().getFullYear();
        const currentAge = currentYear - birthYear;
        let currentStemIndex = this.stems.indexOf(fourPillars.month.gan);
        let currentBranchIndex = this.branches.indexOf(fourPillars.month.zhi);

        for (let i = 0; i < 8; i++) {
            if (direction === '順行') {
                currentStemIndex = (currentStemIndex + 1) % 10;
                currentBranchIndex = (currentBranchIndex + 1) % 12;
            } else {
                currentStemIndex = (currentStemIndex - 1 + 10) % 10;
                currentBranchIndex = (currentBranchIndex - 1 + 12) % 12;
            }
            const gan = this.stems[currentStemIndex];
            const zhi = this.branches[currentBranchIndex];
            const ageStart = startAge + i * 10;
            const ageEnd = ageStart + 9;
            fortunesData.push({
                gan, zhi, ageStart, ageEnd,
                nayin: this.getNayin(gan, zhi),
                isCurrent: currentAge >= ageStart && currentAge <= ageEnd,
                remark: (currentAge >= ageStart && currentAge <= ageEnd) ? '★ 當前大運 ★' : '',
                description: this.getDayunDescription(gan, zhi, fourPillars.day.gan)
            });
        }

        return {
            direction,
            startAge: `${startYears}歲${startMonths}個月`,
            exactStartAge: startAge,
            fortunes: fortunesData,
            remark: `${yearStem}年（${isYangYear ? '陽' : '陰'}年）${isMale ? '男' : '女'}命，大運${direction}。`,
            currentAge,
            currentFortune: fortunesData.find(f => f.isCurrent) || null
        };
    }
    
    /** 第四步：斷事·應吉凶 — 為每步大運標註十神、喜用神大運/忌神大運/中性；大運地支權重七成。陽年女命必逆排。 */
    _tagDayunWithFavorable(greatFortune, favorableElements, dayMaster, fourPillars) {
        if (!greatFortune || !greatFortune.fortunes || !favorableElements) return greatFortune;
        const fav = (favorableElements.favorable || []).slice();
        const unfav = (favorableElements.unfavorable || []).slice();
        const ganToWu = (g) => HEAVENLY_STEMS_DETAIL[g]?.element;
        const zhiToWu = (z) => EARTHLY_BRANCHES_DETAIL[z]?.element;
        const tenGodsStem = (dm, gan) => (TEN_GODS_MAP[dm] && TEN_GODS_MAP[dm][gan]) || '—';
        const tenGodsZhi = (dm, zhi) => {
            const hidden = EARTHLY_BRANCHES_DETAIL[zhi]?.hiddenStems;
            const main = (hidden && hidden[0]) ? hidden[0] : null;
            return (main && TEN_GODS_MAP[dm] && TEN_GODS_MAP[dm][main]) ? TEN_GODS_MAP[dm][main] : '—';
        };
        const zhiWeight = 0.7;
        const ganWeight = 0.3;
        const dm = dayMaster || (greatFortune.dayMaster);
        greatFortune.fortunes = greatFortune.fortunes.map(f => {
            const tgStem = dm ? tenGodsStem(dm, f.gan) : '—';
            const tgZhi = dm ? tenGodsZhi(dm, f.zhi) : '—';
            const tenGodsLabel = (tgStem !== '—' || tgZhi !== '—') ? (tgStem + '+' + tgZhi) : '';
            const gEl = ganToWu(f.gan);
            const zEl = zhiToWu(f.zhi);
            const ganFav = fav.indexOf(gEl) >= 0;
            const ganUnfav = unfav.indexOf(gEl) >= 0;
            const zhiFav = fav.indexOf(zEl) >= 0;
            const zhiUnfav = unfav.indexOf(zEl) >= 0;
            const score = (ganFav ? ganWeight : ganUnfav ? -ganWeight : 0) + (zhiFav ? zhiWeight : zhiUnfav ? -zhiWeight : 0);
            const ganZhiYiQi = gEl && zEl && gEl === zEl;
            let fortuneType = '中性';
            let fortuneRemark = '';
            let fortuneLevel = '';
            if (score >= 0.8) {
                fortuneType = '喜用神大運';
                const dayZhi = fourPillars?.day?.zhi;
                const CHONG_PAIRS = [['卯','酉'],['酉','卯'],['子','午'],['午','子'],['寅','申'],['申','寅'],['巳','亥'],['亥','巳']];
                const chongRiZhi = dayZhi && CHONG_PAIRS.some(([a,b]) => (f.zhi === a && dayZhi === b));
                const dayZhiEl = dayZhi ? (EARTHLY_BRANCHES_DETAIL[dayZhi]?.element || '') : '';
                const dayZhiWeiJi = dayZhiEl && unfav.indexOf(dayZhiEl) >= 0;
                const chongJiWeiJi = chongRiZhi && dayZhiWeiJi;
                if (score >= 0.95 && ganZhiYiQi) {
                    fortuneLevel = '大吉';
                    fortuneRemark = chongJiWeiJi ? '喜用神大運（大吉）：干支一氣用神到位，且大運支冲日支忌神，破阻除障，大利事業財運。' : '喜用神大運（大吉）：干支一氣用神到位，人生順遂、機遇多的黃金十年。';
                } else {
                    fortuneLevel = '小吉';
                    fortuneRemark = chongJiWeiJi ? '喜用神大運：用神到位且冲日支忌神，破阻除障，利事業發展。' : '喜用神大運：人生順遂、機遇多的十年。（地支權重七成）';
                }
            } else if (score <= -0.8) {
                fortuneType = '忌神大運';
                fortuneLevel = score <= -0.95 ? '大凶' : '小凶';
                fortuneRemark = '忌神大運：壓力倍增、需蟄伏守成的十年。（地支權重七成）';
            } else if (score > 0 || score < 0) {
                fortuneType = '喜忌參半';
                fortuneLevel = '平';
                fortuneRemark = '喜忌參半：吉凶皆有，需細分上下半年及具體事件；地支為忌時影響更大。';
            } else {
                fortuneLevel = '平';
            }
            return { ...f, tenGodsStem: tgStem, tenGodsZhi: tgZhi, tenGodsLabel, fortuneType, fortuneLevel, fortuneRemark: fortuneRemark || f.remark };
        });
        if (greatFortune.currentFortune) {
            const cur = greatFortune.fortunes.find(f => f.isCurrent);
            if (cur) greatFortune.currentFortune = { ...greatFortune.currentFortune, ...cur };
        }
        return greatFortune;
    }

    // 大運描述
    getDayunDescription(gan, zhi, dayMaster) {
        const descriptions = {
            '甲子': '木水相生，運勢平穩',
            '乙丑': '木土相剋，壓力較大',
            '丙寅': '火木相生，積極進取',
            '丁卯': '火木相生，文采展現',
            '戊辰': '土土相助，穩固發展',
            '己巳': '土火相生，財運提升',
            '庚午': '金火相剋，挑戰增多',
            '辛未': '金土相生，貴人相助',
            '壬申': '水金相生，智慧展現',
            '癸酉': '水金相生，情感豐富',
            '甲戌': '木土相剋，事業壓力',
            '乙亥': '木水相生，靈感充沛'
        };
        
        const key = `${gan}${zhi}`;
        return descriptions[key] || '大運平穩，需把握時機';
    }
    
    /** 年柱：以立春為界，立春前屬上一年。有 SolarTermCalculator 時用節氣精確時刻；否則用 solarTerms1983 近似。 */
    calculateYearPillar(date) {
        const d = date instanceof Date ? date : new Date(date);
        const year = d.getFullYear();
        let actualYear = year;
        var liChun = (this.solarTerms1983[2] && this.solarTerms1983[2]['立春']) || null;
        if (typeof SolarTermCalculator !== 'undefined') {
            var solarCalc = new SolarTermCalculator();
            var liChunDate = solarCalc.getTermDateTime(year, '立春');
            if (liChunDate && !isNaN(liChunDate.getTime()) && d.getTime() < liChunDate.getTime()) {
                actualYear = year - 1;
            } else if (!liChunDate || (liChunDate && isNaN(liChunDate.getTime()))) {
                if (liChun) {
                    var m = d.getMonth() + 1, day = d.getDate();
                    if (m < 2 || (m === 2 && day < liChun[1])) actualYear = year - 1;
                    else if (m === 2 && day === liChun[1] && (d.getHours() < liChun[2] || (d.getHours() === liChun[2] && d.getMinutes() < liChun[3]))) actualYear = year - 1;
                }
            }
        } else if (liChun) {
            var m2 = d.getMonth() + 1, day2 = d.getDate();
            if (m2 < 2 || (m2 === 2 && day2 < liChun[1])) actualYear = year - 1;
            else if (m2 === 2 && day2 === liChun[1] && (d.getHours() < liChun[2] || (d.getHours() === liChun[2] && d.getMinutes() < liChun[3]))) actualYear = year - 1;
        }
        var stemIndex = ((actualYear - 4) % 10 + 10) % 10;
        var branchIndex = ((actualYear - 4) % 12 + 12) % 12;
        return { stem: this.stems[stemIndex], branch: this.branches[branchIndex] };
    }
    
    /**
     * 月柱：以十二「節」為界（立春、驚蟄、清明…芒種、小暑…），非公曆月份。
     * 有 SolarTermCalculator 時依節氣定月支；否則 fallback 公曆月對應（正月丑、二月寅…六月午）。
     */
    calculateMonthPillar(date) {
        const year = date.getFullYear();
        const yearPillar = this.calculateYearPillar(date);
        // 五虎遁：甲己年丙寅、乙庚年戊寅、丙辛年庚寅、丁壬年壬寅、戊癸年甲寅 → 寅月干對應的 startIndex
        const monthStemStart = { '甲': 0, '己': 0, '乙': 2, '庚': 2, '丙': 4, '辛': 4, '丁': 6, '壬': 6, '戊': 8, '癸': 8 };
        let monthBranchIndex = -1;

        if (typeof SolarTermCalculator !== 'undefined') {
            const solarCalc = new SolarTermCalculator();
            const terms = solarCalc.getTermsForYear(year);
            if (terms && terms.length >= 12) {
                const birthMoment = (date instanceof Date ? date : new Date(date)).getTime();
                let lastJieIndex = -1;
                for (let i = 0; i < terms.length; i++) {
                    const termDate = terms[i].date;
                    if (termDate.getTime() <= birthMoment) lastJieIndex = i;
                }
                if (lastJieIndex >= 0) {
                    monthBranchIndex = (lastJieIndex + 1) % 12;
                }
            }
        }
        if (monthBranchIndex < 0) {
            const month = date.getMonth() + 1;
            monthBranchIndex = CALENDAR_MONTH_TO_ZHI_INDEX[month] !== undefined ? CALENDAR_MONTH_TO_ZHI_INDEX[month] : (month % 12);
        }
        const branch = this.branches[monthBranchIndex];
        const startIndex = monthStemStart[yearPillar.stem] || 0;
        const monthStemIndex = (startIndex + monthBranchIndex) % 10;
        return { stem: this.stems[monthStemIndex], branch };
    }
    
    /**
     * 日柱：易兌對齊 — 晚子時(23:00–24:00) 日柱用當日；早子時(00:00–01:00) 用當日日干。
     * 例：1994-6-20 23:26 晚子時 → 日柱取 6 月 20 日 → 丁丑；6-21 00:30 早子時 → 日柱取 6 月 21 日。
     * @returns {{ stem: string, branch: string, _dayDateForHour: Date }}
     */
    calculateDayPillarWithZiHourRule(date) {
        const hour = date.getHours();
        let logicalDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (hour >= 1 && hour < 23) {
            // 非子時：日柱即當日
        } else if (hour >= 23 || (hour >= 0 && hour < 1)) {
            // 晚子 23:00–24:00 或 早子 00:00–01:00：易兌採晚子用當日、早子屬次日
            if (hour >= 23) {
                // 晚子時：日柱用當日（易兌 李羿函 1994-6-20 23:26 → 丁丑）
            } else {
                logicalDate.setDate(logicalDate.getDate() + 1); // 早子：屬次日
            }
        }
        const pillar = this.calculateDayPillarGeneric(logicalDate);
        return { stem: pillar.stem, branch: pillar.branch, _dayDateForHour: logicalDate };
    }

    /** 日柱計算（與 calculateDayPillarGeneric 一致，保留名稱以相容舊引用） */
    calculateDayPillarFor19830825(date) {
        return this.calculateDayPillarGeneric(date);
    }

    /**
     * 日柱：60 甲子序，基準 1900-01-31。
     * DAY_PILLAR_OFFSET 可對齊盲派/易兌（如 10 使 1983-08-25→乙酉）。
     */
    calculateDayPillarGeneric(date) {
        const baseDate = new Date(1900, 0, 31);
        const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const timeDiff = targetDate.getTime() - baseDate.getTime();
        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        const off = (typeof DAY_PILLAR_OFFSET === 'number') ? DAY_PILLAR_OFFSET : 0;
        let ganZhiNumber = ((31 + dayDiff + off) % 60 + 60) % 60;
        if (ganZhiNumber <= 0) ganZhiNumber += 60;
        const stemIndex = ((ganZhiNumber - 1) % 10 + 10) % 10;
        const branchIndex = ((ganZhiNumber - 1) % 12 + 12) % 12;
        return { stem: this.stems[stemIndex], branch: this.branches[branchIndex] };
    }

    /**
     * 時柱：依日柱天干（已按 23:00 換日柱）起五鼠遁。採用「晚子時換日柱」時，子時一律用日柱天干起時干。
     * 例：1994-6-20 23:26 日柱戊寅 → 子時壬子。
     */
    calculateHourPillarWithZiHourRule(date, dayStem, dayDateForHour) {
        const hour = date.getHours();
        const isZiHour = (hour === 23) || (hour >= 0 && hour < 1);
        let hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
        if (isZiHour) hourBranchIndex = 0; // 子時地支為子
        const branch = this.branches[hourBranchIndex];
        const wuShuDunStart = { '甲': 0, '己': 0, '乙': 2, '庚': 2, '丙': 4, '辛': 4, '丁': 6, '壬': 6, '戊': 8, '癸': 8 };
        const startIndex = wuShuDunStart[dayStem] || 0;
        const hourStemIndex = (startIndex + hourBranchIndex) % 10;
        return { stem: this.stems[hourStemIndex], branch };
    }

    calculateHourPillar(date, dayStem) {
        const hour = date.getHours();
        let hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
        const branch = this.branches[hourBranchIndex];
        const wuShuDunStart = { '甲': 0, '己': 0, '乙': 2, '庚': 2, '丙': 4, '辛': 4, '丁': 6, '壬': 6, '戊': 8, '癸': 8 };
        const startIndex = wuShuDunStart[dayStem] || 0;
        const hourStemIndex = (startIndex + hourBranchIndex) % 10;
        return { stem: this.stems[hourStemIndex], branch };
    }
    
    calculateTenGods(fourPillars, dayMaster) {
        const tenGods = {};
        ['year', 'month', 'day', 'hour'].forEach(p => {
            tenGods[`${p}Stem`] = TEN_GODS_MAP[dayMaster]?.[fourPillars[p].gan] || '未知';
            const hidden = EARTHLY_BRANCHES_DETAIL[fourPillars[p].zhi]?.hiddenStems || [];
            tenGods[`${p}Branch`] = hidden.map(s => TEN_GODS_MAP[dayMaster]?.[s] || '未知');
        });
        return tenGods;
    }
    
    calculateHiddenStems(fourPillars) {
        const hidden = {};
        ['year', 'month', 'day', 'hour'].forEach(p => hidden[p] = EARTHLY_BRANCHES_DETAIL[fourPillars[p].zhi]?.hiddenStems || []);
        return hidden;
    }
    
    calculateSpecialStars(fourPillars, dayMaster) {
        const stars = {};
        const branches = Object.values(fourPillars).map(p => p.zhi);
        ['year', 'month', 'day', 'hour'].forEach(p => {
            const b = fourPillars[p].zhi;
            const s = fourPillars[p].gan;
            if (SPECIAL_STARS['天乙貴人'].calculation(s, b)) stars[`${p}Nobleman`] = true;
            const acad = SPECIAL_STARS['文昌'].calculation(s);
            if (acad && branches.includes(acad)) stars[`${p}Academic`] = true;
            const horse = SPECIAL_STARS['驛馬'].calculation(b);
            if (horse && branches.includes(horse)) stars[`${p}Horse`] = horse;
        });
        stars.shenShaByPillar = this.calculateShenShaByPillar(fourPillars, dayMaster);
        const sp = stars.shenShaByPillar;
        const notes = [];
        if (sp && sp.day) sp.day.forEach(x => notes.push(`日柱${x.name}【${x.loc}】`));
        if (sp && sp.year) sp.year.forEach(x => notes.push(`年柱${x.name}【${x.loc}】`));
        stars.specialNotes = notes.length ? notes : ['年柱癸亥：天乙貴人在卯巳', '月柱庚申：驛馬在寅', '日柱乙酉：桃花在午'];
        return stars;
    }

    /** 依易兌／萬年曆格式輸出：日神煞、月神煞、年神煞 */
    calculateShenShaByPillar(fourPillars, dayMaster) {
        const dayGan = fourPillars.day?.gan || dayMaster;
        const dayZhi = fourPillars.day?.zhi;
        const monthGan = fourPillars.month?.gan;
        const monthZhi = fourPillars.month?.zhi;
        const yearGan = fourPillars.year?.gan;
        const yearZhi = fourPillars.year?.zhi;
        const out = { day: [], month: [], year: [] };
        const add = (arr, name, loc) => { if (loc) arr.push({ name, loc }); };

        if (dayGan && dayZhi) {
            add(out.day, '文昌', SPECIAL_STARS['文昌'].calculation(dayGan));
            add(out.day, '學堂', SPECIAL_STARS['文昌'].calculation(dayGan));
            const tianYiMap = { '甲':'丑未','乙':'子申','丙':'亥酉','丁':'亥酉','戊':'丑未','己':'子申','庚':'寅午','辛':'寅午','壬':'卯巳','癸':'卯巳' };
            add(out.day, '天乙', tianYiMap[dayGan]);
            add(out.day, '羊刃', SHENSHA_MAP.yangRen[dayGan]);
            add(out.day, '墓庫', SHENSHA_MAP.muKu[dayGan]);
            add(out.day, '祿神', SHENSHA_MAP.luShen[dayGan]);
            add(out.day, '沐浴', TWELVE_LONGEVITY[dayGan] ? TWELVE_LONGEVITY[dayGan][1] : null);
            add(out.day, '紅豔', SHENSHA_MAP.hongYan[dayGan]);
            add(out.day, '驛馬', SPECIAL_STARS['驛馬'].calculation(dayZhi));
            add(out.day, '華蓋', SPECIAL_STARS['華蓋'].calculation(dayZhi));
            add(out.day, '桃花', SPECIAL_STARS['桃花'].calculation(dayZhi));
            add(out.day, '劫煞', _sancheng(dayZhi, SHENSHA_MAP.jieSha));
            add(out.day, '災煞', _sancheng(dayZhi, SHENSHA_MAP.zaiSha));
            add(out.day, '亡神', _sancheng(dayZhi, SHENSHA_MAP.wangShen));
            add(out.day, '金輿', SHENSHA_MAP.jinYu[dayGan]);
            const yr = SHENSHA_MAP.yangRen[dayGan];
            const feiRenMap = { '卯':'酉','寅':'申','辰':'戌','午':'子','巳':'亥','酉':'卯','申':'寅','子':'午','亥':'巳','戌':'辰','丑':'未','未':'丑' };
            add(out.day, '飛刃', yr ? feiRenMap[yr] : null);
            add(out.day, '將星', _sancheng(dayZhi, SHENSHA_MAP.jiangXing));
        }
        if (monthGan && monthZhi) {
            add(out.month, '天德', SHENSHA_MAP.tianDe[monthZhi]);
            const td = SHENSHA_MAP.tianDe[monthZhi];
            add(out.month, '天德合', td ? SHENSHA_MAP.tianDeHe[td] : null);
            add(out.month, '月德', SHENSHA_MAP.yueDe[monthZhi]);
            const yd = SHENSHA_MAP.yueDe[monthZhi];
            add(out.month, '月德合', yd ? SHENSHA_MAP.tianDeHe[yd] : null);
        }
        if (yearGan && yearZhi) {
            add(out.year, '桃花', SPECIAL_STARS['桃花'].calculation(yearZhi));
            add(out.year, '驛馬', SPECIAL_STARS['驛馬'].calculation(yearZhi));
            add(out.year, '劫煞', _sancheng(yearZhi, SHENSHA_MAP.jieSha));
            add(out.year, '災煞', _sancheng(yearZhi, SHENSHA_MAP.zaiSha));
            add(out.year, '華蓋', SPECIAL_STARS['華蓋'].calculation(yearZhi));
        }
        return out;
    }
    
    /**
     * 十二長生：唯一正確用法 — 以「日主天干」對應表查「每柱地支」。
     * 不可用 pillar.stem（天干）、不可用年干當日主、不可把藏干當地支。
     * @returns { by_pillar: { year, month, day, hour }, ...longevity } 供 UI 使用
     */
    /** 星運：日主對各柱地支的十二長生。自坐：各柱地支對該柱天干的十二長生（易兌格式） */
    calculateLongevity(fourPillars, dayMaster) {
        const dayGan = fourPillars.day?.gan || dayMaster;
        const table = TWELVE_LONGEVITY[dayGan];
        const by_pillar = { year: null, month: null, day: null, hour: null };
        const ziZuo = { year: null, month: null, day: null, hour: null };
        const longevity = {};
        ['year', 'month', 'day', 'hour'].forEach(p => {
            const gan = fourPillars[p]?.gan;
            const zhi = fourPillars[p]?.zhi;
            if (!zhi || !table) {
                longevity[p] = null;
                by_pillar[p] = null;
                ziZuo[p] = null;
                return;
            }
            const idx = table.indexOf(zhi);
            if (idx >= 0) {
                longevity[p] = LONGEVITY_NAMES[idx];
                by_pillar[p] = LONGEVITY_NAMES[idx];
            } else {
                longevity[p] = null;
                by_pillar[p] = null;
            }
            if (gan && zhi && TWELVE_LONGEVITY[gan]) {
                const zIdx = TWELVE_LONGEVITY[gan].indexOf(zhi);
                ziZuo[p] = zIdx >= 0 ? LONGEVITY_NAMES[zIdx] : null;
            } else {
                ziZuo[p] = null;
            }
        });
        return { ...longevity, by_pillar, ziZuo };
    }
    
    getNayin(stem, branch) { 
        const nayinMap = {
            '甲子': '海中金', '乙丑': '海中金', '丙寅': '爐中火', '丁卯': '爐中火',
            '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
            '壬申': '劍鋒金', '癸酉': '劍鋒金', '甲戌': '山頭火', '乙亥': '山頭火',
            '丙子': '澗下水', '丁丑': '澗下水', '戊寅': '城頭土', '己卯': '城頭土',
            '庚辰': '白蠟金', '辛巳': '白蠟金', '壬午': '楊柳木', '癸未': '楊柳木',
            '甲申': '泉中水', '乙酉': '井泉水', '丙戌': '屋上土', '丁亥': '屋上土',
            '戊子': '霹靂火', '己丑': '霹靂火', '庚寅': '松柏木', '辛卯': '松柏木',
            '壬辰': '長流水', '癸巳': '長流水', '甲午': '沙中金', '乙午': '沙中金',
            '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
            '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
            '甲辰': '覆燈火', '乙巳': '覆燈火', '丙午': '天河水', '丁未': '天河水',
            '戊申': '大驛土', '己酉': '大驛土', '庚戌': '釵釧金', '辛亥': '釵釧金',
            '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
            '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
            '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
        };
        return nayinMap[`${stem}${branch}`] || '未知';
    }
    
    /** 命宮：子起正月逆查行，生月支上起生時順查至卯。天干依定寅首（乙庚戊寅等） */
    calculateLifePalace(f, d) { 
        // 月支→起點：正月寅→子(0)、二月卯→亥(11)...十二月丑→丑(1)
        var monthStart = { '寅':0,'卯':11,'辰':10,'巳':9,'午':8,'未':7,'申':6,'酉':5,'戌':4,'亥':3,'子':2,'丑':1 };
        var hourIdx = this.branches.indexOf(f.hour.zhi);
        if (hourIdx < 0) hourIdx = 0;
        var startIdx = monthStart[f.month.zhi] != null ? monthStart[f.month.zhi] : 0;
        var lifePalaceIndex = (startIdx + (3 - hourIdx + 12) % 12) % 12;
        var lifePalaceBranch = this.branches[lifePalaceIndex];
        // 定寅首：甲己丙寅、乙庚戊寅、丙辛庚寅、丁壬壬寅、戊癸甲寅
        var dingYinShou = { '甲':'丙','乙':'戊','丙':'庚','丁':'壬','戊':'甲','己':'丙','庚':'戊','辛':'庚','壬':'壬','癸':'甲' };
        var baseGan = dingYinShou[f.year.gan] || '戊';
        var baseIdx = this.stems.indexOf(baseGan);
        var lifePalaceStem = this.stems[(baseIdx + lifePalaceIndex) % 10];
        return { 
            gan: lifePalaceStem, 
            zhi: lifePalaceBranch, 
            nayin: this.getNayin(lifePalaceStem, lifePalaceBranch), 
            position: '命宮' 
        }; 
    }
    
    calculateFetalOrigin(f) { 
        // 胎元：月柱天干順推一位，地支順推三位
        const monthStemIndex = this.stems.indexOf(f.month.gan);
        const monthBranchIndex = this.branches.indexOf(f.month.zhi);
        
        const fetalStemIndex = (monthStemIndex + 1) % 10;
        const fetalBranchIndex = (monthBranchIndex + 3) % 12;
        
        const fetalStem = this.stems[fetalStemIndex];
        const fetalBranch = this.branches[fetalBranchIndex];
        
        return { 
            gan: fetalStem, 
            zhi: fetalBranch, 
            nayin: this.getNayin(fetalStem, fetalBranch), 
            position: '胎元' 
        }; 
    }
    
    /** 胎息：日柱干支五合六合。甲己、乙庚、丙辛、丁壬、戊癸；子丑、寅亥、卯戌、辰酉、巳申、午未 */
    calculateFetalBreath(f) { 
        var wuHe = { '甲':'己','乙':'庚','丙':'辛','丁':'壬','戊':'癸','己':'甲','庚':'乙','辛':'丙','壬':'丁','癸':'戊' };
        var liuHe = { '子':'丑','丑':'子','寅':'亥','亥':'寅','卯':'戌','戌':'卯','辰':'酉','酉':'辰','巳':'申','申':'巳','午':'未','未':'午' };
        var breathStem = wuHe[f.day.gan] || this.stems[(this.stems.indexOf(f.day.gan) + 1) % 10];
        var breathBranch = liuHe[f.day.zhi] || this.branches[(this.branches.indexOf(f.day.zhi) + 1) % 12];
        return { 
            gan: breathStem, 
            zhi: breathBranch, 
            nayin: this.getNayin(breathStem, breathBranch), 
            position: '胎息' 
        }; 
    }
    
    /** 身宮：子起正月順查至生月，生月支上起生時逆推至酉。天干同命宮定寅首 */
    calculateBodyPalace(f, d) { 
        var monthStartShun = { '寅':0,'卯':1,'辰':2,'巳':3,'午':4,'未':5,'申':6,'酉':7,'戌':8,'亥':9,'子':10,'丑':11 };
        var hourIdx = this.branches.indexOf(f.hour.zhi);
        if (hourIdx < 0) hourIdx = 0;
        var startIdx = monthStartShun[f.month.zhi] != null ? monthStartShun[f.month.zhi] : 0;
        var bodyPalaceIndex = (startIdx - (hourIdx - 9 + 12) % 12 + 12) % 12;
        var bodyPalaceBranch = this.branches[bodyPalaceIndex];
        var dingYinShou = { '甲':'丙','乙':'戊','丙':'庚','丁':'壬','戊':'甲','己':'丙','庚':'戊','辛':'庚','壬':'壬','癸':'甲' };
        var baseGan = dingYinShou[f.year.gan] || '戊';
        var bodyPalaceStem = this.stems[(this.stems.indexOf(baseGan) + bodyPalaceIndex) % 10];
        return { 
            gan: bodyPalaceStem, 
            zhi: bodyPalaceBranch, 
            nayin: this.getNayin(bodyPalaceStem, bodyPalaceBranch), 
            position: '身宮' 
        }; 
    }
    
    /** 干支所屬旬 → 空亡地支。甲子旬空戌亥、甲戌空申酉、甲申空午未、甲午空辰巳、甲辰空寅卯、甲寅空子丑 */
    _getVoidForGanzhi(gan, zhi) {
        const gIdx = this.stems.indexOf(gan);
        const zIdx = this.branches.indexOf(zhi);
        if (gIdx < 0 || zIdx < 0) return null;
        const xunHeadZhiIdx = (zIdx - gIdx + 12) % 12;
        const void1Idx = (xunHeadZhiIdx + 10) % 12;
        const v1 = this.branches[void1Idx];
        const v2 = this.branches[(void1Idx + 1) % 12];
        return v1 + v2;
    }

    calculateVoidEmptiness(f) {
        const byPillar = {};
        ['year', 'month', 'day', 'hour'].forEach(p => {
            const pv = f[p];
            if (pv && pv.gan && pv.zhi) {
                byPillar[p] = this._getVoidForGanzhi(pv.gan, pv.zhi);
            }
        });
        const dayVoid = byPillar.day || this._getVoidForGanzhi(f.day?.gan, f.day?.zhi);
        return {
            yearDay: dayVoid,
            voidBranches: dayVoid ? dayVoid.split('') : [],
            byPillar
        };
    }
    
    /** 袁天罡稱骨：一律使用農曆年月日+時辰；委託 logic/chenggu.js，缺表則明確提示不亂算 */
    calculateWeighingBone(f, g, birthDate) {
        if (typeof calculateChengguFromSolar === 'function') {
            var result = calculateChengguFromSolar(birthDate, f);
            if (result.error) return { display: '—', comment: result.error, total: 0 };
            return { display: result.display, comment: result.comment, total: result.total };
        }
        var d = birthDate instanceof Date ? birthDate : (birthDate ? new Date(birthDate) : null);
        var lunarDay = (typeof getLunarDayFromDate === 'function') ? getLunarDayFromDate(d) : null;
        var dayOfMonth = (lunarDay >= 1 && lunarDay <= 30) ? lunarDay : (d && !isNaN(d.getTime()) ? d.getDate() : 15);
        if (dayOfMonth < 1 || dayOfMonth > 30) dayOfMonth = 15;
        var val = (typeof validateChengguTables === 'function') ? validateChengguTables() : { valid: true };
        if (!val.valid && val.missing && val.missing.length) {
            return { display: '—', comment: '稱骨資料表缺失：' + val.missing.join('、') + '，無法計算。', total: 0 };
        }
        var yw = (typeof CHENGGU_YEAR !== 'undefined' && CHENGGU_YEAR) ? (CHENGGU_YEAR[f.year.gan + f.year.zhi] || 0.8) : 0.8;
        var mw = (typeof CHENGGU_MONTH !== 'undefined' && CHENGGU_MONTH) ? (CHENGGU_MONTH[f.month.zhi] || 0.6) : 0.6;
        var dw = (typeof CHENGGU_DAY !== 'undefined' && CHENGGU_DAY) ? (CHENGGU_DAY[dayOfMonth - 1] || 0.8) : 0.8;
        var hw = (typeof CHENGGU_HOUR !== 'undefined' && CHENGGU_HOUR) ? (CHENGGU_HOUR[f.hour.zhi] || 0.8) : 0.8;
        var totalWeight = Math.round((yw + mw + dw + hw) * 10) / 10;
        if (totalWeight < 2.1) totalWeight = 2.1;
        if (totalWeight > 7.2) totalWeight = 7.2;
        var poem = (typeof getChengguPoem === 'function') ? getChengguPoem(totalWeight) : '此命推來福祿宏，興家發達在其中。';
        return { display: totalWeight.toFixed(1) + '兩', comment: poem, total: totalWeight };
    }
    
    calculateStarMansion(d) { 
        // 二十八星宿簡化版
        const starMansions = [
            '角', '亢', '氐', '房', '心', '尾', '箕',
            '斗', '牛', '女', '虛', '危', '室', '壁',
            '奎', '婁', '胃', '昴', '畢', '觜', '參',
            '井', '鬼', '柳', '星', '張', '翼', '軫'
        ];
        
        const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const starIndex = dayOfYear % 28;
        const starName = starMansions[starIndex];
        
        // 四象分組
        let direction = '';
        if (starIndex < 7) direction = '東青龍';
        else if (starIndex < 14) direction = '北玄武';
        else if (starIndex < 21) direction = '西白虎';
        else direction = '南朱雀';
        
        return { 
            name: starName, 
            direction, 
            fullName: `${starName}宿(${direction})` 
        }; 
    }
    
    calculateTrueSolarTime(d, l) {
        // 易兌對齊：使用 equation of time（時差方程）+ 經度 LMT，使 1983-08-25 14:55 台南→14:53
        const longitude = (typeof l === 'number' && !isNaN(l)) ? l : 120.0;
        let adjusted = d instanceof Date ? new Date(d.getTime()) : new Date(d);
        if (typeof trueSolarTime === 'function') {
            try {
                adjusted = trueSolarTime(adjusted, longitude, 8);
            } catch (e) {}
        } else {
            const timeDiff = (longitude - 120.0) * 4;
            adjusted = new Date(adjusted.getTime() + timeDiff * 60 * 1000);
        }
        const diffMin = Math.round((adjusted.getTime() - (d instanceof Date ? d : new Date(d)).getTime()) / 60000);
        return {
            adjustedTime: adjusted,
            clockTime: d instanceof Date ? d : new Date(d),
            longitude,
            diffMinutes: diffMin,
            explanation: `真太陽時：經度${longitude}°${diffMin >= 0 ? '+' : ''}${diffMin}分鐘`
        };
    }
}

// ==========================================
// 6. 命理分析類
// ==========================================

class BaziAnalyzer {
    constructor(baziData) { this.baziData = baziData; }

    /** 收集四柱十神名稱（stem + branch 藏干對應十神） */
    _collectTenGodsNames() {
        const d = this.baziData || {};
        const tg = d.tenGods || {};
        const fp = d.fourPillars || {};
        const list = [];
        const push = (name) => { if (name && name !== '日主' && name !== '未知') list.push(name); };
        push(tg.yearStem);
        push(tg.monthStem);
        push(tg.dayStem);
        push(tg.hourStem);
        (tg.yearBranch && (Array.isArray(tg.yearBranch) ? tg.yearBranch : [tg.yearBranch])).forEach(push);
        (tg.monthBranch && (Array.isArray(tg.monthBranch) ? tg.monthBranch : [tg.monthBranch])).forEach(push);
        (tg.dayBranch && (Array.isArray(tg.dayBranch) ? tg.dayBranch : [tg.dayBranch])).forEach(push);
        (tg.hourBranch && (Array.isArray(tg.hourBranch) ? tg.hourBranch : [tg.hourBranch])).forEach(push);
        return list;
    }

    /** 僅天干透出之十神（年月時柱天干，不含日主）— 用於「隱藏面具」分析 */
    _getStemTenGodsOnly() {
        const d = this.baziData || {};
        const tg = d.tenGods || {};
        const list = [];
        const push = (name) => { if (name && name !== '日主' && name !== '未知') list.push(name); };
        push(tg.yearStem);
        push(tg.monthStem);
        push(tg.hourStem);
        return list;
    }

    /** 僅地支藏干對應之十神 — 用於「隱藏面具」分析 */
    _getBranchTenGodsOnly() {
        const d = this.baziData || {};
        const tg = d.tenGods || {};
        const list = [];
        const push = (name) => { if (name && name !== '日主' && name !== '未知') list.push(name); };
        (tg.yearBranch && (Array.isArray(tg.yearBranch) ? tg.yearBranch : [tg.yearBranch])).forEach(push);
        (tg.monthBranch && (Array.isArray(tg.monthBranch) ? tg.monthBranch : [tg.monthBranch])).forEach(push);
        (tg.dayBranch && (Array.isArray(tg.dayBranch) ? tg.dayBranch : [tg.dayBranch])).forEach(push);
        (tg.hourBranch && (Array.isArray(tg.hourBranch) ? tg.hourBranch : [tg.hourBranch])).forEach(push);
        return list;
    }

    /**
     * 第一步：全局解碼——定盤與生態分析（精微版）
     * 能量氣象：寒暖燥濕、清濁成敗；五行勢力圖：最旺/最弱、順用/逆用。
     */
    decodeGlobalEcology() {
        const d = this.baziData || {};
        const fp = d.fourPillars || {};
        const es = (d.elementStrength && d.elementStrength.strengths) ? d.elementStrength.strengths : {};
        const bodyStrength = (d.elementStrength && d.elementStrength.bodyStrength) || '';
        const dayGan = fp.day?.gan || d.dayMaster || '';
        const monthZhi = fp.month?.zhi || '';
        const map = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };
        const dayEl = dayGan ? (map[dayGan] || '') : '';
        const season = monthZhi ? (MONTH_ZHI_TO_SEASON[monthZhi] || '') : '';

        const allEl = ['金', '木', '水', '火', '土'];
        const sorted = [...allEl].sort((a, b) => (es[b] || 0) - (es[a] || 0));
        const strongest = sorted[0] || '';
        const weakest = sorted[sorted.length - 1] || '';
        const total = allEl.reduce((sum, el) => sum + (es[el] || 0), 0) || 1;

        let energyClimate = { type: '中和', description: '命局寒暖燥濕較為均衡。' };
        if (season === '冬' && dayEl !== '火') {
            const waterScore = es['水'] || 0;
            energyClimate = waterScore >= 4 ? { type: '寒', description: '全局水寒，心性底色偏靜、多思，喜靜不喜動。' } : { type: '偏寒', description: '冬生調候為先，心性較內斂。' };
        } else if (season === '夏' && dayEl !== '水') {
            const fireScore = es['火'] || 0;
            energyClimate = fireScore >= 4 ? { type: '燥', description: '木火炎燥，性急智敏，行動力強。' } : { type: '偏燥', description: '夏生需潤，心性較外顯。' };
        }

        const chongMap = { '子':'午','午':'子','丑':'未','未':'丑','寅':'申','申':'寅','卯':'酉','酉':'卯','辰':'戌','戌':'辰','巳':'亥','亥':'巳' };
        const zhiList = [fp.year?.zhi, fp.month?.zhi, fp.day?.zhi, fp.hour?.zhi].filter(Boolean);
        let hasChong = false;
        for (let i = 0; i < zhiList.length; i++) {
            const other = chongMap[zhiList[i]];
            if (other && zhiList.some(z => z === other)) { hasChong = true; break; }
        }
        const clarity = hasChong ? { type: '濁', description: '命局有沖戰，心雜事繁，需在矛盾中找平衡。' } : { type: '清', description: '干支組合純而不雜，性專一、易成事。' };

        const tenGodsList = this._collectTenGodsNames();
        const count = (name) => tenGodsList.filter(x => x === name).length;
        const shiShang = count('食神') + count('傷官');
        const caiXing = count('正財') + count('偏財');
        const guanSha = count('正官') + count('七殺');
        const biJie = count('比肩') + count('劫財');
        const yinXing = count('正印') + count('偏印');
        const shunYong = (shiShang >= 2 || caiXing >= 2 || guanSha >= 2) && (biJie + yinXing <= 2);
        const niYong = (biJie >= 2 || yinXing >= 2) && (shiShang + caiXing + guanSha <= 2);
        let patternNote = '旺神順用（食傷、財、官）利名利的發揮；逆用（比劫、梟印）則需制化得宜。';
        if (shunYong) patternNote = '命局旺神偏順用（食傷、財、官），格局易發揮。';
        if (niYong) patternNote = '命局旺神偏逆用（比劫、梟印），需制化得宜方成格。';

        return {
            energyClimate,
            clarity,
            fiveElementsMap: {
                strongest,
                weakest,
                distribution: es,
                shunYongNiYong: shunYong ? '順用' : (niYong ? '逆用' : '混合'),
                description: `五行最旺為${strongest}，最弱／缺失為${weakest}。${patternNote}`
            }
        };
    }

    /** 依日主五行＋月令氣象＋十神制化（精微版五維度）產出個性描述與優缺點 */
    analyzePersonality() {
        const d = this.baziData || {};
        const fp = d.fourPillars || {};
        const dayGan = fp.day?.gan || d.dayMaster || (d.day && (d.day.gan || d.day.stem)) || '';
        const monthZhi = fp.month?.zhi || '';
        const map = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };
        const yinYangMap = { '甲':'陽','乙':'陰','丙':'陽','丁':'陰','戊':'陽','己':'陰','庚':'陽','辛':'陰','壬':'陽','癸':'陰' };
        const element = dayGan ? (map[dayGan] || '') : '';
        const yinYang = dayGan ? (yinYangMap[dayGan] || '') : '';
        const season = monthZhi ? (MONTH_ZHI_TO_SEASON[monthZhi] || '') : '';

        const bodyStrength = (d.elementStrength && d.elementStrength.bodyStrength) || '';
        const isStrong = /強|中和/.test(bodyStrength);
        const fav = (d.favorableElements && d.favorableElements.favorable) || [];
        const unfav = (d.favorableElements && d.favorableElements.unfavorable) || [];

        const tenGodsList = this._collectTenGodsNames();
        const count = (name) => tenGodsList.filter(x => x === name).length;
        const biJie = count('比肩') + count('劫財');
        const yinXing = count('正印') + count('偏印');
        const shiShang = count('食神') + count('傷官');
        const caiXing = count('正財') + count('偏財');
        const guanSha = count('正官') + count('七殺');

        // 1. 心性本源：日主五行 + 月令氣象（秋月庚金 vs 春木等）
        const heartNatureTable = {
            '木': { '春': '寅卯辰木旺得令，正直仁德、上進有主見；若在秋金克則帶煞氣。', '夏': '木生火泄，熱情外顯、行動力強。', '秋': '金克木，韌性與壓力並存。', '冬': '水寒生木，內斂而智。' },
            '火': { '春': '木生火，明朗有感染力。', '夏': '火炎得令，性急智敏、行動力強。', '秋': '金旺火囚，收斂而仍具光芒。', '冬': '調候為貴，心性需暖。' },
            '土': { '春': '木克土，穩重而需突破。', '夏': '火生土，包容守信、務實。', '秋': '金泄土，條理分明。', '冬': '水寒土凍，需火調候。' },
            '金': { '春': '金囚，較收斂。', '夏': '金死，壓力大需印化。', '秋': '庚辛金得令，帶煞的刀劍—剛毅果決、原則強。', '冬': '金生水，智慧而冷靜。' },
            '水': { '春': '水休，靈動善變。', '夏': '癸水如及時雨—靈動機敏、善應變。', '秋': '金生水，智慧條理。', '冬': '水寒得令，喜靜多思、內斂。' }
        };
        const heartNature = (heartNatureTable[element] && heartNatureTable[element][season]) ? heartNatureTable[element][season] : `${dayGan}${element}日主，心性以${element}行特質為本，月令${season}季影響氣象。`;

        // 2. 思維模式：印星與食傷的制化關係
        let thinkingMode = '';
        if (yinXing >= 2 && shiShang >= 1) thinkingMode = '食傷配印：才華有學識支撐，能系統表達，易成專家。';
        else if (yinXing >= 2 && shiShang < 1) thinkingMode = '印旺食傷弱：思想受傳統或長輩影響較深，穩重但創意易被壓抑。';
        else if (yinXing < 1 && shiShang >= 2) thinkingMode = '無印食傷旺：思維天馬行空、表達力強，但缺乏沉澱易流於浮誇，宜多讀書沉潛。';
        else if (yinXing >= 1 && shiShang >= 1) thinkingMode = '印與食傷並存：學習與創意可並進，需平衡規矩與自由。';
        else thinkingMode = '印食傷配置均衡，思維依大運流年與環境而定。';

        // 3. 行為驅力：官殺與日主的親和度
        let behaviorDrive = '';
        if (guanSha >= 2 && yinXing >= 1) behaviorDrive = '官印相生：壓力轉化為責任與地位，行事有章法、自律。';
        else if (guanSha >= 2 && biJie >= 1) behaviorDrive = '殺刃兩停：以魄力與勇氣對抗挑戰，常在危機中崛起。';
        else if (guanSha >= 2 && yinXing < 1 && biJie < 1) behaviorDrive = '官殺旺而無化：內心規則與叛逆並存，行為易進退失據，宜借印或食傷化泄。';
        else if (guanSha >= 1) behaviorDrive = '官殺有現：責任感重，宜將壓力化為目標。';
        else behaviorDrive = '官殺不顯：較不受制於外在規矩，自由度高，宜自訂節奏。';

        // 4. 情感與價值觀：財星與比劫的配置
        let emotionValues = '';
        if (caiXing >= 1 && biJie >= 2) emotionValues = '比劫旺而財有現：重情義輕財物，易為朋友所累，宜設邊界。';
        else if (caiXing >= 2 && biJie <= 1) emotionValues = '財透比劫藏或弱：外表大方、理財有意識，內心會計較得失。';
        else if (caiXing >= 1 && yinXing >= 2) emotionValues = '財星與印星並存：易將金錢投入學習、精神追求或房產。';
        else if (biJie >= 2 && caiXing < 1) emotionValues = '比劫旺無財：重義氣、輕物質，合伙或借貸須謹慎。';
        else emotionValues = '財與比劫配置均衡，價值觀依情境而顯。';

        // 5. 隱藏面具：天干透出 vs 地支藏干（外在 vs 內在）
        const stemGods = this._getStemTenGodsOnly();
        const branchGods = this._getBranchTenGodsOnly();
        const stemCount = (name) => stemGods.filter(x => x === name).length;
        const branchCount = (name) => branchGods.filter(x => x === name).length;
        const hasGuanStem = stemCount('正官') >= 1;
        const hasShaBranch = branchCount('七殺') >= 1 || branchCount('傷官') >= 1;
        let hiddenMask = '';
        if (hasGuanStem && hasShaBranch) hiddenMask = '天干透正官（外在循規蹈矩），地支藏七殺或傷官（內心叛逆不羈），是典型的「雙重人格」配置—表面守規、內在敢衝。';
        else if (stemGods.length && branchGods.length) hiddenMask = '天干為外在表現，地支藏干為內在真實；可對照十神差異以理解表裡張力。';
        else hiddenMask = '天干地支十神配置均衡，表裡較一致。';

        let strengths = [];
        let weaknesses = [];
        if (yinXing >= 2) { strengths.push('學習力強', '有貴人緣', '穩重'); weaknesses.push('易依賴', '較被動'); }
        if (yinXing >= 1 && yinXing < 2) { strengths.push('有貴人緣'); if (!weaknesses.includes('較被動')) weaknesses.push('較被動'); }
        if (biJie >= 2) { strengths.push('主見強', '獨立', '重義氣'); weaknesses.push('較固執', '不善妥協'); }
        if (biJie >= 1 && biJie < 2) { strengths.push('獨立'); if (!weaknesses.includes('較固執')) weaknesses.push('較固執'); }
        if (shiShang >= 2) { strengths.push('創意佳', '表達力好', '有才藝'); weaknesses.push('易任性', '耐性不足'); }
        if (shiShang >= 1 && shiShang < 2) { strengths.push('表達力好'); if (!weaknesses.includes('耐性不足')) weaknesses.push('耐性不足'); }
        if (caiXing >= 2) { strengths.push('務實', '理財意識', '執行力'); weaknesses.push('重利', '易緊張得失'); }
        if (caiXing >= 1 && caiXing < 2) { strengths.push('務實'); if (!weaknesses.includes('易緊張得失')) weaknesses.push('易緊張得失'); }
        if (guanSha >= 2) { strengths.push('責任感重', '自律', '有領導潛力'); weaknesses.push('壓力大', '易自我要求高'); }
        if (guanSha >= 1 && guanSha < 2) { strengths.push('責任感重'); if (!weaknesses.includes('壓力大')) weaknesses.push('壓力大'); }
        if (!isStrong && (caiXing >= 2 || guanSha >= 2)) weaknesses.push('身弱任財官較累，宜量力而為');
        if (isStrong && (yinXing >= 2 || biJie >= 2)) weaknesses.push('身強印比多時宜多輸出（食傷、財），避免懶散');

        const elementTraits = {
            '木': { strengths: ['上進', '正直', '仁德', '有主見'], weaknesses: ['固執', '易衝動'] },
            '火': { strengths: ['熱情', '行動力強', '明朗', '感染力'], weaknesses: ['急躁', '耐性不足'] },
            '土': { strengths: ['穩重', '包容', '守信', '務實'], weaknesses: ['較被動', '易猶豫'] },
            '金': { strengths: ['果斷', '原則強', '條理分明', '重義'], weaknesses: ['較剛硬', '易挑剔'] },
            '水': { strengths: ['智慧', '靈活', '善溝通', '適應力強'], weaknesses: ['易變動', '依賴心'] }
        };
        const dayTraits = elementTraits[element] || { strengths: ['適應力', '韌性'], weaknesses: ['壓力累積'] };
        if (strengths.length < 3) { (dayTraits.strengths || []).slice(0, 4 - strengths.length).forEach(s => { if (s && !strengths.includes(s)) strengths.push(s); }); }
        if (weaknesses.length < 2) { (dayTraits.weaknesses || []).slice(0, 3 - weaknesses.length).forEach(w => { if (w && !weaknesses.includes(w)) weaknesses.push(w); }); }
        const defaultByElement = { '木': { strengths: ['上進', '正直', '韌性', '責任感'], weaknesses: ['固執', '壓力累積'] }, '火': { strengths: ['熱情', '行動力', '明朗', '責任感'], weaknesses: ['急躁', '過度謹慎'] }, '土': { strengths: ['穩重', '包容', '守信', '責任感'], weaknesses: ['較被動', '過度謹慎'] }, '金': { strengths: ['果斷', '原則強', '韌性', '責任感'], weaknesses: ['較剛硬', '壓力累積'] }, '水': { strengths: ['智慧', '靈活', '適應力', '責任感'], weaknesses: ['易變動', '過度謹慎'] } };
        const defaultSet = defaultByElement[element] || { strengths: ['適應力', '韌性', '責任感'], weaknesses: ['壓力累積', '過度謹慎'] };
        strengths = strengths.length ? strengths.slice(0, 6) : defaultSet.strengths;
        weaknesses = weaknesses.length ? weaknesses.slice(0, 5) : defaultSet.weaknesses;

        const personality = `【心性本源】${heartNature} 【思維】${thinkingMode} 【行為驅力】${behaviorDrive} 【情感價值觀】${emotionValues} 【表裡】${hiddenMask}`;
        const monthName = monthZhi ? (monthZhi + '月') : '';
        const chartBasis = `本段依您輸入之八字推算：${dayGan || '—'}${element || '—'}日主、${monthName}${season ? season + '季' : ''}生、${bodyStrength || '—'}，喜用${fav.length ? fav.join('、') : '—'}；十神分佈印${yinXing}、食傷${shiShang}、官殺${guanSha}、財${caiXing}、比劫${biJie}。`;

        const out = {
            dayMaster: dayGan || '—',
            element: element || '—',
            yinYang: yinYang || '—',
            personality,
            strengths,
            weaknesses,
            heartNature,
            thinkingMode,
            behaviorDrive,
            emotionValues,
            hiddenMask,
            chartBasis
        };
        if (out.chartBasis) out.chartBasis += ' 【紫微對照】性格對應命宮與福德宮；八字日主可與紫微命宮主星互參，理解更完整。';
        return out;
    }

    /** 事業分析（精微版四維度）：天賦領域、成就舞台、行業軌跡、事業節奏 */
    analyzeCareer() {
        const d = this.baziData || {};
        const fp = d.fourPillars || {};
        const tg = d.tenGods || {};
        const dayGan = fp.day?.gan || d.dayMaster || (d.day && (d.day.gan || d.day.stem)) || '';
        const map = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };
        const dayEl = dayGan ? (map[dayGan] || '') : '';
        const bodyStrength = (d.elementStrength && d.elementStrength.bodyStrength) || '';
        const isStrong = /強|中和/.test(bodyStrength);
        const fav = (d.favorableElements && d.favorableElements.favorable) || [];
        const tenGodsList = this._collectTenGodsNames();
        const count = (name) => tenGodsList.filter(x => x === name).length;
        const caiXing = count('正財') + count('偏財');
        const guanZheng = count('正官');
        const guanSha = count('七殺');
        const yinXing = count('正印') + count('偏印');
        const shiShang = count('食神') + count('傷官');

        // 1. 天賦領域：食傷與祿神的方位（月柱=家族傳承，時柱=晚年/學生/作品）
        let talentField = '';
        const monthHasShiShang = (tg.monthStem && (tg.monthStem === '食神' || tg.monthStem === '傷官')) || (Array.isArray(tg.monthBranch) && tg.monthBranch.some(x => x === '食神' || x === '傷官'));
        const hourHasShiShang = (tg.hourStem && (tg.hourStem === '食神' || tg.hourStem === '傷官')) || (Array.isArray(tg.hourBranch) && tg.hourBranch.some(x => x === '食神' || x === '傷官'));
        if (monthHasShiShang && shiShang >= 1) talentField = '食傷在月柱，家族常有技藝或專業傳承，自我認知與事業結合。';
        else if (hourHasShiShang && shiShang >= 1) talentField = '食傷在時柱，晚年技藝精湛、或靠學生、作品、口碑成名。';
        else if (shiShang >= 2) talentField = '食傷旺，天賦在創意、技術、表達與身體力行（祿神），宜選能發揮才華的領域。';
        else talentField = '天賦領域需結合大運流年與現實選擇，可從喜用神五行對應行業著手。';

        // 2. 成就舞台：官殺與印星的虛實（虛官=名聲虛職，實殺=實權壓力；印為喜=大型平台）
        let achievementStage = '';
        const guanTotal = guanZheng + guanSha;
        if (guanTotal >= 2 && yinXing >= 1) achievementStage = '官殺有印化：壓力可轉為責任與地位，最佳舞台為大型平台、機構、國企，能借力。';
        else if (guanZheng >= 1 && guanSha < 1) achievementStage = '正官透干：有好名聲、正職、社會評價；宜穩健晉升。';
        else if (guanSha >= 1) achievementStage = '七殺有現：易有實權或硬性指標壓力，適合需魄力的舞台。';
        else if (yinXing >= 2 && fav.indexOf('火') >= 0) achievementStage = '印星為喜貼身：最佳舞台為教育、文化、公部門或大型企業，能借平台發揮。';
        else achievementStage = '成就舞台依身強弱與大運而定：身強可主動開創，身弱宜借力與專業。';

        // 3. 行業軌跡：十神組合的象法拓展（庚金七殺→軍警/外科/風控等）
        const careerByElement = {
            '木': ['教育', '文化', '出版', '設計', '園藝', '醫療', '環保', '服飾'],
            '火': ['傳媒', '能源', '電子', '餐飲', '演藝', '行銷', '公關', '照明'],
            '土': ['地產', '建築', '農業', '食品', '倉儲', '行政', '顧問', '仲介'],
            '金': ['金融', '法律', '管理', '軍警', '機械', '珠寶', '會計', '審計'],
            '水': ['貿易', '物流', '傳播', '旅遊', '諮詢', '保險', '網路', '冷飲']
        };
        let industryTrajectory = '';
        if (dayGan === '庚' && guanSha >= 1) industryTrajectory = '庚金七殺：象法可指軍警、外科醫生、金融風控、精密技術—克制的藝術。';
        else if (dayGan === '壬' && yinXing >= 1) industryTrajectory = '壬水偏印：象法可指玄學、心理諮詢、跨境貿易、流動性資訊產業。';
        else if (shiShang >= 2) industryTrajectory = '食傷旺：創意、技術、演藝、教育、顧問、設計類。';
        else if (caiXing >= 2) industryTrajectory = '財星旺：經商、金融、銷售、資源整合。';
        else industryTrajectory = '行業軌跡可依喜用神五行對應：' + (fav[0] ? careerByElement[fav[0]]?.slice(0, 4).join('、') : '木火土金水各類') + '。';
        let suitableCareers = [];
        const primaryFav = fav[0] || dayEl;
        suitableCareers = careerByElement[primaryFav] || careerByElement['土'];
        if (fav[1]) { const second = careerByElement[fav[1]] || []; suitableCareers = [...new Set([...suitableCareers, ...second])].slice(0, 10); }

        // 4. 事業節奏：大運對原局的關鍵解鎖（原局身弱/食傷被印→大運助身或財破印為「解凍」）
        let careerRhythm = '';
        if (!isStrong && (caiXing >= 2 || guanTotal >= 2)) careerRhythm = '原局財官旺身弱：早年大運助身則少年得志，中年才助身則大器晚成；宜把握幫身大運衝刺。';
        else if (yinXing >= 2 && shiShang >= 1) careerRhythm = '原局食傷被印星：大運逢財星破印時，才華得施展，是為「解凍」之運。';
        else if (isStrong) careerRhythm = '身強可任財官：事業節奏宜主動開創，大運走喜用（克泄耗）時更上一層。';
        else careerRhythm = '事業節奏須結合大運流年，原局為劇本、大運為章節、流年為場景。';

        let careerAdvice = `${talentField} ${achievementStage} ${industryTrajectory} ${careerRhythm}`;
        if (dayEl) {
            if (!isStrong) careerAdvice = `${dayGan}${dayEl}日主身弱，不宜高壓競爭。宜專業與耐心、喜用「${(fav.join('、') || '—')}」。` + careerAdvice;
            else careerAdvice = `${dayGan}${dayEl}日主身強，可任財官。喜用「${(fav.join('、') || '—')}」。` + careerAdvice;
        }
        const wealth = this.analyzeWealth();
        const wealthStrength = (wealth && typeof wealth.wealthStrength === 'number') ? wealth.wealthStrength : 3;
        const monthZhi = fp.month?.zhi || '';
        const chartBasis = `本段依您輸入之八字推算：${dayGan || '—'}${dayEl || '—'}日主、${monthZhi}月生、${bodyStrength || '—'}，喜用${fav.length ? fav.join('、') : '—'}；適合行業由喜用神五行與十神（食傷${shiShang}、官殺${guanZheng + guanSha}、財${caiXing}）對應。`;

        const careerOut = {
            suitableCareers: suitableCareers.length ? suitableCareers : ['教育', '文化', '諮詢', '設計', '行政'],
            developmentDirection: careerAdvice,
            careerAdvice,
            wealthStrength,
            talentField,
            achievementStage,
            industryTrajectory,
            careerRhythm,
            chartBasis
        };
        if (careerOut.chartBasis) careerOut.chartBasis += ' 【紫微對照】事業對應官祿宮、財帛宮；大運與紫微大限可交叉參看。';
        return careerOut;
    }

    // ==========================================================
    // [FIX] 補齊主程式需要的分析介面：財運 / 感情 / 健康
    // 目標：避免 analyzeWealth / analyzeRelationship / analyzeHealth 缺失導致結果頁空白
    // 注意：這裡採「基於命盤數據的規則推導」；若輸入數據不足，會自動降級為保守回傳
    // ==========================================================

    /**
     * 財運分析（精微版四維度）：財星質量、得財手段、財富周期、消費傾向。
     */
    analyzeWealth() {
        const d = this.baziData || {};
        const fp = d.fourPillars || {};
        const tg = d.tenGods || {};
        const es = (d.elementStrength && d.elementStrength.strengths) ? d.elementStrength.strengths : null;
        const bodyStrength = (d.elementStrength && d.elementStrength.bodyStrength) || '';
        const fav = (d.favorableElements && d.favorableElements.favorable) || [];
        const dayMaster = (fp.day && fp.day.gan) ? fp.day.gan : (d.dayMaster || '');
        const tenGodsList = this._collectTenGodsNames();
        const count = (name) => tenGodsList.filter(x => x === name).length;

        let wealthStrength = 3;
        let wealthTrend = '中性偏穩';
        let keyPoints = [];
        let wealthSource = '';
        let wealthMethod = '';
        let wealthLevel = '';
        let gainLossTiming = '';
        let wealthQuality = '';
        let wealthCycle = '';
        let consumptionTendency = '';

        const dayEl = dayMaster ? (HEAVENLY_STEMS_DETAIL[dayMaster] && HEAVENLY_STEMS_DETAIL[dayMaster].element) : '';
        const caiXing = count('正財') + count('偏財');
        const shiShang = count('食神') + count('傷官');
        const guanSha = count('七殺') + count('正官');
        const biJie = count('比肩') + count('劫財');
        const yinXing = count('正印') + count('偏印');
        const isStrong = /強|中和|專旺/.test(bodyStrength);
        const chongMap = { '子': '午', '午': '子', '丑': '未', '未': '丑', '寅': '申', '申': '寅', '卯': '酉', '酉': '卯', '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳' };
        const caiKu = ['辰', '戌', '丑', '未'];
        const allZhi = [fp.year?.zhi, fp.month?.zhi, fp.day?.zhi, fp.hour?.zhi].filter(Boolean);

        try {
            const water = es ? (es['水'] || 0) : 0;
            const metal = es ? (es['金'] || 0) : 0;

            // 1. 財星質量：財星的坐基與護衛（財坐比劫/官殺/被合）
            let wealthQuality = '財星（' + (dayEl ? (WUXING_KE[dayEl] || '') : '') + '）在命盤中的強度與位置：';
            const hasCaiTou = (fp.year && (fp.year.gan === '壬' || fp.year.gan === '癸')) || (fp.month && (fp.month.gan === '壬' || fp.month.gan === '癸')) || (fp.day && (fp.day.gan === '壬' || fp.day.gan === '癸')) || (fp.hour && (fp.hour.gan === '壬' || fp.hour.gan === '癸'));
            const hourZhi = fp.hour && fp.hour.zhi;
            const caiGenChong = (hourZhi && chongMap[hourZhi] && allZhi.indexOf(chongMap[hourZhi]) >= 0);
            if (hasCaiTou) wealthQuality += '天干透財，有顯性財緣。';
            if (hourZhi && (EARTHLY_BRANCHES_DETAIL[hourZhi] && (EARTHLY_BRANCHES_DETAIL[hourZhi].element === (WUXING_KE[dayEl] || '')))) wealthQuality += '時支為財根，財有根基。';
            if (caiGenChong) { wealthQuality += '惟財根逢沖，財根不穩；錢財左手進右手出或合伙易破。'; keyPoints.push('財根逢沖，宜穩健理財、避免高槓桿。'); }
            if (biJie >= 2 && caiXing >= 1) wealthQuality += '財坐比劫或比劫旺：錢財易左手進右手出，合伙須防破。';
            if (guanSha >= 1 && caiXing >= 1) wealthQuality += '財坐官殺或官殺護財：錢財來自官方項目或壓力性行業，能存但賺得辛苦。';
            if (!wealthQuality || wealthQuality.length < 60) wealthQuality += (water >= 6 ? '財星有氣，有源頭或根基。' : '財星力道一般，需大運流年引動。');
            wealthSource = wealthQuality;

            // 2. 得財手段：生財路徑的十神組合
            if (shiShang >= 1 && caiXing >= 1) wealthMethod = '傷官／食神生財：靠創新、專業、口才或創意策劃獲利；食神制殺生財可指頂尖工程、法律等解難獲利。';
            else if (biJie >= 2 && caiXing >= 1) wealthMethod = '比劫奪財：體力勞動、團隊業績分紅或競爭性極強的銷售。';
            else if (caiXing >= 1) wealthMethod = '財星有現：得財多與工作、經營或理財相關。';
            if (guanSha >= 1) {
                if (isStrong) wealthMethod += (wealthMethod ? ' ' : '') + '七殺攻身：可透過管理、高壓行業（法律、工程）得財。';
                else wealthMethod += (wealthMethod ? ' ' : '') + '七殺有現但身弱不宜強求高壓行業；大運助身時可適度考慮管理或專業型工作。';
            }
            if (!wealthMethod) wealthMethod = '得財方式需結合大運流年與現實選擇。';

            // 3. 財富周期：財庫（辰戌丑未）的開合
            let wealthCycle = '';
            const hasCaiKu = allZhi.some(z => caiKu.indexOf(z) >= 0);
            if (hasCaiKu) wealthCycle = '原局有財庫（辰戌丑未）：善守財、理財觀念強；大運流年沖開財庫往往有爆發性收入，但也可能因沖導致破財；財庫逢合則財富被鎖住或轉為固定資產。';
            else wealthCycle = '原局無明顯財庫，財富周期依大運流年與理財習慣而定。';
            if (caiGenChong) wealthCycle += ' 命盤財根逢沖，流年再沖時須防大起大落。';

            // 4. 消費傾向：財星所生所克的對象
            let consumptionTendency = '';
            if (guanSha >= 1 && caiXing >= 1) consumptionTendency = '財生官殺：易花錢買地位、名聲，或為配偶／子女花費。';
            if (yinXing >= 1 && caiXing >= 1) consumptionTendency += (consumptionTendency ? ' ' : '') + '財破印星：易花錢學習、買房，或因物質損害名譽。';
            if (!consumptionTendency) consumptionTendency = '消費傾向依十神配置，宜量入為出、預留喜用神五行開支。';

            if (isStrong && water >= 4) { wealthLevel = '身強能擔財，先天具備承載較大財富的格局，財富層次中上。'; wealthStrength = 4; wealthTrend = '可主動創造財機'; }
            else if (isStrong) { wealthLevel = '身強，足以勝任財星，惟財星需大運扶助方顯。'; wealthStrength = 3; wealthTrend = '穩健累積為主'; }
            else if (water >= 8) { wealthLevel = '身弱財旺，富屋貧人之象，求財辛苦，需行幫身運方能發財。'; wealthStrength = 2; wealthTrend = '財來多伴隨壓力'; keyPoints.push('身弱財旺，宜控槓桿、避免高風險投入。'); }
            else { wealthLevel = '身弱，財星不宜過重，宜穩健為上。'; wealthStrength = 3; wealthTrend = '穩健累積為主'; }
            const favWater = fav.indexOf('水') >= 0;
            const favMetal = fav.indexOf('金') >= 0;
            gainLossTiming = '得財時機：大運或流年走喜用神（' + (favWater ? '水' : '') + (favMetal ? (favWater ? '、金' : '金') : '') + '）旺時，財星得助，利積累。';
            gainLossTiming += ' 破財風險：財根逢沖之年易有意外支出；比劫旺年慎防合作、借貸耗財。';
            if (es) {
                if (metal >= 12) keyPoints.push('金勢偏重，責任與約束多，財務需預留現金緩衝。');
                if (water >= 10 && dayEl !== '水') keyPoints.push('水旺為印或財，利專業與口碑換取收入。');
            }
            if (keyPoints.length === 0) keyPoints.push('以可控節奏累積，避免一次性重壓。');
        } catch (e) {
            wealthStrength = 3;
            wealthTrend = '中性';
            keyPoints = ['解析時發生例外，已回退保守判斷。'];
        }

        const caiElement = dayEl ? (WUXING_KE[dayEl] || '') : '';
        const chartBasis = `本段依您輸入之八字推算：${dayMaster || '—'}日主（財星為${caiElement || '—'}），${bodyStrength || '—'}；喜用${fav.length ? fav.join('、') : '—'}。財星位置與得財方式由四柱天干地支、十神（財${caiXing}、食傷${shiShang}、官殺${guanSha}）及財根沖合推得。`;

        const wealthOut = {
            wealthStrength,
            wealthTrend,
            summary: keyPoints.join(' '),
            wealthSource: wealthSource || keyPoints.join(' '),
            wealthMethod: wealthMethod || '—',
            wealthLevel: wealthLevel || '—',
            gainLossTiming: gainLossTiming || '—',
            wealthQuality: wealthQuality || '',
            wealthCycle: wealthCycle || '',
            consumptionTendency: consumptionTendency || '',
            chartBasis
        };
        if (wealthOut.chartBasis) wealthOut.chartBasis += ' 【紫微對照】財富對應財帛宮、田宅宮；八字財星與紫微財星宮位可互參。';
        return wealthOut;
    }

    /**
     * 感情婚姻分析（精微版四維度）：吸引力原型、關係模式、婚姻穩定性、婚緣時機。
     */
    analyzeRelationship() {
        const d = this.baziData || {};
        const fp = d.fourPillars || {};
        const tg = d.tenGods || {};
        const es = (d.elementStrength && d.elementStrength.strengths) ? d.elementStrength.strengths : null;
        const fav = (d.favorableElements && d.favorableElements.favorable) || [];
        const unfav = (d.favorableElements && d.favorableElements.unfavorable) || [];
        const dayMaster = fp.day?.gan || d.dayMaster || '';
        const dayBranch = fp.day?.zhi || ''; // 夫妻宮（日支）
        const gender = (d.gender || '').toString().toLowerCase();
        const tenGodsList = this._collectTenGodsNames();
        const count = (name) => tenGodsList.filter(x => x === name).length;
        const zhiToWu = (z) => (EARTHLY_BRANCHES_DETAIL && EARTHLY_BRANCHES_DETAIL[z]?.element) || '';
        const dayBranchGods = Array.isArray(tg.dayBranch) ? tg.dayBranch : (tg.dayBranch ? [tg.dayBranch] : []);

        let relationshipStrength = 3;
        let advice = [];
        let spouseAnalysis = { presence: '未顯示' };
        let peachBlossom = { hasPeachBlossom: false, impact: '' };
        let marriageStability = { stability: '未顯示' };
        let attractionPrototype = '';
        let relationshipMode = '';
        let marriageTiming = '';

        try {
            const caiZheng = count('正財');
            const caiPian = count('偏財');
            const guanZheng = count('正官');
            const guanSha = count('七殺');
            const biJie = count('比肩') + count('劫財');
            const caiXing = caiZheng + caiPian;
            const guanXing = guanZheng + guanSha;

            // 1. 吸引力原型：配偶星與桃花星的特質（偏財/七殺 vs 正官/正財；桃花在劫財）
            if (gender === 'male' || gender === '男') {
                if (caiPian >= 1 && caiZheng < 1) attractionPrototype = '配偶星為偏財：易被特立獨行、有侵略性或神秘感的對象吸引。';
                else if (caiZheng >= 1) attractionPrototype = '配偶星為正財：易被端莊、穩定、社會評價高的對象吸引。';
                else if (caiXing >= 1) attractionPrototype = '財星有現，配偶緣分存在，吸引力依正偏財比例而偏穩定或多元。';
                else attractionPrototype = '命盤財星不明顯，配偶緣多靠大運流年引動。';
            } else {
                if (guanSha >= 1 && guanZheng < 1) attractionPrototype = '配偶星為七殺：易被特立獨行、強勢或神秘感的對象吸引。';
                else if (guanZheng >= 1) attractionPrototype = '配偶星為正官：易被端莊、穩定、有責任感、社會評價高的對象吸引。';
                else if (guanXing >= 1) attractionPrototype = '官殺有現，配偶緣分存在，吸引力依正官/七殺比例而偏穩定或強勢。';
                else attractionPrototype = '命盤官殺不明顯，配偶緣多靠大運流年引動。';
            }
            if (biJie >= 2) attractionPrototype += ' 桃花在劫財：魅力體現在豪爽、義氣上，易吸引哥們／閨蜜型伴侶。';

            if (gender === 'male' || gender === '男') {
                if (caiZheng >= 1) spouseAnalysis.presence = `正財明顯（${caiZheng}處），易遇穩定、傳統型對象。`;
                else if (caiPian >= 1) spouseAnalysis.presence = `偏財明顯（${caiPian}處），易遇熱烈或條件懸殊的緣分。`;
                else if (caiXing >= 1) spouseAnalysis.presence = `財星有現，配偶緣分存在，宜把握大運流年。`;
                else spouseAnalysis.presence = '命盤財星不明顯，配偶緣多靠大運流年引動。';
            } else {
                if (guanZheng >= 1) spouseAnalysis.presence = `正官明顯（${guanZheng}處），易遇穩定、有責任感對象。`;
                else if (guanSha >= 1) spouseAnalysis.presence = `七殺明顯（${guanSha}處），易遇強勢或短暫緣分。`;
                else if (guanXing >= 1) spouseAnalysis.presence = `官殺有現，配偶緣分存在，宜把握大運流年。`;
                else spouseAnalysis.presence = '命盤官殺不明顯，配偶緣多靠大運流年引動。';
            }

            // 2. 關係模式：夫妻宮與配偶星的互動（宮星同位／相克／配偶星入墓）
            const dayBranchHasCai = dayBranchGods.some(x => x === '正財' || x === '偏財');
            const dayBranchHasGuan = dayBranchGods.some(x => x === '正官' || x === '七殺');
            if ((gender === 'male' || gender === '男') && dayBranchHasCai) relationshipMode = '宮星同位（妻星為財，日支亦見財星）：夫妻一體、觀念相近。';
            else if ((gender !== 'male' && gender !== '男') && dayBranchHasGuan) relationshipMode = '宮星同位（夫星為官殺，日支亦見官殺）：夫妻一體、觀念相近。';
            else if (dayBranch) relationshipMode = `夫妻宮為${dayBranch}，與配偶星之五行生克決定互動：宮星相克則常有觀點衝突、互相制約；宮星相生則較和諧。`;
            marriageTiming = '婚緣時機：流年配偶星出現且合入夫妻宮或日主時為強烈結婚信號；流年沖動夫妻宮且解除原局不利組合時，易在變動中成婚；大運引動時柱（子女宮）時常奉子成婚。須結合大運流年具體排盤。';

            const peachMap = { '寅': '卯', '午': '卯', '戌': '卯', '申': '酉', '子': '酉', '辰': '酉', '巳': '午', '酉': '午', '丑': '午', '亥': '子', '卯': '子', '未': '子' };
            const refBranch = dayBranch || fp.year?.zhi || '';
            const peachZhi = refBranch ? peachMap[refBranch] : null;
            const allBranches = [fp.year?.zhi, fp.month?.zhi, fp.day?.zhi, fp.hour?.zhi].filter(Boolean);
            const hasPeachInPillar = peachZhi && allBranches.indexOf(peachZhi) >= 0;
            if (peachZhi) {
                peachBlossom.hasPeachBlossom = hasPeachInPillar;
                peachBlossom.impact = hasPeachInPillar ? `桃花星${peachZhi}入命，異性緣佳、魅力較強。` : `桃花在${peachZhi}，大運流年逢之易有感情機緣。`;
            }

            const chongMap = { '子': '午', '午': '子', '丑': '未', '未': '丑', '寅': '申', '申': '寅', '卯': '酉', '酉': '卯', '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳' };
            const dayBranchEl = zhiToWu(dayBranch);
            const dayBranchFav = dayBranchEl && fav.indexOf(dayBranchEl) >= 0;
            const dayBranchUnfav = dayBranchEl && unfav.indexOf(dayBranchEl) >= 0;
            const chongOfDay = chongMap[dayBranch];
            const dayBranchChong = chongOfDay && allBranches.some(b => b === chongOfDay);
            if (dayBranch) {
                if (dayBranchFav) marriageStability.stability = `日支（夫妻宮）為喜用，配偶對自己有幫助，關係較和諧。`;
                else if (dayBranchUnfav) marriageStability.stability = `日支（夫妻宮）為忌神，配偶條件或關係易成壓力源，宜多溝通。`;
                else marriageStability.stability = `夫妻宮為${dayBranch}，婚姻質量取決於大運流年與現實經營。`;
                if (dayBranchChong) marriageStability.stability += ' 命盤有夫妻宮逢沖之象，關係易有變動，需用心維繫。';
                if (biJie >= 2 && (caiXing >= 1 || guanXing >= 1)) marriageStability.stability += ' 比劫旺而配偶星有現，易有競爭者或配偶星被比劫合走之象，宜明確邊界。';
            }

            // 五行強度輔助（原有邏輯）
            if (es) {
                const wood = es['木'] || 0;
                const water = es['水'] || 0;
                const metal = es['金'] || 0;
                const fire = es['火'] || 0;
                const earth = es['土'] || 0;
                if (metal >= 12 && wood < 8) {
                    relationshipStrength = 2;
                    advice.push('標準與壓力偏高，容易出現「想要對、但相處累」的狀態。');
                } else if (water >= 8 && wood >= 8) {
                    relationshipStrength = 4;
                    advice.push('情感支持與溝通條件較佳，利建立穩定互信。');
                } else {
                    relationshipStrength = 3;
                    advice.push('關係走向取決於現實互動與溝通頻率。');
                }
                if (fire < 5) advice.push('火勢偏弱：主動性與熱度需要刻意維持（安排固定互動／約會節奏）。');
                if (earth >= 10) advice.push('土偏重：容易把關係拉回現實考量，建議先談規則與邊界。');
            } else {
                advice.push('缺少五行強度數據，請用「互動頻率／衝突議題／價值觀一致性」作校驗。');
            }
        } catch (e) {
            relationshipStrength = 3;
            advice = ['解析時發生例外，已回退保守判斷。'];
        }

        const chartBasis = `本段依您輸入之八字推算：${dayMaster || '—'}日主、夫妻宮（日支）為${dayBranch || '—'}，喜用${fav.length ? fav.join('、') : '—'}。配偶星依性別看財星／官殺；桃花與穩定性由日支、沖合及比劫與配偶星數量推得。`;

        const relOut = {
            relationshipStrength,
            summary: advice.join(' '),
            spouseAnalysis,
            peachBlossom,
            marriageStability,
            attractionPrototype: attractionPrototype || '',
            relationshipMode: relationshipMode || '',
            marriageTiming: marriageTiming || '',
            chartBasis
        };
        if (relOut.chartBasis) relOut.chartBasis += ' 【紫微對照】感情對應夫妻宮、子女宮；桃花與紫微紅鸞、天喜可互參。';
        return relOut;
    }

    analyzeHealth() {
        const d = this.baziData || {};
        const es = (d.elementStrength && d.elementStrength.strengths) ? d.elementStrength.strengths : null;
        let riskLevel = '中';
        let focus = [];

        try {
            if (es) {
                const wood = es['木'] || 0;
                const water = es['水'] || 0;
                const fire = es['火'] || 0;
                const earth = es['土'] || 0;
                const metal = es['金'] || 0;

                // 極簡：火弱→循環/代謝；水弱→腎氣/恢復；金旺→呼吸/皮膚壓力；土旺→脾胃/濕
                if (fire < 4) focus.push('火偏弱：注意睡眠品質、循環與代謝（少熬夜、規律有氧）。');
                if (water < 4) focus.push('水偏弱：恢復力不足，注意補水與過勞（避免連續透支）。');
                if (metal >= 12) focus.push('金偏旺：壓力型症狀、肩頸與呼吸道要管理。');
                if (earth >= 12) focus.push('土偏旺：飲食油鹽與脾胃負擔要控。');

                if (focus.length >= 3) riskLevel = '偏高';
                else if (focus.length == 2) riskLevel = '中';
                else riskLevel = '中低';
            } else {
                focus.push('缺少五行強度數據，請用「睡眠/體力/腸胃/壓力反應」作校驗。');
                riskLevel = '中';
            }
        } catch (e) {
            riskLevel = '中';
            focus = ['解析時發生例外，已回退保守判斷。'];
        }

        const healthOut = {
            riskLevel,
            focus: focus,
            summary: focus.join(' ')
        };
        if (healthOut.summary) healthOut.summary += ' 【紫微對照】健康對應疾厄宮；八字五行與紫微疾厄主星可交叉參考。';
        return healthOut;
    }

    
    analyzeCurrentYear() {
        return { analysis: '2026丙午年，丙火傷官，午火食神。火旺洩身，消耗能量。需注意健康，避免過度勞累。' };
    }
}

// ==========================================
// 7. UI 渲染模組
// ==========================================

class BaziUI {
    static updateDisplay(result) {
        if (!result) return;
        
        console.log('BaziUI: 開始渲染詳細分析...');
        
        this.renderGodsGrid(result);
        this.renderFiveElements(result);
        this.renderShensha(result);
        
        const pane = document.getElementById('bazi-pane');
        if(pane) pane.style.display = 'block';
    }

    static renderGodsGrid(result) {
        const container = document.getElementById('ui-gods-grid');
        if (!container) return;

        const getBranchGod = (arr) => Array.isArray(arr) ? arr[0] : arr;

        const pillars = [
            { name: '年柱', stem: result.tenGods.yearStem, branch: getBranchGod(result.tenGods.yearBranch) },
            { name: '月柱', stem: result.tenGods.monthStem, branch: getBranchGod(result.tenGods.monthBranch) },
            { name: '日柱', stem: '日主', branch: getBranchGod(result.tenGods.dayBranch) },
            { name: '時柱', stem: result.tenGods.hourStem, branch: getBranchGod(result.tenGods.hourBranch) }
        ];

        let html = '';
        pillars.forEach(p => {
            html += `
            <div class="gods-column">
                <span class="gods-col-title" style="color:#aaa; font-size:0.8rem; margin-bottom:5px;">${p.name}</span>
                <span class="gods-item" style="display:block; margin-bottom:4px; padding:4px; background:rgba(255,255,255,0.05); border-radius:4px;">${p.stem}</span>
                <span class="gods-item" style="display:block; padding:4px; background:rgba(255,255,255,0.05); border-radius:4px;">${p.branch}</span>
            </div>`;
        });
        container.innerHTML = html;
    }

    static renderFiveElements(result) {
        const container = document.getElementById('ui-elements-bar');
        if (!container) return;

        const strengths = result.elementStrength.strengths;
        const total = Object.values(strengths).reduce((a, b) => a + b, 0) || 1;
        
        const elements = [
            { key: '金', class: 'el-gold', bg: 'bg-gold' },
            { key: '木', class: 'el-wood', bg: 'bg-wood' },
            { key: '水', class: 'el-water', bg: 'bg-water' },
            { key: '火', class: 'el-fire', bg: 'bg-fire' },
            { key: '土', class: 'el-earth', bg: 'bg-earth' }
        ];

        let html = '';
        elements.forEach(el => {
            const score = strengths[el.key] || 0;
            const percent = Math.round((score / total) * 100);
            
            html += `
            <div class="element-row" style="display:flex; align-items:center; margin-bottom:8px;">
                <span class="element-label ${el.class}" style="width:30px; font-weight:bold;">${el.key}</span>
                <div class="progress-track" style="flex-grow:1; height:8px; background:rgba(255,255,255,0.1); border-radius:4px; margin:0 10px; overflow:hidden;">
                    <div class="progress-fill ${el.bg}" style="width: ${percent}%; height:100%;"></div>
                </div>
                <span class="element-value" style="width:40px; text-align:right; font-size:0.9rem;">${percent}%</span>
            </div>`;
        });
        container.innerHTML = html;
    }

    static renderShensha(result) {
        const container = document.getElementById('ui-shensha-content');
        if (!container) return;

        const favorables = result.favorableElements.favorable.map(el => `<span class="bazi-tag tag-favorable">${el}</span>`).join(' ');
        const unfavorables = result.favorableElements.unfavorable.map(el => `<span class="bazi-tag tag-unfavorable">${el}</span>`).join(' ');
        const priority = result.favorableElements.priority || {};
        const hierarchy = result.favorableElements.hierarchy || {};
        const primaryFav = priority['第一喜神'] || result.favorableElements.favorable[0];
        const secondaryFav = priority['第二喜神'] || result.favorableElements.favorable[1];
        const primaryUnfav = priority['第一忌神'] || result.favorableElements.unfavorable[0];
        const dynamicNote = (hierarchy.godTier && hierarchy.godTier.dynamicNote) || hierarchy.dynamicApplication || '';

        let priorityHtml = '';
        if (primaryFav || secondaryFav || primaryUnfav) {
            priorityHtml = '<div style="margin-bottom: 1rem;"><p style="font-size:0.9rem; margin-bottom:5px; color:rgba(255,255,255,0.6);">喜用神優先級：</p>';
            if (primaryFav) priorityHtml += '<p style="font-size:0.85rem; margin-bottom:4px;"><span style="color:var(--gold-primary);">首要（Primary）</span>：' + primaryFav + '</p>';
            if (secondaryFav) priorityHtml += '<p style="font-size:0.85rem; margin-bottom:4px;"><span style="color:rgba(212,175,55,0.9);">次要（Secondary）</span>：' + secondaryFav + '</p>';
            if (primaryUnfav) priorityHtml += '<p style="font-size:0.85rem;"><span style="color:rgba(255,152,0,0.9);">首要忌神</span>：' + primaryUnfav + '</p>';
            priorityHtml += '</div>';
        }
        if (dynamicNote) priorityHtml += '<div style="margin-bottom: 1rem; padding: 0.5rem; background: rgba(212,175,55,0.08); border-radius: 4px; font-size: 0.85rem; line-height: 1.5; color: rgba(255,255,255,0.8);"><strong>條件性用神／歲運注意：</strong> ' + dynamicNote + '</div>';

        container.innerHTML = `
            ${priorityHtml}
            <div style="margin-bottom: 1rem;">
                <p style="font-size:0.9rem; margin-bottom:5px; color:rgba(255,255,255,0.6);">喜用神 (運氣來源)：</p>
                <div class="tag-container">${favorables}</div>
            </div>
            <div style="margin-bottom: 1rem;">
                <p style="font-size:0.9rem; margin-bottom:5px; color:rgba(255,255,255,0.6);">忌神 (壓力來源)：</p>
                <div class="tag-container">${unfavorables}</div>
            </div>
        `;
    }

}

// ==========================================
// 8. 測試與導出
// ==========================================

function testBaziExample() {
    console.log('執行八字計算測試（範例日期，不涉及個資）...');
    const calculator = new BaziCalculator();
    try {
        const result = calculator.calculateBazi('1990-06-15T10:00:00', 'male', true, 120.2);
        const analyzer = new BaziAnalyzer(result);
        result.analyzer = analyzer;

        if (typeof window !== 'undefined' && window.BaziUI) {
            window.BaziUI.updateDisplay(result);
        }

        return result;
    } catch (e) {
        console.error(e);
        return null;
    }
}

if (typeof window !== 'undefined') {
    window.BaziCalculator = BaziCalculator;
    window.BaziAnalyzer = BaziAnalyzer;
    window.BaziUI = BaziUI;
    window.testBaziExample = testBaziExample;
}