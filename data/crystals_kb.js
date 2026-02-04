/**
 * 水晶知識庫：每顆水晶結構化（五行、意圖、強度、配戴、注意事項、五術證據對照）
 * 供 crystal-recommender / crystal-advice-synthesizer 使用
 */
(function (global) {
  'use strict';

  var CRYSTALS_KB = [
    {
      id: 'titanium_quartz',
      name: '鈦晶',
      aliases: ['鈦晶', '金鈦晶'],
      elements: { 木: 0, 火: 0.2, 土: 0.2, 金: 0.9, 水: 0.1 },
      intents: ['money', 'career', 'decision'],
      intensity: 5,
      wear: { defaultHand: 'right', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: false }, scenarios: ['work', 'meeting', 'sales'] },
      cautions: [
        { tag: 'sleep_sensitive', text: '睡前請取下，避免亢奮影響睡眠。' },
        { tag: 'anxiety_prone', text: '易焦慮者建議縮短配戴時段或改戴白水晶緩衝。' },
        { tag: 'overstimulation', text: '能量過強時可改戴左手或僅白天配戴。' }
      ],
      contraindications: [{ rule: 'intensity>=4 and sleepPoor', reason: '鈦晶能量強，睡眠不佳時不宜夜戴。' }],
      synergy: { goodWith: ['白水晶', '黑曜石'], avoidWith: ['黑碧璽'] },
      evidenceMap: { bazi: { boost: ['金弱', '喜金'], avoid: ['金過旺', '火過旺'] }, ziwei: { boost: ['財帛宮強', '化祿'], avoid: ['疾厄過重'] }, meihua: { boost: ['乾', '兌'], avoid: ['離過旺'] }, tarot: { boost: ['Pentacles', 'The Sun'], avoid: ['The Tower'] }, nameology: { boost: ['金數'], avoid: ['火數過旺'] } }
    },
    {
      id: 'citrine',
      name: '黃水晶',
      aliases: ['黃水晶', '黃晶'],
      elements: { 木: 0.1, 火: 0.3, 土: 0.85, 金: 0.3, 水: 0 },
      intents: ['money', 'career', 'health'],
      intensity: 3,
      wear: { defaultHand: 'left', bestForms: ['bracelet', 'necklace', 'ring'], dayNight: { day: true, night: true }, scenarios: ['work', 'sales', 'meditation'] },
      cautions: [
        { tag: 'sun_fade', text: '避免長時間曝曬，易褪色。' },
        { tag: 'metal_allergy', text: '若鑲金屬，金屬過敏者留意材質。' }
      ],
      synergy: { goodWith: ['綠幽靈', '白水晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['土弱', '喜土', '財運'], avoid: ['土過旺'] }, ziwei: { boost: ['財帛宮', '化祿'], avoid: [] }, meihua: { boost: ['坤', '艮'], avoid: ['坎過旺'] }, tarot: { boost: ['Pentacles'], avoid: [] }, nameology: { boost: ['土數'], avoid: [] } }
    },
    {
      id: 'golden_rutilated_quartz',
      name: '金髮晶',
      aliases: ['金髮晶', '金髮'],
      elements: { 木: 0, 火: 0.2, 土: 0.3, 金: 0.85, 水: 0.1 },
      intents: ['money', 'career'],
      intensity: 4,
      wear: { defaultHand: 'right', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: false }, scenarios: ['work', 'meeting', 'sales'] },
      cautions: [
        { tag: 'sleep_sensitive', text: '建議白天配戴，睡前取下。' },
        { tag: 'overstimulation', text: '若覺頭脹可改左手或縮短時段。' }
      ],
      synergy: { goodWith: ['黃水晶', '白水晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['金弱', '喜金'], avoid: ['金過旺'] }, ziwei: { boost: ['官祿', '化權'], avoid: [] }, meihua: { boost: ['乾', '兌'], avoid: ['離'] }, tarot: { boost: ['Pentacles', 'Wands'], avoid: [] }, nameology: { boost: ['金數'], avoid: [] } }
    },
    {
      id: 'green_phantom_quartz',
      name: '綠幽靈',
      aliases: ['綠幽靈', '綠幻影'],
      elements: { 木: 0.9, 火: 0.1, 土: 0.3, 金: 0, 水: 0.2 },
      intents: ['money', 'career', 'decision'],
      intensity: 3,
      wear: { defaultHand: 'left', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: true }, scenarios: ['work', 'sales', 'meditation'] },
      cautions: [
        { tag: 'sun_fade', text: '避免強光長期直射。' }
      ],
      synergy: { goodWith: ['黃水晶', '白水晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['木弱', '喜木', '事業'], avoid: ['木過旺'] }, ziwei: { boost: ['官祿', '命宮'], avoid: [] }, meihua: { boost: ['震', '巽'], avoid: ['兌過旺'] }, tarot: { boost: ['Pentacles', 'Wands'], avoid: [] }, nameology: { boost: ['木數'], avoid: [] } }
    },
    {
      id: 'obsidian',
      name: '黑曜石',
      aliases: ['黑曜石', '黑曜'],
      elements: { 木: 0, 火: 0, 土: 0.1, 金: 0.1, 水: 0.95 },
      intents: ['money', 'health', 'decision'],
      intensity: 4,
      wear: { defaultHand: 'right', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: false }, scenarios: ['work', 'meditation'] },
      cautions: [
        { tag: 'sleep_sensitive', text: '不宜戴著睡覺，易多夢。' },
        { tag: 'fragile', text: '避免撞擊，破裂後需更換。' }
      ],
      synergy: { goodWith: ['白水晶'], avoidWith: ['鈦晶'] },
      evidenceMap: { bazi: { boost: ['水弱', '喜水'], avoid: ['水過旺'] }, ziwei: { boost: ['疾厄', '財帛'], avoid: ['命宮過旺'] }, meihua: { boost: ['坎'], avoid: ['離'] }, tarot: { boost: ['Pentacles'], avoid: ['The Sun'] }, nameology: { boost: ['水數'], avoid: [] } }
    },
    {
      id: 'black_tourmaline',
      name: '黑碧璽',
      aliases: ['黑碧璽', '黑電氣石'],
      elements: { 木: 0, 火: 0, 土: 0.2, 金: 0.2, 水: 0.9 },
      intents: ['health', 'decision'],
      intensity: 3,
      wear: { defaultHand: 'right', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: false }, scenarios: ['work', 'meditation'] },
      cautions: [
        { tag: 'metal_allergy', text: '鑲嵌金屬時留意過敏。' },
        { tag: 'piercing', text: '有傷口或術後請勿直接貼膚。' }
      ],
      synergy: { goodWith: ['白水晶', '粉晶'], avoidWith: ['鈦晶'] },
      evidenceMap: { bazi: { boost: ['水弱', '需排負'], avoid: ['水過旺'] }, ziwei: { boost: ['疾厄'], avoid: [] }, meihua: { boost: ['坎'], avoid: [] }, tarot: { boost: [], avoid: ['The Sun'] }, nameology: { boost: ['水數'], avoid: [] } }
    },
    {
      id: 'clear_quartz',
      name: '白水晶',
      aliases: ['白水晶', '透明水晶'],
      elements: { 木: 0.1, 火: 0.1, 土: 0.2, 金: 0.7, 水: 0.3 },
      intents: ['money', 'career', 'health', 'decision', 'timing'],
      intensity: 2,
      wear: { defaultHand: 'both', bestForms: ['bracelet', 'necklace', 'ring'], dayNight: { day: true, night: true }, scenarios: ['work', 'sleep', 'meditation', 'meeting'] },
      cautions: [
        { tag: 'sun_fade', text: '長時間曝曬可能影響透明度。' }
      ],
      synergy: { goodWith: [], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['金弱', '水弱', '通用'], avoid: [] }, ziwei: { boost: ['通用'], avoid: [] }, meihua: { boost: ['乾', '兌'], avoid: [] }, tarot: { boost: [], avoid: [] }, nameology: { boost: ['金數', '水數'], avoid: [] } }
    },
    {
      id: 'amethyst',
      name: '紫水晶',
      aliases: ['紫水晶', '紫晶'],
      elements: { 木: 0.1, 火: 0.3, 土: 0.2, 金: 0.2, 水: 0.8 },
      intents: ['love', 'health', 'decision', 'relationship'],
      intensity: 3,
      wear: { defaultHand: 'left', bestForms: ['bracelet', 'necklace'], dayNight: { day: true, night: true }, scenarios: ['meditation', 'sleep'] },
      cautions: [
        { tag: 'sun_fade', text: '避免陽光直射，易褪色。' },
        { tag: 'anxiety_prone', text: '有助安定，但易依賴者勿過度依賴。' }
      ],
      synergy: { goodWith: ['白水晶', '粉晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['水弱', '喜水'], avoid: ['火過旺'] }, ziwei: { boost: ['夫妻', '福德'], avoid: ['官祿過旺'] }, meihua: { boost: ['坎', '兌'], avoid: ['離'] }, tarot: { boost: ['Cups', 'The Star'], avoid: ['Wands過多'] }, nameology: { boost: ['水數'], avoid: ['火數過旺'] } }
    },
    {
      id: 'rose_quartz',
      name: '粉晶',
      aliases: ['粉晶', '玫瑰石英'],
      elements: { 木: 0.2, 火: 0.5, 土: 0.3, 金: 0, 水: 0.3 },
      intents: ['love', 'relationship'],
      intensity: 2,
      wear: { defaultHand: 'left', bestForms: ['bracelet', 'necklace'], dayNight: { day: true, night: true }, scenarios: ['meditation', 'meeting'] },
      cautions: [
        { tag: 'sun_fade', text: '避免長期曝曬。' }
      ],
      synergy: { goodWith: ['紫水晶', '白水晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['火弱', '喜火', '桃花'], avoid: ['火過旺'] }, ziwei: { boost: ['夫妻'], avoid: [] }, meihua: { boost: ['離', '兌'], avoid: ['坎過旺'] }, tarot: { boost: ['Cups', 'The Lovers'], avoid: [] }, nameology: { boost: ['火數'], avoid: [] } }
    },
    {
      id: 'labradorite',
      name: '拉長石',
      aliases: ['拉長石', '灰長石'],
      elements: { 木: 0.2, 火: 0.1, 土: 0.3, 金: 0.2, 水: 0.7 },
      intents: ['career', 'decision', 'timing'],
      intensity: 3,
      wear: { defaultHand: 'left', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: false }, scenarios: ['work', 'meditation'] },
      cautions: [
        { tag: 'fragile', text: '避免撞擊，解理明顯。' }
      ],
      synergy: { goodWith: ['白水晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['水弱', '木弱'], avoid: [] }, ziwei: { boost: ['官祿', '命宮'], avoid: [] }, meihua: { boost: ['坎', '巽'], avoid: [] }, tarot: { boost: ['The Moon', 'The Star'], avoid: [] }, nameology: { boost: ['水數'], avoid: [] } }
    },
    {
      id: 'aquamarine',
      name: '海藍寶',
      aliases: ['海藍寶', '藍玉'],
      elements: { 木: 0.2, 火: 0, 土: 0.1, 金: 0.1, 水: 0.9 },
      intents: ['love', 'relationship', 'health', 'decision'],
      intensity: 2,
      wear: { defaultHand: 'left', bestForms: ['bracelet', 'necklace'], dayNight: { day: true, night: true }, scenarios: ['meeting', 'meditation'] },
      cautions: [
        { tag: 'sun_fade', text: '避免強光長期照射。' }
      ],
      synergy: { goodWith: ['白水晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['水弱', '喜水'], avoid: ['水過旺'] }, ziwei: { boost: ['夫妻', '遷移'], avoid: [] }, meihua: { boost: ['坎', '兌'], avoid: [] }, tarot: { boost: ['Cups'], avoid: [] }, nameology: { boost: ['水數'], avoid: [] } }
    },
    {
      id: 'tiger_eye',
      name: '虎眼石',
      aliases: ['虎眼石', '虎眼'],
      elements: { 木: 0.4, 火: 0.3, 土: 0.7, 金: 0.2, 水: 0 },
      intents: ['money', 'career', 'decision'],
      intensity: 3,
      wear: { defaultHand: 'right', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: false }, scenarios: ['work', 'sales'] },
      cautions: [
        { tag: 'sun_fade', text: '黃虎眼避免長期曝曬。' }
      ],
      synergy: { goodWith: ['黃水晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['土弱', '木弱'], avoid: ['土過旺'] }, ziwei: { boost: ['財帛', '官祿'], avoid: [] }, meihua: { boost: ['坤', '震'], avoid: [] }, tarot: { boost: ['Pentacles', 'Wands'], avoid: [] }, nameology: { boost: ['土數'], avoid: [] } }
    },
    {
      id: 'lapis_lazuli',
      name: '青金石',
      aliases: ['青金石', '青金'],
      elements: { 木: 0.1, 火: 0, 土: 0.2, 金: 0.2, 水: 0.85 },
      intents: ['career', 'relationship', 'decision'],
      intensity: 3,
      wear: { defaultHand: 'left', bestForms: ['bracelet', 'necklace'], dayNight: { day: true, night: false }, scenarios: ['work', 'meeting'] },
      cautions: [
        { tag: 'water_sensitive', text: '避免長時間泡水，結構較鬆。' },
        { tag: 'metal_allergy', text: '鑲嵌時留意金屬材質。' }
      ],
      synergy: { goodWith: ['白水晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['水弱', '喜水'], avoid: [] }, ziwei: { boost: ['官祿', '遷移'], avoid: [] }, meihua: { boost: ['坎'], avoid: [] }, tarot: { boost: ['The Emperor', 'Cups'], avoid: [] }, nameology: { boost: ['水數'], avoid: [] } }
    },
    {
      id: 'garnet',
      name: '石榴石',
      aliases: ['石榴石', '石榴'],
      elements: { 木: 0.2, 火: 0.7, 土: 0.4, 金: 0, 水: 0.2 },
      intents: ['love', 'health', 'relationship'],
      intensity: 3,
      wear: { defaultHand: 'left', bestForms: ['bracelet', 'necklace'], dayNight: { day: true, night: true }, scenarios: ['meditation'] },
      cautions: [
        { tag: 'sun_fade', text: '部分品種避免強光。' }
      ],
      synergy: { goodWith: ['粉晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['火弱', '喜火'], avoid: ['火過旺'] }, ziwei: { boost: ['夫妻', '福德'], avoid: [] }, meihua: { boost: ['離'], avoid: ['坎過旺'] }, tarot: { boost: ['Cups', 'Wands'], avoid: [] }, nameology: { boost: ['火數'], avoid: [] } }
    },
    {
      id: 'moonstone',
      name: '月光石',
      aliases: ['月光石', '月長石'],
      elements: { 木: 0.2, 火: 0.1, 土: 0.2, 金: 0.1, 水: 0.8 },
      intents: ['love', 'relationship', 'timing'],
      intensity: 2,
      wear: { defaultHand: 'left', bestForms: ['bracelet', 'necklace'], dayNight: { day: true, night: true }, scenarios: ['meditation', 'sleep'] },
      cautions: [
        { tag: 'fragile', text: '避免撞擊。' },
        { tag: 'water_sensitive', text: '不宜長時間泡水。' }
      ],
      synergy: { goodWith: ['粉晶', '白水晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['水弱', '喜水'], avoid: [] }, ziwei: { boost: ['夫妻'], avoid: [] }, meihua: { boost: ['坎', '兌'], avoid: [] }, tarot: { boost: ['The Moon', 'Cups'], avoid: [] }, nameology: { boost: ['水數'], avoid: [] } }
    },
    {
      id: 'red_agate',
      name: '紅瑪瑙',
      aliases: ['紅瑪瑙', '紅玉髓'],
      elements: { 木: 0.2, 火: 0.85, 土: 0.3, 金: 0, 水: 0 },
      intents: ['love', 'career', 'health'],
      intensity: 3,
      wear: { defaultHand: 'right', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: false }, scenarios: ['work', 'sales'] },
      cautions: [
        { tag: 'sun_fade', text: '避免長期曝曬。' }
      ],
      synergy: { goodWith: ['黃水晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['火弱', '喜火'], avoid: ['火過旺'] }, ziwei: { boost: ['官祿', '福德'], avoid: [] }, meihua: { boost: ['離'], avoid: ['坎過旺'] }, tarot: { boost: ['Wands'], avoid: [] }, nameology: { boost: ['火數'], avoid: [] } }
    },
    {
      id: 'smoky_quartz',
      name: '茶晶',
      aliases: ['茶晶', '煙晶'],
      elements: { 木: 0, 火: 0, 土: 0.5, 金: 0.3, 水: 0.6 },
      intents: ['health', 'decision'],
      intensity: 2,
      wear: { defaultHand: 'right', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: true }, scenarios: ['meditation', 'sleep'] },
      cautions: [
        { tag: 'sun_fade', text: '避免高溫與強光，可能褪色。' }
      ],
      synergy: { goodWith: ['白水晶', '黑曜石'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['水弱', '土弱'], avoid: [] }, ziwei: { boost: ['疾厄'], avoid: [] }, meihua: { boost: ['坎', '坤'], avoid: [] }, tarot: { boost: [], avoid: [] }, nameology: { boost: ['水數', '土數'], avoid: [] } }
    },
    {
      id: 'selenite',
      name: '透石膏',
      aliases: ['透石膏', '石膏'],
      elements: { 木: 0.1, 火: 0.1, 土: 0.3, 金: 0.6, 水: 0.4 },
      intents: ['health', 'decision'],
      intensity: 2,
      wear: { defaultHand: 'left', bestForms: ['pendant', 'bracelet'], dayNight: { day: true, night: true }, scenarios: ['meditation'] },
      cautions: [
        { tag: 'fragile', text: '透石膏較軟，避免碰撞與泡水。' }
      ],
      synergy: { goodWith: ['白水晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['金弱', '水弱'], avoid: [] }, ziwei: { boost: ['疾厄'], avoid: [] }, meihua: { boost: ['乾', '坎'], avoid: [] }, tarot: { boost: [], avoid: [] }, nameology: { boost: ['金數'], avoid: [] } }
    },
    {
      id: 'amazonite',
      name: '天河石',
      aliases: ['天河石', '亞馬遜石'],
      elements: { 木: 0.6, 火: 0, 土: 0.2, 金: 0.1, 水: 0.6 },
      intents: ['money', 'career', 'relationship', 'decision'],
      intensity: 2,
      wear: { defaultHand: 'left', bestForms: ['bracelet', 'necklace'], dayNight: { day: true, night: true }, scenarios: ['work', 'meeting'] },
      cautions: [
        { tag: 'fragile', text: '避免撞擊。' }
      ],
      synergy: { goodWith: ['白水晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['木弱', '水弱'], avoid: [] }, ziwei: { boost: ['官祿', '遷移'], avoid: [] }, meihua: { boost: ['巽', '坎'], avoid: [] }, tarot: { boost: ['Pentacles', 'Cups'], avoid: [] }, nameology: { boost: ['木數', '水數'], avoid: [] } }
    },
    {
      id: 'iolite',
      name: '堇青石',
      aliases: ['堇青石', '紫藍晶'],
      elements: { 木: 0.2, 火: 0.1, 土: 0.2, 金: 0.1, 水: 0.8 },
      intents: ['decision', 'timing', 'relationship'],
      intensity: 2,
      wear: { defaultHand: 'left', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: true }, scenarios: ['meditation', 'meeting'] },
      cautions: [
        { tag: 'sun_fade', text: '避免強光直射。' }
      ],
      synergy: { goodWith: ['白水晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['水弱'], avoid: [] }, ziwei: { boost: ['命宮', '遷移'], avoid: [] }, meihua: { boost: ['坎'], avoid: [] }, tarot: { boost: ['The High Priestess'], avoid: [] }, nameology: { boost: ['水數'], avoid: [] } }
    },
    {
      id: 'smoky_quartz_dark',
      name: '煙晶',
      aliases: ['煙晶', '深色茶晶'],
      elements: { 木: 0, 火: 0, 土: 0.5, 金: 0.2, 水: 0.7 },
      intents: ['health', 'decision'],
      intensity: 2,
      wear: { defaultHand: 'right', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: true }, scenarios: ['meditation'] },
      cautions: [
        { tag: 'sun_fade', text: '高溫與強光可能褪色。' }
      ],
      synergy: { goodWith: ['白水晶'], avoidWith: [] },
      evidenceMap: { bazi: { boost: ['水弱', '土弱'], avoid: [] }, ziwei: { boost: ['疾厄'], avoid: [] }, meihua: { boost: ['坎'], avoid: [] }, tarot: { boost: [], avoid: [] }, nameology: { boost: ['水數'], avoid: [] } }
    },
    { id: 'longgong_sheli_yellow', name: '黃龍宮舍利', aliases: ['黃龍宮舍利', '龍宮舍利'], elements: { 木: 0.1, 火: 0.2, 土: 0.85, 金: 0.5, 水: 0.1 }, intents: ['money', 'health', 'decision'], intensity: 3, wear: { defaultHand: 'left', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: true }, scenarios: ['meditation'] }, cautions: [], synergy: { goodWith: ['白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['土弱', '喜土'], avoid: ['土過旺'] }, ziwei: { boost: ['財帛', '福德'], avoid: [] }, meihua: { boost: ['坤', '艮'], avoid: [] }, tarot: { boost: ['Pentacles'], avoid: [] }, nameology: { boost: ['土數'], avoid: [] } } },
    { id: 'longgong_sheli_blood', name: '血龍宮舍利', aliases: ['血龍宮舍利', '血龍宮'], elements: { 木: 0.1, 火: 0.7, 土: 0.6, 金: 0.2, 水: 0.2 }, intents: ['love', 'health', 'career'], intensity: 3, wear: { defaultHand: 'left', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: true }, scenarios: ['meditation'] }, cautions: [], synergy: { goodWith: ['白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['火弱', '喜火', '土弱'], avoid: ['火過旺'] }, ziwei: { boost: ['福德', '官祿'], avoid: [] }, meihua: { boost: ['離', '坤'], avoid: [] }, tarot: { boost: ['Wands', 'Cups'], avoid: [] }, nameology: { boost: ['火數'], avoid: [] } } },
    { id: 'longgong_sheli_white', name: '白龍宮舍利', aliases: ['白龍宮舍利'], elements: { 木: 0.1, 火: 0.1, 土: 0.6, 金: 0.7, 水: 0.3 }, intents: ['money', 'health', 'decision'], intensity: 2, wear: { defaultHand: 'both', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: true }, scenarios: ['meditation'] }, cautions: [], synergy: { goodWith: ['白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['金弱', '土弱'], avoid: [] }, ziwei: { boost: ['財帛'], avoid: [] }, meihua: { boost: ['乾', '坤'], avoid: [] }, tarot: { boost: ['Pentacles'], avoid: [] }, nameology: { boost: ['金數'], avoid: [] } } },
    { id: 'super_seven', name: '超七', aliases: ['超七', '彩超七', '超八', '阿賽'], elements: { 木: 0.2, 火: 0.5, 土: 0.5, 金: 0.3, 水: 0.5 }, intents: ['love', 'money', 'health', 'decision'], intensity: 4, wear: { defaultHand: 'left', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: false }, scenarios: ['meditation', 'work'] }, cautions: [{ tag: 'overstimulation', text: '能量強，敏感者縮短配戴時段。' }], synergy: { goodWith: ['白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['多維平衡'], avoid: [] }, ziwei: { boost: ['命宮', '福德'], avoid: [] }, meihua: { boost: ['綜合'], avoid: [] }, tarot: { boost: ['Pentacles', 'Cups'], avoid: [] }, nameology: { boost: [], avoid: [] } } },
    { id: 'gold_obsidian', name: '金曜石', aliases: ['金曜石', '金曜'], elements: { 木: 0, 火: 0.2, 土: 0.2, 金: 0.8, 水: 0.6 }, intents: ['money', 'career', 'health'], intensity: 4, wear: { defaultHand: 'right', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: false }, scenarios: ['work'] }, cautions: [{ tag: 'sleep_sensitive', text: '睡前請取下。' }], synergy: { goodWith: ['白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['金弱', '喜金', '水弱'], avoid: ['金過旺'] }, ziwei: { boost: ['財帛'], avoid: [] }, meihua: { boost: ['乾', '坎'], avoid: [] }, tarot: { boost: ['Pentacles'], avoid: [] }, nameology: { boost: ['金數'], avoid: [] } } },
    { id: 'silver_obsidian', name: '銀曜石', aliases: ['銀曜石', '銀曜'], elements: { 木: 0, 火: 0, 土: 0.1, 金: 0.6, 水: 0.8 }, intents: ['money', 'health', 'decision'], intensity: 3, wear: { defaultHand: 'right', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: false }, scenarios: ['work', 'meditation'] }, cautions: [], synergy: { goodWith: ['白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['水弱', '喜水', '金弱'], avoid: ['水過旺'] }, ziwei: { boost: ['疾厄', '財帛'], avoid: [] }, meihua: { boost: ['坎'], avoid: ['離'] }, tarot: { boost: ['Pentacles'], avoid: [] }, nameology: { boost: ['水數', '金數'], avoid: [] } } },
    { id: 'pietersite', name: '彼得石', aliases: ['彼得石', '藍彼得'], elements: { 木: 0.2, 火: 0.2, 土: 0.5, 金: 0.5, 水: 0.6 }, intents: ['career', 'decision', 'timing'], intensity: 3, wear: { defaultHand: 'left', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: false }, scenarios: ['work'] }, cautions: [], synergy: { goodWith: ['白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['土弱', '水弱'], avoid: [] }, ziwei: { boost: ['遷移', '官祿'], avoid: [] }, meihua: { boost: ['坤', '坎'], avoid: [] }, tarot: { boost: ['The Star'], avoid: [] }, nameology: { boost: [], avoid: [] } } },
    { id: 'strawberry_quartz', name: '草莓晶', aliases: ['草莓晶', '星光草莓晶', '薔薇石'], elements: { 木: 0.2, 火: 0.7, 土: 0.3, 金: 0, 水: 0.2 }, intents: ['love', 'relationship'], intensity: 2, wear: { defaultHand: 'left', bestForms: ['bracelet', 'necklace'], dayNight: { day: true, night: true }, scenarios: ['meeting'] }, cautions: [], synergy: { goodWith: ['粉晶', '白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['火弱', '喜火', '桃花'], avoid: ['火過旺'] }, ziwei: { boost: ['夫妻'], avoid: [] }, meihua: { boost: ['離'], avoid: [] }, tarot: { boost: ['Cups', 'The Lovers'], avoid: [] }, nameology: { boost: ['火數'], avoid: [] } } },
    { id: 'tibetan_tektite', name: '天鐵', aliases: ['天鐵', '隕石', '西北非隕石'], elements: { 木: 0.1, 火: 0.3, 土: 0.3, 金: 0.9, 水: 0.1 }, intents: ['career', 'decision', 'timing'], intensity: 5, wear: { defaultHand: 'right', bestForms: ['pendant', 'bracelet'], dayNight: { day: true, night: false }, scenarios: ['work'] }, cautions: [{ tag: 'overstimulation', text: '能量極強，勿久戴。' }], synergy: { goodWith: ['白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['金弱', '喜金'], avoid: ['金過旺'] }, ziwei: { boost: ['官祿', '遷移'], avoid: [] }, meihua: { boost: ['乾'], avoid: [] }, tarot: { boost: ['The Tower', 'Wands'], avoid: [] }, nameology: { boost: ['金數'], avoid: [] } } },
    { id: 'sugilite', name: '舒俱徠石', aliases: ['舒俱徠', '舒俱徠石'], elements: { 木: 0.1, 火: 0.4, 土: 0.2, 金: 0.1, 水: 0.8 }, intents: ['love', 'health', 'decision'], intensity: 3, wear: { defaultHand: 'left', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: true }, scenarios: ['meditation'] }, cautions: [], synergy: { goodWith: ['白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['水弱', '喜水'], avoid: ['水過旺'] }, ziwei: { boost: ['夫妻', '福德'], avoid: [] }, meihua: { boost: ['坎'], avoid: [] }, tarot: { boost: ['Cups'], avoid: [] }, nameology: { boost: ['水數'], avoid: [] } } },
    { id: 'charoite', name: '紫龍晶', aliases: ['紫龍晶', '綠龍晶'], elements: { 木: 0.5, 火: 0.2, 土: 0.2, 金: 0.1, 水: 0.7 }, intents: ['love', 'decision', 'relationship'], intensity: 3, wear: { defaultHand: 'left', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: true }, scenarios: ['meditation'] }, cautions: [], synergy: { goodWith: ['白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['水弱', '木弱'], avoid: [] }, ziwei: { boost: ['夫妻'], avoid: [] }, meihua: { boost: ['坎', '巽'], avoid: [] }, tarot: { boost: ['Cups'], avoid: [] }, nameology: { boost: ['水數'], avoid: [] } } },
    { id: 'green_rutilated_quartz', name: '綠髮晶', aliases: ['綠髮晶', '綠髮'], elements: { 木: 0.85, 火: 0.2, 土: 0.2, 金: 0.2, 水: 0.2 }, intents: ['money', 'career'], intensity: 4, wear: { defaultHand: 'left', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: false }, scenarios: ['work'] }, cautions: [], synergy: { goodWith: ['黃水晶', '白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['木弱', '喜木'], avoid: ['木過旺'] }, ziwei: { boost: ['官祿'], avoid: [] }, meihua: { boost: ['震', '巽'], avoid: [] }, tarot: { boost: ['Pentacles', 'Wands'], avoid: [] }, nameology: { boost: ['木數'], avoid: [] } } },
    { id: 'black_rutilated_quartz', name: '黑髮晶', aliases: ['黑髮晶', '黑髮'], elements: { 木: 0, 火: 0, 土: 0.2, 金: 0.3, 水: 0.9 }, intents: ['health', 'decision'], intensity: 3, wear: { defaultHand: 'right', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: false }, scenarios: ['meditation'] }, cautions: [], synergy: { goodWith: ['白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['水弱', '需排負'], avoid: ['水過旺'] }, ziwei: { boost: ['疾厄'], avoid: [] }, meihua: { boost: ['坎'], avoid: [] }, tarot: { boost: [], avoid: [] }, nameology: { boost: ['水數'], avoid: [] } } },
    { id: 'rutilated_quartz', name: '太陽花', aliases: ['太陽花', '金髮', '彩閃靈'], elements: { 木: 0.2, 火: 0.4, 土: 0.3, 金: 0.7, 水: 0.2 }, intents: ['money', 'career'], intensity: 4, wear: { defaultHand: 'right', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: false }, scenarios: ['work'] }, cautions: [], synergy: { goodWith: ['白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['金弱', '喜金'], avoid: ['金過旺'] }, ziwei: { boost: ['財帛', '官祿'], avoid: [] }, meihua: { boost: ['乾'], avoid: [] }, tarot: { boost: ['Pentacles'], avoid: [] }, nameology: { boost: ['金數'], avoid: [] } } },
    { id: 'white_phantom_quartz', name: '白幽靈', aliases: ['白幽靈'], elements: { 木: 0.1, 火: 0.1, 土: 0.3, 金: 0.6, 水: 0.4 }, intents: ['money', 'career', 'health'], intensity: 2, wear: { defaultHand: 'both', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: true }, scenarios: ['work'] }, cautions: [], synergy: { goodWith: ['白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['金弱', '水弱'], avoid: [] }, ziwei: { boost: ['財帛'], avoid: [] }, meihua: { boost: ['乾', '坎'], avoid: [] }, tarot: { boost: ['Pentacles'], avoid: [] }, nameology: { boost: [], avoid: [] } } },
    { id: 'aventurine', name: '東陵玉', aliases: ['東陵玉'], elements: { 木: 0.85, 火: 0.2, 土: 0.4, 金: 0, 水: 0.2 }, intents: ['money', 'career', 'health'], intensity: 2, wear: { defaultHand: 'left', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: true }, scenarios: ['work'] }, cautions: [], synergy: { goodWith: ['黃水晶', '白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['木弱', '喜木'], avoid: ['木過旺'] }, ziwei: { boost: ['官祿'], avoid: [] }, meihua: { boost: ['震', '巽'], avoid: [] }, tarot: { boost: ['Pentacles'], avoid: [] }, nameology: { boost: ['木數'], avoid: [] } } },
    { id: 'tourmaline_green', name: '綠碧璽', aliases: ['綠碧璽', '阿富汗碧璽'], elements: { 木: 0.9, 火: 0.1, 土: 0.2, 金: 0, 水: 0.2 }, intents: ['money', 'career', 'health'], intensity: 3, wear: { defaultHand: 'left', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: true }, scenarios: ['work'] }, cautions: [], synergy: { goodWith: ['白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['木弱', '喜木'], avoid: ['木過旺'] }, ziwei: { boost: ['官祿'], avoid: [] }, meihua: { boost: ['巽'], avoid: [] }, tarot: { boost: ['Wands'], avoid: [] }, nameology: { boost: ['木數'], avoid: [] } } },
    { id: 'tourmaline_multi', name: '糖果碧璽', aliases: ['糖果碧璽', '多色碧璽'], elements: { 木: 0.5, 火: 0.4, 土: 0.2, 金: 0.1, 水: 0.4 }, intents: ['love', 'money', 'health'], intensity: 3, wear: { defaultHand: 'left', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: true }, scenarios: ['work'] }, cautions: [], synergy: { goodWith: ['白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['木弱', '水弱'], avoid: [] }, ziwei: { boost: ['夫妻', '財帛'], avoid: [] }, meihua: { boost: ['巽', '坎'], avoid: [] }, tarot: { boost: ['Cups', 'Pentacles'], avoid: [] }, nameology: { boost: [], avoid: [] } } },
    { id: 'tourmaline_pink', name: '粉紅碧璽', aliases: ['粉紅碧璽', '粉碧璽'], elements: { 木: 0.2, 火: 0.6, 土: 0.2, 金: 0, 水: 0.4 }, intents: ['love', 'relationship', 'health'], intensity: 2, wear: { defaultHand: 'left', bestForms: ['bracelet', 'necklace'], dayNight: { day: true, night: true }, scenarios: ['meeting'] }, cautions: [], synergy: { goodWith: ['粉晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['火弱', '喜火'], avoid: ['火過旺'] }, ziwei: { boost: ['夫妻'], avoid: [] }, meihua: { boost: ['離'], avoid: [] }, tarot: { boost: ['Cups'], avoid: [] }, nameology: { boost: ['火數'], avoid: [] } } },
    { id: 'morganite', name: '摩根石', aliases: ['摩根石'], elements: { 木: 0.2, 火: 0.5, 土: 0.2, 金: 0, 水: 0.4 }, intents: ['love', 'relationship'], intensity: 2, wear: { defaultHand: 'left', bestForms: ['bracelet', 'necklace'], dayNight: { day: true, night: true }, scenarios: ['meeting'] }, cautions: [], synergy: { goodWith: ['粉晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['火弱', '喜火'], avoid: ['火過旺'] }, ziwei: { boost: ['夫妻'], avoid: [] }, meihua: { boost: ['離'], avoid: [] }, tarot: { boost: ['Cups'], avoid: [] }, nameology: { boost: ['火數'], avoid: [] } } },
    { id: 'golden_heliodor', name: '金太陽', aliases: ['金太陽'], elements: { 木: 0.2, 火: 0.6, 土: 0.7, 金: 0.4, 水: 0 }, intents: ['money', 'career', 'love'], intensity: 3, wear: { defaultHand: 'right', bestForms: ['bracelet', 'pendant'], dayNight: { day: true, night: false }, scenarios: ['work', 'sales'] }, cautions: [], synergy: { goodWith: ['黃水晶', '白水晶'], avoidWith: [] }, evidenceMap: { bazi: { boost: ['土弱', '火弱', '喜土'], avoid: ['土過旺'] }, ziwei: { boost: ['財帛', '福德'], avoid: [] }, meihua: { boost: ['坤', '離'], avoid: [] }, tarot: { boost: ['Pentacles', 'The Sun'], avoid: [] }, nameology: { boost: ['土數'], avoid: [] } } }
  ];

  function getCrystalById(id) {
    for (var i = 0; i < CRYSTALS_KB.length; i++) {
      if (CRYSTALS_KB[i].id === id) return CRYSTALS_KB[i];
    }
    return null;
  }

  function getCrystalsByIntent(intent) {
    return CRYSTALS_KB.filter(function (c) { return c.intents && c.intents.indexOf(intent) >= 0; });
  }

  function getAllCrystals() {
    return CRYSTALS_KB.slice(0);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CRYSTALS_KB: CRYSTALS_KB, getCrystalById: getCrystalById, getCrystalsByIntent: getCrystalsByIntent, getAllCrystals: getAllCrystals };
  } else {
    global.CrystalsKB = { CRYSTALS_KB: CRYSTALS_KB, getCrystalById: getCrystalById, getCrystalsByIntent: getCrystalsByIntent, getAllCrystals: getAllCrystals };
  }
})(typeof window !== 'undefined' ? window : this);
