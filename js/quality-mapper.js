/**
 * 大運流年品質映射（與 utils/quality_mapper.py 對齊）
 * 支援 Cycle / YunShiAnalysis 風格的物件或純 Dict；level 優先，其次 score。
 */

(function (global) {
    'use strict';

    var DEFAULT_MAPPING = {
        level_mapping: {
            '大吉': { label: '大優', class: 'excellent', score_threshold: 3.0 },
            '中吉': { label: '優', class: 'good', score_threshold: 1.5 },
            '小吉': { label: '小優', class: 'neutral-good', score_threshold: 0.5 },
            '平':   { label: '平', class: 'neutral', score_threshold: 0.0 },
            '小凶': { label: '小劣', class: 'warning', score_threshold: -0.5 },
            '中凶': { label: '劣', class: 'bad', score_threshold: -1.5 },
            '大凶': { label: '大劣', class: 'danger', score_threshold: -3.0 }
        },
        score_mapping: [
            { min: 3.0, max: 5.0, label: '大優', class: 'excellent-bright' },
            { min: 1.5, max: 3.0, label: '優', class: 'excellent' },
            { min: 0.5, max: 1.5, label: '小優', class: 'good' },
            { min: -0.5, max: 0.5, label: '平', class: 'neutral' },
            { min: -1.5, max: -0.5, label: '小劣', class: 'warning' },
            { min: -3.0, max: -1.5, label: '劣', class: 'bad' },
            { min: -5.0, max: -3.0, label: '大劣', class: 'danger' }
        ]
    };

    var DEFAULT_QUALITY = { label: '平', class: 'neutral' };

    function mapByLevel(level) {
        var m = DEFAULT_MAPPING.level_mapping;
        if (level && m[level]) {
            return { label: m[level].label, class: m[level].class };
        }
        return DEFAULT_QUALITY;
    }

    function mapByScore(score) {
        var list = DEFAULT_MAPPING.score_mapping;
        var s = Number(score);
        if (s !== s) return DEFAULT_QUALITY;
        for (var i = 0; i < list.length; i++) {
            var r = list[i];
            if (r.min <= s && s < r.max) {
                return { label: r.label, class: r.class };
            }
        }
        return DEFAULT_QUALITY;
    }

    /**
     * 統一入口：支援 Cycle / YunShiAnalysis 風格或 Dict。
     * 優先 level，其次 score；皆無則 fallback。
     * @param {Object} cycle - { level?, score?, ... } 或 Cycle-like
     * @param {{ label: string, class: string }} [fallback]
     * @returns {{ label: string, class: string }}
     */
    function getCycleQuality(cycle, fallback) {
        var fb = fallback || DEFAULT_QUALITY;
        if (cycle == null) return fb;
        var level = cycle.level;
        if (typeof level === 'string' && level.length) {
            return mapByLevel(level) || fb;
        }
        if (typeof cycle.score === 'number' || (typeof cycle.score === 'string' && cycle.score !== '')) {
            return mapByScore(cycle.score);
        }
        return fb;
    }

    function getCycleQualityByLevel(level) {
        return mapByLevel(level);
    }

    function mapScoreToQuality(score) {
        return mapByScore(score);
    }

    /**
     * 更新映射配置（與 Python update_mapping 對齊）
     * @param {Object} config - 可含 level_mapping、score_mapping 等
     */
    function updateMapping(config) {
        if (config && typeof config === 'object') {
            if (config.level_mapping) DEFAULT_MAPPING.level_mapping = config.level_mapping;
            if (config.score_mapping) DEFAULT_MAPPING.score_mapping = config.score_mapping;
            if (config.DEFAULT_MAPPING) {
                if (config.DEFAULT_MAPPING.level_mapping) DEFAULT_MAPPING.level_mapping = config.DEFAULT_MAPPING.level_mapping;
                if (config.DEFAULT_MAPPING.score_mapping) DEFAULT_MAPPING.score_mapping = config.DEFAULT_MAPPING.score_mapping;
            }
        }
    }

    /** 天干→五行（用於五行生克） */
    var WUXING_GAN = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
    /** 五行生克：生、克、被生、被克 */
    var SHENGKE = {
        '金': { '生': '水', '克': '木', '被生': '土', '被克': '火' },
        '木': { '生': '火', '克': '土', '被生': '水', '被克': '金' },
        '水': { '生': '木', '克': '火', '被生': '金', '被克': '土' },
        '火': { '生': '土', '克': '金', '被生': '木', '被克': '水' },
        '土': { '生': '金', '克': '水', '被生': '火', '被克': '木' }
    };
    /** 生克→評分（與 yunshi_analyzer 對齊） */
    var SHENGKE_SCORE = { '生我': 3.0, '同我': 1.0, '我克': 0.5, '我生': -1.0, '克我': -2.0 };

    /**
     * 依日主與大運天干五行生克計算評分，用於 getCycleQuality(cycle) 的 score。
     * 大運以天干五行為主；有日主時必用此取代 levelFromGanzhi，避免全部顯示「平」。
     * @param {string} gan - 大運天干
     * @param {string} zhi - 大運地支（未用，保留擴充）
     * @param {string} dayMaster - 日主天干
     * @returns {number} score 約 -5～5
     */
    function computeDayunScore(gan, zhi, dayMaster) {
        var dm = ((dayMaster || '') + '')[0] || '';
        var g = ((gan || '') + '')[0] || '';
        if (!dm || !g) return 0;
        var dw = WUXING_GAN[dm];
        var gw = WUXING_GAN[g];
        if (!dw || !gw) return 0;
        var rel;
        if (dw === gw) rel = '同我';
        else if (SHENGKE[dw] && SHENGKE[dw]['被生'] === gw) rel = '生我';
        else if (SHENGKE[dw] && SHENGKE[dw]['生'] === gw) rel = '我生';
        else if (SHENGKE[dw] && SHENGKE[dw]['克'] === gw) rel = '我克';
        else if (SHENGKE[dw] && SHENGKE[dw]['被克'] === gw) rel = '克我';
        else rel = '';
        return SHENGKE_SCORE[rel] != null ? SHENGKE_SCORE[rel] : 0;
    }

    /**
     * 簡易 干支→level；僅 12 組對照，其餘 '平'。有日主時請用 computeDayunScore + score 取代。
     */
    function levelFromGanzhi(gan, zhi) {
        var key = (gan || '') + (zhi || '');
        var map = {
            '甲子': '小吉', '乙丑': '小凶', '丙寅': '小吉', '丁卯': '小吉',
            '戊辰': '小吉', '己巳': '小吉', '庚午': '小凶', '辛未': '小吉',
            '壬申': '小吉', '癸酉': '小吉', '甲戌': '小凶', '乙亥': '小吉'
        };
        return map[key] || '平';
    }

    /**
     * 生成周期 HTML；支援 Cycle 的 age_range / year_range 或 ageStart–ageEnd。
     */
    function createDayunCycleHTML(cycle, quality, options) {
        options = options || {};
        var isCurrent = options.is_current != null ? options.is_current : (cycle.is_current || cycle.current);
        var showBadge = options.showCurrentBadge !== false && !!isCurrent;
        var ageStart = cycle.ageStart != null ? cycle.ageStart : (cycle.age_start != null ? cycle.age_start : null);
        var ageEnd = cycle.ageEnd != null ? cycle.ageEnd : (cycle.age_end != null ? cycle.age_end : null);
        var ageRange = cycle.age_range;
        var ageStr = '';
        if (ageRange && typeof ageRange === 'string') {
            ageStr = ageRange.replace('-', '\u2013') + '\u6b72';
        } else if (ageStart != null && ageEnd != null) {
            ageStr = ageStart + '\u2013' + ageEnd + '\u6b72';
        }
        var badge = showBadge ? '<span class="dayun-current-badge">\u7576\u4e0b\u5927\u904b</span>' : '';
        var q = quality || getCycleQuality(cycle);
        var qClass = (q && q.class) ? q.class : 'neutral';
        var qLabel = (q && q.label) ? q.label : '\u5e73';
        var gan = cycle.gan != null ? cycle.gan : (cycle.ganzhi ? cycle.ganzhi[0] : '');
        var zhi = cycle.zhi != null ? cycle.zhi : (cycle.ganzhi && cycle.ganzhi.length > 1 ? cycle.ganzhi[1] : '');
        return '<div class="dayun-item' + (showBadge ? ' dayun-item--current' : '') + '">' +
            badge +
            '<div class="age">' + ageStr + '</div>' +
            '<div class="pillar"><div>' + gan + '</div><div>' + zhi + '</div></div>' +
            '<span class="dayun-quality dayun-quality--' + qClass + '">' + qLabel + '</span>' +
            '</div>';
    }

    var QualityMapper = {
        getCycleQuality: getCycleQuality,
        getCycleQualityByLevel: getCycleQualityByLevel,
        mapScoreToQuality: mapScoreToQuality,
        mapByLevel: mapByLevel,
        mapByScore: mapByScore,
        updateMapping: updateMapping,
        levelFromGanzhi: levelFromGanzhi,
        computeDayunScore: computeDayunScore,
        createDayunCycleHTML: createDayunCycleHTML,
        DEFAULT_QUALITY: DEFAULT_QUALITY,
        DEFAULT_MAPPING: DEFAULT_MAPPING
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = QualityMapper;
    } else {
        global.QualityMapper = QualityMapper;
    }
})(typeof window !== 'undefined' ? window : this);
