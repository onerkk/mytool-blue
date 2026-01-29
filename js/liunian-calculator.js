/**
 * 流年計算模組 LiuNianCalculator
 * 架構：大運流年正確計算架構指南 — 流年計算模組
 *
 * - 流年：逐年干支（以立春換年）
 * - 流月：月干支（節氣劃分）
 * - 流日：日干支（六十甲子循環）
 * - 流時：時干支（日上起時）
 */
(function (global) {
    'use strict';

    var STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    var BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    var JIAZI = [
        '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
        '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
        '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
        '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
        '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
        '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
    ];

    /** 五鼠遁日起時表 */
    var DAY_STEM_HOUR_STEM_START = { '甲': 0, '己': 0, '乙': 2, '庚': 2, '丙': 4, '辛': 4, '丁': 6, '壬': 6, '戊': 8, '癸': 8 };

    function mod(n, m) { return ((n % m) + m) % m; }

    /**
     * 儒略日（簡化）→ 日干支索引 0–59
     * 基準：已知某日干支，可推前後。
     * 簡化：以 2000-01-01 為 庚辰日 (index 16) 作基準推算。
     */
    function jdOffset(y, m, d) {
        var a = Math.floor((14 - m) / 12);
        var yy = y + 4800 - a;
        var mm = m + 12 * a - 3;
        var jd = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
        return jd;
    }

    var J2000_JD = 2451545;
    var J2000_GANZHI_INDEX = 16;

    function dayGanZhiIndex(y, m, d) {
        var jd = jdOffset(y, m, d);
        return mod(J2000_GANZHI_INDEX + (jd - J2000_JD), 60);
    }

    function LiuNianCalculator(opts) {
        this.solar = (opts && opts.solarCalculator) || (typeof SolarTermCalculator !== 'undefined' ? new SolarTermCalculator() : null);
    }

    /**
     * 流年干支（依公曆年；若具節氣資料則以立春換年更精確）
     * @param {number} year - 公曆年
     * @param {Object} [solarTerms] - 該年節氣（可選）
     */
    LiuNianCalculator.prototype.getYearGanZhi = function (year) {
        var idx = mod((year - 4), 60);
        return JIAZI[idx];
    };

    /** 五虎遁月：甲己年丙寅月，乙庚年戊寅月，丙辛年庚寅月，丁壬年壬寅月，戊癸年甲寅月 */
    var MONTH_STEM_START = { '甲': 2, '己': 2, '乙': 4, '庚': 4, '丙': 6, '辛': 6, '丁': 8, '壬': 8, '戊': 0, '癸': 0 };

    /**
     * 流月干支（節氣月）
     * 寅月=正月…丑月=臘月；簡化依公曆月份近似。
     */
    LiuNianCalculator.prototype.getMonthGanZhi = function (year, month) {
        var yearGz = this.getYearGanZhi(year);
        var yg = yearGz[0];
        var yi = STEMS.indexOf(yg);
        var monthBranchIndex = mod(month - 1, 12);
        var firstStem = MONTH_STEM_START[yg] != null ? MONTH_STEM_START[yg] : (yi * 2 + 2) % 10;
        var monthStemIndex = mod(firstStem + monthBranchIndex, 10);
        return STEMS[monthStemIndex] + BRANCHES[monthBranchIndex];
    };

    /**
     * 流日干支
     */
    LiuNianCalculator.prototype.getDayGanZhi = function (year, month, day) {
        var i = dayGanZhiIndex(year, month, day);
        return JIAZI[i];
    };

    /**
     * 流時干支（日上起時）
     */
    LiuNianCalculator.prototype.getHourGanZhi = function (dayGan, hour) {
        var h = typeof hour === 'number' ? hour : parseInt(hour, 10);
        if (isNaN(h) || h < 0 || h > 23) return null;
        var branchIndex = Math.floor(((h + 1) % 24) / 2);
        var start = DAY_STEM_HOUR_STEM_START[dayGan];
        if (start == null) start = 0;
        var stemIndex = mod(start + branchIndex, 10);
        return STEMS[stemIndex] + BRANCHES[branchIndex];
    };

    /**
     * 取得某日流時列表（子丑寅…亥）
     */
    LiuNianCalculator.prototype.getDayHourGanZhiList = function (dayGan) {
        var out = [];
        for (var zi = 0; zi < 12; zi++) {
            var start = DAY_STEM_HOUR_STEM_START[dayGan] != null ? DAY_STEM_HOUR_STEM_START[dayGan] : 0;
            var si = mod(start + zi, 10);
            out.push(STEMS[si] + BRANCHES[zi]);
        }
        return out;
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { LiuNianCalculator: LiuNianCalculator };
    } else {
        global.LiuNianCalculator = LiuNianCalculator;
    }
})(typeof window !== 'undefined' ? window : this);
