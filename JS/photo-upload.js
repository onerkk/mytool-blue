// ═══════════════════════════════════════════════════════════════
// photo-upload.js — v38 面相/手相/水晶照片上傳模組
// 動態注入 DOM，壓縮圖片，存入 window._jyPhotos 供 payload 讀取
// ═══════════════════════════════════════════════════════════════
(function(){
'use strict';

// ── 全域照片儲存 ──
window._jyPhotos = null;

// ── 常數 ──
var MAX_PX = 768;       // 最長邊壓到 768px
var QUALITY = 0.75;     // JPEG 品質
var MAX_SIZE_MB = 4;    // 單張上限 4MB（壓縮前）

// ── 照片欄位定義 ──
var PHOTO_FIELDS = {
  face:      { icon: 'fa-portrait',    label: '臉部照片',   hint: '正面自拍・光線充足' },
  palmLeft:  { icon: 'fa-hand-paper',  label: '左手掌',     hint: '手心朝上・手指張開' },
  palmRight: { icon: 'fa-hand-paper',  label: '右手掌',     hint: '手心朝上・手指張開' },
  crystal:   { icon: 'fa-gem',         label: '水晶照片',   hint: '拍你正在配戴的水晶' }
};

// ── 根據工具決定顯示哪些上傳欄位 ──
function getFieldsForTool(tool) {
  if (tool === 'tarot' || tool === 'ootk') return ['crystal'];
  return ['face', 'palmLeft', 'palmRight', 'crystal']; // full / direct
}

// ── 圖片壓縮：縮放到 MAX_PX 並轉 base64 JPEG ──
function compressImage(file) {
  return new Promise(function(resolve, reject) {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      reject(new Error('圖片太大，請選擇 ' + MAX_SIZE_MB + 'MB 以內的照片'));
      return;
    }
    var reader = new FileReader();
    reader.onerror = function() { reject(new Error('讀取失敗')); };
    reader.onload = function() {
      var img = new Image();
      img.onerror = function() { reject(new Error('圖片格式不支援')); };
      img.onload = function() {
        var w = img.width, h = img.height;
        if (w > MAX_PX || h > MAX_PX) {
          if (w > h) { h = Math.round(h * MAX_PX / w); w = MAX_PX; }
          else       { w = Math.round(w * MAX_PX / h); h = MAX_PX; }
        }
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── 儲存照片到全域 ──
function savePhoto(key, dataUrl) {
  if (!window._jyPhotos) window._jyPhotos = {};
  window._jyPhotos[key] = dataUrl;
}
function removePhoto(key) {
  if (window._jyPhotos) {
    delete window._jyPhotos[key];
    if (Object.keys(window._jyPhotos).length === 0) window._jyPhotos = null;
  }
}

// ── 建立單一上傳欄位的 HTML ──
function createUploadSlot(key, field) {
  var slot = document.createElement('div');
  slot.className = 'jy-photo-slot';
  slot.id = 'photo-slot-' + key;
  slot.innerHTML =
    '<div class="jy-photo-btn" id="photo-btn-' + key + '">' +
      '<i class="fas ' + field.icon + '"></i>' +
      '<span class="jy-photo-label">' + field.label + '</span>' +
      '<span class="jy-photo-hint">' + field.hint + '</span>' +
    '</div>' +
    '<div class="jy-photo-preview" id="photo-preview-' + key + '" style="display:none">' +
      '<img id="photo-img-' + key + '" />' +
      '<button class="jy-photo-remove" id="photo-rm-' + key + '" title="移除">&times;</button>' +
    '</div>' +
    '<input type="file" accept="image/*" id="photo-input-' + key + '" style="display:none" />';

  return slot;
}

// ── 綁定事件 ──
function bindSlotEvents(key) {
  var btn = document.getElementById('photo-btn-' + key);
  var input = document.getElementById('photo-input-' + key);
  var preview = document.getElementById('photo-preview-' + key);
  var img = document.getElementById('photo-img-' + key);
  var rm = document.getElementById('photo-rm-' + key);

  if (!btn || !input) return;

  btn.addEventListener('click', function() { input.click(); });

  input.addEventListener('change', function() {
    var file = input.files && input.files[0];
    if (!file) return;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 處理中…';
    compressImage(file).then(function(dataUrl) {
      savePhoto(key, dataUrl);
      img.src = dataUrl;
      btn.style.display = 'none';
      preview.style.display = 'flex';
    }).catch(function(err) {
      alert(err.message || '圖片處理失敗');
      var f = PHOTO_FIELDS[key];
      btn.innerHTML = '<i class="fas ' + f.icon + '"></i><span class="jy-photo-label">' + f.label + '</span><span class="jy-photo-hint">' + f.hint + '</span>';
    });
  });

  rm.addEventListener('click', function() {
    removePhoto(key);
    img.src = '';
    input.value = '';
    preview.style.display = 'none';
    btn.style.display = '';
    var f = PHOTO_FIELDS[key];
    btn.innerHTML = '<i class="fas ' + f.icon + '"></i><span class="jy-photo-label">' + f.label + '</span><span class="jy-photo-hint">' + f.hint + '</span>';
  });
}

// ── 注入 CSS ──
function injectStyles() {
  if (document.getElementById('jy-photo-styles')) return;
  var style = document.createElement('style');
  style.id = 'jy-photo-styles';
  style.textContent =
    '.jy-photo-card{margin-top:var(--sp-sm,8px);padding:12px 14px;background:rgba(255,255,255,.03);border:1px solid rgba(212,175,55,.15);border-radius:12px}' +
    '.jy-photo-title{font-size:.82rem;color:rgba(212,175,55,.85);margin-bottom:8px;display:flex;align-items:center;gap:6px}' +
    '.jy-photo-title i{font-size:.75rem}' +
    '.jy-photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}' +
    '.jy-photo-slot{position:relative}' +
    '.jy-photo-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;' +
      'padding:16px 8px;border-radius:10px;border:1px dashed rgba(212,175,55,.25);background:rgba(0,0,0,.15);' +
      'cursor:pointer;transition:border-color .2s,background .2s;min-height:80px;text-align:center}' +
    '.jy-photo-btn:hover{border-color:rgba(212,175,55,.5);background:rgba(212,175,55,.06)}' +
    '.jy-photo-btn i{font-size:1.2rem;color:rgba(212,175,55,.6)}' +
    '.jy-photo-label{font-size:.78rem;color:var(--c-text,#e8e0d0);font-weight:500}' +
    '.jy-photo-hint{font-size:.65rem;color:var(--c-text-dim,#8a8070);line-height:1.2}' +
    '.jy-photo-preview{display:flex;align-items:center;justify-content:center;position:relative;' +
      'border-radius:10px;overflow:hidden;border:1px solid rgba(212,175,55,.3);background:#000;min-height:80px}' +
    '.jy-photo-preview img{width:100%;height:80px;object-fit:cover;display:block}' +
    '.jy-photo-remove{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;' +
      'background:rgba(0,0,0,.7);color:#fff;border:none;font-size:14px;line-height:22px;text-align:center;' +
      'cursor:pointer;padding:0}' +
    '.jy-photo-note{font-size:.65rem;color:var(--c-text-dim,#8a8070);margin-top:6px;text-align:center}' +
    '@media(max-width:360px){.jy-photo-grid{grid-template-columns:repeat(2,1fr)}}';
  document.head.appendChild(style);
}

// ── 主渲染：根據工具類型渲染照片上傳區 ──
var _currentRenderedTool = null;

function renderPhotoUpload(tool) {
  tool = tool || 'full';
  var fields = getFieldsForTool(tool);

  // 避免重複渲染同一工具
  if (_currentRenderedTool === tool) return;
  _currentRenderedTool = tool;

  // ★ 清除不屬於新工具的照片（七維度→塔羅時移除臉/手照片，避免浪費 token）
  if (window._jyPhotos) {
    var validKeys = {};
    fields.forEach(function(k) { validKeys[k] = true; });
    Object.keys(window._jyPhotos).forEach(function(k) {
      if (!validKeys[k]) delete window._jyPhotos[k];
    });
    if (Object.keys(window._jyPhotos).length === 0) window._jyPhotos = null;
  }

  // 移除舊的
  var old = document.getElementById('jy-photo-upload');
  if (old) old.remove();

  // 找注入點：問題卡片後面
  var questionCard = document.getElementById('q-custom-wrap');
  var parentCard = questionCard ? questionCard.closest('.card') : null;
  if (!parentCard) {
    // fallback：找 step-0 裡第一個 .card
    var step0 = document.getElementById('step-0');
    if (step0) {
      var cards = step0.querySelectorAll('.card');
      if (cards.length) parentCard = cards[0];
    }
  }
  if (!parentCard) return;

  // 建立容器
  var wrap = document.createElement('div');
  wrap.id = 'jy-photo-upload';
  wrap.className = 'jy-photo-card';

  var titleText = fields.length > 1
    ? '<i class="fas fa-camera"></i> 上傳照片（選填）・讓分析更深入'
    : '<i class="fas fa-gem"></i> 上傳水晶照片（選填）';

  wrap.innerHTML = '<div class="jy-photo-title">' + titleText + '</div><div class="jy-photo-grid" id="jy-photo-grid"></div>' +
    '<div class="jy-photo-note">照片僅用於本次分析，不會儲存</div>';

  // 插到問題卡片後面
  parentCard.parentNode.insertBefore(wrap, parentCard.nextSibling);

  // 填入上傳欄位
  var grid = document.getElementById('jy-photo-grid');
  fields.forEach(function(key) {
    var slot = createUploadSlot(key, PHOTO_FIELDS[key]);
    grid.appendChild(slot);
    // 如果之前已有照片（切換工具後保留），恢復預覽
    if (window._jyPhotos && window._jyPhotos[key]) {
      var btn = slot.querySelector('.jy-photo-btn');
      var preview = slot.querySelector('.jy-photo-preview');
      var img = slot.querySelector('img');
      if (btn) btn.style.display = 'none';
      if (preview) { preview.style.display = 'flex'; }
      if (img) img.src = window._jyPhotos[key];
    }
  });

  // 綁定事件
  fields.forEach(function(key) { bindSlotEvents(key); });
}

// ── 清除所有照片（重置時呼叫）──
function clearPhotos() {
  window._jyPhotos = null;
  _currentRenderedTool = null;
  var el = document.getElementById('jy-photo-upload');
  if (el) el.remove();
}

// ── 監聽工具切換 ──
function hookToolSwitch() {
  // 攔截 pickTool
  if (typeof window.pickTool === 'function') {
    var _origPickTool = window.pickTool;
    window.pickTool = function(tool) {
      _origPickTool(tool);
      renderPhotoUpload(tool);
    };
  }
  // 攔截 resetAll（清除照片）
  if (typeof window.resetAll === 'function') {
    var _origReset = window.resetAll;
    window.resetAll = function() {
      clearPhotos();
      return _origReset.apply(this, arguments);
    };
  }
}

// ── 初始化 ──
function init() {
  injectStyles();
  // 等 DOM 就緒
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      hookToolSwitch();
      // 初始渲染（預設工具）
      var tool = (typeof _selectedTool !== 'undefined') ? _selectedTool : 'full';
      renderPhotoUpload(tool);
    });
  } else {
    hookToolSwitch();
    var tool = (typeof _selectedTool !== 'undefined') ? _selectedTool : 'full';
    renderPhotoUpload(tool);
  }
}

init();

})();
