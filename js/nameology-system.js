/**
 * 靜月之光 - 完整姓名學分析系統
 * 包含：五格剖象法、81數理、三才配置、五行分析、生肖姓名學、現代姓名學
 */

// ==========================================
// 1. 核心數據結構
// ==========================================

// 1.1 康熙字典筆畫數（常用字部分）
const KANGXI_STROKE_COUNT = {
    // 一畫
    '一': 1, '乙': 1,
    // 二畫
    '二': 2, '十': 2, '丁': 2, '七': 2, '卜': 2, '人': 2, '入': 2, '八': 2, '刀': 2, '力': 2,
    // 三畫
    '三': 3, '千': 3, '大': 3, '小': 3, '上': 3, '下': 3, '土': 3, '工': 3, '子': 3, '女': 3,
    '王': 4, // 注意：王字實際4畫
    // 四畫
    '中': 4, '文': 4, '方': 4, '心': 4, '日': 4, '月': 4, '木': 4, '火': 4, '水': 4, '牛': 4,
    // 五畫
    '弘': 5, '玉': 5, '石': 5, '田': 5, '立': 5, '正': 5, '世': 5, '民': 5, '永': 5, '可': 5,
    // 六畫
    '林': 8, '安': 6, '宇': 6, '光': 6, '成': 7,
    // 七畫
    '志': 7, '孝': 7, '君': 7, '秀': 7, '利': 7,
    // 八畫
    '明': 8, '承': 8, '孟': 8, '宗': 8, '東': 8,
    // 九畫
    '美': 9, '英': 9, '俊': 9, '冠': 9, '思': 9,
    // 十畫
    '家': 10, '哲': 10, '軒': 10, '倫': 10, '晉': 10,
    // 十一畫
    '偉': 11, '健': 11, '國': 11, '祥': 11, '紹': 11,
    // 十二畫
    '傑': 12, '勝': 12, '超': 12, '鈞': 12, '鈺': 13,
    // 十三畫
    '傳': 13, '義': 13, '誠': 13, '聖': 13, '裕': 13,
    // 十四畫
    '嘉': 14, '壽': 14, '榮': 14, '福': 14, '銘': 14,
    // 十五畫
    '德': 15, '慶': 15, '賢': 15, '輝': 15, '震': 15,
    // 十六畫
    '龍': 16, '興': 16, '運': 16, '學': 16, '靜': 16,
    // 十七畫
    '鴻': 17, '燦': 17, '聰': 17, '謙': 17,
    // 十八畫
    '璧': 18, '豐': 18, '禮': 18, '曜': 18,
    // 十九畫
    '鵬': 19, '麗': 19, '麒': 19, '韻': 19,
    // 二十畫
    '寶': 20, '耀': 20, '馨': 20, '瀚': 20,
    // 二十一畫以上
    '權': 22, '驤': 27, '艷': 28,
    // 常用姓氏
    '陳': 11, '李': 7, '王': 4, '張': 11, '劉': 15, '黃': 12, '吳': 7, '周': 8,
    '林': 8, '徐': 10, '朱': 6, '馬': 10, '胡': 9, '郭': 15, '何': 7, '高': 10,
    '羅': 19, '鄭': 14, '梁': 11, '謝': 17, '宋': 7, '唐': 10, '許': 11, '韓': 17,
    '馮': 12, '鄧': 19, '曹': 11, '彭': 12, '曾': 12, '蕭': 18, '田': 5, '董': 15,
    '潘': 16, '袁': 10, '于': 3, '余': 7, '葉': 12, '蔣': 17, '杜': 7, '蘇': 21,
    '程': 12, '魏': 17, '呂': 7, '丁': 2, '任': 6, '沈': 7, '姚': 9, '盧': 16,
    '姜': 9, '崔': 11, '鍾': 17, '譚': 19, '陸': 11, '汪': 7, '范': 8, '金': 8,
    '石': 5, '廖': 14, '賈': 13, '夏': 10, '韋': 9, '付': 5, '方': 4, '白': 5,
    '鄒': 12, '孟': 8, '熊': 14, '秦': 10, '邱': 12, '江': 6, '尹': 4, '薛': 19,
    '閻': 16, '段': 9, '雷': 13, '侯': 9, '龍': 16, '史': 5, '陶': 16, '黎': 15,
    '賀': 12, '顧': 21, '毛': 4, '郝': 14, '龔': 22, '邵': 12, '萬': 12, '錢': 16,
    '嚴': 19, '覃': 12, '武': 8, '戴': 17, '莫': 10, '孔': 4, '向': 6, '湯': 12
};

// 數字對應筆畫
const NUMBER_STROKES = {
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9, '0': 0
};

