/**
 * 真太陽時處理系統 TrueSolarTimeCalculator
 * 架構：大運流年精確計算架構 — 真太陽時
 *
 * - 地方平太陽時 LMT = UTC + λ/15（λ 經度，小時）
 * - 時差方程 E = 9.87sin(2B) - 7.53cos(B) - 1.5sin(B)，B = 360°(N-81)/365，N 日序
 * - 真太陽時 = LMT + E（E 通常為分鐘，換算成小時）
 * - 八字排盤、起運計算以出生地真太陽時為準
 */
(function (global) {
    'use strict';

    function degRad(d) { return (d * Math.PI) / 180; }

    /**
     * 時差方程 E（分鐘）
     * B = 360 * (N - 81) / 365，N 為年間第幾日 (1–365)
     */
    function equationOfTimeMinutes(date) {
        var d = date instanceof Date ? date : new Date(date);
        var y = d.getFullYear();
        var start = new Date(y, 0, 1, 0, 0, 0, 0);
        var N = 1 + Math.round((d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
        N = Math.max(1, Math.min(365, N));
        var B = 360 * (N - 81) / 365;
        var Br = degRad(B);
        var E = 9.87 * Math.sin(2 * Br) - 7.53 * Math.cos(Br) - 1.5 * Math.sin(Br);
        return E;
    }

    /**
     * 將「公曆當地鐘錶時間」視為某時區的平太陽時，換算為 UTC 再算真太陽時。
     * @param {Date|string} localDate - 當地鐘錶時間（如 1983-08-25T14:55）
     * @param {number} longitude - 出生地經度（十進制，東正西負），如台南 120.2
     * @param {number} zoneOffsetHours - 當地時區偏移（小時），如台灣 +8
     * @returns {Date} 真太陽時對應的 Date（仍用本地時區表示，僅時刻已修正）
     */
    function trueSolarTime(localDate, longitude, zoneOffsetHours) {
        var d = localDate instanceof Date ? new Date(localDate.getTime()) : new Date(localDate);
        if (isNaN(d.getTime())) return d;

        var lmtHours = (longitude || 120) / 15;
        var lmtOffset = (lmtHours - (zoneOffsetHours || 8)) * 60 * 60 * 1000;
        var eMin = equationOfTimeMinutes(d);
        var eOffset = (eMin / 60) * 60 * 60 * 1000;
        var trueSolar = new Date(d.getTime() + lmtOffset + eOffset);
        return trueSolar;
    }

    /**
     * 經度 → 時差（小時）。λ/15。
     * 台南 120.2°E → 8.013h
     */
    function longitudeToHourOffset(longitude) {
        return (longitude || 0) / 15;
    }

    /**
     * 節氣 UTC 時刻 → 出生地真太陽時
     * LMT = UTC + λ/15，真太陽時 = LMT + E
     * @param {Date} utcDate - 節氣 UTC 時刻
     * @param {number} longitude - 出生地經度（十進制）
     * @returns {Date} 地方真太陽時
     */
    function adjustSolarTermTime(utcDate, longitude) {
        var t = utcDate.getTime();
        var lmt = t + ((longitude || 0) / 15) * 60 * 60 * 1000;
        var d = new Date(lmt);
        var e = equationOfTimeMinutes(d);
        return new Date(lmt + (e / 60) * 60 * 60 * 1000);
    }

    function TrueSolarTimeCalculator() {}

    TrueSolarTimeCalculator.prototype.equationOfTimeMinutes = equationOfTimeMinutes;
    TrueSolarTimeCalculator.prototype.trueSolarTime = trueSolarTime;
    TrueSolarTimeCalculator.prototype.longitudeToHourOffset = longitudeToHourOffset;
    TrueSolarTimeCalculator.prototype.adjustSolarTermTime = adjustSolarTermTime;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            TrueSolarTimeCalculator: TrueSolarTimeCalculator,
            equationOfTimeMinutes: equationOfTimeMinutes,
            trueSolarTime: trueSolarTime,
            adjustSolarTermTime: adjustSolarTermTime
        };
    } else {
        global.TrueSolarTimeCalculator = TrueSolarTimeCalculator;
        global.equationOfTimeMinutes = equationOfTimeMinutes;
        global.trueSolarTime = trueSolarTime;
        global.adjustSolarTermTime = adjustSolarTermTime;
    }
})(typeof window !== 'undefined' ? window : this);
