/**
 * 節氣計算系統 SolarTermCalculator
 * 架構：節氣依天文公式計算，適用 1900–2100，無須逐年手動建檔。
 *
 * - 優先使用 lunar-javascript 公式計算（精確到分）
 * - fallback：getApproximateJieForYear（近似日，0時0分）
 * - 12 節（大運起運）：小寒、立春、驚蟄、清明、立夏、芒種、小暑、立秋、白露、寒露、立冬、大雪
 */
(function (global) {
    'use strict';

    var JIE_NAMES = [
        '小寒', '立春', '驚蟄', '清明', '立夏', '芒種',
        '小暑', '立秋', '白露', '寒露', '立冬', '大雪'
    ];

    /** lunar-javascript 節氣名對照（繁簡體） */
    var JIE_TO_LUNAR = { '小寒':'小寒','立春':'立春','驚蟄':'惊蛰','清明':'清明','立夏':'立夏','芒種':'芒种','小暑':'小暑','立秋':'立秋','白露':'白露','寒露':'寒露','立冬':'立冬','大雪':'大雪' };

    /** 備用：手動覆寫（僅在 lunar 失敗且需校正時使用） */
    var TERM_DB = {};

    /** 使用 lunar-javascript 取得某年 12 節精確時刻（北京時間）。若失敗回傳 []。 */
    function getTermsFromLunar(year) {
        var LunarObj = (typeof Lunar !== 'undefined' && Lunar) ? Lunar : (typeof window !== 'undefined' && window.Lunar) ? window.Lunar : null;
        if (!LunarObj || typeof LunarObj.fromYmd !== 'function') return [];
        try {
            var lunar = LunarObj.fromYmd(year, 1, 1);
            var table = lunar.getJieQiTable ? lunar.getJieQiTable() : (lunar.getJieQi && lunar.getJieQi());
            if (!table || typeof table !== 'object') return [];
            var out = [];
            for (var i = 0; i < JIE_NAMES.length; i++) {
                var name = JIE_NAMES[i];
                var key = JIE_TO_LUNAR[name] || name;
                var solar = table[key] || table[name];
                if (solar && solar.getYear && solar.getMonth) {
                    var dt = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), solar.getHour() || 0, solar.getMinute() || 0, solar.getSecond() || 0, 0);
                    if (!isNaN(dt.getTime())) out.push({ name: name, date: dt });
                }
            }
            return out;
        } catch (e) { return []; }
    }

    function mergeDataJsTerms() {
        if (typeof BAZI_DATA === 'undefined' || !BAZI_DATA.solarTerms) return;
        var ys = [2024, 2025, 2026];
        for (var i = 0; i < ys.length; i++) {
            var y = ys[i];
            var row = BAZI_DATA.solarTerms[y];
            if (!row) continue;
            if (!TERM_DB[y]) TERM_DB[y] = {};
            for (var j = 0; j < JIE_NAMES.length; j++) {
                var name_1 = JIE_NAMES[j];
                var v = row[name_1];
                if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
                    var parts = v.split('-');
                    TERM_DB[y][name_1] = [parseInt(parts[1], 10), parseInt(parts[2], 10), 0, 0];
                }
            }
        }
    }

    function parseToDate(year, val) {
        if (Array.isArray(val)) {
            var m = val[0], d = val[1], h = val[2] || 0, min = val[3] || 0;
            return new Date(year, m - 1, d, h, min, 0, 0);
        }
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
            var p = val.split('-');
            return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10), 0, 0, 0, 0);
        }
        return null;
    }

    /** ISO UTC "YYYY-MM-DDTHH:mm:ssZ" → Date */
    function parseIsoUtc(s) {
        if (typeof s !== 'string') return null;
        var d = new Date(s);
        return d && !isNaN(d.getTime()) ? d : null;
    }

    var TERM_JSON = {};
    function mergeTermJson() {
        if (typeof SOLAR_TERMS_JSON !== 'undefined' && SOLAR_TERMS_JSON && typeof SOLAR_TERMS_JSON === 'object') {
            for (var k in SOLAR_TERMS_JSON) if (Object.prototype.hasOwnProperty.call(SOLAR_TERMS_JSON, k)) {
                TERM_JSON[k] = SOLAR_TERMS_JSON[k];
            }
        }
    }

    /**
     * SolarTermCalculator
     */
    function SolarTermCalculator() {
        mergeDataJsTerms();
        mergeTermJson();
    }

    SolarTermCalculator.prototype.JIE_NAMES = JIE_NAMES;

    /** 從 JSON 格式載入節氣。obj 同 SOLAR_TERMS_JSON：{ "年": { "節名": "YYYY-MM-DDTHH:mm:ssZ" } } */
    SolarTermCalculator.prototype.loadFromJson = function (obj) {
        if (!obj || typeof obj !== 'object') return;
        for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
            TERM_JSON[k] = obj[k];
        }
    };

    /**
     * 無精確資料時：依年份用近似公式產出 12 節（大運起運用），使不同八字得到不同起運。
     * 基準日參考常見曆書；日差依 (year-2000)*0.2422 取整後微調，使每年節氣日有 0～1 日變化。
     */
    function getApproximateJieForYear(year) {
        var y = parseInt(year, 10);
        if (isNaN(y) || y < 1900 || y > 2100) return [];
        var base = [
            { name: '小寒', month: 1, day: 5 },
            { name: '立春', month: 2, day: 4 },
            { name: '驚蟄', month: 3, day: 5 },
            { name: '清明', month: 4, day: 4 },
            { name: '立夏', month: 5, day: 5 },
            { name: '芒種', month: 6, day: 5 },
            { name: '小暑', month: 7, day: 7 },
            { name: '立秋', month: 8, day: 7 },
            { name: '白露', month: 9, day: 7 },
            { name: '寒露', month: 10, day: 8 },
            { name: '立冬', month: 11, day: 7 },
            { name: '大雪', month: 12, day: 7 }
        ];
        var offset = Math.floor((y - 2000) * 0.2422) % 2;
        if (offset < 0) offset += 2;
        var febMax = (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28;
        var out = [];
        for (var i = 0; i < base.length; i++) {
            var d = base[i].day + (offset + i) % 2;
            if (base[i].month === 2 && d > febMax) d = febMax;
            if ((base[i].month === 4 || base[i].month === 6 || base[i].month === 9 || base[i].month === 11) && d > 30) d = 30;
            if (d > 31) d = 31;
            if (d < 1) d = 1;
            var dt = new Date(y, base[i].month - 1, d, 0, 0, 0, 0);
            out.push({ name: base[i].name, date: dt });
        }
        return out;
    }

    /** 取得某年 12 節（大運起運只用「節」）。優先：lunar 公式 → TERM_DB → TERM_JSON → 近似公式。 */
    SolarTermCalculator.prototype.getTermsForYear = function (year) {
        var y = parseInt(year, 10);
        var out = getTermsFromLunar(y);
        if (out.length < 12) {
            var rowDb = TERM_DB && TERM_DB[y];
            if (rowDb && typeof rowDb === 'object') {
                for (var i = 0; i < JIE_NAMES.length; i++) {
                    var n = JIE_NAMES[i];
                    var v = rowDb[n];
                    if (v == null) continue;
                    var dt = parseToDate(y, v);
                    if (dt && !isNaN(dt.getTime())) out.push({ name: n, date: dt });
                }
            }
        }
        if (out.length < 12) {
            var row = TERM_JSON[String(y)];
            if (row && typeof row === 'object') {
                for (var j = 0; j < JIE_NAMES.length; j++) {
                    var n2 = JIE_NAMES[j];
                    var v2 = row[n2];
                    if (v2 == null) continue;
                    var dt2 = parseIsoUtc(v2);
                    if (dt2) out.push({ name: n2, date: dt2, utc: true });
                }
            }
        }
        if (out.length < 12) {
            out = getApproximateJieForYear(y);
        }
        out.sort(function (a, b) { return a.date.getTime() - b.date.getTime(); });
        return out;
    };

    /** 取得指定節氣該年交節時刻。若無資料回傳 null。 */
    SolarTermCalculator.prototype.getTermDateTime = function (year, termName) {
        var list = this.getTermsForYear(year);
        for (var i = 0; i < list.length; i++) {
            if (list[i].name === termName) return list[i].date;
        }
        return null;
    };

    /**
     * 取得出生日前/後最近節氣（跨年處理）
     * 1 月逆行納入前一年節氣；12 月順行納入次年節氣。
     * @param {Date} dateTime - 出生時刻（真太陽時為佳）
     * @param {string} direction - 'forward' 順行取下一節 / 'backward' 逆行取上一節
     * @returns {{ name: string, date: Date, utc?: boolean } | null}
     */
    SolarTermCalculator.prototype.getNearestSolarTerms = function (dateTime, direction) {
        var d = dateTime instanceof Date ? dateTime : new Date(dateTime);
        if (isNaN(d.getTime())) return null;
        var y = d.getFullYear();
        var m = d.getMonth() + 1;
        var terms = this.getTermsForYear(y);
        var prev = this.getTermsForYear(y - 1);
        if (prev && prev.length) {
            terms = prev.concat(terms);
            terms.sort(function (a, b) { return a.date.getTime() - b.date.getTime(); });
        }
        if (direction === 'forward' && m === 12) {
            var next = this.getTermsForYear(y + 1);
            if (next && next.length) {
                terms = terms.concat(next);
                terms.sort(function (a, b) { return a.date.getTime() - b.date.getTime(); });
            }
        }
        if (direction === 'forward') {
            for (var i = 0; i < terms.length; i++) {
                if (terms[i].date > d) return terms[i];
            }
        } else {
            for (var j = terms.length - 1; j >= 0; j--) {
                if (terms[j].date < d) return terms[j];
            }
        }
        return null;
    };

    /** 註冊某年節氣資料。entry[節名] = [月,日,時,分] 或 'YYYY-MM-DD'。 */
    SolarTermCalculator.prototype.registerYear = function (year, entry) {
        var y = parseInt(year, 10);
        if (!TERM_DB[y]) TERM_DB[y] = {};
        for (var k in entry) if (Object.prototype.hasOwnProperty.call(entry, k)) {
            TERM_DB[y][k] = entry[k];
        }
    };

    SolarTermCalculator.prototype.hasYear = function (year) {
        var list = this.getTermsForYear(year);
        return list.length >= 12;
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { SolarTermCalculator: SolarTermCalculator, JIE_NAMES: JIE_NAMES };
    } else {
        global.SolarTermCalculator = SolarTermCalculator;
        global.SOLAR_TERM_JIE_NAMES = JIE_NAMES;
    }
})(typeof window !== 'undefined' ? window : this);
