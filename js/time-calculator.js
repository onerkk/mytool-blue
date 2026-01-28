/**
 * time-calculator.js - 真太陽時計算
 */

class TimeCalculator {
    constructor() {
        this.cities = this.loadCities();
    }

    loadCities() {
        // 城市經緯度數據庫（簡化版）
        return {
            '121.56': { name: '台北市', longitude: 121.56, latitude: 25.03 },
            '120.20': { name: '台南市', longitude: 120.20, latitude: 22.99 },
            '120.30': { name: '高雄市', longitude: 120.30, latitude: 22.63 },
            '120.68': { name: '台中市', longitude: 120.68, latitude: 24.15 }
        };
    }

    /**
     * 計算真太陽時
     * @param {Date} birthDate - 出生日期時間
     * @param {number} longitude - 經度
     * @returns {Date} 真太陽時
     */
    calculateTrueSolarTime(birthDate, longitude) {
        // 標準時區經度（台灣為東經120度）
        const standardLongitude = 120;
        
        // 經度差（度）
        const longitudeDiff = longitude - standardLongitude;
        
        // 時間差（分鐘）= 經度差 × 4分鐘/度
        const timeDiffMinutes = longitudeDiff * 4;
        
        // 計算真太陽時
        const trueSolarTime = new Date(birthDate);
        trueSolarTime.setMinutes(trueSolarTime.getMinutes() + timeDiffMinutes);
        
        return {
            original: birthDate,
            trueSolar: trueSolarTime,
            timeDiff: timeDiffMinutes,
            longitude: longitude
        };
    }

    /**
     * 格式化時間為時辰
     * @param {Date} time - 時間
     * @returns {string} 時辰（如：14:55 -> 未時）
     */
    formatToHourBranch(time) {
        const hour = time.getHours();
        const minute = time.getMinutes();
        const totalMinutes = hour * 60 + minute;
        
        // 時辰對照表（每2小時一個時辰）
        const hourBranches = [
            { start: 0, end: 120, branch: '子', time: '23-1' },
            { start: 120, end: 240, branch: '丑', time: '1-3' },
            { start: 240, end: 360, branch: '寅', time: '3-5' },
            { start: 360, end: 480, branch: '卯', time: '5-7' },
            { start: 480, end: 600, branch: '辰', time: '7-9' },
            { start: 600, end: 720, branch: '巳', time: '9-11' },
            { start: 720, end: 840, branch: '午', time: '11-13' },
            { start: 840, end: 960, branch: '未', time: '13-15' },
            { start: 960, end: 1080, branch: '申', time: '15-17' },
            { start: 1080, end: 1200, branch: '酉', time: '17-19' },
            { start: 1200, end: 1320, branch: '戌', time: '19-21' },
            { start: 1320, end: 1440, branch: '亥', time: '21-23' }
        ];
        
        for (let hb of hourBranches) {
            if (totalMinutes >= hb.start && totalMinutes < hb.end) {
                return hb.time;
            }
        }
        
        // 處理跨日情況（23:00-01:00）
        if (totalMinutes >= 1380 || totalMinutes < 60) {
            return '23-1';
        }
        
        return '12-14'; // 默認
    }
}
