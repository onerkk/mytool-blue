// ═══════════════════════════════════════════════════════════════
// photo-upload.js — v62 氣色面相全民開放版
// 變更（取代 v53）：
// - 移除 crystal 欄位（塔羅/開鑰唯一選項，但水晶上傳對命理分析價值有限）
// - 改成「氣色面相」face 欄位三套工具（tarot/ootk/full）全部顯示
// - 免費用戶在所有模式都可上傳臉部照片（之前是會員專屬）
// - 手相 palmLeft/palmRight 仍維持七維度+會員專屬（手相需要近距離高解析度且只在七維度有完整命盤合參）
// 規格延續 v48：MAX_PX 1568、QUALITY 0.85、MAX_SIZE_MB 8
// ═══════════════════════════════════════════════════════════════
(function(){
'use strict';

window._jyPhotos = null;

var MAX_PX = 1568;
var QUALITY = 0.85;
var MAX_SIZE_MB = 8;

// v62：移除 crystal，face 主打氣色面相
var PHOTO_FIELDS = {
  face:      { icon: 'fa-portrait',   label: '氣色面相', hint: '正面自拍・光線充足・素顏最佳' },
  palmLeft:  { icon: 'fa-hand-paper', label: '左手掌',   hint: '手心朝上・手指張開' },
  palmRight: { icon: 'fa-hand-paper', label: '右手掌',   hint: '手心朝上・手指張開' }
};

// v62：face 三套都可（含免費），手相仍只在七維度（且會員專屬，由 worker gate 把關）
function getFieldsForTool(tool, privileged) {
  if (tool === 'tarot' || tool === 'ootk') {
    // 塔羅/開鑰：所有人都只看到「氣色面相」一個欄位（取代舊版水晶照片位置）
    return ['face'];
  }
  // 七維度（full）
  if (privileged) {
    // 會員：臉、左手、右手全開（手相是付費價值之一）
    return ['face', 'palmLeft', 'palmRight'];
  }
  // 七維度免費用戶：只開放臉
  return ['face'];
}

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
          else { w = Math.round(w * MAX_PX / h); h = MAX_PX; }
        }
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function savePhoto(key, dataUrl) {
  if (!window._jyPhotos) window._jyPhotos = {};
  window._jyPhotos[key] = dataUrl;
}

function removePhoto(key) {
  if (!window._jyPhotos) return;
  delete window._jyPhotos[key];
  if (!Object.keys(window._jyPhotos).length) window._jyPhotos = null;
}

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

function bindSlotEvents(key) {
  var btn = document.getElementById('photo-btn-' + key);
  var input = document.getElementById('photo-input-' + key);
  var preview = document.getElementById('photo-preview-' + key);
  var img = document.getElementById('photo-img-' + key);
  var rm = document.getElementById('photo-rm-' + key);
  if (!btn || !input || !preview || !img || !rm) return;

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
    '.jy-photo-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:16px 8px;border-radius:10px;border:1px dashed rgba(212,175,55,.25);background:rgba(0,0,0,.15);cursor:pointer;transition:border-color .2s,background .2s;min-height:80px;text-align:center}' +
    '.jy-photo-btn:hover{border-color:rgba(212,175,55,.5);background:rgba(212,175,55,.06)}' +
    '.jy-photo-btn i{font-size:1.2rem;color:rgba(212,175,55,.6)}' +
    '.jy-photo-label{font-size:.78rem;color:var(--c-text,#e8e0d0);font-weight:500}' +
    '.jy-photo-hint{font-size:.65rem;color:var(--c-text-dim,#8a8070);line-height:1.2}' +
    '.jy-photo-preview{display:flex;align-items:center;justify-content:center;position:relative;border-radius:10px;overflow:hidden;border:1px solid rgba(212,175,55,.3);background:#000;min-height:80px}' +
    '.jy-photo-preview img{width:100%;height:80px;object-fit:cover;display:block}' +
    '.jy-photo-remove{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.7);color:#fff;border:none;font-size:14px;line-height:22px;text-align:center;cursor:pointer;padding:0}' +
    '.jy-photo-note{font-size:.65rem;color:var(--c-text-dim,#8a8070);margin-top:6px;text-align:center}' +
    '@media(max-width:360px){.jy-photo-grid{grid-template-columns:repeat(2,1fr)}}';
  document.head.appendChild(style);
}

var _currentRenderedState = '';
var _memberCheckPromise = null;
var _lastObservedTool = null;
var _lastObservedAccess = null;

function _getSelectedTool() {
  if (typeof window._selectedTool !== 'undefined' && window._selectedTool) return window._selectedTool;
  if (typeof _selectedTool !== 'undefined' && _selectedTool) return _selectedTool;
  var fullCard = document.getElementById('tool-full');
  var tarotCard = document.getElementById('tool-tarot');
  var ootkCard = document.getElementById('tool-ootk');
  if (fullCard && fullCard.classList.contains('selected')) return 'full';
  if (tarotCard && tarotCard.classList.contains('selected')) return 'tarot';
  if (ootkCard && ootkCard.classList.contains('selected')) return 'ootk';
  return 'full';
}

function _hasActiveMemberCache() {
  try {
    var exp = parseInt(localStorage.getItem('_jy_sub_expires') || '0', 10);
    if (exp > Date.now()) return true;
  } catch (e) {}
  return !!window._JY_IS_MEMBER;
}

function _isAdmin() {
  return !!window._JY_ADMIN_TOKEN;
}

function _isPrivileged() {
  return _isAdmin() || _hasActiveMemberCache();
}

function _checkMemberStatusOnce() {
  if (_memberCheckPromise) return _memberCheckPromise;
  if (!window._JY_SESSION_TOKEN || _isAdmin()) return Promise.resolve(false);
  var AI_URL = (typeof AI_WORKER_URL !== 'undefined') ? AI_WORKER_URL : 'https://jy-ai-proxy.onerkk.workers.dev';
  _memberCheckPromise = fetch(AI_URL + '/check-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_token: window._JY_SESSION_TOKEN })
  }).then(function(r) {
    return r.json();
  }).then(function(data) {
    var active = !!(data && data.active);
    window._JY_IS_MEMBER = active;
    try {
      if (active && data.expiresAt) localStorage.setItem('_jy_sub_expires', String(data.expiresAt));
      if (!active) localStorage.removeItem('_jy_sub_expires');
    } catch (e) {}
    return active;
  }).catch(function() {
    return _hasActiveMemberCache();
  }).finally(function() {
    _memberCheckPromise = null;
  });
  return _memberCheckPromise;
}

