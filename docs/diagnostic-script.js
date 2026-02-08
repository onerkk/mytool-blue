/**
 * 靜月之光 - 系統診斷腳本
 * 在瀏覽器 Console (F12) 貼上並執行，回報結果以便排查問題
 */
(function() {
  console.log('=== 系統診斷 ===');
  console.log('1. WizardController 存在:', typeof WizardController !== 'undefined');
  console.log('2. main-content 元素:', document.getElementById('main-content') !== null);
  console.log('3. input-section 元素:', document.getElementById('input-section') !== null);
  console.log('4. 所有 section 數量:', document.querySelectorAll('.section').length);
  console.log('5. CSS 變數 --color-primary:', getComputedStyle(document.documentElement).getPropertyValue('--color-primary'));
  console.log('6. 頁面可見內容(前100字):', document.body.innerText.substring(0, 100));
  console.log('7. JavaScript 錯誤處理器:', window.onerror ? '有' : '無');
  console.log('=== 診斷結束 ===');
})();