// 1.2 81數理吉凶
const EIGHTY_ONE_NUMEROLOGY = {
    auspicious: [1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 17, 18, 21, 23, 24, 25, 29, 
                 31, 32, 33, 35, 37, 39, 41, 45, 47, 48, 52, 57, 61, 63, 65, 
                 67, 68, 73, 75, 77, 78, 81],
    semiAuspicious: [27, 28, 30, 38, 40, 42, 43, 50, 51, 53, 55, 58, 62, 69, 71],
    inauspicious: [2, 4, 9, 10, 12, 14, 19, 20, 22, 26, 27, 28, 34, 36, 42, 
                   43, 44, 46, 49, 50, 51, 53, 54, 56, 59, 60, 62, 64, 66, 
                   69, 70, 71, 72, 74, 76, 79, 80],
    leadership: [21, 23, 29, 33, 39, 41, 45, 47, 48],
    femaleLonely: [21, 23, 26, 28, 29, 33, 39],
    wealth: [15, 16, 24, 29, 32, 33, 41, 52],
    artistic: [13, 14, 18, 26, 29, 33, 35, 38, 48],
    detailed: {
        1: { luck: '大吉', meaning: '太極之數，萬物開泰，生發無窮，利祿亨通。' },
        2: { luck: '凶', meaning: '兩儀之數，混沌未開，進退保守，志望難達。' },
        3: { luck: '大吉', meaning: '三才之數，天地人和，大事大業，繁榮昌隆。' },
        4: { luck: '凶', meaning: '四象之數，待於生發，萬事慎重，不具營謀。' },
        5: { luck: '大吉', meaning: '五行俱權，循環相生，圓通暢達，福祉無窮。' },
        6: { luck: '大吉', meaning: '六爻之數，發展變化，天賦美德，吉祥安泰。' },
        7: { luck: '吉', meaning: '七政之數，精悍嚴謹，天賦之力，吉星照耀。' },
        8: { luck: '吉', meaning: '八卦之數，乾坎艮震，巽離坤兌，無窮無盡。' },
        9: { luck: '凶', meaning: '大成之數，蘊涵凶險，或成或敗，難以把握。' },
        10: { luck: '凶', meaning: '終結之數，雪暗飄零，偶或有成，回顧茫然。' },
        11: { luck: '大吉', meaning: '旱苗逢雨，萬物更新，調順發達，繁榮富貴。' },
        12: { luck: '凶', meaning: '掘井無泉，薄弱無力，外祥內苦，謀事難成。' },
        13: { luck: '吉', meaning: '春日牡丹，才藝多能，智謀奇略，鳴奏大功。' },
        14: { luck: '凶', meaning: '破兆，家庭緣薄，孤獨遭難，謀事不達，悲慘不測。' },
        15: { luck: '大吉', meaning: '福壽，福壽圓滿，富貴榮譽，涵養雅量，德高望重。' },
        16: { luck: '大吉', meaning: '厚重，厚重載德，安富尊榮，財官雙美，功成名就。' },
        17: { luck: '半吉', meaning: '剛強，權威剛強，突破萬難，如能容忍，必獲成功。' },
        18: { luck: '半吉', meaning: '鐵鏡重磨，權威顯達，博得名利，且養柔德。' },
        19: { luck: '凶', meaning: '多難，風雲蔽日，辛苦重來，雖有智謀，萬事挫折。' },
        20: { luck: '凶', meaning: '屋下藏金，非業破運，災難重重，進退維谷，萬事難成。' },
        21: { luck: '大吉', meaning: '明月中天，光風霽月，萬物確立，官運亨通，大搏名利。' },
        22: { luck: '凶', meaning: '秋草逢霜，困難疾弱，雖出豪傑，人生波折。' },
        23: { luck: '大吉', meaning: '壯麗，旭日東升，壯麗壯觀，權威旺盛，功名榮達。' },
        24: { luck: '大吉', meaning: '掘藏得金，家門餘慶，金錢豐盈，白手成家，財源廣進。' },
        25: { luck: '吉', meaning: '英俊，資性英敏，才能奇特，克服傲慢，尚可成功。' },
        26: { luck: '凶', meaning: '變怪，變怪之謎，英雄豪傑，波瀾重疊，而奏大功。' },
        27: { luck: '凶', meaning: '增長，欲望無止，自我強烈，多受毀謗，尚可成功。' },
        28: { luck: '凶', meaning: '闊水浮萍，遭難之數，豪傑氣概，四海漂泊，終世浮躁。' },
        29: { luck: '大吉', meaning: '智謀，智謀優秀，財力歸集，名聞海內，成就大業。' },
        30: { luck: '半吉', meaning: '非運，沉浮不定，凶吉難變，若明若暗，大成大敗。' },
        81: { luck: '大吉', meaning: '最極之數，還本歸元，能得繁榮，發達成功。' }
    }
};

