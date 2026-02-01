/**
 * 梅花易數完整算命系統架構 v3.1 (修復補全版)
 * 供靜月之前能量占卜儀 v2.0 使用
 *
 * 說明：
 * - 本檔僅負責「梅花易數」的核心演算法與資料結構
 * - 與 UI 的整合由 js/main.js 中的 MeihuaModule 負責呼叫
 * - 包含完整的64卦資料
 */

// ==========================================
// 1. 核心數據結構
// ==========================================

// 1.1 八卦基礎系統
const BAGUA_FUNDAMENTALS = {
    // 先天八卦（伏羲八卦）
    '先天八卦': {
        1: { name: '乾', symbol: '☰', nature: '天', number: 1, direction: '南', element: '金', family: '父' },
        2: { name: '兌', symbol: '☱', nature: '澤', number: 2, direction: '東南', element: '金', family: '少女' },
        3: { name: '離', symbol: '☲', nature: '火', number: 3, direction: '東', element: '火', family: '中女' },
        4: { name: '震', symbol: '☳', nature: '雷', number: 4, direction: '東北', element: '木', family: '長男' },
        5: { name: '巽', symbol: '☴', nature: '風', number: 5, direction: '西南', element: '木', family: '長女' },
        6: { name: '坎', symbol: '☵', nature: '水', number: 6, direction: '西', element: '水', family: '中男' },
        7: { name: '艮', symbol: '☶', nature: '山', number: 7, direction: '西北', element: '土', family: '少男' },
        8: { name: '坤', symbol: '☷', nature: '地', number: 8, direction: '北', element: '土', family: '母' }
    },

    // 後天八卦（文王八卦）
    '後天八卦': {
        1: { name: '坎', symbol: '☵', nature: '水', number: 1, direction: '北', element: '水', season: '冬' },
        2: { name: '坤', symbol: '☷', nature: '地', number: 2, direction: '西南', element: '土', season: '夏秋之交' },
        3: { name: '震', symbol: '☳', nature: '雷', number: 3, direction: '東', element: '木', season: '春' },
        4: { name: '巽', symbol: '☴', nature: '風', number: 4, direction: '東南', element: '木', season: '春夏之交' },
        5: { name: '中宮', nature: '土', number: 5, direction: '中', element: '土', season: '四季' },
        6: { name: '乾', symbol: '☰', nature: '天', number: 6, direction: '西北', element: '金', season: '秋冬之交' },
        7: { name: '兌', symbol: '☱', nature: '澤', number: 7, direction: '西', element: '金', season: '秋' },
        8: { name: '艮', symbol: '☶', nature: '山', number: 8, direction: '東北', element: '土', season: '冬春之交' },
        9: { name: '離', symbol: '☲', nature: '火', number: 9, direction: '南', element: '火', season: '夏' }
    },

    // 八卦卦象（三爻）
    '卦象': {
        '乾': { lines: [1, 1, 1], binary: '111', decimal: 7 },
        '兌': { lines: [0, 1, 1], binary: '011', decimal: 6 },
        '離': { lines: [1, 0, 1], binary: '101', decimal: 5 },
        '震': { lines: [0, 0, 1], binary: '001', decimal: 4 },
        '巽': { lines: [1, 1, 0], binary: '110', decimal: 3 },
        '坎': { lines: [0, 1, 0], binary: '010', decimal: 2 },
        '艮': { lines: [1, 0, 0], binary: '100', decimal: 1 },
        '坤': { lines: [0, 0, 0], binary: '000', decimal: 0 }
    },

    // 八卦五行
    '五行': {
        '乾': '金', '兌': '金', '離': '火', '震': '木',
        '巽': '木', '坎': '水', '艮': '土', '坤': '土'
    },

    // 八卦方位
    '方位': {
        '乾': '西北', '兌': '西', '離': '南', '震': '東',
        '巽': '東南', '坎': '北', '艮': '東北', '坤': '西南'
    }
};

