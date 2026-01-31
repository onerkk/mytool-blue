/**
 * 通用八字吉凶判斷引擎 Universal Bazi Fortune Judgment Engine
 * 動態接受任意八字輸入，計算旺衰、喜忌神，量化大運／流年吉凶。
 * 無硬編碼特定日主或日期，適用所有 10 天干 × 12 地支。
 */
(function (global) {
    'use strict';

    var ELEMENTS = ['木', '火', '土', '金', '水'];
    var WUXING_SHENG = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
    var WUXING_KE = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };

    var STEM_TO_ELEMENT = {
        '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
        '庚': '金', '辛': '金', '壬': '水', '癸': '水'
    };
    var ZHI_TO_ELEMENT = {
        '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
        '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };
    var ZHI_HIDDEN_STEMS = {
        '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'], '卯': ['乙'],
        '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'], '午': ['丁', '己'], '未': ['己', '丁', '乙'],
        '申': ['庚', '壬', '戊'], '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
    };

    function getElement(stemOrZhi) {
        if (!stemOrZhi || stemOrZhi.length < 1) return null;
        return STEM_TO_ELEMENT[stemOrZhi[0]] || ZHI_TO_ELEMENT[stemOrZhi[0]] || null;
    }

    /**
     * Module 1: 旺衰計算模組
     * 得令 40% + 得地 30% + 得勢 30% → 總分 >= 50 身強，< 50 身弱
     * @param {Object} chart - { year, month, day, hour } 各 { gan, zhi }
     * @returns {{ strength: 'Strong'|'Weak', score: number, breakdown: Object }}
     */
    function calculateBodyStrength(chart) {
        if (!chart || !chart.day) return { strength: 'Weak', score: 0, breakdown: {} };
        var dmEl = getElement(chart.day.gan);
        if (!dmEl) return { strength: 'Weak', score: 0, breakdown: {} };

        var shengWo = Object.keys(WUXING_SHENG).find(function (k) { return WUXING_SHENG[k] === dmEl; });
        var keWo = WUXING_KE[dmEl];
        var woSheng = WUXING_SHENG[dmEl];
        var woKe = WUXING_KE[dmEl];

        var deLing = 0;  // 得令 40%: 月令生我/同我 +40, 克我/泄我/耗我 0
        var monthZhi = chart.month && chart.month.zhi ? chart.month.zhi : '';
        var monthEl = monthZhi ? getElement(monthZhi) : null;
        if (monthEl) {
            var monthShengDm = WUXING_SHENG[monthEl] === dmEl;
            if (monthEl === dmEl || monthShengDm) {
                deLing = 40;
            } else if (monthEl === keWo || monthEl === woSheng || monthEl === woKe) {
                deLing = 0;
            } else {
                deLing = 15;
            }
        } else {
            deLing = 20;
        }

        var deDi = 0;  // 得地 30%: 日支、年支、時支，Root/Resource +10 per valid branch
        var branches = [chart.day.zhi, chart.year && chart.year.zhi, chart.hour && chart.hour.zhi].filter(Boolean);
        branches.forEach(function (zhi) {
            var zEl = getElement(zhi);
            if (!zhi) return;
            var pts = 0;
            if (zEl === dmEl || zEl === shengWo) pts = 10;
            else {
                var hidden = ZHI_HIDDEN_STEMS[zhi];
                if (hidden) {
                    for (var h = 0; h < hidden.length; h++) {
                        var hEl = getElement(hidden[h]);
                        if (hEl === dmEl) { pts = 5; break; }
                        if (hEl === shengWo) { pts = 5; break; }
                    }
                }
            }
            deDi += pts;
        });
        deDi = Math.min(30, deDi);

        var deShi = 0;  // 得勢 30%: 年干、月干、時干（不含日干）
        var stems = [
            chart.year && chart.year.gan,
            chart.month && chart.month.gan,
            chart.hour && chart.hour.gan
        ].filter(Boolean);
        stems.forEach(function (gan) {
            var gEl = getElement(gan);
            if (!gEl) return;
            if (gEl === shengWo) deShi += 10;
            else if (gEl === dmEl) deShi += 10;
            else if (gEl === keWo) deShi -= 5;
            else if (gEl === woSheng) deShi -= 3;
            else if (gEl === woKe) deShi += 2;
        });
        deShi = Math.max(0, Math.min(30, deShi));

        var total = deLing + deDi + deShi;
        var strength = total >= 50 ? 'Strong' : 'Weak';

        return {
            strength: strength,
            score: total,
            breakdown: { deLing: deLing, deDi: deDi, deShi: deShi }
        };
    }

    /**
     * Module 2: 喜忌神動態選擇器
     * 依身強／身弱動態回傳五行的偏好分數
     * @param {string} strength - 'Strong' | 'Weak'
     * @param {string} dayMasterElement - 日主五行 '木'|'火'|'土'|'金'|'水'
     * @returns {Object} { 木: score, 火: score, ... } 約 -20 ~ +20
     */
    function getElementPreferences(strength, dayMasterElement) {
        var prefs = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
        if (!dayMasterElement || ELEMENTS.indexOf(dayMasterElement) < 0) return prefs;

        var shengWo = Object.keys(WUXING_SHENG).find(function (k) { return WUXING_SHENG[k] === dayMasterElement; });
        var keWo = WUXING_KE[dayMasterElement];
        var woSheng = WUXING_SHENG[dayMasterElement];
        var woKe = WUXING_KE[dayMasterElement];

        if (strength === 'Weak') {
            prefs[shengWo] = 20;      // 印 Resource - Top
            prefs[dayMasterElement] = 10; // 比劫 Companion - Secondary
            prefs[woSheng] = -5;      // 食傷 Output - Neutral/Mixed
            prefs[woKe] = -10;        // 財 Wealth - Taboo Secondary
            prefs[keWo] = -20;        // 官殺 Officer/Kill - Taboo Primary
        } else {
            prefs[keWo] = 20;         // 官殺 - Top Useful
            prefs[woSheng] = 10;      // 食傷 - Secondary
            prefs[woKe] = 5;          // 財 - Sustains Officer
            prefs[dayMasterElement] = -10; // 比劫 - Taboo Secondary
            prefs[shengWo] = -20;     // 印 - Taboo Primary (Worst)
        }
        return prefs;
    }

    /**
     * Module 3 & 4: 吉凶量化引擎 + 輸出格式化
     * PillarScore = StemScore * 0.4 + BranchScore * 0.6
     * @param {Object} pillar - { gan, zhi }
     * @param {Object} preferences - 五行分數映射
     * @returns {{ score: number, judgment: string, color: string }}
     */
    function evaluatePillar(pillar, preferences) {
        if (!pillar || !preferences) {
            return { score: 0, judgment: '平', color: 'gray' };
        }
        var stemEl = getElement(pillar.gan);
        var zhiEl = getElement(pillar.zhi);
        var stemScore = (stemEl && preferences[stemEl] != null) ? preferences[stemEl] : 0;
        var zhiScore = (zhiEl && preferences[zhiEl] != null) ? preferences[zhiEl] : 0;
        var score = stemScore * 0.4 + zhiScore * 0.6;

        var judgment, color;
        if (score > 12) {
            judgment = '大吉';
            color = 'green';
        } else if (score > 1) {
            judgment = '吉';
            color = 'teal';
        } else if (score >= -5) {
            judgment = '平';
            color = 'gray';
        } else if (score >= -12) {
            judgment = '凶';
            color = 'orange';
        } else {
            judgment = '大凶';
            color = 'red';
        }

        return { score: Math.round(score * 100) / 100, judgment: judgment, color: color };
    }

    /**
     * 便捷：依八字圖直接評估單一干支柱
     * @param {Object} chart
     * @param {Object} pillar - { gan, zhi }
     */
    function evaluatePillarFromChart(chart, pillar) {
        var bs = calculateBodyStrength(chart);
        var dmEl = chart.day && chart.day.gan ? getElement(chart.day.gan) : null;
        if (!dmEl) return { score: 0, judgment: '平', color: 'gray', strength: bs.strength };
        var prefs = getElementPreferences(bs.strength, dmEl);
        var out = evaluatePillar(pillar, prefs);
        out.strength = bs.strength;
        out.preferences = prefs;
        return out;
    }

    var FortuneJudgmentEngine = {
        calculateBodyStrength: calculateBodyStrength,
        getElementPreferences: getElementPreferences,
        evaluatePillar: evaluatePillar,
        evaluatePillarFromChart: evaluatePillarFromChart,
        ELEMENTS: ELEMENTS,
        getElement: getElement
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = FortuneJudgmentEngine;
    } else {
        global.FortuneJudgmentEngine = FortuneJudgmentEngine;
    }
})(typeof window !== 'undefined' ? window : this);