// 1.3 三才配置吉凶表（部分）
const THREE_TALENTS_CONFIGURATION = {
    '木木木': { luck: '吉', meaning: '性情溫厚平靜，一般與同事和朋友的關係好。具有犧牲精神。' },
    '木木火': { luck: '吉', meaning: '成功順利伸展，希望圓滿達成，基礎安定，能向上發展。' },
    '木木土': { luck: '吉', meaning: '人格之木立於地格土之上，順應自然生態之妙配，創造力佳。' },
    '木木金': { luck: '凶', meaning: '雖有困難，若努力進取亦能成功，但多身心過勞。' },
    '木木水': { luck: '吉', meaning: '成功運佳，境遇安定，唯數理凶者易生災難。' },
    '木火木': { luck: '大吉', meaning: '得上下之惠助，順調成功發展，基礎穩固，境遇安泰。' },
    '木火火': { luck: '中吉', meaning: '順利成功，易達目的，基礎平穩，心身健全，可得長壽幸福。' },
    '木火土': { luck: '吉', meaning: '受上司的引進，得成功順利發展，基礎強固，身心平安。' },
    '木火金': { luck: '凶', meaning: '雖因苦心奮鬥而有成功運，但基礎運劣，易生意外之災難。' },
    '木火水': { luck: '凶', meaning: '雖有一時的成功，但基礎不穩，易生突發之變。' },
    '火木木': { luck: '大吉', meaning: '有向上發展的生機，目的容易達到而成功。' },
    '火木火': { luck: '大吉', meaning: '成功運佳，向上發展容易達到目的。' },
    '火木土': { luck: '大吉', meaning: '基礎堅固，境遇安然，勤智交輝而能博得財利。' },
    '金金金': { luck: '大凶', meaning: '性情剛硬，易生衝突，孤獨無助，易遭失敗。' },
    '金金木': { luck: '大凶', meaning: '雙金克木，易生災禍，家庭不和，事業挫折。' }
};

// 1.4 五行與數字對應
const FIVE_ELEMENTS_NUMBERS = {
    '木': [1, 2],
    '火': [3, 4],
    '土': [5, 6],
    '金': [7, 8],
    '水': [9, 0]
};

const NUMBERS_TO_ELEMENT = {
    1: '木', 2: '木',
    3: '火', 4: '火',
    5: '土', 6: '土',
    7: '金', 8: '金',
    9: '水', 0: '水'
};

