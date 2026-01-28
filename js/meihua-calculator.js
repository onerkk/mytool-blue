class MeihuaCalculator {
    constructor() {
        this.guaData = this.loadGuaData();
        this.characterStrokes = this.loadCharacterStrokes();
    }

    loadGuaData() {
        return {
            eightGua: {
                '111': { name: '乾', wuxing: '金', nature: '天', number: 1 },
                '011': { name: '兌', wuxing: '金', nature: '澤', number: 2 },
                '101': { name: '離', wuxing: '火', nature: '火', number: 3 },
                '001': { name: '震', wuxing: '木', nature: '雷', number: 4 },
                '110': { name: '巽', wuxing: '木', nature: '風', number: 5 },
                '010': { name: '坎', wuxing: '水', nature: '水', number: 6 },
                '100': { name: '艮', wuxing: '土', nature: '山', number: 7 },
                '000': { name: '坤', wuxing: '土', nature: '地', number: 8 }
            },
            // 完整五行生剋
            wuxingShengke: {
                '金': { generates: '水', overcomes: '木', generatedBy: '土', overcomeBy: '火' },
                '木': { generates: '火', overcomes: '土', generatedBy: '水', overcomeBy: '金' },
                '水': { generates: '木', overcomes: '火', generatedBy: '金', overcomeBy: '土' },
                '火': { generates: '土', overcomes: '金', generatedBy: '木', overcomeBy: '水' },
                '土': { generates: '金', overcomes: '水', generatedBy: '火', overcomeBy: '木' }
            }
        };
    }

    // 簡化筆劃庫 (可自行擴充)
    loadCharacterStrokes() {
        return {
            '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
            '天': 4, '地': 6, '人': 2, '日': 4, '月': 4, '金': 8, '木': 4, '水': 4, '火': 4, '土': 3,
            '愛': 13, '情': 11, '財': 10, '富': 12, '運': 12, '命': 8, '家': 10, '國': 11, '我': 7
        };
    }

    calculateCharacterStrokes(char) {
        if (this.characterStrokes[char]) return this.characterStrokes[char];
        return Math.min(24, char.charCodeAt(0) % 20 + 1); // 查不到時的算法回退
    }

    // 1. 數字起卦
    numberDivination(num1, num2, num3) {
        let shang = num1 % 8 || 8;
        let xia = num2 % 8 || 8;
        let dong = (num3 ? num3 : (num1 + num2)) % 6 || 6;
        return { shangNum: shang, xiaNum: xia, dongYao: dong };
    }

    // 2. 時間起卦
    timeDivination() {
        const now = new Date();
        const y = now.getFullYear() % 12 + 1; // 簡化地支年
        const m = now.getMonth() + 1;
        const d = now.getDate();
        const h = now.getHours();
        
        let shang = (y + m + d) % 8 || 8;
        let xia = (y + m + d + h) % 8 || 8;
        let dong = (y + m + d + h) % 6 || 6;
        return { shangNum: shang, xiaNum: xia, dongYao: dong };
    }

    // 3. 漢字起卦
    characterDivination(text) {
        if(!text) return this.timeDivination();
        let s1 = this.calculateCharacterStrokes(text[0] || '无');
        let s2 = this.calculateCharacterStrokes(text[1] || text[0] || '无');
        return this.numberDivination(s1, s2, s1 + s2);
    }

    numberToGua(num) {
        const map = { 1:'111', 2:'011', 3:'101', 4:'001', 5:'110', 6:'010', 7:'100', 8:'000' };
        return map[num];
    }

    // 核心：生成報告
    generateReport(method, input1, input2) {
        let res;
        if(method === 'number') res = this.numberDivination(parseInt(input1), parseInt(input2));
        else if(method === 'character') res = this.characterDivination(input1);
        else res = this.timeDivination();

        const shangCode = this.numberToGua(res.shangNum);
        const xiaCode = this.numberToGua(res.xiaNum);
        const shangInfo = this.guaData.eightGua[shangCode];
        const xiaInfo = this.guaData.eightGua[xiaCode];

        // 體用判斷 (動爻所在為用，另一為體)
        let ti, yong;
        if (res.dongYao <= 3) { ti = shangInfo; yong = xiaInfo; } // 下卦動，上為體
        else { ti = xiaInfo; yong = shangInfo; } // 上卦動，下為體

        // 生剋關係
        const relation = this.analyzeWuxing(ti.wuxing, yong.wuxing);

        // 生成變卦（動爻變化後的卦象）
        const bianGua = this.generateBianGua(shangInfo, xiaInfo, res.dongYao, res.shangNum, res.xiaNum);

        return {
            benGua: `${shangInfo.name}${xiaInfo.name}`,
            guaDesc: `上${shangInfo.nature}下${xiaInfo.nature}`,
            ti: ti,
            yong: yong,
            relation: relation,
            dongYao: res.dongYao,
            bianGua: bianGua.name || `${shangInfo.name}${xiaInfo.name}`,
            bianInfo: bianGua
        };
    }

    // 生成變卦（動爻變化後的卦象）
    generateBianGua(shangInfo, xiaInfo, dongYao, shangNum, xiaNum) {
        // 變卦：動爻所在的卦，該爻的陰陽發生變化
        // 簡化版：根據動爻位置，改變對應卦的數字（奇數變偶數，偶數變奇數）
        let bianShangNum = shangNum;
        let bianXiaNum = xiaNum;

        if (dongYao <= 3) {
            // 動爻在下卦，下卦數字變化
            bianXiaNum = xiaNum % 2 === 1 ? (xiaNum === 8 ? 7 : xiaNum + 1) : (xiaNum === 1 ? 2 : xiaNum - 1);
        } else {
            // 動爻在上卦，上卦數字變化
            bianShangNum = shangNum % 2 === 1 ? (shangNum === 8 ? 7 : shangNum + 1) : (shangNum === 1 ? 2 : shangNum - 1);
        }

        // 確保範圍在1-8
        bianShangNum = bianShangNum < 1 ? 8 : (bianShangNum > 8 ? 1 : bianShangNum);
        bianXiaNum = bianXiaNum < 1 ? 8 : (bianXiaNum > 8 ? 1 : bianXiaNum);

        const bianShangCode = this.numberToGua(bianShangNum);
        const bianXiaCode = this.numberToGua(bianXiaNum);
        const bianShangInfo = this.guaData.eightGua[bianShangCode];
        const bianXiaInfo = this.guaData.eightGua[bianXiaCode];

        return {
            name: `${bianShangInfo.name}${bianXiaInfo.name}`,
            desc: `上${bianShangInfo.nature}下${bianXiaInfo.nature}`,
            shang: bianShangInfo,
            xia: bianXiaInfo
        };
    }

    analyzeWuxing(tiWx, yongWx) {
        const rules = this.guaData.wuxingShengke[tiWx];
        if(tiWx === yongWx) return { type: '比和', desc: '吉。體用比和，百事順遂，內外同心。' };
        if(rules.generates === yongWx) return { type: '體生用', desc: '凶。體去生用，消耗自身能量，付出多而回報少。' };
        if(rules.overcomes === yongWx) return { type: '體剋用', desc: '吉。體剋制用，雖有阻力但最終能掌控局勢。' };
        if(rules.generatedBy === yongWx) return { type: '用生體', desc: '大吉。用來生體，外力相助，事半功倍。' };
        if(rules.overcomeBy === yongWx) return { type: '用剋體', desc: '大凶。用來剋體，壓力巨大，外部環境不利。' };
    }
}
