/**
 * 紫微斗數排盤系統
 * 使用 iztro 開源庫 (https://github.com/SylarLong/iztro)
 * 依出生日期、時辰、性別取得完整紫微星盤
 */
(function (global) {
    'use strict';

    /** 時辰對應：子0 丑1 ... 亥11，與 iztro timeIndex 一致（iztro 0-11 為 早子～亥，12 為晚子時） */
    function getTimeIndexFromHHmm(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') return 6; // 預設午時
        var parts = timeStr.trim().split(/[:\s]/);
        var h = parseInt(parts[0], 10);
        var m = parseInt(parts[1], 10) || 0;
        if (isNaN(h)) return 6;
        if (h === 24) h = 0;
        if (h === 23 || (h >= 0 && h < 1)) return 0;   // 早子時
        if (h >= 1 && h < 3) return 1;   // 丑
        if (h >= 3 && h < 5) return 2;   // 寅
        if (h >= 5 && h < 7) return 3;   // 卯
        if (h >= 7 && h < 9) return 4;   // 辰
        if (h >= 9 && h < 11) return 5;  // 巳
        if (h >= 11 && h < 13) return 6; // 午
        if (h >= 13 && h < 15) return 7; // 未
        if (h >= 15 && h < 17) return 8; // 申
        if (h >= 17 && h < 19) return 9; // 酉
        if (h >= 19 && h < 21) return 10;// 戌
        if (h >= 21 && h < 23) return 11;// 亥
        return 6;
    }

    /**
     * 依陽曆日期、時間、性別取得紫微星盤
     * @param {string} solarDate - YYYY-MM-DD
     * @param {string} timeStr - HH:mm
     * @param {string} gender - 'male' | 'female'
     * @returns {Object|null} iztro astrolabe 或 null
     */
    function calculateZiwei(solarDate, timeStr, gender) {
        var iztro = global.iztro;
        var astro = (iztro && iztro.astro) || (iztro && iztro.default && iztro.default.astro) || global.astro;
        if (!astro || typeof astro.bySolar !== 'function') {
            console.warn('[ziwei-system] iztro 庫未載入或格式不符，請確認 CDN 可用');
            return null;
        }
        if (!solarDate) return null;
        var dateStr = String(solarDate).replace(/\//g, '-').trim();
        var timeIndex = getTimeIndexFromHHmm(timeStr || '12:00');
        var genderZh = (gender === 'female' || gender === '女') ? '女' : '男';
        try {
            return astro.bySolar(dateStr, timeIndex, genderZh, true, 'zh-TW');
        } catch (e) {
            console.warn('[ziwei-system] 紫微排盤失敗:', e);
            return null;
        }
    }

    /** 命主／身主 白話說明（讓人看懂代表什麼） */
    var SOUL_BODY_PLAIN = {
        soul: '命主代表先天性格與精神傾向，可理解為「與生俱來的氣質」。',
        body: '身主代表後天體質與行為傾向，可理解為「後天發展與身體狀況的象徵」。'
    };
    /** 十二宮位 白話說明：宮位名稱 → 一句話讓人懂 */
    var PALACE_PLAIN = {
        '命宮': '你的人格、人生方向與整體運勢的起點。',
        '父母': '與長輩、上司、師長的緣分與互動。',
        '福德': '精神享受、興趣嗜好與內心是否滿足。',
        '田宅': '不動產、居家環境與家庭根基。',
        '官祿': '工作、事業、職涯發展與成就。',
        '僕役': '同事、下屬、朋友與人際助力。',
        '遷移': '外出、搬家、旅行與外在機遇。',
        '疾厄': '健康狀況、體質與需留意的身體部位。',
        '財帛': '金錢、收入、理財與物質條件。',
        '子女': '子女緣、下屬、創作與桃花。',
        '夫妻': '配偶、感情、婚姻與一對一關係。',
        '兄弟': '兄弟姊妹、同輩與平輩人際。'
    };

    /**
     * 將紫微星盤轉為簡化 HTML 供顯示（含白話說明，讓人看懂）
     */
    function renderZiweiHTML(astrolabe) {
        if (!astrolabe) return '<p class="no-data-note"><i class="fas fa-info-circle"></i> 請先填寫出生日期、時間與性別。</p>';
        var h = [];
        h.push('<div class="ziwei-summary ziwei-plain" style="margin-bottom:1rem; padding:0.75rem; background:rgba(212,175,55,0.08); border-radius:8px; font-size:0.9rem;">');
        h.push('<p><strong>命主：</strong>' + (astrolabe.soul || '-') + ' <span style="color:rgba(255,255,255,0.75); font-size:0.8rem;">（' + (SOUL_BODY_PLAIN.soul || '先天性格與精神傾向') + '）</span></p>');
        h.push('<p><strong>身主：</strong>' + (astrolabe.body || '-') + ' <span style="color:rgba(255,255,255,0.75); font-size:0.8rem;">（' + (SOUL_BODY_PLAIN.body || '後天體質與行為傾向') + '）</span></p>');
        h.push('<p><strong>五行局：</strong>' + (astrolabe.fiveElementsClass || '-') + ' &nbsp; <strong>命宮：</strong>' + (astrolabe.earthlyBranchOfSoulPalace || '-') + ' &nbsp; <strong>身宮：</strong>' + (astrolabe.earthlyBranchOfBodyPalace || '-') + '</p>');
        h.push('<p style="font-size:0.8rem; color:rgba(255,255,255,0.7); margin-top:0.5rem;">五行局與命宮／身宮代表你命盤的基礎格局；身宮標示「身」的宮位，代表後天努力的重心。</p>');
        h.push('</div>');
        h.push('<div class="ziwei-palaces" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:0.5rem;">');
        var palaces = astrolabe.palaces || [];
        palaces.forEach(function (p) {
            var majors = (p.majorStars || []).map(function (s) { return s.name; }).join('、');
            var minors = (p.minorStars || []).map(function (s) { return s.name; }).join('、');
            var stars = majors + (minors ? ' + ' + minors : '');
            if (!stars) stars = '無主星';
            var bodyTag = p.isBodyPalace ? ' <span class="bazi-tag tag-star" style="font-size:0.65rem;">身</span>' : '';
            var plainDesc = PALACE_PLAIN[p.name] || '';
            h.push('<div class="ziwei-palace-item" style="padding:0.5rem; background:rgba(255,255,255,0.04); border-radius:6px; border:1px solid rgba(212,175,55,0.2);">');
            h.push('<div style="font-weight:bold; color:var(--gold-primary); margin-bottom:0.3rem;">' + (p.name || '-') + bodyTag + '</div>');
            h.push('<div style="font-size:0.8rem; line-height:1.4;">' + stars + '</div>');
            if (plainDesc) h.push('<div style="font-size:0.7rem; color:rgba(255,255,255,0.7); margin-top:0.25rem;">' + plainDesc + '</div>');
            if (p.stage && p.stage.range) {
                h.push('<div style="font-size:0.7rem; opacity:0.8;">大限 ' + p.stage.range[0] + '-' + p.stage.range[1] + ' 歲（此十年運勢重心在此宮）</div>');
            }
            h.push('</div>');
        });
        h.push('</div>');
        return h.join('');
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { calculateZiwei: calculateZiwei, renderZiweiHTML: renderZiweiHTML };
    } else {
        global.ZiweiSystem = {
            calculate: calculateZiwei,
            renderHTML: renderZiweiHTML
        };
    }
})(typeof window !== 'undefined' ? window : this);