// 1.5 生肖姓名學（部分示例）
const ZODIAC_NAME_ANALYSIS = {
    '鼠': {
        favorable: { radicals: ['米', '豆', '禾', '梁', '麥', '艹'], characters: ['家', '富', '寶', '宇', '安', '宏', '容'] },
        unfavorable: { radicals: ['日', '光', '午', '馬', '火', '灬'], characters: ['明', '輝', '駿', '炎', '炳'] }
    },
    '牛': {
        favorable: { radicals: ['艹', '禾', '米', '豆', '麥', '車', '宀'], characters: ['浩', '清', '潤', '海', '澤', '家', '安'] },
        unfavorable: { radicals: ['心', '忄', '月', '羊', '未'], characters: ['志', '忠', '怡', '勝', '美'] }
    },
    '虎': {
        favorable: { radicals: ['山', '林', '木', '王', '君', '令', '大'], characters: ['峰', '岳', '林', '森', '琳', '珺'] },
        unfavorable: { radicals: ['日', '光', '田', '小', '示'], characters: ['明', '晶', '思', '福', '神'] }
    },
    '兔': {
        favorable: { radicals: ['月', '艹', '禾', '米', '豆', '麥', '木'], characters: ['朋', '青', '芸', '芳', '秋', '秀'] },
        unfavorable: { radicals: ['日', '陽', '金', '酉', '西', '鳥'], characters: ['旭', '昶', '鋒', '銘', '鳳'] }
    },
    '龍': {
        favorable: { radicals: ['水', '氵', '雨', '雲', '日', '月', '王', '大'], characters: ['海', '江', '沛', '晨', '明', '玥', '珮'] },
        unfavorable: { radicals: ['山', '丘', '艮', '戌', '犬', '犭'], characters: ['岳', '峰', '成', '猛', '獅'] }
    },
    '蛇': {
        favorable: { radicals: ['艹', '木', '禾', '米', '豆', '口', '宀'], characters: ['芸', '芷', '和', '嘉', '園', '安'] },
        unfavorable: { radicals: ['日', '光', '火', '灬', '人', '亻'], characters: ['旭', '炎', '傑', '仁', '仲'] }
    },
    '馬': {
        favorable: { radicals: ['艹', '禾', '米', '豆', '麥', '木', '糸'], characters: ['英', '華', '秋', '秀', '綾', '緯'] },
        unfavorable: { radicals: ['田', '水', '氵', '子', '牛', '丑'], characters: ['富', '男', '海', '泳', '子', '妞'] }
    },
    '羊': {
        favorable: { radicals: ['艹', '木', '禾', '米', '豆', '麥', '口'], characters: ['芳', '芸', '和', '品', '嘉', '園'] },
        unfavorable: { radicals: ['心', '忄', '月', '犭', '虎', '豸'], characters: ['思', '忠', '念', '彪', '豹'] }
    },
    '猴': {
        favorable: { radicals: ['木', '禾', '米', '豆', '麥', '山', '石'], characters: ['林', '杉', '秋', '秀', '峰', '岩'] },
        unfavorable: { radicals: ['火', '灬', '日', '光', '人', '亻'], characters: ['炎', '炳', '明', '晶', '仁', '仲'] }
    },
    '雞': {
        favorable: { radicals: ['米', '豆', '禾', '梁', '麥', '山', '石'], characters: ['精', '粹', '峰', '岩', '碩', '碁'] },
        unfavorable: { radicals: ['犭', '犬', '戌', '東', '月', '兔'], characters: ['猛', '獅', '成', '東', '朋'] }
    },
    '狗': {
        favorable: { radicals: ['人', '亻', '入', '宀', '家', '心', '忄'], characters: ['仁', '仕', '安', '家', '忠', '怡'] },
        unfavorable: { radicals: ['日', '火', '灬', '龍', '辰'], characters: ['旭', '炎', '炳', '晨', '震'] }
    },
    '豬': {
        favorable: { radicals: ['豆', '米', '禾', '梁', '麥', '宀', '冖'], characters: ['家', '安', '宏', '容', '富', '寶'] },
        unfavorable: { radicals: ['糸', '彡', '巾', '示', '刀', '血'], characters: ['綵', '彥', '帥', '福', '刀', '血'] }
    }
};

// ==========================================
// 2. 姓名學核心計算類
// ==========================================

class NameAnalysisSystem {
    constructor() {
        this.strokeData = KANGXI_STROKE_COUNT;
        this.numerology = EIGHTY_ONE_NUMEROLOGY;
        this.zodiacData = ZODIAC_NAME_ANALYSIS;
    }
    
    // 主分析函數
    analyzeFullName(fullName, birthYear = null, gender = 'male') {
        const nameParts = this.splitChineseName(fullName);
        if (!nameParts) {
            return { error: '姓名格式錯誤' };
        }
        
        const strokes = this.calculateStrokes(nameParts);
        const fivePatterns = this.calculateFivePatterns(nameParts, strokes);
        const threeTalents = this.calculateThreeTalents(fivePatterns);
        const numerologyAnalysis = this.analyzeNumerology(fivePatterns);
        const fiveElementsAnalysis = this.analyzeFiveElements(fivePatterns);
        
        let zodiacAnalysis = null;
        if (birthYear) {
            const zodiac = this.getZodiacByYear(birthYear);
            zodiacAnalysis = this.analyzeZodiacName(nameParts, zodiac);
        }
        
        const structureAnalysis = this.analyzeCharacterStructure(nameParts);
        const overallScore = this.calculateOverallScore(numerologyAnalysis, threeTalents, fiveElementsAnalysis, zodiacAnalysis);
        const suggestions = this.generateSuggestions(nameParts, fivePatterns, numerologyAnalysis, threeTalents, fiveElementsAnalysis, zodiacAnalysis, gender);
        
        return {
            basicInfo: {
                fullName,
                surname: nameParts.surname,
                givenName: nameParts.givenName,
                birthYear,
                zodiac: birthYear ? this.getZodiacByYear(birthYear) : null,
                gender
            },
            strokes,
            fivePatterns,
            threeTalents,
            numerologyAnalysis,
            fiveElementsAnalysis,
            zodiacAnalysis,
            structureAnalysis,
            overallScore,
            suggestions,
            timestamp: new Date().toISOString()
        };
    }
    