// 1.2 六十四卦完整名錄 (上卦_下卦 索引)
const HEXAGRAM_NAMES_MAP = {
    '1_1': { name: '乾為天', nature: '剛健中正', luck: '吉' }, 
    '1_2': { name: '天澤履', nature: '如履薄冰', luck: '平' },
    '1_3': { name: '天火同人', nature: '上下和同', luck: '吉' }, 
    '1_4': { name: '天雷無妄', nature: '真實無妄', luck: '平' },
    '1_5': { name: '天風姤', nature: '風雲相濟', luck: '平' }, 
    '1_6': { name: '天水訟', nature: '慎爭戒訟', luck: '凶' },
    '1_7': { name: '天山遯', nature: '退避隱忍', luck: '平' }, 
    '1_8': { name: '天地否', nature: '陰陽不交', luck: '凶' },
    
    '2_1': { name: '澤天夬', nature: '決斷剛決', luck: '平' }, 
    '2_2': { name: '兌為澤', nature: '喜悅溝通', luck: '吉' },
    '2_3': { name: '澤火革', nature: '順天應人', luck: '吉' }, 
    '2_4': { name: '澤雷隨', nature: '隨機應變', luck: '吉' },
    '2_5': { name: '澤風大過', nature: '非常行動', luck: '凶' }, 
    '2_6': { name: '澤水困', nature: '困境求通', luck: '凶' },
    '2_7': { name: '澤山咸', nature: '交感相應', luck: '吉' }, 
    '2_8': { name: '澤地萃', nature: '群英薈萃', luck: '吉' },

    '3_1': { name: '火天大有', nature: '自助天助', luck: '吉' }, 
    '3_2': { name: '火澤睽', nature: '異中求同', luck: '凶' },
    '3_3': { name: '離為火', nature: '光明依附', luck: '吉' }, 
    '3_4': { name: '火雷噬嗑', nature: '剛柔相濟', luck: '平' },
    '3_5': { name: '火風鼎', nature: '穩重圖變', luck: '吉' }, 
    '3_6': { name: '火水未濟', nature: '謀事未成', luck: '平' },
    '3_7': { name: '火山旅', nature: '依附探索', luck: '平' }, 
    '3_8': { name: '火地晉', nature: '求進發展', luck: '吉' },

    '4_1': { name: '雷天大壯', nature: '壯大強盛', luck: '吉' }, 
    '4_2': { name: '雷澤歸妹', nature: '浮雲蔽日', luck: '凶' },
    '4_3': { name: '雷火豐', nature: '豐大成果', luck: '吉' }, 
    '4_4': { name: '震為雷', nature: '臨危不亂', luck: '平' },
    '4_5': { name: '雷風恆', nature: '持之以恆', luck: '吉' }, 
    '4_6': { name: '雷水解', nature: '柔道致治', luck: '吉' },
    '4_7': { name: '雷山小過', nature: '行動有度', luck: '平' }, 
    '4_8': { name: '雷地豫', nature: '順時依勢', luck: '吉' },

    '5_1': { name: '風天小畜', nature: '蓄養待進', luck: '平' }, 
    '5_2': { name: '風澤中孚', nature: '誠信立身', luck: '吉' },
    '5_3': { name: '風火家人', nature: '誠信齊家', luck: '吉' }, 
    '5_4': { name: '風雷益', nature: '損上益下', luck: '吉' },
    '5_5': { name: '巽為風', nature: '謙遜受益', luck: '平' }, 
    '5_6': { name: '風水渙', nature: '拯救渙散', luck: '平' },
    '5_7': { name: '風山漸', nature: '循序漸進', luck: '吉' }, 
    '5_8': { name: '風地觀', nature: '觀摩省察', luck: '平' },

    '6_1': { name: '水天需', nature: '守正待機', luck: '吉' }, 
    '6_2': { name: '水澤節', nature: '節制有度', luck: '吉' },
    '6_3': { name: '水火既濟', nature: '盛極將衰', luck: '平' }, 
    '6_4': { name: '水雷屯', nature: '起始維艱', luck: '凶' },
    '6_5': { name: '水風井', nature: '求賢若渴', luck: '吉' }, 
    '6_6': { name: '坎為水', nature: '行險用險', luck: '凶' },
    '6_7': { name: '水山蹇', nature: '險阻在前', luck: '凶' }, 
    '6_8': { name: '水地比', nature: '誠信相輔', luck: '吉' },

    '7_1': { name: '山天大畜', nature: '止健篤實', luck: '吉' }, 
    '7_2': { name: '山澤損', nature: '損下益上', luck: '平' },
    '7_3': { name: '山火賁', nature: '飾外揚質', luck: '平' }, 
    '7_4': { name: '山雷頤', nature: '純正頤養', luck: '吉' },
    '7_5': { name: '山風蠱', nature: '振疲起衰', luck: '平' }, 
    '7_6': { name: '山水蒙', nature: '啟蒙發智', luck: '平' },
    '7_7': { name: '艮為山', nature: '動靜適時', luck: '平' }, 
    '7_8': { name: '山地剝', nature: '順勢而止', luck: '凶' },

    '8_1': { name: '地天泰', nature: '陰陽交泰', luck: '吉' }, 
    '8_2': { name: '地澤臨', nature: '教民保民', luck: '吉' },
    '8_3': { name: '地火明夷', nature: '晦而轉明', luck: '凶' }, 
    '8_4': { name: '地雷復', nature: '寓動於順', luck: '吉' },
    '8_5': { name: '地風升', nature: '積小成大', luck: '吉' }, 
    '8_6': { name: '地水師', nature: '行險而順', luck: '平' },
    '8_7': { name: '地山謙', nature: '內高外低', luck: '吉' }, 
    '8_8': { name: '坤為地', nature: '厚德載物', luck: '吉' }
};

