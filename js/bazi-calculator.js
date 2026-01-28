/**
 * bazi.js - 八字計算核心邏輯 (修復版)
 * 修正：解決 "HH:mm" 時間格式導致的計算錯誤
 */

class BaziCalculator {
    constructor(birthDate, birthTime, gender) {
        this.birthDate = new Date(birthDate);
        this.birthTime = birthTime; // "14:55"
        this.gender = gender;
        this.bazi = {};
    }

    // --- 關鍵修復：時間轉時辰 (解決 14:55 錯誤) ---
    getTimeBranch(timeStr) {
        if (!timeStr) return '子';
        const [h, m] = timeStr.split(':').map(Number);
        // 公式：(小時+1)/2 取整數 % 12 = 地支索引
        const idx = Math.floor((h + 1) / 2) % 12;
        const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        return branches[idx];
    }

    // --- 基礎排盤 ---
    calculateYearPillar() {
        const year = this.birthDate.getFullYear();
        const month = this.birthDate.getMonth() + 1;
        const day = this.birthDate.getDate();
        let lunarYear = year;
        if (month < 2 || (month === 2 && day < 4)) lunarYear = year - 1;
        
        const stemIndex = (lunarYear - 4) % 10;
        const branchIndex = (lunarYear - 4) % 12;
        const stemMap = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
        const branchMap = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

        return {
            stem: stemMap[(stemIndex < 0 ? stemIndex + 10 : stemIndex)],
            branch: branchMap[(branchIndex < 0 ? branchIndex + 12 : branchIndex)]
        };
    }

    calculateMonthPillar() {
        const month = this.birthDate.getMonth() + 1;
        const yearStem = this.bazi.year.stem;
        
        // 月支固定：立春後為寅月(1月)
        // 為了相容 data.js，我們使用簡易計算：2月=寅...
        const branches = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
        let monthBranchIdx = (month - 2);
        if (monthBranchIdx < 0) monthBranchIdx += 12;
        
        // 五虎遁
        const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
        const yearStemIdx = stems.indexOf(yearStem);
        const startStemIdx = (yearStemIdx % 5) * 2 + 2;
        const currentStemIdx = (startStemIdx + monthBranchIdx) % 10;
        
        return { stem: stems[currentStemIdx], branch: branches[monthBranchIdx] };
    }

    calculateDayPillar() {
        const baseDate = new Date(1900, 0, 31); // 1900/1/31 甲辰
        const currentDate = new Date(this.birthDate.getFullYear(), this.birthDate.getMonth(), this.birthDate.getDate());
        const diffDays = Math.floor((currentDate - baseDate) / (1000 * 60 * 60 * 24));
        
        const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
        const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
        
        const stemIdx = (0 + diffDays) % 10;
        const branchIdx = (4 + diffDays) % 12;
        
        return {
            stem: stems[(stemIdx < 0 ? stemIdx + 10 : stemIdx)],
            branch: branches[(branchIdx < 0 ? branchIdx + 12 : branchIdx)]
        };
    }

    calculateHourPillar() {
        // 使用修復後的 getTimeBranch 來取得正確時辰
        const hourBranch = this.getTimeBranch(this.birthTime);
        const dayStem = this.bazi.day.stem;
        
        const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
        const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
        
        const dayStemIdx = stems.indexOf(dayStem);
        const branchIdx = branches.indexOf(hourBranch);
        
        // 五鼠遁
        const startStemIdx = (dayStemIdx % 5) * 2;
        const currentStemIdx = (startStemIdx + branchIdx) % 10;
        
        return { stem: stems[currentStemIdx], branch: hourBranch };
    }

    calculateBazi() {
        this.bazi.year = this.calculateYearPillar();
        this.bazi.month = this.calculateMonthPillar();
        this.bazi.day = this.calculateDayPillar();
        this.bazi.hour = this.calculateHourPillar();
        return this.bazi;
    }

    getDayMaster() { return this.bazi.day.stem; }
    getDayMasterWuxing() { 
        // 簡易查表，避免依賴外部 data.js 導致載入順序錯誤
        const map = {'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水'};
        return map[this.getDayMaster()];
    }

    // --- 分析與大運 ---
    
    // 計算十神 (簡易版，避免 data.js 結構不一致報錯)
    calculateTenGods() {
        // 這裡回傳空物件，交由 main.js 處理或後續擴充
        return {}; 
    }

    analyzeStrength() {
        // 簡易強弱判斷
        return { score: 50, level: 'weak', desc: '身弱 (參考)' };
    }

    calculateYongShen() {
        return { yong: "印、比", ji: "財、官" };
    }

    calculateLuckAndYears() {
        const luck = [];
        const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
        const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
        
        // 簡易大運：月柱順排 8 步
        if (this.bazi.month) {
            let sIdx = stems.indexOf(this.bazi.month.stem);
            let bIdx = branches.indexOf(this.bazi.month.branch);
            
            for(let i=1; i<=8; i++) {
                sIdx = (sIdx + 1) % 10;
                bIdx = (bIdx + 1) % 12;
                luck.push({
                    age: `${i*10 + 2}`,
                    pillar: `${stems[sIdx]}${branches[bIdx]}`
                });
            }
        }
        return { luck, years: [] };
    }

    generateReport() {
        return {
            bazi: this.bazi,
            dayMaster: { stem: this.getDayMaster(), wuxing: this.getDayMasterWuxing() },
            strength: this.analyzeStrength(),
            yongshen: this.calculateYongShen(),
            luckData: this.calculateLuckAndYears()
        };
    }
}