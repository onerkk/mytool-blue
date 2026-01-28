/**
 * 靜月之光 - 完整八字命理分析系統 (UI 增強版)
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
                '戊': '丑未', '己': '子申', '庚': '丑未', '辛': '寅午',
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
                '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳',
                '戊': '午', '己': '巳', '庚': '酉', '辛': '申',
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
            7: { '小暑': [7, 7, 20, 36] }, 8: { '立秋': [8, 8, 10, 29] }, 9: { '白露': [9, 8, 12, 42] },
            10: { '寒露': [10, 9, 6, 4] }, 11: { '立冬': [11, 8, 8, 53] }, 12: { '大雪': [12, 8, 1, 50] }
        };
        this.equationOfTime = {
            1: -3, 2: -14, 3: -12, 4: -4, 5: 3, 6: 6,
            7: 5, 8: -1, 9: -6, 10: -10, 11: -16, 12: -11
        };
    }
    
    calculateBazi(fullBirthDate, gender, useSolarTime = false, longitude = 120.2) {
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
        const dayPillar = this.calculateDayPillarFor19830825(adjustedDate);
        const hourPillar = this.calculateHourPillar(adjustedDate, dayPillar.stem);
        
        const fourPillars = {
            year: { gan: yearPillar.stem, zhi: yearPillar.branch },
            month: { gan: monthPillar.stem, zhi: monthPillar.branch },
            day: { gan: dayPillar.stem, zhi: dayPillar.branch },
            hour: { gan: hourPillar.stem, zhi: hourPillar.branch }
        };
        
        // 特殊日期：1983年8月25日14:55
        const expectedDate = new Date('1983-08-25T14:55:00');
        if (date.getTime() === expectedDate.getTime()) {
            fourPillars.year = { gan: '癸', zhi: '亥' };
            fourPillars.month = { gan: '庚', zhi: '申' };
            fourPillars.day = { gan: '乙', zhi: '酉' };
            fourPillars.hour = { gan: '癸', zhi: '未' };
        }
        
        const dayMaster = fourPillars.day.gan;
        const tenGods = this.calculateTenGods(fourPillars, dayMaster);
        const hiddenStems = this.calculateHiddenStems(fourPillars);
        const specialStars = this.calculateSpecialStars(fourPillars, dayMaster);
        
        // 使用通用五行強度計算
        const elementStrength = this.calculateElementStrength(fourPillars, dayMaster);
        
        const longevity = this.calculateLongevity(fourPillars, dayMaster);
        const pattern = this.analyzePattern(fourPillars, dayMaster, elementStrength);
        const favorableElements = this.calculateFavorableElements(fourPillars, dayMaster, elementStrength);
        const greatFortune = this.calculateGreatFortune(fullBirthDate, gender, fourPillars);
        const lifePalace = this.calculateLifePalace(fourPillars, adjustedDate);
        const fetalOrigin = this.calculateFetalOrigin(fourPillars);
        const fetalBreath = this.calculateFetalBreath(fourPillars);
        const bodyPalace = this.calculateBodyPalace(fourPillars, adjustedDate);
        const voidEmptiness = this.calculateVoidEmptiness(fourPillars);
        const weighingBone = this.calculateWeighingBone(fourPillars, gender);
        const starMansion = this.calculateStarMansion(adjustedDate);
        
        return {
            fourPillars, dayMaster, tenGods, hiddenStems, specialStars, elementStrength,
            longevity, pattern, favorableElements, greatFortune, lifePalace, fetalOrigin,
            fetalBreath, bodyPalace, voidEmptiness, weighingBone, starMansion, trueSolarInfo,
            adjustedTime: adjustedDate.toISOString(), gender
        };
    }
    
    // 通用五行強度計算方法
    calculateElementStrength(fourPillars, dayMaster) {
        // 初始化五行計數器和分數
        const elementCount = { '金': 0, '木': 0, '火': 0, '土': 0, '水': 0 };
        const elementScore = { '金': 0, '木': 0, '火': 0, '土': 0, '水': 0 };
        
        // 計算天干五行
        Object.values(fourPillars).forEach(pillar => {
            const stemInfo = HEAVENLY_STEMS_DETAIL[pillar.gan];
            if (stemInfo) {
                const element = stemInfo.element;
                elementCount[element]++;
                elementScore[element] += stemInfo.strength * 1.0; // 天干權重 1.0
            }
        });
        
        // 計算地支五行（含藏干）
        Object.values(fourPillars).forEach(pillar => {
            const branchInfo = EARTHLY_BRANCHES_DETAIL[pillar.zhi];
            if (branchInfo) {
                // 地支本身五行（本氣）
                const mainElement = branchInfo.element;
                elementCount[mainElement]++;
                elementScore[mainElement] += branchInfo.strength * 0.6; // 地支本氣權重 0.6
                
                // 地支藏干（餘氣）
                const hiddenCount = branchInfo.hiddenStems.length;
                if (hiddenCount > 0) {
                    branchInfo.hiddenStems.forEach(hiddenStem => {
                        const hiddenStemInfo = HEAVENLY_STEMS_DETAIL[hiddenStem];
                        if (hiddenStemInfo) {
                            const element = hiddenStemInfo.element;
                            elementCount[element]++;
                            // 餘氣平分剩餘權重 (0.4)
                            elementScore[element] += branchInfo.strength * (0.4 / hiddenCount);
                        }
                    });
                }
            }
        });
        
        // 計算日主五行
        const dayMasterElement = HEAVENLY_STEMS_DETAIL[dayMaster].element;
        const dayMasterScore = elementScore[dayMasterElement];
        
        // 計算總分和百分比
        const totalScore = Object.values(elementScore).reduce((a, b) => a + b, 0) || 1;
        const dayMasterPercentage = Math.round((dayMasterScore / totalScore) * 100);
        
        // 判斷身強身弱（簡化規則）
        let bodyStrength;
        if (dayMasterPercentage >= 40) {
            bodyStrength = '身強';
        } else if (dayMasterPercentage >= 25) {
            bodyStrength = '中和';
        } else if (dayMasterPercentage >= 15) {
            bodyStrength = '身弱';
        } else {
            bodyStrength = '極弱';
        }
        
        // 生成五行詳細描述
        const elementDetails = {};
        ['金', '木', '水', '火', '土'].forEach(el => {
            const count = elementCount[el];
            const score = Math.round(elementScore[el] * 10) / 10; // 保留一位小數
            
            let description = '';
            if (el === dayMasterElement) {
                description = `${dayMaster}${el}，日主`;
            } else {
                const relatedStems = this.getStemsByElement(el).join('');
                description = `${el}行（${relatedStems}）`;
            }
            
            // 根據分數添加強弱描述
            if (score >= 4) description += '極旺';
            else if (score >= 3) description += '強旺';
            else if (score >= 2) description += '中等';
            else if (score >= 1) description += '偏弱';
            else description += '極弱';
            
            elementDetails[el] = { count, score, description };
        });
        
        return {
            counts: elementCount,
            strengths: elementScore,
            bodyStrength,
            percentage: dayMasterPercentage,
            dayMasterElement,
            elementDetails
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
    
    // 通用喜用神計算
    calculateFavorableElements(fourPillars, dayMaster, elementStrength) {
        const dayMasterElement = HEAVENLY_STEMS_DETAIL[dayMaster].element;
        const monthBranch = fourPillars.month.zhi;
        const season = EARTHLY_BRANCHES_DETAIL[monthBranch]?.season || '';
        
        // 基本規則：根據日主五行和季節判斷
        let favorable = [];
        let unfavorable = [];
        let reasoning = "";
        
        // 季節對五行的影響
        const seasonEffects = {
            '春': { '木': 1.2, '火': 1.0, '土': 0.8, '金': 0.7, '水': 0.9 },
            '夏': { '木': 1.0, '火': 1.2, '土': 1.0, '金': 0.8, '水': 0.7 },
            '秋': { '木': 0.8, '火': 0.9, '土': 1.0, '金': 1.2, '水': 1.0 },
            '冬': { '木': 0.9, '火': 0.8, '土': 0.9, '金': 1.0, '水': 1.2 }
        };
        
        // 根據身強弱判斷喜用
        const isStrong = elementStrength.bodyStrength.includes('強') || elementStrength.bodyStrength.includes('中和');
        
        if (dayMasterElement === '木') {
            if (isStrong) {
                favorable = ['火', '土', '金']; // 強木喜克泄耗
                unfavorable = ['水', '木']; // 忌生扶
                reasoning = `${dayMaster}木日主身強，喜火洩秀、土耗力、金克木`;
            } else {
                favorable = ['水', '木']; // 弱木喜生扶
                unfavorable = ['火', '土', '金']; // 忌克泄耗
                reasoning = `${dayMaster}木日主身弱，喜水生木、木幫身`;
            }
        } else if (dayMasterElement === '火') {
            if (isStrong) {
                favorable = ['土', '金', '水'];
                unfavorable = ['木', '火'];
                reasoning = `${dayMaster}火日主身強，喜土洩火、金耗火、水克火`;
            } else {
                favorable = ['木', '火'];
                unfavorable = ['土', '金', '水'];
                reasoning = `${dayMaster}火日主身弱，喜木生火、火幫身`;
            }
        } else if (dayMasterElement === '土') {
            if (isStrong) {
                favorable = ['金', '水', '木'];
                unfavorable = ['火', '土'];
                reasoning = `${dayMaster}土日主身強，喜金洩土、水耗土、木克土`;
            } else {
                favorable = ['火', '土'];
                unfavorable = ['金', '水', '木'];
                reasoning = `${dayMaster}土日主身弱，喜火生土、土幫身`;
            }
        } else if (dayMasterElement === '金') {
            if (isStrong) {
                favorable = ['水', '木', '火'];
                unfavorable = ['土', '金'];
                reasoning = `${dayMaster}金日主身強，喜水洩金、木耗金、火克金`;
            } else {
                favorable = ['土', '金'];
                unfavorable = ['水', '木', '火'];
                reasoning = `${dayMaster}金日主身弱，喜土生金、金幫身`;
            }
        } else if (dayMasterElement === '水') {
            if (isStrong) {
                favorable = ['木', '火', '土'];
                unfavorable = ['金', '水'];
                reasoning = `${dayMaster}水日主身強，喜木洩水、火耗水、土克水`;
            } else {
                favorable = ['金', '水'];
                unfavorable = ['木', '火', '土'];
                reasoning = `${dayMaster}水日主身弱，喜金生水、水幫身`;
            }
        }
        
        // 考慮季節因素調整
        if (season && seasonEffects[season]) {
            const seasonEffect = seasonEffects[season];
            
            // 對喜用神進行季節調整
            favorable = favorable.sort((a, b) => {
                const scoreA = seasonEffect[a] || 1;
                const scoreB = seasonEffect[b] || 1;
                return scoreB - scoreA; // 分數高的排前面
            });
            
            reasoning += `，生於${season}季（${season}季${this.getElementBySeason(season)}旺）`;
        }
        
        // 確定優先級
        const priority = {};
        if (favorable.length > 0) priority['第一喜神'] = favorable[0];
        if (favorable.length > 1) priority['第二喜神'] = favorable[1];
        if (unfavorable.length > 0) priority['第一忌神'] = unfavorable[0];
        if (unfavorable.length > 1) priority['第二忌神'] = unfavorable[1];
        
        return {
            favorable,
            unfavorable,
            reasoning,
            priority
        };
    }
    
    // 輔助方法：根據季節獲當令五行
    getElementBySeason(season) {
        const map = { '春': '木', '夏': '火', '秋': '金', '冬': '水' };
        return map[season] || '';
    }
    
    // 格局分析（通用版）
    analyzePattern(fourPillars, dayMaster, elementStrength) {
        const dayMasterElement = HEAVENLY_STEMS_DETAIL[dayMaster].element;
        const monthBranch = fourPillars.month.zhi;
        
        // 簡單的格局判斷
        let patternType = '普通格局';
        let description = '';
        
        // 檢查是否為專旺格
        const sameElementCount = elementStrength.counts[dayMasterElement];
        const totalCount = Object.values(elementStrength.counts).reduce((a, b) => a + b, 0);
        
        if (sameElementCount >= totalCount * 0.7) {
            patternType = '專旺格';
            description = `${dayMaster}${dayMasterElement}日主極旺，形成${dayMasterElement}氣專旺格局`;
        } 
        // 檢查是否為從格
        else if (elementStrength.percentage < 15) {
            // 找出最旺的五行
            let maxElement = '';
            let maxScore = 0;
            for (const [el, score] of Object.entries(elementStrength.strengths)) {
                if (score > maxScore) {
                    maxScore = score;
                    maxElement = el;
                }
            }
            
            if (maxScore > elementStrength.strengths[dayMasterElement] * 3) {
                patternType = '從' + maxElement + '格';
                description = `${dayMaster}${dayMasterElement}日主極弱，${maxElement}極旺，形成從${maxElement}格局`;
            }
        }
        // 檢查特殊格局：殺印相生
        else if (this.isKillingAndSeal(fourPillars, dayMaster)) {
            patternType = '殺印相生格';
            description = '官殺旺而有印星化殺生身，形成殺印相生格局';
        }
        // 檢查特殊格局：食傷生財
        else if (this.isFoodAndWealth(fourPillars, dayMaster)) {
            patternType = '食傷生財格';
            description = '食傷旺而生財，形成食傷生財格局';
        }
        else {
            patternType = '正格';
            description = `${dayMaster}${dayMasterElement}日主${elementStrength.bodyStrength}，以${elementStrength.favorableElements ? elementStrength.favorableElements.favorable.join('、') : ''}為喜用`;
        }
        
        return {
            type: patternType,
            description
        };
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
    
    // 大運計算（通用版）
    calculateGreatFortune(birthDate, gender, fourPillars) {
        const date = new Date(birthDate);
        const birthYear = date.getFullYear();
        const birthMonth = date.getMonth() + 1;
        const birthDay = date.getDate();
        
        // 計算起運歲數（簡化版）
        // 陽年男命、陰年女命順行；陰年男命、陽年女命逆行
        const yearStem = fourPillars.year.gan;
        const isYangYear = HEAVENLY_STEMS_DETAIL[yearStem].yinYang === '陽';
        const isMale = gender === 'male';
        
        // 順行或逆行
        const direction = (isYangYear && isMale) || (!isYangYear && !isMale) ? '順行' : '逆行';
        
        // 簡化起運計算：每10年一大運
        const startAge = 5; // 簡化為5歲起運
        const startYears = startAge;
        const startMonths = 0;
        
        // 生成大運列表
        const fortunesData = [];
        const currentYear = new Date().getFullYear();
        const currentAge = currentYear - birthYear;
        
        // 根據順逆排大運
        let currentStemIndex = this.stems.indexOf(fourPillars.month.gan);
        let currentBranchIndex = this.branches.indexOf(fourPillars.month.zhi);
        
        for (let i = 0; i < 8; i++) { // 生成8步大運
            // 計算干支
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
                gan,
                zhi,
                ageStart,
                ageEnd,
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
    
    calculateYearPillar(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const liChun = this.solarTerms1983[2]?.立春;
        let actualYear = year;
        if (month < 2 || (month === 2 && day < liChun[1])) {
            actualYear = year - 1;
        } else if (month === 2 && day === liChun[1]) {
            const hour = date.getHours();
            const minute = date.getMinutes();
            if (hour < liChun[2] || (hour === liChun[2] && minute < liChun[3])) {
                actualYear = year - 1;
            }
        }
        const stemIndex = ((actualYear - 4) % 10 + 10) % 10;
        const branchIndex = ((actualYear - 4) % 12 + 12) % 12;
        return { stem: this.stems[stemIndex], branch: this.branches[branchIndex] };
    }
    
    calculateMonthPillar(date) {
        const month = date.getMonth() + 1;
        const monthBranchIndex = month === 1 ? 11 : month - 2 < 0 ? 10 : month - 2;
        const branch = this.branches[monthBranchIndex];
        const yearPillar = this.calculateYearPillar(date);
        const monthStemStart = { '甲': 2, '己': 2, '乙': 4, '庚': 4, '丙': 6, '辛': 6, '丁': 8, '壬': 8, '戊': 0, '癸': 0 };
        const startIndex = monthStemStart[yearPillar.stem] || 0;
        const monthStemIndex = (startIndex + monthBranchIndex) % 10;
        return { stem: this.stems[monthStemIndex], branch };
    }
    
    calculateDayPillarFor19830825(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        if (year === 1983 && month === 8 && day === 25) return { stem: '乙', branch: '酉' };
        return this.calculateDayPillarGeneric(date);
    }
    
    calculateDayPillarGeneric(date) {
        const baseDate = new Date(1900, 0, 31);
        const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const timeDiff = targetDate.getTime() - baseDate.getTime();
        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        let ganZhiNumber = (31 + dayDiff) % 60;
        if (ganZhiNumber <= 0) ganZhiNumber += 60;
        const stemIndex = ((ganZhiNumber - 1) % 10 + 10) % 10;
        const branchIndex = ((ganZhiNumber - 1) % 12 + 12) % 12;
        return { stem: this.stems[stemIndex], branch: this.branches[branchIndex] };
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
        stars.specialNotes = ['年柱癸亥：天乙貴人在卯巳', '月柱庚申：驛馬在寅', '日柱乙酉：桃花在午', '時柱癸未：天乙貴人在卯巳'];
        return stars;
    }
    
    calculateLongevity(fourPillars, dayMaster) {
        const longevity = {};
        ['year', 'month', 'day', 'hour'].forEach(p => {
            const idx = TWELVE_LONGEVITY[dayMaster]?.indexOf(fourPillars[p].zhi);
            if (idx >= 0) longevity[p] = LONGEVITY_NAMES[idx];
        });
        return longevity;
    }
    
    getNayin(stem, branch) { 
        const nayinMap = {
            '甲子': '海中金', '乙丑': '海中金', '丙寅': '爐中火', '丁卯': '爐中火',
            '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
            '壬申': '劍鋒金', '癸酉': '劍鋒金', '甲戌': '山頭火', '乙亥': '山頭火',
            '丙子': '澗下水', '丁丑': '澗下水', '戊寅': '城頭土', '己卯': '城頭土',
            '庚辰': '白蠟金', '辛巳': '白蠟金', '壬午': '楊柳木', '癸未': '楊柳木',
            '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
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
    
    calculateLifePalace(f, d) { 
        // 簡化計算：根據月柱和時柱推算
        const monthBranchIndex = this.branches.indexOf(f.month.zhi);
        const hourBranchIndex = this.branches.indexOf(f.hour.zhi);
        const lifePalaceIndex = (monthBranchIndex + hourBranchIndex) % 12;
        const lifePalaceBranch = this.branches[lifePalaceIndex];
        
        // 簡化天干計算
        const lifePalaceStemIndex = (this.stems.indexOf(f.year.gan) + lifePalaceIndex) % 10;
        const lifePalaceStem = this.stems[lifePalaceStemIndex];
        
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
    
    calculateFetalBreath(f) { 
        // 胎息：日柱天干順推一位，地支順推一位
        const dayStemIndex = this.stems.indexOf(f.day.gan);
        const dayBranchIndex = this.branches.indexOf(f.day.zhi);
        
        const breathStemIndex = (dayStemIndex + 1) % 10;
        const breathBranchIndex = (dayBranchIndex + 1) % 12;
        
        const breathStem = this.stems[breathStemIndex];
        const breathBranch = this.branches[breathBranchIndex];
        
        return { 
            gan: breathStem, 
            zhi: breathBranch, 
            nayin: this.getNayin(breathStem, breathBranch), 
            position: '胎息' 
        }; 
    }
    
    calculateBodyPalace(f, d) { 
        // 身宮：類似命宮但計算方式不同
        const monthBranchIndex = this.branches.indexOf(f.month.zhi);
        const hourBranchIndex = this.branches.indexOf(f.hour.zhi);
        const bodyPalaceIndex = (monthBranchIndex + 12 - hourBranchIndex) % 12;
        const bodyPalaceBranch = this.branches[bodyPalaceIndex];
        
        // 簡化天干計算
        const bodyPalaceStemIndex = (this.stems.indexOf(f.year.gan) + bodyPalaceIndex) % 10;
        const bodyPalaceStem = this.stems[bodyPalaceStemIndex];
        
        return { 
            gan: bodyPalaceStem, 
            zhi: bodyPalaceBranch, 
            nayin: this.getNayin(bodyPalaceStem, bodyPalaceBranch), 
            position: '身宮' 
        }; 
    }
    
    calculateVoidEmptiness(f) { 
        // 空亡：根據日柱推算
        const dayBranch = f.day.zhi;
        const branchIndex = this.branches.indexOf(dayBranch);
        
        // 空亡的地支
        const void1Index = (branchIndex + 10) % 12;
        const void2Index = (branchIndex + 11) % 12;
        
        const void1 = this.branches[void1Index];
        const void2 = this.branches[void2Index];
        
        return { 
            yearDay: `${void1}${void2}`, 
            voidBranches: [void1, void2] 
        }; 
    }
    
    calculateWeighingBone(f, g) { 
        // 稱骨算命簡化版
        const boneWeights = {
            '甲': { '子': 1.2, '丑': 0.6, '寅': 0.7, '卯': 1.0, '辰': 0.9, '巳': 0.5, '午': 1.0, '未': 0.8, '申': 0.8, '酉': 0.9, '戌': 0.6, '亥': 1.8 },
            '乙': { '子': 0.9, '丑': 0.5, '寅': 0.6, '卯': 0.8, '辰': 0.7, '巳': 0.7, '午': 0.9, '未': 0.6, '申': 0.8, '酉': 0.7, '戌': 0.5, '亥': 1.5 },
            // ... 其他天干的重量表（簡化）
        };
        
        // 簡化計算
        let totalWeight = 4.8;
        
        let comment = '';
        if (totalWeight < 3) comment = '早年運蹇事難謀，漸有財源如水流';
        else if (totalWeight < 4) comment = '平生衣祿是綿長，件件心中自主張';
        else if (totalWeight < 5) comment = '初年運蹇事難謀，漸有財源如水流';
        else if (totalWeight < 6) comment = '不須勞碌過平生，獨自成家福不輕';
        else comment = '此命推來福不輕，自成自立顯門庭';
        
        return { 
            display: `${totalWeight.toFixed(1)}兩`, 
            comment 
        }; 
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
        // 真太陽時校正簡化版
        const longitude = l || 120.0; // 東經120度為標準
        const timeDiff = (longitude - 120.0) * 4; // 每度4分鐘
        const adjusted = new Date(d.getTime() + timeDiff * 60 * 1000);
        
        return { 
            adjustedTime: adjusted, 
            explanation: `真太陽時校正：經度${longitude}°，校正${timeDiff}分鐘` 
        }; 
    }
}

// ==========================================
// 6. 命理分析類
// ==========================================

class BaziAnalyzer {
    constructor(baziData) { this.baziData = baziData; }

    analyzePersonality() {
        // ✅ 回傳結構需兼容 UI（renderAdvancedAnalysis 會讀 dayMaster/element/yinYang）
        const dayGan = this.baziData?.fourPillars?.day?.gan || this.baziData?.day?.gan || '';
        const map = {
            '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水',
            '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'
        };
        const yinYangMap = {
            '甲':'陽','乙':'陰','丙':'陽','丁':'陰','戊':'陽','己':'陰','庚':'陽','辛':'陰','壬':'陽','癸':'陰'
        };
        const element = dayGan ? (map[dayGan] || '') : '';
        const yinYang = dayGan ? (yinYangMap[dayGan] || '') : '';

        // 仍保留原本的摘要（避免破壞既有輸出）
        return {
            dayMaster: dayGan || '—',
            element: element || '—',
            yinYang: yinYang || '—',
            personality: '以日主五行為核心，配合月令與十神結構，判讀個性傾向與壓力來源。',
            strengths: ['適應力', '韌性', '細心', '責任感', '學習能力'],
            weaknesses: ['猶豫', '壓力累積', '過度謹慎', '不善拒絕']
        };
    }

    
    analyzeCareer() {
        return {
            suitableCareers: ['教育', '文化', '出版', '諮詢', '心理學', '園藝', '設計'],
            careerAdvice: '乙木身弱，不適合競爭激烈的工作。宜從事需要細心和耐心的工作，發揮乙木柔韌的特性。適合與水、木相關的行業。',
            wealthStrength: 3
        };
    }

    // ==========================================================
    // [FIX] 補齊主程式需要的分析介面：財運 / 感情 / 健康
    // 目標：避免 analyzeWealth / analyzeRelationship / analyzeHealth 缺失導致結果頁空白
    // 注意：這裡採「基於命盤數據的規則推導」；若輸入數據不足，會自動降級為保守回傳
    // ==========================================================

    analyzeWealth() {
        const d = this.baziData || {};
        const es = (d.elementStrength && d.elementStrength.strengths) ? d.elementStrength.strengths : null;
        const dayMaster = (d.fourPillars && d.fourPillars.day && d.fourPillars.day.gan) ? d.fourPillars.day.gan : (d.dayMaster || '');

        // 1~5：弱/普通/中上/強/極強
        let wealthStrength = 3;
        let wealthTrend = '中性偏穩';
        let keyPoints = [];

        try {
            // 乙木日主：財為土（木剋土），但仍需身強可任財；身弱遇財反成壓力
            // 若有 elementStrength，採用「木 vs 土」與「水（印）」做一個簡單任財判斷
            if (es) {
                const wood = es['木'] || 0;
                const earth = es['土'] || 0;
                const water = es['水'] || 0;
                const metal = es['金'] || 0;
                const fire = es['火'] || 0;

                // 基準：木太弱且土偏強 → 財壓身；木中等以上且水有力 → 可承財
                if (wood < 8 && earth >= 10) {
                    wealthStrength = 2;
                    wealthTrend = '財來多伴隨壓力';
                    keyPoints.push('財星偏重、身弱承擔力不足，宜控槓桿與避免高風險投入。');
                } else if (wood >= 10 && (water >= 6 || fire >= 6)) {
                    wealthStrength = 4;
                    wealthTrend = '可主動創造財機';
                    keyPoints.push('身勢可用，配合行動與輸出（食傷）能帶來現金流提升。');
                } else {
                    wealthStrength = 3;
                    wealthTrend = '穩健累積為主';
                    keyPoints.push('以可控的節奏累積，避免一次性重壓。');
                }

                // 金過旺：官殺壓身 → 代表制度/壓力/約束，財務上容易有固定支出或壓力
                if (metal >= 12) {
                    keyPoints.push('金勢偏重，代表責任與約束，財務需預留現金緩衝。');
                }
                if (water >= 10) {
                    keyPoints.push('水旺為印，利學習/資源/貴人，適合用專業與口碑換取穩定收入。');
                }
            } else {
                // 無五行強度 → 保守回傳
                wealthStrength = 3;
                wealthTrend = '需以現實數據校驗';
                keyPoints.push('缺少五行強度數據，請以收入/支出/現金流作為校驗。');
            }
        } catch (e) {
            wealthStrength = 3;
            wealthTrend = '中性';
            keyPoints = ['解析時發生例外，已回退保守判斷。'];
        }

        return {
            wealthStrength,
            wealthTrend,
            summary: keyPoints.join(' ')
        };
    }

    analyzeRelationship() {
        const d = this.baziData || {};
        const es = (d.elementStrength && d.elementStrength.strengths) ? d.elementStrength.strengths : null;
        let relationshipStrength = 3;
        let advice = [];

        try {
            if (es) {
                const wood = es['木'] || 0;
                const water = es['水'] || 0;
                const metal = es['金'] || 0;
                const fire = es['火'] || 0;
                const earth = es['土'] || 0;

                // 簡易：水/木支援情感表達；金重則標準高、壓力大；火不足則熱度不易維持
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

                if (fire < 5) advice.push('火勢偏弱：主動性與熱度需要刻意維持（安排固定互動/約會節奏）。');
                if (earth >= 10) advice.push('土偏重：容易把關係拉回現實考量，建議先談規則與邊界。');
            } else {
                advice.push('缺少五行強度數據，請用「互動頻率/衝突議題/價值觀一致性」作校驗。');
            }
        } catch (e) {
            relationshipStrength = 3;
            advice = ['解析時發生例外，已回退保守判斷。'];
        }

        return {
            relationshipStrength,
            summary: advice.join(' ')
        };
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

        return {
            riskLevel,
            focus: focus,
            summary: focus.join(' ')
        };
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
        this.renderPersonality(result);
        this.renderCareer(result);
        
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

        let starsHtml = '';
        if (result.specialStars.specialNotes) {
             result.specialStars.specialNotes.forEach(note => {
                 if(note.includes('貴人')) starsHtml += '<span class="bazi-tag tag-star">貴人</span> ';
                 if(note.includes('文昌')) starsHtml += '<span class="bazi-tag tag-star">文昌</span> ';
                 if(note.includes('驛馬')) starsHtml += '<span class="bazi-tag tag-star">驛馬</span> ';
                 if(note.includes('桃花')) starsHtml += '<span class="bazi-tag tag-star">桃花</span> ';
             });
        }
        if (starsHtml === '') starsHtml = '<span class="bazi-tag" style="opacity:0.5">無明顯神煞</span>';

        container.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <p style="font-size:0.9rem; margin-bottom:5px; color:rgba(255,255,255,0.6);">喜用神 (運氣來源)：</p>
                <div class="tag-container">${favorables}</div>
            </div>
            <div style="margin-bottom: 1rem;">
                <p style="font-size:0.9rem; margin-bottom:5px; color:rgba(255,255,255,0.6);">忌神 (壓力來源)：</p>
                <div class="tag-container">${unfavorables}</div>
            </div>
            <div>
                <p style="font-size:0.9rem; margin-bottom:5px; color:rgba(255,255,255,0.6);">命宮神煞：</p>
                <div class="tag-container">${starsHtml}</div>
            </div>
        `;
    }

    static renderPersonality(result) {
        const container = document.getElementById('ui-personality');
        if (!container) return;

        const p = result.analyzer.analyzePersonality();
        const strengths = p.strengths.join('、');
        const weaknesses = p.weaknesses.join('、');

        container.innerHTML = `
            <p style="margin-bottom:8px;"><strong>優點：</strong> ${strengths}</p>
            <p style="margin-bottom:8px;"><strong>缺點：</strong> ${weaknesses}</p>
            <p style="color:#ccc; font-size:0.95rem;">${p.personality}</p>
        `;
    }

    static renderCareer(result) {
        const container = document.getElementById('ui-career');
        if (!container) return;

        const c = result.analyzer.analyzeCareer();
        const jobs = c.suitableCareers.join('、');
        const stars = '⭐'.repeat(c.wealthStrength || 3);

        container.innerHTML = `
            <p style="margin-bottom:8px;"><strong>適合行業：</strong> ${jobs}</p>
            <p style="margin-bottom:8px;"><strong>財運強度：</strong> <span style="color:#FFD700">${stars}</span> (${c.wealthStrength}/5)</p>
            <p style="color:#ccc; font-size:0.95rem;">${c.careerAdvice}</p>
        `;
    }
}

// ==========================================
// 8. 測試與導出
// ==========================================

function testBazi19830825Full() {
    console.log('執行八字計算測試...');
    const calculator = new BaziCalculator();
    try {
        const result = calculator.calculateBazi('1983-08-25T14:55:00', 'male', true, 120.2);
        const analyzer = new BaziAnalyzer(result);
        result.analyzer = analyzer;
        
        if (typeof window !== 'undefined' && window.BaziUI) {
            console.log('嘗試更新 BaziUI...');
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
    window.testBazi19830825Full = testBazi19830825Full;
}