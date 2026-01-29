/**
 * 節氣計算系統 SolarTermCalculator
 * 架構：大運流年正確計算架構指南 — 節氣計算系統
 *
 * - 二十四節氣時間（精確到分鐘；資料庫不足時以日為單位）
 * - 節氣查詢接口：getTermDateTime(year, termName)、getTermsForYear(year)
 * - 12 節（用於大運起運）：小寒、立春、驚蟄、清明、立夏、芒種、小暑、立秋、白露、寒露、立冬、大雪
 * - 節氣數據庫：可擴充 1900–2100；目前內建 1983（精確時分）、2024–2026（日級）
 */
(function (global) {
    'use strict';

    var JIE_NAMES = [
        '小寒', '立春', '驚蟄', '清明', '立夏', '芒種',
        '小暑', '立秋', '白露', '寒露', '立冬', '大雪'
    ];

    /** 節氣資料庫 [年][節名] = [月, 日, 時, 分]。可擴充 1900–2100。 */
    var TERM_DB = {
        1982: { '大雪': [12, 8, 1, 30] },
        1983: {
            '小寒': [1, 6, 5, 59], '立春': [2, 4, 17, 36], '驚蟄': [3, 6, 11, 47],
            '清明': [4, 5, 16, 44], '立夏': [5, 6, 10, 11], '芒種': [6, 6, 14, 26],
            '小暑': [7, 7, 20, 36], '立秋': [8, 8, 9, 30], '白露': [9, 8, 12, 42],
            '寒露': [10, 9, 6, 4], '立冬': [11, 8, 8, 53], '大雪': [12, 8, 1, 50]
        },
        2024: {
            '小寒': [1, 6, 0, 0], '立春': [2, 4, 0, 0], '驚蟄': [3, 5, 0, 0], '清明': [4, 4, 0, 0],
            '立夏': [5, 5, 0, 0], '芒種': [6, 5, 0, 0], '小暑': [7, 6, 0, 0], '立秋': [8, 7, 0, 0],
            '白露': [9, 7, 0, 0], '寒露': [10, 8, 0, 0], '立冬': [11, 7, 0, 0], '大雪': [12, 7, 0, 0]
        },
        2025: {
            '小寒': [1, 5, 0, 0], '立春': [2, 3, 0, 0], '驚蟄': [3, 5, 0, 0], '清明': [4, 4, 0, 0],
            '立夏': [5, 5, 0, 0], '芒種': [6, 5, 0, 0], '小暑': [7, 7, 0, 0], '立秋': [8, 7, 0, 0],
            '白露': [9, 7, 0, 0], '寒露': [10, 8, 0, 0], '立冬': [11, 7, 0, 0], '大雪': [12, 7, 0, 0]
        },
        2026: {
            '小寒': [1, 5, 0, 0], '立春': [2, 4, 0, 0], '驚蟄': [3, 5, 0, 0], '清明': [4, 4, 0, 0],
            '立夏': [5, 5, 0, 0], '芒種': [6, 5, 0, 0], '小暑': [7, 7, 0, 0], '立秋': [8, 7, 0, 0],
            '白露': [9, 7, 0, 0], '寒露': [10, 8, 0, 0], '立冬': [11, 7, 0, 0], '大雪': [12, 7, 0, 0]
        }
    };

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

    /** 取得某年 12 節，依時間排序。回傳 { name, date, utc? }[]。同年若有 TERM_DB 優先用它（本地）；否則用 JSON（UTC）。 */
    SolarTermCalculator.prototype.getTermsForYear = function (year) {
        var y = parseInt(year, 10);
        var out = [];
        var rowDb = TERM_DB[y];
        if (rowDb && typeof rowDb === 'object') {
            for (var i = 0; i < JIE_NAMES.length; i++) {
                var n = JIE_NAMES[i];
                var v = rowDb[n];
                if (v == null) continue;
                var dt = parseToDate(y, v);
                if (dt && !isNaN(dt.getTime())) out.push({ name: n, date: dt });
            }
        }
        if (out.length === 0) {
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