    // 分割中文姓名
    splitChineseName(fullName) {
        if (!fullName || fullName.length < 2) return null;
        
        const compoundSurnames = ['歐陽', '上官', '諸葛', '司馬', '東方', '西門', '南宮', '慕容', '司徒', '司空', '端木', '公孫'];
        
        let surname = '';
        let givenName = '';
        
        for (const compoundSurname of compoundSurnames) {
            if (fullName.startsWith(compoundSurname)) {
                surname = compoundSurname;
                givenName = fullName.substring(compoundSurname.length);
                break;
            }
        }
        
        if (!surname) {
            surname = fullName[0];
            givenName = fullName.substring(1);
        }
        
        return {
            surname,
            givenName,
            isCompoundSurname: surname.length > 1,
            surnameLength: surname.length,
            givenNameLength: givenName.length
        };
    }
    
    // 計算筆畫數
    calculateStrokes(nameParts) {
        const strokes = {
            surnameStrokes: [],
            givenNameStrokes: [],
            totalStrokes: []
        };
        
        for (let char of nameParts.surname) {
            const stroke = this.getStrokeCount(char);
            strokes.surnameStrokes.push(stroke);
            strokes.totalStrokes.push(stroke);
        }
        
        for (let char of nameParts.givenName) {
            const stroke = this.getStrokeCount(char);
            strokes.givenNameStrokes.push(stroke);
            strokes.totalStrokes.push(stroke);
        }
        
        strokes.total = strokes.totalStrokes.reduce((a, b) => a + b, 0);
        return strokes;
    }
    
    // 查詢單字筆畫數
    getStrokeCount(character) {
        if (this.strokeData[character]) {
            return this.strokeData[character];
        }
        if (NUMBER_STROKES[character] !== undefined) {
            return NUMBER_STROKES[character];
        }
        // 簡化估算
        const code = character.charCodeAt(0);
        return (code >= 0x4E00 && code <= 0x9FFF) ? 8 : 1;
    }
    
    // 計算五格
    calculateFivePatterns(nameParts, strokes) {
        const patterns = {};
        const surnameStrokes = strokes.surnameStrokes;
        const givenNameStrokes = strokes.givenNameStrokes;
        
        // 天格
        let heavenNum;
        if (nameParts.isCompoundSurname) {
            heavenNum = surnameStrokes[0] + surnameStrokes[1];
        } else {
            heavenNum = surnameStrokes[0] + 1;
        }
        
        // 人格
        let personalityNum;
        if (nameParts.isCompoundSurname) {
            personalityNum = surnameStrokes[1] + (givenNameStrokes[0] || 0);
        } else {
            personalityNum = surnameStrokes[0] + (givenNameStrokes[0] || 0);
        }
        
        // 地格
        let earthNum;
        if (givenNameStrokes.length === 1) {
            earthNum = givenNameStrokes[0] + 1;
        } else if (givenNameStrokes.length >= 2) {
            earthNum = givenNameStrokes[0] + givenNameStrokes[1];
        } else {
            earthNum = 1;
        }
        
        // 總格
        const totalNum = strokes.total;
        
        // 外格
        let externalNum;
        if (nameParts.isCompoundSurname && givenNameStrokes.length >= 2) {
            externalNum = (surnameStrokes[1] + givenNameStrokes[1]) - (surnameStrokes[0] + givenNameStrokes[0]) + 1;
        } else if (nameParts.isCompoundSurname && givenNameStrokes.length === 1) {
            externalNum = (surnameStrokes[1] + 1) - (surnameStrokes[0] + givenNameStrokes[0]) + 1;
        } else if (!nameParts.isCompoundSurname && givenNameStrokes.length >= 2) {
            externalNum = (surnameStrokes[0] + givenNameStrokes[1]) - (surnameStrokes[0] + givenNameStrokes[0]) + 1;
        } else {
            externalNum = 2;
        }
        
        if (externalNum < 0) {
            externalNum = Math.abs(externalNum) + 1;
        }
        
        // 計算五行
        const heavenElement = this.numberToElement(heavenNum);
        const personalityElement = this.numberToElement(personalityNum);
        const earthElement = this.numberToElement(earthNum);
        const externalElement = this.numberToElement(externalNum);
        const totalElement = this.numberToElement(totalNum);
        
        // 獲取數理吉凶
        const getNumerology = (num) => {
            const normalizedNum = num > 81 ? num - 80 : num;
            return this.numerology.detailed[normalizedNum] || { luck: '中', meaning: '此數理較為特殊' };
        };
        
        // 返回完整的五格數據
        return {
            heaven: {
                number: heavenNum,
                element: heavenElement,
                luck: getNumerology(heavenNum).luck,
                meaning: getNumerology(heavenNum).meaning
            },
            person: {
                number: personalityNum,
                element: personalityElement,
                luck: getNumerology(personalityNum).luck,
                meaning: getNumerology(personalityNum).meaning
            },
            earth: {
                number: earthNum,
                element: earthElement,
                luck: getNumerology(earthNum).luck,
                meaning: getNumerology(earthNum).meaning
            },
            outer: {
                number: externalNum,
                element: externalElement,
                luck: getNumerology(externalNum).luck,
                meaning: getNumerology(externalNum).meaning
            },
            total: {
                number: totalNum,
                element: totalElement,
                luck: getNumerology(totalNum).luck,
                meaning: getNumerology(totalNum).meaning
            },
            // 保留舊格式以兼容
            heavenElement,
            personalityElement,
            earthElement,
            externalElement,
            totalElement
        };
    }
    
