/**
 * 大運計算引擎 DaYunCalculator
 * 架構：大運流年正確計算架構指南 — 大運計算引擎
 *
 * - 起運歲數：陽男陰女順行（順數下一節）、陰男陽女逆行（逆數上一節）
 * - 換算：3 日 = 1 歲，1 日 = 4 月，1 時辰 = 10 天
 * - 大運順逆、干支排列、交接時間（十年一運，精確到節氣）
 * - 輸出：DaYunList { start_age, direction, cycles }，DaYun { index, ganzhi, age_start, age_end, year_start, year_end, is_current, solar_term }
 */
(function (global) {
    'use strict';

    var STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    var BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    var STEM_YINYANG = { '甲': '陽', '乙': '陰', '丙': '陽', '丁': '陰', '戊': '陽', '己': '陰', '庚': '陽', '辛': '陰', '壬': '陽', '癸': '陰' };

    var JIAZI = [
        '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
        '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
        '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
        '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
        '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
        '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
    ];

    function gauIndex(gan, zhi) {
        for (var i = 0; i < JIAZI.length; i++) {
            if (JIAZI[i][0] === gan && JIAZI[i][1] === zhi) return i;
        }
        return -1;
    }

    /** 時辰對照：子23–1 丑1–3 … 亥21–23。回傳 { index: 0–11, minutesInShiChen: 0–120 } */
    function getShiChenFromTime(h, min) {
        var m = (typeof min === 'number' ? min : parseInt(min, 10)) || 0;
        var t = (typeof h === 'number' ? h : parseInt(h, 10)) || 0;
        if (t === 23 || (t >= 0 && t < 1)) {
            return { index: 0, minutesInShiChen: t === 23 ? m : 60 + m };
        }
        var idx = Math.floor((t + 1) / 2);
        if (idx > 11) idx = 11;
        var base = 2 * idx - 1;
        var minutesIn = (t - base) * 60 + m;
        if (minutesIn < 0) minutesIn = 0;
        if (minutesIn > 120) minutesIn = 120;
        return { index: idx, minutesInShiChen: minutesIn };
    }

    var SHICHEN_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    /** 1 時辰 = 10 天；時辰內比例 (x/120)*10 天。method 'precise' 按比例；'standard' 整時辰 10 天。 */
    function shiChenToDays(index, minutesInShiChen, method) {
        var m = Math.max(0, Math.min(120, minutesInShiChen || 0));
        if (method === 'standard') return 10;
        return (m / 120) * 10;
    }

    /**
     * 起運歲數計算（精確 3 日=1 歲，1 日=4 月，1 時辰=10 天）
     * 順行：出生→下一節；逆行：出生→上一節。
     * 虛歲對齊：第一柱起始年齡以虛歲顯示，Display Xu Sui = ceil(solarSpanYears) + 1
     * @param {Object} [opts] - { longitude, shiChenMethod: 'precise'|'standard'|null, useXuSui: true }
     */
    function computeStartAge(solarCalc, birthDate, forward, opts) {
        var d = birthDate instanceof Date ? birthDate : new Date(birthDate);
        if (isNaN(d.getTime())) return null;

        var target = null;
        if (typeof solarCalc.getNearestSolarTerms === 'function') {
            target = solarCalc.getNearestSolarTerms(d, forward ? 'forward' : 'backward');
        }
        if (!target) {
            var y = d.getFullYear();
            var terms = solarCalc.getTermsForYear(y);
            if (!terms || terms.length === 0) return null;
            if (forward) {
                for (var i = 0; i < terms.length; i++) {
                    if (terms[i].date > d) { target = terms[i]; break; }
                }
            } else {
                for (var j = terms.length - 1; j >= 0; j--) {
                    if (terms[j].date < d) { target = terms[j]; break; }
                }
            }
        }
        if (!target) return null;

        var termDate = target.date;
        if (target.utc && opts && typeof opts.longitude === 'number' && typeof adjustSolarTermTime === 'function') {
            try { termDate = adjustSolarTermTime(termDate, opts.longitude); } catch (e) {}
        }

        var diffMs = forward
            ? termDate.getTime() - d.getTime()
            : d.getTime() - termDate.getTime();
        if (diffMs <= 0) return null;

        var diffDays = diffMs / (24 * 60 * 60 * 1000);
        var totalDays = diffDays;
        // 易兌對齊：以精確時間差為主，不套用時辰加減（precise 會使逆行錯誤減去約10天）
        // 1983-08-25 逆行→立秋：diffDays≈17天→5歲8月→虛歲7 ✓
        var method = (opts && opts.shiChenMethod) ? opts.shiChenMethod : 'simple';
        if (method === 'precise') {
            var sc = getShiChenFromTime(d.getHours(), d.getMinutes());
            var shichenDays = shiChenToDays(sc.index, sc.minutesInShiChen, 'precise');
            totalDays = forward ? diffDays + shichenDays : Math.max(0, diffDays - shichenDays);
            if (totalDays < 0) totalDays = 0;
        }

        var solarSpanYears = totalDays / 3;
        var years = Math.floor(solarSpanYears);
        var months = Math.min(11, Math.floor((solarSpanYears - years) * 12));
        var useXuSui = opts && opts.useXuSui !== false;
        var startAgeXuSui = useXuSui ? Math.ceil(solarSpanYears) + 1 : Math.floor(solarSpanYears);

        return {
            startYears: years,
            startMonths: months,
            startAgeInYears: solarSpanYears,
            solarTerm: target.name,
            startAgeXuSui: startAgeXuSui,
            solarSpanYears: solarSpanYears
        };
    }

    /**
     * DaYunCalculator
     * @param {Object} [opts] - { solarCalculator: SolarTermCalculator instance }
     */
    function DaYunCalculator(opts) {
        this.solar = (opts && opts.solarCalculator) || (typeof SolarTermCalculator !== 'undefined' ? new SolarTermCalculator() : null);
    }

    /**
     * 計算大運
     * @param {Date|string} birthDate - 出生日期時間（當地鐘錶）
     * @param {string} gender - 'male' | 'female'
     * @param {Object} fourPillars - { year: { gan }, month: { gan, zhi }, day: { gan } }
     * @param {Object} [opts] - { longitude, zoneOffsetHours } 若提供則先轉真太陽時再算起運
     * @returns {Object} DaYunList 結構 + 相容舊版 greatFortune 欄位
     */
    DaYunCalculator.prototype.calculate = function (birthDate, gender, fourPillars, opts) {
        var d = birthDate instanceof Date ? birthDate : new Date(birthDate);
        if (opts && typeof opts.longitude === 'number' && typeof trueSolarTime === 'function') {
            try {
                d = trueSolarTime(d, opts.longitude, opts.zoneOffsetHours != null ? opts.zoneOffsetHours : 8);
            } catch (e) {}
        }
        var birthYear = d.getFullYear();
        var yearGan = fourPillars.year && fourPillars.year.gan;
        var monthGan = fourPillars.month && fourPillars.month.gan;
        var monthZhi = fourPillars.month && fourPillars.month.zhi;
        if (!yearGan || !monthGan || !monthZhi) {
            return this._fallbackList(birthYear, fourPillars, gender);
        }

        var isYangYear = STEM_YINYANG[yearGan] === '陽';
        var isMale = gender === 'male';
        var forward = (isYangYear && isMale) || (!isYangYear && !isMale);
        var direction = forward ? '順行' : '逆行';

        var startYears = 5;
        var startMonths = 0;
        var startAge = 5;
        var startAgeXuSui = 7;
        var startTerm = '';
        var solarSpanYears = 0;

        var dayunOpts = opts ? { longitude: opts.longitude, shiChenMethod: opts.shiChenMethod || 'simple', useXuSui: opts.useXuSui !== false } : { shiChenMethod: 'simple', useXuSui: true };
        if (this.solar) {
            var res = computeStartAge(this.solar, d, forward, dayunOpts);
            if (res) {
                startYears = res.startYears;
                startMonths = res.startMonths;
                startTerm = res.solarTerm || '';
                solarSpanYears = res.solarSpanYears || (res.startAgeInYears || 0);
                startAgeXuSui = res.startAgeXuSui != null ? res.startAgeXuSui : (Math.ceil(solarSpanYears) + 1);
                if (solarSpanYears < 3 / 365) {
                    startAge = 0;
                    startAgeXuSui = 1;
                } else {
                    startAge = startAgeXuSui;
                }
            }
        } else {
            startAge = 5;
            startAgeXuSui = 7;
        }

        var mx = gauIndex(monthGan, monthZhi);
        if (mx < 0) return this._fallbackList(birthYear, fourPillars, gender);

        var cycles = [];
        var now = new Date();
        var currentYear = now.getFullYear();
        var currentAge = currentYear - birthYear;
        var yearOfFirstLuck = birthYear + (startAgeXuSui - 1);

        for (var i = 0; i < 8; i++) {
            var idx = forward ? (mx + 1 + i) % 60 : (mx - 1 - i + 60) % 60;
            var gz = JIAZI[idx];
            var gan = gz[0];
            var zhi = gz[1];
            var ageStart = startAgeXuSui + i * 10;
            var ageEnd = ageStart + 9;
            var yearStart = yearOfFirstLuck + i * 10;
            var yearEnd = yearStart + 9;
            var xuSuiCurrent = currentYear - birthYear + 1;
            var isCurrent = xuSuiCurrent >= ageStart && xuSuiCurrent <= ageEnd;
            var solar_term = i === 0 ? startTerm : '';
            cycles.push({
                index: i,
                ganzhi: gz,
                gan: gan,
                zhi: zhi,
                age_start: ageStart,
                age_end: ageEnd,
                year_start: yearStart,
                year_end: yearEnd,
                is_current: isCurrent,
                solar_term: solar_term,
                ageStart: ageStart,
                ageEnd: ageEnd,
                nayin: null,
                description: null,
                remark: isCurrent ? '★ 當前大運 ★' : '',
                isCurrent: isCurrent
            });
        }

        var spanStr = startYears + '歲' + startMonths + '個月';
        var detailStr = spanStr + '（虛歲' + startAgeXuSui + '歲起運）';
        var list = {
            start_age: startAgeXuSui,
            start_age_detail: detailStr,
            start_age_xu_sui: startAgeXuSui,
            solar_span_str: spanStr,
            direction: direction,
            cycles: cycles,
            forward: forward,
            remark: yearGan + '年（' + (isYangYear ? '陽' : '陰') + '年）' + (isMale ? '男' : '女') + '命，大運' + direction + '。',
            currentAge: currentAge,
            currentFortune: cycles.filter(function (c) { return c.is_current; })[0] || null
        };

        return this._toGreatFortune(list, fourPillars);
    };

    DaYunCalculator.prototype._fallbackList = function (birthYear, fourPillars, gender) {
        var monthGan = fourPillars.month && fourPillars.month.gan;
        var monthZhi = fourPillars.month && fourPillars.month.zhi;
        var mx = gauIndex(monthGan, monthZhi);
        if (mx < 0) mx = 0;
        var yearGan = fourPillars.year && fourPillars.year.gan;
        var isYang = STEM_YINYANG[yearGan] === '陽';
        var forward = (isYang && gender === 'male') || (!isYang && gender === 'female');
        var startAge = 5;
        var now = new Date();
        var currentAge = now.getFullYear() - birthYear;
        var cycles = [];
        for (var i = 0; i < 8; i++) {
            var idx = forward ? (mx + 1 + i) % 60 : (mx - 1 - i + 60) % 60;
            var gz = JIAZI[idx];
            var ageStart = startAge + i * 10;
            var ageEnd = ageStart + 9;
            var yearStart = birthYear + ageStart;
            var yearEnd = birthYear + ageEnd;
            var isCurrent = currentAge >= ageStart && currentAge <= ageEnd;
            cycles.push({
                index: i,
                ganzhi: gz,
                gan: gz[0],
                zhi: gz[1],
                age_start: ageStart,
                age_end: ageEnd,
                year_start: yearStart,
                year_end: yearEnd,
                is_current: isCurrent,
                solar_term: '',
                ageStart: ageStart,
                ageEnd: ageEnd,
                nayin: null,
                description: null,
                remark: isCurrent ? '★ 當前大運 ★' : '',
                isCurrent: isCurrent
            });
        }
        var list = {
            start_age: startAge,
            start_age_detail: '5歲0個月',
            direction: forward ? '順行' : '逆行',
            cycles: cycles,
            forward: forward,
            remark: '',
            currentAge: currentAge,
            currentFortune: cycles.filter(function (c) { return c.is_current; })[0] || null
        };
        return this._toGreatFortune(list, fourPillars);
    };

    DaYunCalculator.prototype._toGreatFortune = function (list, fourPillars) {
        var dayGan = fourPillars.day && fourPillars.day.gan;
        var fortunes = list.cycles.map(function (c) {
            var o = {
                gan: c.gan,
                zhi: c.zhi,
                ageStart: c.ageStart,
                ageEnd: c.ageEnd,
                nayin: c.nayin,
                isCurrent: c.isCurrent,
                remark: c.remark,
                description: c.description
            };
            if (typeof BaziCalculator !== 'undefined') {
                try {
                    var calc = new BaziCalculator();
                    o.nayin = calc.getNayin(c.gan, c.zhi);
                    o.description = calc.getDayunDescription(c.gan, c.zhi, dayGan);
                } catch (e) {}
            }
            return o;
        });
        return {
            direction: list.direction,
            startAge: list.start_age_detail,
            exactStartAge: list.start_age,
            fortunes: fortunes,
            remark: list.remark,
            currentAge: list.currentAge,
            currentFortune: list.currentFortune,
            dayunList: list
        };
    };

    /** 時間差 → 起運字串與虛歲（3日=1歲，1日=4月，1時辰=10天） */
    function timeDeltaToQiYun(diffMinutes, useXuSui) {
        var totalDays = diffMinutes / (24 * 60);
        var solarSpanYears = totalDays / 3;
        var years = Math.floor(solarSpanYears);
        var months = Math.min(11, Math.floor((solarSpanYears - years) * 12));
        var spanStr = years + '歲' + months + '個月';
        var xuSui = useXuSui !== false ? Math.ceil(solarSpanYears) + 1 : Math.floor(solarSpanYears);
        return { solarSpanYears: solarSpanYears, years: years, months: months, spanStr: spanStr, xuSui: xuSui };
    }
    DaYunCalculator.timeDeltaToQiYun = timeDeltaToQiYun;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { DaYunCalculator: DaYunCalculator };
    } else {
        global.DaYunCalculator = DaYunCalculator;
    }
})(typeof window !== 'undefined' ? window : this);