function renderPhotoUpload(tool, forceRefresh) {
  tool = tool || 'full';
  var privileged = _isPrivileged();
  var fields = getFieldsForTool(tool, privileged);

  // v62：氣色面相全民開放——不再針對 full 模式做整段隱藏
  //   塔羅/開鑰：所有人都看到 face
  //   七維度免費：只看到 face
  //   七維度會員：face + palmLeft + palmRight

  var stateKey = tool + '|' + (privileged ? 'all' : 'face');
  if (!forceRefresh && _currentRenderedState === stateKey) return;
  _currentRenderedState = stateKey;

  if (window._jyPhotos) {
    var validKeys = {};
    fields.forEach(function(k) { validKeys[k] = true; });
    Object.keys(window._jyPhotos).forEach(function(k) {
      if (!validKeys[k]) delete window._jyPhotos[k];
    });
    if (!Object.keys(window._jyPhotos).length) window._jyPhotos = null;
  }

  var old = document.getElementById('jy-photo-upload');
  if (old) old.remove();

  var questionCard = document.getElementById('q-custom-wrap');
  var parentCard = questionCard ? questionCard.closest('.card') : null;
  if (!parentCard) {
    var step0 = document.getElementById('step-0');
    if (step0) {
      var cards = step0.querySelectorAll('.card');
      if (cards.length) parentCard = cards[0];
    }
  }
  if (!parentCard) return;

  var wrap = document.createElement('div');
  wrap.id = 'jy-photo-upload';
  wrap.className = 'jy-photo-card';

  // v62：標題依欄位數動態切換
  //   只有 face：「氣色面相（選填）・免費深度解析」
  //   有手相：「上傳照片（選填）・讓分析更深入」
  var titleText = fields.length > 1
    ? '<i class="fas fa-camera"></i> 上傳照片（選填）・讓分析更深入'
    : '<i class="fas fa-portrait"></i> 氣色面相（選填）・免費深度解析';

  wrap.innerHTML = '<div class="jy-photo-title">' + titleText + '</div><div class="jy-photo-grid" id="jy-photo-grid"></div><div class="jy-photo-note">照片僅用於本次分析，不會儲存</div>';
  parentCard.parentNode.insertBefore(wrap, parentCard.nextSibling);

  var grid = document.getElementById('jy-photo-grid');
  fields.forEach(function(key) {
    var slot = createUploadSlot(key, PHOTO_FIELDS[key]);
    grid.appendChild(slot);
    if (window._jyPhotos && window._jyPhotos[key]) {
      var btn = slot.querySelector('.jy-photo-btn');
      var preview = slot.querySelector('.jy-photo-preview');
      var img = slot.querySelector('img');
      if (btn) btn.style.display = 'none';
      if (preview) preview.style.display = 'flex';
      if (img) img.src = window._jyPhotos[key];
    }
  });
  fields.forEach(function(key) { bindSlotEvents(key); });
}

function clearPhotos() {
  window._jyPhotos = null;
  _currentRenderedState = '';
  var el = document.getElementById('jy-photo-upload');
  if (el) el.remove();
}

function hookToolSwitch() {
  if (typeof window.pickTool === 'function' && !window.pickTool.__jy_photo_wrapped__) {
    var _origPickTool = window.pickTool;
    var wrapped = function(tool) {
      var out = _origPickTool.apply(this, arguments);
      setTimeout(function() { renderPhotoUpload(tool, true); }, 0);
      return out;
    };
    wrapped.__jy_photo_wrapped__ = true;
    window.pickTool = wrapped;
  }
  if (typeof window.resetAll === 'function' && !window.resetAll.__jy_photo_wrapped__) {
    var _origReset = window.resetAll;
    var resetWrapped = function() {
      clearPhotos();
      return _origReset.apply(this, arguments);
    };
    resetWrapped.__jy_photo_wrapped__ = true;
    window.resetAll = resetWrapped;
  }
}

function watchState() {
  setInterval(function() {
    hookToolSwitch();
    var tool = _getSelectedTool();
    var access = _isPrivileged() ? 'all' : 'face';
    if (tool !== _lastObservedTool || access !== _lastObservedAccess) {
      _lastObservedTool = tool;
      _lastObservedAccess = access;
      renderPhotoUpload(tool, true);
    }
  }, 700);
}

function init() {
  injectStyles();
  function start() {
    hookToolSwitch();
    renderPhotoUpload(_getSelectedTool(), true);
    // v62：登入後再 check 一次會員狀態（七維度會員會額外顯示手相欄位）
    if (window._JY_SESSION_TOKEN && !_isPrivileged()) {
      _checkMemberStatusOnce().then(function(active) {
        if (active || _isAdmin()) renderPhotoUpload(_getSelectedTool(), true);
      });
    }
    watchState();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}

init();

})();