    // 數字轉五行
    numberToElement(number) {
        const lastDigit = number % 10;
        return NUMBERS_TO_ELEMENT[lastDigit] || '土';
    }
    
    // 計算三才配置
    calculateThreeTalents(fivePatterns) {
        // 兼容新舊格式
        const heavenNum = fivePatterns.heaven?.number || fivePatterns.heaven;
        const personalityNum = fivePatterns.person?.number || fivePatterns.personality || fivePatterns.person;
        const earthNum = fivePatterns.earth?.number || fivePatterns.earth;
        
        const heavenElement = fivePatterns.heaven?.element || this.numberToElement(heavenNum);
        const personalityElement = fivePatterns.person?.element || fivePatterns.personalityElement || this.numberToElement(personalityNum);
        const earthElement = fivePatterns.earth?.element || this.numberToElement(earthNum);
        
        const combination = heavenElement + personalityElement + earthElement;
        const configuration = THREE_TALENTS_CONFIGURATION[combination] || 
                            { luck: '中', meaning: '此三才配置較為特殊，需詳細分析' };
        
        // 分析五行關係
        const elementRelations = this.analyzeElementRelations(heavenElement, personalityElement, earthElement);
        
        return {
            configuration: combination,
            elements: `${heavenElement}${personalityElement}${earthElement}`,
            heavenElement,
            personalityElement,
            earthElement,
            luck: configuration.luck,
            description: configuration.meaning,
            elementRelations
        };
    }
    
    // 分析五行相生相剋關係
    analyzeElementRelations(heaven, personality, earth) {
        const relations = [];
        
        // 天格與人格關係
        if (heaven === personality) {
            relations.push(`天格${heaven}與人格${personality}比和`);
        } else if (this.isElementGenerating(heaven, personality)) {
            relations.push(`天格${heaven}生人格${personality}(相生)`);
        } else if (this.isElementOvercoming(heaven, personality)) {
            relations.push(`天格${heaven}剋人格${personality}(相剋)`);
        }
        
        // 人格與地格關係
        if (personality === earth) {
            relations.push(`人格${personality}與地格${earth}比和`);
        } else if (this.isElementGenerating(personality, earth)) {
            relations.push(`人格${personality}生地格${earth}(相生)`);
        } else if (this.isElementOvercoming(personality, earth)) {
            relations.push(`人格${personality}剋地格${earth}(相剋)`);
        }
        
        return relations.join('；');
    }
    
    // 判斷五行相生
    isElementGenerating(generator, generated) {
        const generatingMap = {
            '木': '火',
            '火': '土',
            '土': '金',
            '金': '水',
            '水': '木'
        };
        return generatingMap[generator] === generated;
    }
    
    // 判斷五行相剋
    isElementOvercoming(overcomer, overcome) {
        const overcomingMap = {
            '木': '土',
            '土': '水',
            '水': '火',
            '火': '金',
            '金': '木'
        };
        return overcomingMap[overcomer] === overcome;
    }
    
    // 分析81數理
    analyzeNumerology(fivePatterns) {
        const analysis = {};
        const patterns = ['heaven', 'person', 'earth', 'outer', 'total'];
        const patternMap = {
            'heaven': 'heaven',
            'person': 'person',
            'earth': 'earth',
            'outer': 'outer',
            'total': 'total'
        };
        
        patterns.forEach(pattern => {
            // 兼容新舊格式
            const patternData = fivePatterns[pattern] || fivePatterns[patternMap[pattern]] || {};
            const number = patternData.number || patternData || fivePatterns[pattern];
            const element = patternData.element || fivePatterns[`${pattern}Element`] || fivePatterns[`${patternMap[pattern]}Element`];
            
            // 標準化數理（超過81則減去80）
            const normalizedNum = number > 81 ? number - 80 : number;
            const numerology = this.numerology.detailed[normalizedNum] || 
                             { luck: '中', meaning: '此數理較為特殊' };
            
            analysis[pattern] = {
                number,
                element,
                luck: numerology.luck,
                meaning: numerology.meaning,
                isAuspicious: this.numerology.auspicious.includes(normalizedNum),
                isInauspicious: this.numerology.inauspicious.includes(normalizedNum),
                specialNotes: this.getSpecialNotes(normalizedNum)
            };
        });
        
        return analysis;
    }
    
