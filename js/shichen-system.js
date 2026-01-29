/**
 * 時辰系統 ShiChenSystem / ShiChenConverter
 * 架構：大運精確計算補充資料 — 時辰換算精確規則
 *
 * - 時辰定義：子 23–01、丑 1–3 … 亥 21–23
 * - 換算：standard 每時辰 10 天；precise 時辰內比例 (x/120)×10；ziwei 紫微流派係數
 */
(function (global) {
    'use strict';

    var SHICHEN_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    var SHICHEN_DEFINITION = {
        '子': { start: '23:00', end: '01:00', hourType: '夜半' },
        '丑': { start: '01:00', end: '03:00', hourType: '雞鳴' },
        '寅': { start: '03:00', end: '05:00', hourType: '平旦' },
        '卯': { start: '05:00', end: '07:00', hourType: '日出' },
        '辰': { start: '07:00', end: '09:00', hourType: '食時' },
        '巳': { start: '09:00', end: '11:00', hourType: '隅中' },
        '午': { start: '11:00', end: '13:00', hourType: '日中' },
        '未': { start: '13:00', end: '15:00', hourType: '日昳' },
        '申': { start: '15:00', end: '17:00', hourType: '哺時' },
        '酉': { start: '17:00', end: '19:00', hourType: '日入' },
        '戌': { start: '19:00', end: '21:00', hourType: '黃昏' },
        '亥': { start: '21:00', end: '23:00', hourType: '人定' }
    };

    var SHICHEN_TO_DAYS_STANDARD = { '子': 10, '丑': 20, '寅': 30, '卯': 40, '辰': 50, '巳': 60, '午': 70, '未': 80, '申': 90, '酉': 100, '戌': 110, '亥': 120 };
    var SHICHEN_TO_DAYS_ZIWEI = { '子': 9.6, '丑': 19.2, '寅': 28.8, '卯': 38.4, '辰': 48, '巳': 57.6, '午': 67.2, '未': 76.8, '申': 86.4, '酉': 96, '戌': 105.6, '亥': 115.2 };

    /**
     * 依時分取得時辰。子 23–01 跨日。
     * @returns {{ name: string, index: number, minutesInShiChen: number }}
     */
    function getShiChenFromTime(hour, minute) {
        var h = (typeof hour === 'number' ? hour : parseInt(hour, 10)) || 0;
        var m = (typeof minute === 'number' ? minute : parseInt(minute, 10)) || 0;
        var name, index, minutesInShiChen;
        if (h === 23 || (h >= 0 && h < 1)) {
            name = '子';
            index = 0;
            minutesInShiChen = h === 23 ? m : 60 + m;
        } else {
            index = Math.floor((h + 1) / 2);
            if (index > 11) index = 11;
            name = SHICHEN_NAMES[index];
            var base = 2 * index - 1;
            minutesInShiChen = (h - base) * 60 + m;
            if (minutesInShiChen < 0) minutesInShiChen = 0;
            if (minutesInShiChen > 120) minutesInShiChen = 120;
        }
        return { name: name, index: index, minutesInShiChen: minutesInShiChen };
    }

    /**
     * 時辰換算為天數
     * @param {string} shichenName - 時辰名
     * @param {number} [minutesInShiChen=0] - 時辰內分鐘 0–120
     * @param {string} [method='precise'] - 'standard' | 'precise' | 'ziwei'
     */
    function shiChenToDays(shichenName, minutesInShiChen, method) {
        var mins = Math.max(0, Math.min(120, minutesInShiChen || 0));
        if (method === 'standard') {
            var base = SHICHEN_TO_DAYS_STANDARD[shichenName];
            return typeof base === 'number' ? base : 10;
        }
        if (method === 'ziwei') {
            var zw = SHICHEN_TO_DAYS_ZIWEI[shichenName];
            return (typeof zw === 'number' ? zw : 9.6) * (mins / 120);
        }
        return (mins / 120) * 10;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            SHICHEN_DEFINITION: SHICHEN_DEFINITION,
            SHICHEN_NAMES: SHICHEN_NAMES,
            getShiChenFromTime: getShiChenFromTime,
            shiChenToDays: shiChenToDays
        };
    } else {
        global.SHICHEN_DEFINITION = SHICHEN_DEFINITION;
        global.SHICHEN_NAMES = SHICHEN_NAMES;
        global.getShiChenFromTime = getShiChenFromTime;
        global.shiChenToDays = shiChenToDays;
    }
})(typeof window !== 'undefined' ? window : this);