// 1.3 爻位系統
const YAO_POSITIONS = {
    positions: [
        { number: 1, name: '初爻', significance: '基礎、開始' },
        { number: 2, name: '二爻', significance: '發展、顯露' },
        { number: 3, name: '三爻', significance: '轉折、危險' },
        { number: 4, name: '四爻', significance: '進取、接近' },
        { number: 5, name: '五爻', significance: '尊位、成功' },
        { number: 6, name: '六爻', significance: '頂點、結束' }
    ],
    yinYang: {
        0: { name: '陰爻', symbol: '⚋', broken: true, numeric: 6 },
        1: { name: '陽爻', symbol: '⚊', broken: false, numeric: 9 }
    },
    relationships: {
        correspondence: [[1, 4], [2, 5], [3, 6]],
        adjacency: [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
        mutualLower: [2, 3, 4],
        mutualUpper: [3, 4, 5]
    },
    movingLineJudgment: {
        1: '初爻動，變動在基礎',
        2: '二爻動，變動在發展',
        3: '三爻動，變動在轉折',
        4: '四爻動，變動在進取',
        5: '五爻動，變動在尊位',
        6: '上爻動，變動在頂點'
    }
};

// 1.4 五行生克系統
const FIVE_ELEMENTS_SYSTEM = {
    elements: {
        '木': { nature: '曲直', direction: '東', season: '春', color: '青綠', organ: '肝膽', taste: '酸' },
        '火': { nature: '炎上', direction: '南', season: '夏', color: '紅', organ: '心小腸', taste: '苦' },
        '土': { nature: '稼穡', direction: '中', season: '四季末', color: '黃', organ: '脾胃', taste: '甘' },
        '金': { nature: '從革', direction: '西', season: '秋', color: '白', organ: '肺大腸', taste: '辛' },
        '水': { nature: '潤下', direction: '北', season: '冬', color: '黑', organ: '腎膀胱', taste: '鹹' }
    },
    relationships: {
        generating: { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' },
        overcoming: { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' }
    },
    bodyUseRelationship: (bodyElement, useElement) => {
        if (bodyElement === useElement) {
            return { type: '比和', meaning: '吉 (互助)', strength: 1.0 };
        } else if (FIVE_ELEMENTS_SYSTEM.relationships.generating[bodyElement] === useElement) {
            return { type: '體生用', meaning: '凶 (洩氣)', strength: 0.6 };
        } else if (FIVE_ELEMENTS_SYSTEM.relationships.generating[useElement] === bodyElement) {
            return { type: '用生體', meaning: '大吉 (進益)', strength: 1.2 };
        } else if (FIVE_ELEMENTS_SYSTEM.relationships.overcoming[bodyElement] === useElement) {
            return { type: '體剋用', meaning: '小吉 (掌控)', strength: 1.0 };
        } else if (FIVE_ELEMENTS_SYSTEM.relationships.overcoming[useElement] === bodyElement) {
            return { type: '用剋體', meaning: '大凶 (受制)', strength: 0.4 };
        }
        return { type: '無關', meaning: '平', strength: 0.8 };
    }
};

// ==========================================
// 2. 梅花易數核心類 (v3.1修復補全版)
// ==========================================

class PlumBlossomCalculator {
    constructor() {
        this.baguaData = BAGUA_FUNDAMENTALS;
        this.hexagramMap = HEXAGRAM_NAMES_MAP;
    }

    // 1. 起卦主函數 (兼容舊版)
    divine(query, method = 'time', options = {}) {
        let result;
        switch (method) {
            case 'number':
                result = this.divineByNumbers(options.numbers);
                break;
            case 'date':
                result = this.divineByDate(options.date, options.time);
                break;
            case 'character':
                result = this.divineByCharacter(options.text);
                break;
            case 'sound':
                result = this.divineBySound(options.soundCount);
                break;
            case 'random':
                result = this.divineByRandom(options);
                break;
            case 'observation':
                result = this.divineByObservation(options.phenomenon);
                break;
            default: // 默認時間起卦
                result = this.divineByTime();
        }
        
        // 進行卦象分析
        const analysis = this.analyzeHexagram(result);
        
        // 返回舊版格式兼容的結果
        return {
            method: result.method || method,
            query: query || '',
            timestamp: new Date().toISOString(),
            ...analysis,
            // 兼容舊版格式
            originalHexagram: analysis.benGua,
            mutualHexagram: analysis.huGua,
            changedHexagram: analysis.bianGua,
            movingLine: analysis.movingLine,
            bodyUse: this.convertTiYongToBodyUse(analysis.tiYong, analysis.benGua)
        };
    }

    // 2. 時間起卦法 (加入秒數) - v3.1修復版
    divineByTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const second = now.getSeconds(); // 關鍵：加入秒數

        // 梅花易數基礎公式：
        const baseSum = year + month + day + hour;
        
        let upperNum = (baseSum) % 8 || 8;
        let lowerNum = (baseSum + minute + second) % 8 || 8; // 加入秒數讓卦象變動
        let movingLine = (baseSum + minute + second) % 6 || 6;

        return { 
            upperNum, 
            lowerNum, 
            movingLine, 
            method: 'time', 
            timestamp: now,
            // 保留原始數值供舊版兼容
            numbers: { num1: upperNum, num2: lowerNum, num3: movingLine }
        };
    }

    // 3. 數字起卦法
    divineByNumbers(numbers) {
        const [num1, num2, num3] = numbers;
        const upperNum = num1 % 8 || 8;
        const lowerNum = num2 % 8 || 8;
        // 如果沒有第三個數，默認用前兩個數之和或當前時間
        const movingLine = (num3 ? num3 : (num1 + num2 + new Date().getSeconds())) % 6 || 6;
        
        return { 
            upperNum, 
            lowerNum, 
            movingLine, 
            method: 'number',
            numbers: { num1, num2, num3: movingLine }
        };
    }

    // 4. 漢字起卦法
    divineByCharacter(text) {
        if (!text || text.length === 0) {
            return this.divineByTime();
        }
        
        let sum = 0;
        for (let i = 0; i < text.length; i++) {
            sum += text.charCodeAt(i);
        }
        
        const now = new Date();
        const upperNum = (sum) % 8 || 8;
        const lowerNum = (sum + now.getSeconds()) % 8 || 8; // 結合秒數
        const movingLine = (sum + now.getMinutes() + now.getSeconds()) % 6 || 6;
        
        return { 
            upperNum, 
            lowerNum, 
            movingLine, 
            method: 'character',
            text: text
        };
    }

    // 5. 聲音起卦法 (舊版兼容)
    divineBySound(soundCount) {
        const num1 = soundCount % 8 || 8;
        const num2 = (soundCount + 1) % 8 || 8;
        const num3 = (soundCount + 2) % 6 || 6;
        return this.divineByNumbers([num1, num2, num3]);
    }

    // 6. 觀察起卦法 (舊版兼容)
    divineByObservation(phenomenon) {
        let numbers = [1, 1, 1];
        if (phenomenon && phenomenon.length >= 2) {
            const length = phenomenon.length;
            numbers = [
                length % 8 || 8,
                (length + phenomenon.charCodeAt(0)) % 8 || 8,
                (length + phenomenon.charCodeAt(1)) % 6 || 6
            ];
        }
        return this.divineByNumbers(numbers);
    }

    // 7. 日期起卦法 (舊版兼容)
    divineByDate(dateStr, timeStr) {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        let hour = 0, minute = 0;
        if (timeStr) {
            [hour, minute] = timeStr.split(':').map(Number);
        }
        
        const baseSum = year + month + day;
        const upperNum = (baseSum) % 8 || 8;
        const lowerNum = (baseSum + hour) % 8 || 8;
        const movingLine = (baseSum + hour + minute) % 6 || 6;
        
        return { 
            upperNum, 
            lowerNum, 
            movingLine, 
            method: 'date',
            date: dateStr,
            time: timeStr
        };
    }

    // 7.5. 隨機起卦法（補齊 random 起卦，避免「按了無變化/抓不到資料」）
    divineByRandom(options) {
        // 使用加密隨機（若可用）提高隨機性；否則降級 Math.random
        const randInt = (min, max) => {
            try {
                if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
                    const buf = new Uint32Array(1);
                    crypto.getRandomValues(buf);
                    const n = buf[0] / 0xFFFFFFFF;
                    return Math.floor(n * (max - min + 1)) + min;
                }
            } catch (e) {}
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        const upperNum = randInt(1, 8);
        const lowerNum = randInt(1, 8);
        const movingLine = randInt(1, 6);

        return {
            upperNum,
            lowerNum,
            movingLine,
            method: 'random',
            numbers: { num1: upperNum, num2: lowerNum, num3: movingLine },
            options: options || {}
        };
    }


    // 8. 構建卦象資料 (核心)
    getHexagramData(upperNum, lowerNum) {
        const key = `${upperNum}_${lowerNum}`;
        const upperGuaName = this.baguaData['先天八卦'][upperNum].name;
        const lowerGuaName = this.baguaData['先天八卦'][lowerNum].name;
        
        // 從完整名錄中獲取
        const mapData = this.hexagramMap[key] || { 
            name: `${upperGuaName}${lowerGuaName}卦`, 
            nature: '未定義', 
            luck: '平' 
        };

        const upperLines = this.baguaData['卦象'][upperGuaName].lines;
        const lowerLines = this.baguaData['卦象'][lowerGuaName].lines;
        
        // 組合六爻：下卦在下 (0-2)，上卦在上 (3-5)
        const lines = [...lowerLines, ...upperLines];

        return {
            id: key,
            upper: upperGuaName,
            lower: lowerGuaName,
            upperNum: upperNum,
            lowerNum: lowerNum,
            name: mapData.name,
            nature: mapData.nature,
            luck: mapData.luck,
            lines: lines,
            upperElement: this.baguaData['先天八卦'][upperNum].element,
            lowerElement: this.baguaData['先天八卦'][lowerNum].element,
            hexagram: this.getHexagramSymbol(upperLines, lowerLines),
            hexagramText: this.getHexagramDefaultText(mapData.name, mapData.luck)
        };
    }

    // 9. 卦象分析 (本卦、互卦、變卦) - v3.1修復版
    analyzeHexagram(data) {
        const { upperNum, lowerNum, movingLine } = data;

        // 1. 本卦
        const benGua = this.getHexagramData(upperNum, lowerNum);

        // 2. 互卦 (取本卦的 345 為上，234 為下)
        // benGua.lines: [下1, 下2, 下3, 上1, 上2, 上3] (索引 0-5)
        const huLowerLines = [benGua.lines[1], benGua.lines[2], benGua.lines[3]];
        const huUpperLines = [benGua.lines[2], benGua.lines[3], benGua.lines[4]];
        
        const huLowerNum = this.linesToNumber(huLowerLines);
        const huUpperNum = this.linesToNumber(huUpperLines);
        const huGua = this.getHexagramData(huUpperNum, huLowerNum);

        // 3. 變卦 (動爻變化)
        const movingIndex = movingLine - 1; // 0-based
        const bianLines = [...benGua.lines];
        bianLines[movingIndex] = bianLines[movingIndex] === 1 ? 0 : 1; // 陰陽反轉
        
        const bianLowerLines = bianLines.slice(0, 3);
        const bianUpperLines = bianLines.slice(3, 6);
        const bianLowerNum = this.linesToNumber(bianLowerLines);
        const bianUpperNum = this.linesToNumber(bianUpperLines);
        const bianGua = this.getHexagramData(bianUpperNum, bianLowerNum);

        // 4. 體用分析
        const tiYong = this.analyzeTiYong(upperNum, lowerNum, movingLine);

        // 5. 綜合分析 (舊版兼容)
        const analysis = this.comprehensiveAnalysis(benGua, huGua, bianGua, movingLine, tiYong);

        return {
            ...data,
            benGua,
            huGua,
            bianGua,
            tiYong,
            analysis
        };
    }

    // 輔助：爻陣列轉八卦數字
    linesToNumber(lines) {
        const binary = lines.join('');
        const map = this.baguaData['卦象'];
        for (const [name, data] of Object.entries(map)) {
            if (data.binary === binary) {
                // 找回對應的數字
                for (const [num, basic] of Object.entries(this.baguaData['先天八卦'])) {
                    if (basic.name === name) return parseInt(num);
                }
            }
        }
        return 1; // 默認乾
    }

    // 輔助：體用分析
    analyzeTiYong(upperNum, lowerNum, movingLine) {
        let tiNum, yongNum;
        let tiPos, yongPos;

        // 動爻所在為用，不動為體
        if (movingLine <= 3) {
            yongNum = lowerNum; // 下卦動
            tiNum = upperNum;   // 上卦靜
            yongPos = '下';
            tiPos = '上';
        } else {
            yongNum = upperNum; // 上卦動
            tiNum = lowerNum;   // 下卦靜
            yongPos = '上';
            tiPos = '下';
        }

        const tiElement = this.baguaData['先天八卦'][tiNum].element;
        const yongElement = this.baguaData['先天八卦'][yongNum].element;
        const relation = FIVE_ELEMENTS_SYSTEM.bodyUseRelationship(tiElement, yongElement);

        return {
            tiNum,
            yongNum,
            tiPos, 
            yongPos,
            tiElement, 
            yongElement,
            relation: relation.type,
            judgment: relation.meaning,
            strength: relation.strength
        };
    }

    // 輔助：將體用分析轉換為舊版bodyUse格式
    convertTiYongToBodyUse(tiYong, benGua) {
        const upperGua = this.baguaData['先天八卦'][tiYong.tiNum === benGua.upperNum ? tiYong.tiNum : tiYong.yongNum].name;
        const lowerGua = this.baguaData['先天八卦'][tiYong.tiNum === benGua.lowerNum ? tiYong.tiNum : tiYong.yongNum].name;
        
        return {
            bodyGua: upperGua,
            useGua: lowerGua,
            relationship: `${tiYong.tiPos}卦為體，${tiYong.yongPos}卦為用`,
            elementAnalysis: `${tiYong.tiElement} ${tiYong.relation} ${tiYong.yongElement}`
        };
    }

    // 輔助：獲取卦象符號
    getHexagramSymbol(upperLines, lowerLines) {
        // 簡單實現，返回Unicode卦象
        const hexagramSymbols = [
            '䷀', '䷁', '䷂', '䷃', '䷄', '䷅', '䷆', '䷇',
            '䷈', '䷉', '䷊', '䷋', '䷌', '䷍', '䷎', '䷏',
            '䷐', '䷑', '䷒', '䷓', '䷔', '䷕', '䷖', '䷗',
            '䷘', '䷙', '䷚', '䷛', '䷜', '䷝', '䷞', '䷟',
            '䷠', '䷡', '䷢', '䷣', '䷤', '䷥', '䷦', '䷧',
            '䷨', '䷩', '䷪', '䷫', '䷬', '䷭', '䷮', '䷯',
            '䷰', '䷱', '䷲', '䷳', '䷴', '䷵', '䷶', '䷷',
            '䷸', '䷹', '䷺', '䷻', '䷼', '䷽', '䷾', '䷿'
        ];
        
        // 隨機返回一個卦象符號（簡化實現）
        const index = (upperLines[0] * 4 + upperLines[1] * 2 + upperLines[2]) * 8 + 
                     (lowerLines[0] * 4 + lowerLines[1] * 2 + lowerLines[2]);
        
        return hexagramSymbols[index % 64] || '䷀';
    }

    // 輔助：獲取卦象默認文本
    getHexagramDefaultText(name, luck) {
        const texts = {
            '吉': `${name}，卦象吉利，表示事情發展順利。`,
            '凶': `${name}，卦象不利，需要謹慎應對。`,
            '平': `${name}，卦象平穩，需看具體發展。`
        };
        return texts[luck] || `${name}，需綜合判斷。`;
    }

    // 綜合分析 (舊版兼容)
    comprehensiveAnalysis(benGua, huGua, bianGua, movingLine, tiYong) {
        return {
            basicAnalysis: {
                original: {
                    name: benGua.name,
                    meaning: benGua.hexagramText,
                    element: `${benGua.upperElement}上${benGua.lowerElement}下`,
                    nature: benGua.nature,
                    luck: benGua.luck
                },
                mutual: {
                    name: huGua.name,
                    meaning: '互卦代表過程中的變化',
                    significance: '發展過程中的過渡階段'
                },
                changed: {
                    name: bianGua.name,
                    meaning: '變卦代表最終結果',
                    comparison: '有變化，結果可能轉變'
                }
            },
            movingLineAnalysis: {
                lineNumber: movingLine,
                lineText: `第${movingLine}爻動`,
                positionMeaning: YAO_POSITIONS.movingLineJudgment[movingLine] || '變動意義需綜合判斷',
                lineType: benGua.lines[movingLine-1] === 1 ? '陽爻動' : '陰爻動',
                changeDirection: benGua.lines[movingLine-1] === 1 ? '陽變陰' : '陰變陽'
            },
            bodyUseAnalysis: {
                body: { 
                    gua: this.baguaData['先天八卦'][tiYong.tiNum].name, 
                    element: tiYong.tiElement, 
                    meaning: '體卦代表問卦者自身' 
                },
                use: { 
                    gua: this.baguaData['先天八卦'][tiYong.yongNum].name, 
                    element: tiYong.yongElement, 
                    meaning: '用卦代表所問之事' 
                },
                relationship: {
                    type: tiYong.relation,
                    meaning: tiYong.judgment,
                    strength: tiYong.strength
                }
            },
            timeAnalysis: this.analyzeTime(),
            responseTime: this.predictResponseTime(movingLine, tiYong),
            advice: this.generateAdvice(benGua.luck, tiYong.relation)
        };
    }

    // 時間分析
    analyzeTime() {
        const now = new Date();
        const hour = now.getHours();
        const hourGua = this.getHourGua(hour);
        const season = this.getSeason(now.getMonth() + 1);
        const seasonElement = this.getSeasonElement(season);
        
        return {
            hour,
            hourGua,
            season,
            seasonElement,
            timingAdvice: `當前時節為${season}，五行屬${seasonElement}，宜順應時勢`
        };
    }

    // 預測應期
    predictResponseTime(movingLine, tiYong) {
        let timeUnit = '日';
        let timeAmount = movingLine;
        
        if (movingLine <= 2) timeUnit = '日';
        else if (movingLine <= 4) {
            timeUnit = '月';
            timeAmount = movingLine - 2;
        } else {
            timeUnit = '年';
            timeAmount = movingLine - 4;
        }
        
        if (tiYong.relation === '用生體') timeAmount = Math.max(1, timeAmount - 1);
        else if (tiYong.relation === '用剋體') timeAmount += 1;
        
        return {
            timeAmount,
            timeUnit,
            prediction: `大約${timeAmount}${timeUnit}內會有結果`,
            confidence: 70 + (tiYong.strength - 1) * 10
        };
    }

    // 生成建議
    generateAdvice(luck, relation) {
        let advice = '';
        if (luck === '吉' && relation === '用生體') advice = '大吉之兆，應積極行動，把握良機。';
        else if (luck === '吉') advice = '總體順利，但需注意細節。';
        else if (luck === '凶' && relation === '用剋體') advice = '大凶，宜保守應對，等待時機。';
        else if (luck === '凶') advice = '面臨挑戰，需尋求幫助。';
        else advice = '中平，需努力爭取，謹慎行事。';
        
        return advice;
    }

    // 輔助：根據時辰獲取卦
    getHourGua(hour) {
        const hourToGua = {
            0: '坎', 1: '坎', 2: '艮', 3: '艮',
            4: '震', 5: '震', 6: '震', 7: '震',
            8: '巽', 9: '巽', 10: '巽', 11: '巽',
            12: '離', 13: '離', 14: '坤', 15: '坤',
            16: '兌', 17: '兌', 18: '兌', 19: '兌',
            20: '乾', 21: '乾', 22: '坎', 23: '坎'
        };
        return hourToGua[hour] || '坤';
    }

    // 輔助：獲取季節
    getSeason(month) {
        if (month >= 3 && month <= 5) return '春';
        if (month >= 6 && month <= 8) return '夏';
        if (month >= 9 && month <= 11) return '秋';
        return '冬';
    }

    // 輔助：獲取季節五行
    getSeasonElement(season) {
        const map = { '春': '木', '夏': '火', '秋': '金', '冬': '水' };
        return map[season] || '土';
    }

    // 輔助：簡化農曆計算 (舊版兼容)
    simplifiedLunarCalculation(year, month, day) {
        return { year: year - 1900 + 36, month, day };
    }

    // 輔助：估算筆畫數 (舊版兼容)
    estimateStrokeCount(character) {
        const commonStrokes = {
            '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
            '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
            '天': 4, '地': 6, '人': 2, '日': 4, '月': 4
        };
        return commonStrokes[character] || (character.charCodeAt(0) % 8) + 1;
    }

    // 輔助：根據卦名獲取八卦 (舊版兼容)
    getGuaByNumber(number) {
        const data = BAGUA_FUNDAMENTALS['先天八卦'];
        for (const key in data) {
            if (data[key].number === number) return data[key].name;
        }
        return '乾';
    }
}

// 簡單導出供 Node 或其他模組系統使用（瀏覽器中可直接使用全域變數）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        PlumBlossomCalculator, 
        BAGUA_FUNDAMENTALS, 
        HEXAGRAM_NAMES_MAP,
        FIVE_ELEMENTS_SYSTEM,
        YAO_POSITIONS
    };
}

// 瀏覽器環境掛載
if (typeof window !== 'undefined') {
    window.PlumBlossomCalculator = PlumBlossomCalculator;
    window.HEXAGRAM_NAMES_MAP = HEXAGRAM_NAMES_MAP;
}