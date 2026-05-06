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
// ★ Bug #14 fix: iPhone 高解析照片常 5-12MB，壓縮前先 reject 會擋掉合理用戶
//   原始照片放寬到 25MB（手機原圖極少超過這個），壓縮後再用 MAX_SIZE_MB 把關
var MAX_RAW_SIZE_MB = 25;

// v62：移除 crystal，face 主打氣色面相
var PHOTO_FIELDS = {
  face:      { icon: 'fa-portrait',   label: '氣色面相', hint: '正面自拍・光線充足・素顏最佳' },
  palmLeft:  { icon: 'fa-hand-paper', label: '左手掌',   hint: '手心朝上・手指張開' },
  palmRight: { icon: 'fa-hand-paper', label: '右手掌',   hint: '手心朝上・手指張開' }
};

// v62：face 三套都可（含免費），手相仍只在七維度
// v68.21.10:業務變更 — 手相全工具(七維/塔羅/開鑰)免費開放
//   塔羅/開鑰只給 face(避免介面複雜)/七維度給 face+palmLeft+palmRight
//   實際 AI 分析:三工具有照片就一律納入交叉分析,Haiku/Sonnet/Opus 都會
function getFieldsForTool(tool, privileged) {
  if (tool === 'tarot' || tool === 'ootk') {
    // 塔羅/開鑰:所有人都只看到「氣色面相」一個欄位
    return ['face'];
  }
  // 七維度(full):全部人都顯示三欄位(face+palmLeft+palmRight),全免費
  return ['face', 'palmLeft', 'palmRight'];
}

function compressImage(file) {
  return new Promise(function(resolve, reject) {
    // ★ Bug #14 fix: 改成「raw 上限放寬到 25MB（拒絕極端大檔案），壓縮後才用 8MB 檢查」
    //   舊版 8MB 在壓縮前就擋 → iPhone 高解析照片常 5-12MB 直接被拒
    if (file.size > MAX_RAW_SIZE_MB * 1024 * 1024) {
      reject(new Error('圖片太大，請選擇 ' + MAX_RAW_SIZE_MB + 'MB 以內的照片'));
      return;
    }
    var reader = new FileReader();
    reader.onerror = function() { reject(new Error('讀取失敗')); };
    reader.onload = function() {
      var img = new Image();
      img.onerror = function() { reject(new Error('圖片格式不支援')); };
      img.onload = function() {
        // ★ v68.21.22 Bug #42 修:canvas.toDataURL 失敗(罕見 cross-origin/SecurityError)
        //   原本同步 throw 會跳脫 promise 沒人接 → UI 卡在「處理中…」
        try {
          var w = img.width, h = img.height;
          if (w > MAX_PX || h > MAX_PX) {
            if (w > h) { h = Math.round(h * MAX_PX / w); w = MAX_PX; }
            else { w = Math.round(w * MAX_PX / h); h = MAX_PX; }
          }
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('瀏覽器不支援 canvas'));
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          var dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
          // 壓縮後檢查：base64 字串大小約是實際 byte 的 1.37 倍
          var approxBytes = dataUrl.length * 0.75;
          if (approxBytes > MAX_SIZE_MB * 1024 * 1024) {
            // 二次壓縮：降 quality
            dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          }
          resolve(dataUrl);
        } catch(e) {
          reject(new Error('圖片壓縮失敗: ' + (e && e.message ? e.message : '未知錯誤')));
        }
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

function createUploadSlot(key, field, privileged) {
  var slot = document.createElement('div');
  slot.className = 'jy-photo-slot';
  slot.id = 'photo-slot-' + key;
  // ★ v68.21.10:手相全民開放 — 業務決策變更,免費用戶也可上傳手相,AI 一律納入交叉
  //   舊版(已停用):手相欄位 (!privileged) 時顯示「💎 付費解鎖」徽章
  //   新版:不顯示徽章,跟氣色面相一樣免費
  //   舊邏輯保留為註解供日後參考:
  //   var _isPalm = (key === 'palmLeft' || key === 'palmRight');
  //   var _lockBadge = (_isPalm && !privileged)
  //     ? '<span style="position:absolute;top:4px;right:4px;font-size:.55rem;padding:2px 6px;border-radius:6px;background:rgba(192,132,252,.18);color:#c084fc;border:1px solid rgba(192,132,252,.4);font-weight:600;letter-spacing:.02em;z-index:1">💎 付費解鎖</span>'
  //     : '';
  var _lockBadge = '';
  slot.innerHTML =
    '<div class="jy-photo-btn" id="photo-btn-' + key + '" style="position:relative">' +
      _lockBadge +
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
    // ★ v68.21.28 Bug #80 修:5xx throw 走 catch,維持原 localStorage 訂閱狀態
    //   原本沒檢查 r.ok,5xx 時 data.active undefined → !!data.active = false
    //   → line 237 removeItem('_jy_sub_expires') 誤清會員資料
    //   修法:5xx 視為暫時故障,catch 維持 _hasActiveMemberCache() 的狀態
    if (!r.ok && r.status >= 500) {
      throw new Error('worker 5xx');
    }
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
    // v68.21.10:手相已全民開放 — privileged 旗標保留(備用),不再用於顯示徽章
    var slot = createUploadSlot(key, PHOTO_FIELDS[key], privileged);
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