    // 五行配置分析
    analyzeFiveElements(fivePatterns) {
        const elements = {
            heaven: fivePatterns.heavenElement,
            personality: fivePatterns.personalityElement,
            earth: fivePatterns.earthElement,
            external: fivePatterns.externalElement,
            total: fivePatterns.totalElement
        };
        
        const elementCount = this.countElements(elements);
        const balanceScore = this.calculateElementBalanceScore(elementCount);
        
        return {
            elements,
            elementCount,
            balanceScore,
            missingElements: this.findMissingElements(elementCount),
            excessiveElements: this.findExcessiveElements(elementCount)
        };
    }
    
    // 生肖姓名分析
    analyzeZodiacName(nameParts, zodiac) {
        const zodiacInfo = this.zodiacData[zodiac];
        if (!zodiacInfo) return null;
        
        const analysis = {
            zodiac,
            favorableCharacters: [],
            unfavorableCharacters: [],
            favorableRadicals: [],
            unfavorableRadicals: [],
            score: 0
        };
        
        for (let char of nameParts.surname + nameParts.givenName) {
            if (zodiacInfo.favorable.characters.includes(char)) {
                analysis.favorableCharacters.push(char);
            }
            if (zodiacInfo.unfavorable.characters.includes(char)) {
                analysis.unfavorableCharacters.push(char);
            }
            for (let radical of zodiacInfo.favorable.radicals) {
                if (char.includes(radical)) {
                    analysis.favorableRadicals.push({ character: char, radical });
                }
            }
            for (let radical of zodiacInfo.unfavorable.radicals) {
                if (char.includes(radical)) {
                    analysis.unfavorableRadicals.push({ character: char, radical });
                }
            }
        }
        
        analysis.score = 50 + analysis.favorableCharacters.length * 10 + 
                         analysis.favorableRadicals.length * 5 -
                         analysis.unfavorableCharacters.length * 15 -
                         analysis.unfavorableRadicals.length * 10;
        analysis.score = Math.max(0, Math.min(100, analysis.score));
        
        return analysis;
    }
    
    // 字形結構分析
    analyzeCharacterStructure(nameParts) {
        return {
            surnameStructures: [],
            givenNameStructures: [],
            overallStructure: '中等',
            recommendations: []
        };
    }
    
    // 綜合評分計算
    calculateOverallScore(numerology, threeTalents, fiveElements, zodiacAnalysis) {
        let score = 0;
        let totalWeight = 0;
        
        const numerologyScore = this.calculateNumerologyScore(numerology);
        score += numerologyScore * 0.4;
        totalWeight += 0.4;
        
        const threeTalentsScore = this.calculateThreeTalentsScore(threeTalents);
        score += threeTalentsScore * 0.3;
        totalWeight += 0.3;
        
        score += (fiveElements.balanceScore / 100) * 0.2;
        totalWeight += 0.2;
        
        if (zodiacAnalysis) {
            score += (zodiacAnalysis.score / 100) * 0.1;
            totalWeight += 0.1;
        }
        
        return Math.round((score / totalWeight) * 100);
    }
    
