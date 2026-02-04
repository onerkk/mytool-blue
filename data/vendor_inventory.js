/**
 * 您有賣的物件清單：依五行屬性、功效分類，供命主需求配置推薦時僅從此清單篩選。
 * 每筆：id, name（顯示名）, crystalId（對應 CrystalsKB），若無對應則用 elements + intents 內聯。
 * 五行：木/火/土/金/水 權重 0~1；功效 intents：money/career/love/health/relationship/decision/timing
 */
(function (global) {
  'use strict';

  var VENDOR_INVENTORY = [
    { id: 'v1', name: '黃龍宮舍利', crystalId: 'longgong_sheli_yellow', elements: { 木: 0.1, 火: 0.2, 土: 0.85, 金: 0.5, 水: 0.1 }, intents: ['money', 'health', 'decision'] },
    { id: 'v2', name: '血龍宮舍利鼓珠', crystalId: 'longgong_sheli_blood', elements: { 木: 0.1, 火: 0.7, 土: 0.6, 金: 0.2, 水: 0.2 }, intents: ['love', 'health', 'career'] },
    { id: 'v3', name: '血龍宮舍利鼓珠(白)', crystalId: 'longgong_sheli_blood', elements: { 木: 0.1, 火: 0.5, 土: 0.6, 金: 0.5, 水: 0.3 }, intents: ['health', 'decision'] },
    { id: 'v4', name: '紅花碧玉手排', crystalId: null, elements: { 木: 0.3, 火: 0.75, 土: 0.5, 金: 0.1, 水: 0 }, intents: ['love', 'health'] },
    { id: 'v5', name: '阿富汗碧璽', crystalId: 'tourmaline_green', elements: { 木: 0.8, 火: 0.2, 土: 0.2, 金: 0.1, 水: 0.3 }, intents: ['money', 'career', 'health'] },
    { id: 'v6', name: '摩根石', crystalId: 'morganite', elements: { 木: 0.2, 火: 0.5, 土: 0.2, 金: 0, 水: 0.4 }, intents: ['love', 'relationship'] },
    { id: 'v7', name: '糖果碧璽', crystalId: 'tourmaline_multi', elements: { 木: 0.5, 火: 0.4, 土: 0.2, 金: 0.1, 水: 0.4 }, intents: ['love', 'money', 'health'] },
    { id: 'v8', name: '紫水晶', crystalId: 'amethyst', elements: { 木: 0.1, 火: 0.3, 土: 0.2, 金: 0.2, 水: 0.8 }, intents: ['love', 'health', 'decision', 'relationship'] },
    { id: 'v9', name: '綠碧璽', crystalId: 'tourmaline_green', elements: { 木: 0.9, 火: 0.1, 土: 0.2, 金: 0, 水: 0.2 }, intents: ['money', 'career', 'health'] },
    { id: 'v10', name: '堇青石', crystalId: 'iolite', elements: { 木: 0.2, 火: 0.1, 土: 0.2, 金: 0.1, 水: 0.8 }, intents: ['decision', 'timing', 'relationship'] },
    { id: 'v11', name: '設計款A', crystalId: 'clear_quartz', elements: { 木: 0.1, 火: 0.1, 土: 0.2, 金: 0.7, 水: 0.3 }, intents: ['money', 'career', 'health', 'decision'] },
    { id: 'v12', name: '設計款B', crystalId: 'clear_quartz', elements: { 木: 0.1, 火: 0.1, 土: 0.2, 金: 0.7, 水: 0.3 }, intents: ['money', 'career', 'health', 'decision'] },
    { id: 'v13', name: '設計款C', crystalId: 'clear_quartz', elements: { 木: 0.1, 火: 0.1, 土: 0.2, 金: 0.7, 水: 0.3 }, intents: ['money', 'career', 'health', 'decision'] },
    { id: 'v14', name: '設計款D', crystalId: 'clear_quartz', elements: { 木: 0.1, 火: 0.1, 土: 0.2, 金: 0.7, 水: 0.3 }, intents: ['money', 'career', 'health', 'decision'] },
    { id: 'v15', name: '設計款E', crystalId: 'clear_quartz', elements: { 木: 0.1, 火: 0.1, 土: 0.2, 金: 0.7, 水: 0.3 }, intents: ['money', 'career', 'health', 'decision'] },
    { id: 'v16', name: '設計款F', crystalId: 'clear_quartz', elements: { 木: 0.1, 火: 0.1, 土: 0.2, 金: 0.7, 水: 0.3 }, intents: ['money', 'career', 'health', 'decision'] },
    { id: 'v17', name: '設計款G', crystalId: 'clear_quartz', elements: { 木: 0.1, 火: 0.1, 土: 0.2, 金: 0.7, 水: 0.3 }, intents: ['money', 'career', 'health', 'decision'] },
    { id: 'v18', name: '黑曜石貔貅(一對)', crystalId: 'obsidian', elements: { 木: 0, 火: 0, 土: 0.1, 金: 0.1, 水: 0.95 }, intents: ['money', 'health', 'decision'] },
    { id: 'v19', name: '抹茶幽靈', crystalId: 'green_phantom_quartz', elements: { 木: 0.9, 火: 0.1, 土: 0.3, 金: 0, 水: 0.2 }, intents: ['money', 'career', 'decision'] },
    { id: 'v20', name: '多寶隕石手鍊', crystalId: null, elements: { 木: 0.2, 火: 0.3, 土: 0.6, 金: 0.6, 水: 0.2 }, intents: ['career', 'decision', 'timing'] },
    { id: 'v21', name: '海藍寶', crystalId: 'aquamarine', elements: { 木: 0.2, 火: 0, 土: 0.1, 金: 0.1, 水: 0.9 }, intents: ['love', 'relationship', 'health', 'decision'] },
    { id: 'v22', name: '彩超七圓珠', crystalId: 'super_seven', elements: { 木: 0.2, 火: 0.5, 土: 0.5, 金: 0.3, 水: 0.5 }, intents: ['love', 'money', 'health', 'decision'] },
    { id: 'v23', name: '銀曜項鍊(關公)', crystalId: 'silver_obsidian', elements: { 木: 0, 火: 0, 土: 0.1, 金: 0.6, 水: 0.8 }, intents: ['money', 'health', 'decision'] },
    { id: 'v24', name: '金曜項鍊(龍牌)', crystalId: 'gold_obsidian', elements: { 木: 0, 火: 0.2, 土: 0.2, 金: 0.8, 水: 0.6 }, intents: ['money', 'career', 'health'] },
    { id: 'v25', name: '銀曜項鍊(九尾狐)', crystalId: 'silver_obsidian', elements: { 木: 0, 火: 0, 土: 0.1, 金: 0.6, 水: 0.8 }, intents: ['love', 'relationship', 'decision'] },
    { id: 'v26', name: '黑曜項鍊無事牌', crystalId: 'obsidian', elements: { 木: 0, 火: 0, 土: 0.1, 金: 0.1, 水: 0.95 }, intents: ['health', 'decision'] },
    { id: 'v27', name: '太極石設計款', crystalId: null, elements: { 木: 0.3, 火: 0.3, 土: 0.4, 金: 0.3, 水: 0.3 }, intents: ['health', 'decision'] },
    { id: 'v28', name: '紅瑪腦設計款', crystalId: 'red_agate', elements: { 木: 0.2, 火: 0.85, 土: 0.3, 金: 0, 水: 0 }, intents: ['love', 'career', 'health'] },
    { id: 'v29', name: '煙花雨薔葳石', crystalId: 'rose_quartz', elements: { 木: 0.2, 火: 0.6, 土: 0.3, 金: 0, 水: 0.3 }, intents: ['love', 'relationship'] },
    { id: 'v30', name: '紅瑪腦', crystalId: 'red_agate', elements: { 木: 0.2, 火: 0.85, 土: 0.3, 金: 0, 水: 0 }, intents: ['love', 'career', 'health'] },
    { id: 'v31', name: '天鐵五行設計款', crystalId: 'tibetan_tektite', elements: { 木: 0.1, 火: 0.3, 土: 0.3, 金: 0.9, 水: 0.1 }, intents: ['career', 'decision', 'timing'] },
    { id: 'v32', name: '白水晶手排', crystalId: 'clear_quartz', elements: { 木: 0.1, 火: 0.1, 土: 0.2, 金: 0.7, 水: 0.3 }, intents: ['money', 'career', 'health', 'decision'] },
    { id: 'v33', name: '綠水晶隨型', crystalId: 'green_phantom_quartz', elements: { 木: 0.9, 火: 0.1, 土: 0.3, 金: 0, 水: 0.2 }, intents: ['money', 'career', 'decision'] },
    { id: 'v34', name: '海藍寶手排', crystalId: 'aquamarine', elements: { 木: 0.2, 火: 0, 土: 0.1, 金: 0.1, 水: 0.9 }, intents: ['love', 'relationship', 'health'] },
    { id: 'v35', name: '銀曜石五行設計款', crystalId: 'silver_obsidian', elements: { 木: 0, 火: 0, 土: 0.1, 金: 0.6, 水: 0.8 }, intents: ['money', 'health', 'decision'] },
    { id: 'v36', name: '藍虎眼', crystalId: 'tiger_eye', elements: { 木: 0.2, 火: 0.1, 土: 0.5, 金: 0.5, 水: 0.6 }, intents: ['career', 'decision', 'relationship'] },
    { id: 'v37', name: '彩虹黑曜石', crystalId: 'obsidian', elements: { 木: 0.1, 火: 0.2, 土: 0.1, 金: 0.2, 水: 0.9 }, intents: ['health', 'decision'] },
    { id: 'v38', name: '情侶對鍊', crystalId: null, elements: { 木: 0.2, 火: 0.5, 土: 0.2, 金: 0.1, 水: 0.5 }, intents: ['love', 'relationship'] },
    { id: 'v39', name: '冰藍小熊', crystalId: 'aquamarine', elements: { 木: 0.2, 火: 0, 土: 0.1, 金: 0.1, 水: 0.9 }, intents: ['love', 'relationship'] },
    { id: 'v40', name: '紅膠花設計款', crystalId: 'red_agate', elements: { 木: 0.2, 火: 0.85, 土: 0.3, 金: 0, 水: 0 }, intents: ['love', 'career', 'health'] },
    { id: 'v41', name: '沉香無事牌', crystalId: null, elements: { 木: 0.95, 火: 0.2, 土: 0.2, 金: 0, 水: 0.2 }, intents: ['health', 'decision', 'relationship'] },
    { id: 'v42', name: '老山檀香圓珠', crystalId: null, elements: { 木: 0.9, 火: 0.2, 土: 0.3, 金: 0, 水: 0.2 }, intents: ['health', 'decision'] },
    { id: 'v43', name: '白水茶晶設計款', crystalId: 'smoky_quartz', elements: { 木: 0, 火: 0, 土: 0.5, 金: 0.3, 水: 0.6 }, intents: ['health', 'decision'] },
    { id: 'v44', name: '鷹眼堇青石設計款', crystalId: 'iolite', elements: { 木: 0.2, 火: 0.1, 土: 0.2, 金: 0.1, 水: 0.8 }, intents: ['decision', 'timing', 'relationship'] },
    { id: 'v45', name: '綠檀木手鍊', crystalId: null, elements: { 木: 0.95, 火: 0.1, 土: 0.2, 金: 0, 水: 0.2 }, intents: ['health', 'decision'] },
    { id: 'v46', name: '綠檀木手鍊三圈', crystalId: null, elements: { 木: 0.95, 火: 0.1, 土: 0.2, 金: 0, 水: 0.2 }, intents: ['health', 'decision'] },
    { id: 'v47', name: '白阿賽設計款', crystalId: 'super_seven', elements: { 木: 0.1, 火: 0.3, 土: 0.3, 金: 0.6, 水: 0.5 }, intents: ['money', 'career', 'decision'] },
    { id: 'v48', name: '金太陽', crystalId: 'golden_heliodor', elements: { 木: 0.2, 火: 0.6, 土: 0.7, 金: 0.4, 水: 0 }, intents: ['money', 'career', 'love'] },
    { id: 'v49', name: '變色貔貅(小)', crystalId: 'obsidian', elements: { 木: 0, 火: 0.2, 土: 0.2, 金: 0.3, 水: 0.8 }, intents: ['money', 'decision'] },
    { id: 'v50', name: '變色貔貅(中)', crystalId: 'obsidian', elements: { 木: 0, 火: 0.2, 土: 0.2, 金: 0.3, 水: 0.8 }, intents: ['money', 'decision'] },
    { id: 'v51', name: '變色貔貅(大)', crystalId: 'obsidian', elements: { 木: 0, 火: 0.2, 土: 0.2, 金: 0.3, 水: 0.8 }, intents: ['money', 'decision'] },
    { id: 'v52', name: '鈦晶手排', crystalId: 'titanium_quartz', elements: { 木: 0, 火: 0.2, 土: 0.2, 金: 0.9, 水: 0.1 }, intents: ['money', 'career', 'decision'] },
    { id: 'v53', name: '藍彼得算盤珠', crystalId: 'pietersite', elements: { 木: 0.2, 火: 0.2, 土: 0.5, 金: 0.5, 水: 0.6 }, intents: ['career', 'decision', 'timing'] },
    { id: 'v54', name: '阿拉善', crystalId: null, elements: { 木: 0.2, 火: 0.3, 土: 0.8, 金: 0.2, 水: 0.2 }, intents: ['money', 'health', 'decision'] },
    { id: 'v55', name: '透石膏', crystalId: 'selenite', elements: { 木: 0.1, 火: 0.1, 土: 0.3, 金: 0.6, 水: 0.4 }, intents: ['health', 'decision'] },
    { id: 'v56', name: '紫水晶三圈', crystalId: 'amethyst', elements: { 木: 0.1, 火: 0.3, 土: 0.2, 金: 0.2, 水: 0.8 }, intents: ['love', 'health', 'decision'] },
    { id: 'v57', name: '藍玉髓', crystalId: null, elements: { 木: 0.2, 火: 0, 土: 0.2, 金: 0.1, 水: 0.85 }, intents: ['love', 'relationship', 'decision'] },
    { id: 'v58', name: '粉晶', crystalId: 'rose_quartz', elements: { 木: 0.2, 火: 0.5, 土: 0.3, 金: 0, 水: 0.3 }, intents: ['love', 'relationship'] },
    { id: 'v59', name: '星光草莓晶', crystalId: 'strawberry_quartz', elements: { 木: 0.2, 火: 0.7, 土: 0.3, 金: 0, 水: 0.2 }, intents: ['love', 'relationship'] },
    { id: 'v60', name: '薔薇石', crystalId: 'rose_quartz', elements: { 木: 0.2, 火: 0.6, 土: 0.3, 金: 0, 水: 0.3 }, intents: ['love', 'relationship', 'health'] },
    { id: 'v61', name: '西北非隕石', crystalId: 'tibetan_tektite', elements: { 木: 0.1, 火: 0.3, 土: 0.4, 金: 0.8, 水: 0.1 }, intents: ['career', 'decision', 'timing'] },
    { id: 'v62', name: '黑曜磨砂心經', crystalId: 'obsidian', elements: { 木: 0, 火: 0, 土: 0.1, 金: 0.1, 水: 0.95 }, intents: ['health', 'decision'] },
    { id: 'v63', name: '鑽切白水晶', crystalId: 'clear_quartz', elements: { 木: 0.1, 火: 0.1, 土: 0.2, 金: 0.7, 水: 0.3 }, intents: ['money', 'career', 'health'] },
    { id: 'v64', name: '鐵膽石手排', crystalId: null, elements: { 木: 0, 火: 0.2, 土: 0.6, 金: 0.7, 水: 0.1 }, intents: ['money', 'career'] },
    { id: 'v65', name: '白水晶貔貅', crystalId: 'clear_quartz', elements: { 木: 0.1, 火: 0.1, 土: 0.2, 金: 0.7, 水: 0.3 }, intents: ['money', 'career', 'decision'] },
    { id: 'v66', name: '月光石貔貅', crystalId: 'moonstone', elements: { 木: 0.2, 火: 0.1, 土: 0.2, 金: 0.1, 水: 0.8 }, intents: ['love', 'relationship', 'money'] },
    { id: 'v67', name: '天河石貔貅', crystalId: 'amazonite', elements: { 木: 0.6, 火: 0, 土: 0.2, 金: 0.1, 水: 0.6 }, intents: ['money', 'career', 'relationship'] },
    { id: 'v68', name: '舒俱徠石貔貅', crystalId: 'sugilite', elements: { 木: 0.1, 火: 0.4, 土: 0.2, 金: 0.1, 水: 0.8 }, intents: ['love', 'health', 'decision'] },
    { id: 'v69', name: '天鐵貔貅(金)', crystalId: 'tibetan_tektite', elements: { 木: 0.1, 火: 0.3, 土: 0.3, 金: 0.9, 水: 0.1 }, intents: ['money', 'career', 'decision'] },
    { id: 'v70', name: '天鐵貔貅(銀)', crystalId: 'tibetan_tektite', elements: { 木: 0.1, 火: 0.2, 土: 0.3, 金: 0.85, 水: 0.2 }, intents: ['money', 'career', 'decision'] },
    { id: 'v71', name: '彼得石貔貅', crystalId: 'pietersite', elements: { 木: 0.2, 火: 0.2, 土: 0.5, 金: 0.5, 水: 0.6 }, intents: ['money', 'career', 'decision'] },
    { id: 'v72', name: '藍方解石', crystalId: null, elements: { 木: 0.1, 火: 0, 土: 0.4, 金: 0.2, 水: 0.8 }, intents: ['relationship', 'decision'] },
    { id: 'v73', name: '太陽花手排', crystalId: 'rutilated_quartz', elements: { 木: 0.2, 火: 0.4, 土: 0.3, 金: 0.7, 水: 0.2 }, intents: ['money', 'career'] },
    { id: 'v74', name: '茶晶', crystalId: 'smoky_quartz', elements: { 木: 0, 火: 0, 土: 0.5, 金: 0.3, 水: 0.6 }, intents: ['health', 'decision'] },
    { id: 'v75', name: '紅虎眼', crystalId: 'tiger_eye', elements: { 木: 0.3, 火: 0.6, 土: 0.6, 金: 0.2, 水: 0 }, intents: ['money', 'career', 'health'] },
    { id: 'v76', name: '紫牙烏', crystalId: 'garnet', elements: { 木: 0.2, 火: 0.7, 土: 0.4, 金: 0, 水: 0.2 }, intents: ['love', 'health', 'relationship'] },
    { id: 'v77', name: '綠龍晶', crystalId: 'charoite', elements: { 木: 0.6, 火: 0.1, 土: 0.2, 金: 0.1, 水: 0.7 }, intents: ['love', 'decision', 'relationship'] },
    { id: 'v78', name: '青晶石', crystalId: 'lapis_lazuli', elements: { 木: 0.1, 火: 0, 土: 0.2, 金: 0.2, 水: 0.85 }, intents: ['career', 'relationship', 'decision'] },
    { id: 'v79', name: '骨幹太陽石', crystalId: null, elements: { 木: 0.2, 火: 0.7, 土: 0.5, 金: 0.3, 水: 0 }, intents: ['money', 'career', 'love'] },
    { id: 'v80', name: '綠髮晶手排', crystalId: 'green_rutilated_quartz', elements: { 木: 0.85, 火: 0.2, 土: 0.2, 金: 0.2, 水: 0.2 }, intents: ['money', 'career'] },
    { id: 'v81', name: '月光石', crystalId: 'moonstone', elements: { 木: 0.2, 火: 0.1, 土: 0.2, 金: 0.1, 水: 0.8 }, intents: ['love', 'relationship', 'timing'] },
    { id: 'v82', name: '黑閃靈', crystalId: 'black_rutilated_quartz', elements: { 木: 0, 火: 0, 土: 0.2, 金: 0.3, 水: 0.9 }, intents: ['health', 'decision'] },
    { id: 'v83', name: '彩閃靈', crystalId: 'rutilated_quartz', elements: { 木: 0.2, 火: 0.3, 土: 0.2, 金: 0.7, 水: 0.3 }, intents: ['money', 'career', 'decision'] },
    { id: 'v84', name: '彩超七', crystalId: 'super_seven', elements: { 木: 0.2, 火: 0.5, 土: 0.5, 金: 0.3, 水: 0.5 }, intents: ['love', 'money', 'health'] },
    { id: 'v85', name: '黑髮手排', crystalId: 'black_rutilated_quartz', elements: { 木: 0, 火: 0, 土: 0.2, 金: 0.3, 水: 0.9 }, intents: ['health', 'decision'] },
    { id: 'v86', name: '綠幽靈', crystalId: 'green_phantom_quartz', elements: { 木: 0.9, 火: 0.1, 土: 0.3, 金: 0, 水: 0.2 }, intents: ['money', 'career', 'decision'] },
    { id: 'v87', name: '金曜石', crystalId: 'gold_obsidian', elements: { 木: 0, 火: 0.2, 土: 0.2, 金: 0.8, 水: 0.6 }, intents: ['money', 'career', 'health'] },
    { id: 'v88', name: '黃水晶', crystalId: 'citrine', elements: { 木: 0.1, 火: 0.3, 土: 0.85, 金: 0.3, 水: 0 }, intents: ['money', 'career', 'health'] },
    { id: 'v89', name: '超八', crystalId: 'super_seven', elements: { 木: 0.2, 火: 0.5, 土: 0.5, 金: 0.3, 水: 0.5 }, intents: ['love', 'money', 'health'] },
    { id: 'v90', name: '彩色草莓晶', crystalId: 'strawberry_quartz', elements: { 木: 0.2, 火: 0.7, 土: 0.3, 金: 0, 水: 0.2 }, intents: ['love', 'relationship'] },
    { id: 'v91', name: '藍磷灰', crystalId: null, elements: { 木: 0.2, 火: 0, 土: 0.2, 金: 0.1, 水: 0.85 }, intents: ['relationship', 'decision'] },
    { id: 'v92', name: '紫金砂', crystalId: 'amethyst', elements: { 木: 0.1, 火: 0.3, 土: 0.2, 金: 0.3, 水: 0.8 }, intents: ['love', 'health', 'decision'] },
    { id: 'v93', name: '紫龍晶', crystalId: 'charoite', elements: { 木: 0.5, 火: 0.2, 土: 0.2, 金: 0.1, 水: 0.7 }, intents: ['love', 'decision', 'relationship'] },
    { id: 'v94', name: '白幽靈', crystalId: 'white_phantom_quartz', elements: { 木: 0.1, 火: 0.1, 土: 0.3, 金: 0.6, 水: 0.4 }, intents: ['money', 'career', 'health'] },
    { id: 'v95', name: '大地瑪腦手排', crystalId: 'red_agate', elements: { 木: 0.3, 火: 0.5, 土: 0.8, 金: 0.1, 水: 0.2 }, intents: ['health', 'decision'] },
    { id: 'v96', name: '彩鋼超七', crystalId: 'super_seven', elements: { 木: 0.2, 火: 0.5, 土: 0.5, 金: 0.4, 水: 0.5 }, intents: ['money', 'career', 'health'] },
    { id: 'v97', name: '東陵玉', crystalId: 'aventurine', elements: { 木: 0.85, 火: 0.2, 土: 0.4, 金: 0, 水: 0.2 }, intents: ['money', 'career', 'health'] },
    { id: 'v98', name: '粉晶手排', crystalId: 'rose_quartz', elements: { 木: 0.2, 火: 0.5, 土: 0.3, 金: 0, 水: 0.3 }, intents: ['love', 'relationship'] },
    { id: 'v99', name: '金髮晶', crystalId: 'golden_rutilated_quartz', elements: { 木: 0, 火: 0.2, 土: 0.3, 金: 0.85, 水: 0.1 }, intents: ['money', 'career'] },
    { id: 'v100', name: '鐵膽石圓珠', crystalId: null, elements: { 木: 0, 火: 0.2, 土: 0.6, 金: 0.7, 水: 0.1 }, intents: ['money', 'career'] },
    { id: 'v101', name: '黃水晶鑽切面', crystalId: 'citrine', elements: { 木: 0.1, 火: 0.3, 土: 0.85, 金: 0.3, 水: 0 }, intents: ['money', 'career', 'health'] },
    { id: 'v102', name: '咖啡鈦太陽花手排', crystalId: 'titanium_quartz', elements: { 木: 0, 火: 0.2, 土: 0.4, 金: 0.85, 水: 0.1 }, intents: ['money', 'career'] },
    { id: 'v103', name: '咖啡鈦晶手排', crystalId: 'titanium_quartz', elements: { 木: 0, 火: 0.2, 土: 0.3, 金: 0.9, 水: 0.1 }, intents: ['money', 'career'] },
    { id: 'v104', name: '粉紅碧璽圓珠', crystalId: 'tourmaline_pink', elements: { 木: 0.2, 火: 0.6, 土: 0.2, 金: 0, 水: 0.4 }, intents: ['love', 'relationship', 'health'] },
    { id: 'v105', name: '藍彼得圓珠', crystalId: 'pietersite', elements: { 木: 0.2, 火: 0.2, 土: 0.5, 金: 0.5, 水: 0.6 }, intents: ['career', 'decision', 'timing'] },
    { id: 'v106', name: '黑碧璽三圈', crystalId: 'black_tourmaline', elements: { 木: 0, 火: 0, 土: 0.2, 金: 0.2, 水: 0.9 }, intents: ['health', 'decision'] },
    { id: 'v107', name: '白水晶鳳凰項鍊', crystalId: 'clear_quartz', elements: { 木: 0.1, 火: 0.1, 土: 0.2, 金: 0.7, 水: 0.3 }, intents: ['money', 'career', 'health'] },
    { id: 'v108', name: '彼得石手排', crystalId: 'pietersite', elements: { 木: 0.2, 火: 0.2, 土: 0.5, 金: 0.5, 水: 0.6 }, intents: ['career', 'decision', 'timing'] },
    { id: 'v109', name: '四季幽靈手排', crystalId: 'green_phantom_quartz', elements: { 木: 0.85, 火: 0.2, 土: 0.3, 金: 0.1, 水: 0.3 }, intents: ['money', 'career', 'decision'] },
    { id: 'v110', name: '綠月光', crystalId: 'moonstone', elements: { 木: 0.6, 火: 0.1, 土: 0.2, 金: 0.1, 水: 0.7 }, intents: ['love', 'relationship', 'health'] },
    { id: 'v111', name: '白龍宮舍利', crystalId: 'longgong_sheli_white', elements: { 木: 0.1, 火: 0.1, 土: 0.6, 金: 0.7, 水: 0.3 }, intents: ['money', 'health', 'decision'] },
    { id: 'v112', name: '黃龍宮舍利(珊瑚化石)', crystalId: 'longgong_sheli_yellow', elements: { 木: 0.1, 火: 0.3, 土: 0.85, 金: 0.4, 水: 0.1 }, intents: ['money', 'health'] },
    { id: 'v113', name: '血龍宮雪花舍利', crystalId: 'longgong_sheli_blood', elements: { 木: 0.1, 火: 0.6, 土: 0.6, 金: 0.2, 水: 0.2 }, intents: ['love', 'health', 'career'] },
    { id: 'v114', name: '血龍宮舍利', crystalId: 'longgong_sheli_blood', elements: { 木: 0.1, 火: 0.7, 土: 0.6, 金: 0.2, 水: 0.2 }, intents: ['love', 'health', 'career'] },
    { id: 'v115', name: '白水晶', crystalId: 'clear_quartz', elements: { 木: 0.1, 火: 0.1, 土: 0.2, 金: 0.7, 水: 0.3 }, intents: ['money', 'career', 'health', 'decision'] }
  ];

  /** 依五行取主屬性（權重最高者） */
  function getPrimaryElement(item) {
    if (!item || !item.elements) return null;
    var el, max = 0;
    ['木', '火', '土', '金', '水'].forEach(function (e) {
      var v = item.elements[e];
      if (v != null && v > max) { max = v; el = e; }
    });
    return el || null;
  }

  /** 依功效意圖篩選（intents 含任一即可） */
  function filterByIntent(items, intent) {
    if (!intent) return items;
    return items.filter(function (i) { return i.intents && i.intents.indexOf(intent) >= 0; });
  }

  /** 依五行篩選（主屬性或權重 > 0.3 的屬性符合即可） */
  function filterByElement(items, element) {
    if (!element) return items;
    return items.filter(function (i) {
      if (!i.elements) return false;
      if (i.elements[element] != null && i.elements[element] >= 0.3) return true;
      return getPrimaryElement(i) === element;
    });
  }

  function getAll() {
    return VENDOR_INVENTORY.slice(0);
  }

  function getByName(name) {
    var n = String(name || '').trim();
    for (var i = 0; i < VENDOR_INVENTORY.length; i++) {
      if (VENDOR_INVENTORY[i].name === n) return VENDOR_INVENTORY[i];
    }
    return null;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VENDOR_INVENTORY: VENDOR_INVENTORY, getPrimaryElement: getPrimaryElement, filterByIntent: filterByIntent, filterByElement: filterByElement, getAll: getAll, getByName: getByName };
  } else {
    global.VendorInventory = { VENDOR_INVENTORY: VENDOR_INVENTORY, getPrimaryElement: getPrimaryElement, filterByIntent: filterByIntent, filterByElement: filterByElement, getAll: getAll, getByName: getByName };
  }
})(typeof window !== 'undefined' ? window : this);
