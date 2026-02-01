/**
 * 八字類型建議模板
 * 依身強弱、喜忌、十神配置，觸發愛情/事業/財運/健康/運勢的建議
 * 供分析文字與融合引擎參考
 */
(function (global) {
  'use strict';

  var TEMPLATES = {
    love: {
      strong_fav_wood: '身強喜木，感情上宜主動表達、創造共同目標，避免過度強勢。',
      weak_fav_wood: '身弱喜木，感情宜尋求可依靠對象，勿在曖昧中消耗。',
      strong_fav_fire: '身強喜火，感情需熱情投入，桃花運佳時把握。',
      weak_fav_fire: '身弱喜火，感情需對方主動，勿過度付出。',
      strong_fav_earth: '身強喜土，感情穩定為上，宜循序漸進。',
      weak_fav_earth: '身弱喜土，感情宜尋求穩定支持，避免動盪。',
      strong_fav_metal: '身強喜金，感情需理性溝通，忌情緒化。',
      weak_fav_metal: '身弱喜金，感情易受壓，宜選擇包容型對象。',
      strong_fav_water: '身強喜水，感情需彈性與智慧，避免固執。',
      weak_fav_water: '身弱喜水，感情需滋潤與理解，勿急躁。',
      guansha_heavy: '官殺重，感情易有壓力或競爭，宜釐清界線。',
      caixing_heavy: '財星旺，異性緣佳但易分心，宜專注一人。'
    },
    career: {
      strong_fav_metal: '身強喜金，事業宜從軍警、法律、金融等領域發展。',
      weak_fav_metal: '身弱喜金，事業宜穩紮穩打，勿承接超出能力之責。',
      strong_fav_fire: '身強喜火，事業可大膽拓展，領導力佳。',
      weak_fav_fire: '身弱喜火，事業需借團隊或上司之力，勿單打獨鬥。',
      guansha_heavy: '官殺旺，適合管理、公職，宜善用權威。',
      shishang_heavy: '食傷旺，適合創意、技術、自由業。',
      cai_weak: '財星弱，宜專注本業累積，避免投機。'
    },
    wealth: {
      strong_cai_heavy: '身強財旺，可積極理財投資，宜分散風險。',
      weak_cai_heavy: '身弱財旺，財運策略偏保守，避免槓桿。',
      fav_earth: '喜土，宜投資不動產或穩健標的。',
      fav_water: '喜水，宜流動性理財，避免固定資產過重。',
      unfav_fire: '忌火，避開高風險、投機性投資。',
      unfav_wood: '忌木，理財勿過度擴張。'
    },
    health: {
      weak_fire: '身弱火少，需注意心血管、精力不足。',
      weak_water: '身弱水少，需注意腎、泌尿、睡眠。',
      weak_wood: '身弱木少，需注意肝膽、筋骨。',
      weak_earth: '身弱土少，需注意脾胃、消化。',
      weak_metal: '身弱金少，需注意呼吸、皮膚。',
      balance: '五行尚平衡，規律作息與適度運動為上。'
    },
    relationship: {
      strong_fav_wood: '身強喜木，人際宜主動連結、創造共同話題。',
      weak_fav_wood: '身弱喜木，人際宜尋求支持，勿單打獨鬥。',
      strong_fav_fire: '身強喜火，人緣佳，宜把握貴人機緣。',
      weak_fav_fire: '身弱喜火，人際需對方主動，勿過度討好。',
      guansha_heavy: '官殺旺，人際易有權力張力，宜釐清界線。',
      from_ge: '從格命局，人際順勢而為。'
    },
    family: {
      strong_fav_earth: '身強喜土，家庭穩定為重，宜包容體諒。',
      weak_fav_earth: '身弱喜土，家庭宜尋求支持，勿獨扛。',
      strong_fav_water: '身強喜水，家庭溝通順暢，宜傾聽。',
      weak_fav_water: '身弱喜水，家庭需滋潤理解，勿急躁。',
      from_ge: '從格命局，家庭順勢而為。'
    },
    general: {
      strong: '身強體健，運勢順遂時把握機會，勿過度自信。',
      weak: '身弱需借大運流年補益，沉潛進修、蓄勢待發。',
      from_ge: '從格命局，順勢而為，勿逆勢操作。'
    }
  };

  /**
   * @param {Object} bazi - 八字結果，含 fullData.favorableElements, fullData.bodyStrength 等
   * @param {string} type - love|career|wealth|health|general
   * @returns {string[]} 建議條目
   */
  function getTypeSuggestions(bazi, type) {
    var out = [];
    if (!bazi || !bazi.fullData) return out;

    var fe = bazi.fullData.favorableElements || {};
    var fav = Array.isArray(fe.favorable) ? fe.favorable : (fe.favorable ? [fe.favorable] : []);
    var unfav = Array.isArray(fe.unfavorable) ? fe.unfavorable : (fe.unfavorable ? [fe.unfavorable] : []);
    var strength = (bazi.fullData.bodyStrength || bazi.bodyStrength || '').toLowerCase();
    var isStrong = /身強|偏強|從強/.test(strength);
    var isWeak = /身弱|偏弱|從弱/.test(strength);
    var isFrom = /從格|從/.test(strength);

    var t = TEMPLATES[type] || TEMPLATES.general;
    if (!t) return out;

    var EL_TO_KEY = { '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water' };
    var favEl = fav[0] || '';
    var favKey = EL_TO_KEY[favEl] || '';
    if (favKey && t['strong_fav_' + favKey]) {
      if (isStrong) out.push(t['strong_fav_' + favKey]);
      else if (isWeak) out.push(t['weak_fav_' + favKey]);
    }
    if (type === 'wealth' && fav.indexOf('土') >= 0) out.push(t.fav_earth || '');
    if (type === 'wealth' && fav.indexOf('水') >= 0) out.push(t.fav_water || '');
    if (type === 'wealth' && unfav.indexOf('火') >= 0) out.push(t.unfav_fire || '');
    if (type === 'wealth' && unfav.indexOf('木') >= 0) out.push(t.unfav_wood || '');
    if (type === 'career' && (t.guansha_heavy || t.shishang_heavy)) out.push(t.guansha_heavy || t.shishang_heavy || '');
    if (type === 'love' && (t.guansha_heavy || t.caixing_heavy)) out.push(t.guansha_heavy || t.caixing_heavy || '');
    if (isFrom && t.from_ge) out.push(t.from_ge);
    if (isStrong && !out.length && t.strong) out.push(t.strong);
    if (isWeak && !out.length && t.weak) out.push(t.weak);

    return out.filter(Boolean).slice(0, 3);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TEMPLATES, getTypeSuggestions };
  } else {
    global.BaziInterpreter = { TEMPLATES: TEMPLATES, getTypeSuggestions: getTypeSuggestions };
  }
})(typeof window !== 'undefined' ? window : this);