    // 生成建議
    generateSuggestions(nameParts, fivePatterns, numerology, threeTalents, fiveElements, zodiacAnalysis, gender) {
        const suggestions = {
            strengths: [],
            weaknesses: [],
            immediateActions: [],
            longTermAdvice: [],
            luckyNumbers: [],
            favorableElements: [],
            avoidElements: []
        };
        
        // 安全訪問numerology數據
        const personality = numerology.person || numerology.personality || {};
        if (personality.isAuspicious) {
            suggestions.strengths.push(`人格數理 ${personality.number || ''} (${personality.luck || ''}): ${personality.meaning || ''}`);
        }
        
        if (threeTalents && (threeTalents.luck === '大吉' || threeTalents.luck === '吉')) {
            const combination = threeTalents.combination || threeTalents.configuration || '';
            const meaning = threeTalents.meaning || threeTalents.description || '';
            suggestions.strengths.push(`三才配置 ${combination} (${threeTalents.luck}): ${meaning}`);
        }
        
        if (personality.isInauspicious) {
            suggestions.weaknesses.push(`人格數理 ${personality.number || ''} 為凶數，可能影響個性發展`);
        }
        
        if (threeTalents && (threeTalents.luck === '凶' || threeTalents.luck === '大凶')) {
            const combination = threeTalents.combination || threeTalents.configuration || '';
            const meaning = threeTalents.meaning || threeTalents.description || '';
            suggestions.weaknesses.push(`三才配置 ${combination} (${threeTalents.luck}): ${meaning}`);
        }
        
        if (fiveElements && fiveElements.missingElements && fiveElements.missingElements.length > 0) {
            suggestions.immediateActions.push(`補充五行: ${fiveElements.missingElements.join('、')}`);
        }
        
        if (zodiacAnalysis && zodiacAnalysis.unfavorableCharacters && zodiacAnalysis.unfavorableCharacters.length > 0) {
            suggestions.weaknesses.push(`姓名中有生肖忌用字: ${zodiacAnalysis.unfavorableCharacters.join('、')}`);
        }
        
        // 安全獲取五格數理
        const personNum = fivePatterns.person?.number || fivePatterns.personality?.number || fivePatterns.personality || fivePatterns.person || null;
        const totalNum = fivePatterns.total?.number || fivePatterns.total || null;
        suggestions.luckyNumbers = [personNum, totalNum].filter(n => n !== null);
        suggestions.favorableElements = (fiveElements && fiveElements.missingElements) ? fiveElements.missingElements : [];
        
        return suggestions;
    }
    
    // 輔助函數
    getZodiacByYear(year) {
        const zodiacs = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];
        const startYear = 1900;
        const index = (year - startYear) % 12;
        return zodiacs[(index + 12) % 12];
    }
    
    getSpecialNotes(number) {
        const notes = [];
        if (this.numerology.leadership.includes(number)) notes.push('領導數');
        if (this.numerology.wealth.includes(number)) notes.push('財富數');
        if (this.numerology.artistic.includes(number)) notes.push('藝術數');
        return notes;
    }
    
    calculateNumerologyScore(numerology) {
        if (!numerology || typeof numerology !== 'object') {
            return 0;
        }
        
        let score = 0;
        const patterns = ['heaven', 'person', 'earth', 'outer', 'total'];
        const patternMap = {
            'heaven': 'heaven',
            'person': 'person',
            'earth': 'earth',
            'outer': 'outer',
            'total': 'total'
        };
        const weights = { person: 0.4, earth: 0.3, total: 0.2, heaven: 0.05, outer: 0.05 };
        
        patterns.forEach(pattern => {
            // 嘗試多種可能的鍵名
            const patternAnalysis = numerology[pattern] || numerology[patternMap[pattern]] || {};
            if (!patternAnalysis || typeof patternAnalysis !== 'object') {
                return; // 跳過無效數據
            }
            
            if (patternAnalysis.isAuspicious) {
                score += (weights[pattern] || 0.1) * 1.0;
            } else if (patternAnalysis.isInauspicious) {
                score += (weights[pattern] || 0.1) * 0.3;
            } else {
                score += (weights[pattern] || 0.1) * 0.6;
            }
        });
        
        return score;
    }
    
    calculateThreeTalentsScore(threeTalents) {
        const luckScores = {
            '大吉': 1.0, '吉': 0.8, '中吉': 0.7, '半吉': 0.6, '平': 0.5,
            '凶': 0.3, '大凶': 0.1, '未知': 0.5
        };
        return luckScores[threeTalents.luck] || 0.5;
    }
    
    countElements(elements) {
        const count = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
        Object.values(elements).forEach(element => {
            if (count[element] !== undefined) count[element]++;
        });
        return count;
    }
    
    calculateElementBalanceScore(elementCount) {
        const total = Object.values(elementCount).reduce((a, b) => a + b, 0);
        if (total === 0) return 50;
        const average = total / 5;
        let variance = 0;
        Object.values(elementCount).forEach(count => {
            variance += Math.pow(count - average, 2);
        });
        const stdDev = Math.sqrt(variance / 5);
        const maxStdDev = Math.sqrt(Math.pow(total, 2) / 5);
        const balance = 100 * (1 - stdDev / maxStdDev);
        return Math.round(balance);
    }
    
    findMissingElements(elementCount) {
        const missing = [];
        ['木', '火', '土', '金', '水'].forEach(element => {
            if (elementCount[element] === 0) missing.push(element);
        });
        return missing;
    }
    
    findExcessiveElements(elementCount) {
        const excessive = [];
        const total = Object.values(elementCount).reduce((a, b) => a + b, 0);
        const average = total / 5;
        Object.entries(elementCount).forEach(([element, count]) => {
            if (count > average * 1.5) excessive.push(element);
        });
        return excessive;
    }
}

// 導出供外部使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NameAnalysisSystem };
}
