/**
 * 強制現代化 UI 注入腳本
 * 使用 JavaScript 直接修改 DOM 樣式，確保生效
 */

(function() {
  'use strict';
  
  // 等待 DOM 載入完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyModernUI);
  } else {
    applyModernUI();
  }
  
  function applyModernUI() {
    console.log('[Modern UI] 開始套用現代化樣式...');
    
    // 注入關鍵 CSS 變數
    injectCSSVariables();
    
    // 強制套用樣式到具體元素
    styleBody();
    styleNavbar();
    styleProgressBar();
    styleSections();
    styleFormElements();
    styleButtons();
    
    console.log('[Modern UI] 現代化樣式套用完成');
  }
  
  function injectCSSVariables() {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --modern-gold: #D4AF37;
        --modern-gold-light: #E8C968;
        --modern-gold-dark: #B8941F;
        --modern-bg: #1a1520;
        --modern-bg-card: rgba(255, 255, 255, 0.03);
        --modern-border: rgba(212, 175, 55, 0.2);
        --modern-glow: 0 0 20px rgba(212, 175, 55, 0.3);
      }
    `;
    document.head.appendChild(style);
  }
  
  function styleBody() {
    document.body.style.background = 'linear-gradient(180deg, #1a1520 0%, #0f0b14 100%)';
    document.body.style.backgroundAttachment = 'fixed';
  }
  
  function styleNavbar() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.style.background = 'rgba(26, 21, 32, 0.95)';
      navbar.style.backdropFilter = 'blur(20px)';
      navbar.style.borderBottom = '1px solid rgba(212, 175, 55, 0.2)';
      navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.4)';
    }
  }
  
  function styleProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.style.background = 'rgba(26, 21, 32, 0.95)';
      progressBar.style.backdropFilter = 'blur(20px)';
      progressBar.style.borderBottom = '1px solid rgba(212, 175, 55, 0.2)';
    }
    
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach(step => {
      step.style.padding = '0.625rem 1.125rem';
      step.style.fontSize = '0.875rem';
      step.style.borderRadius = '0.75rem';
      step.style.transition = 'all 0.2s ease';
      
      if (step.classList.contains('active')) {
        step.style.color = '#D4AF37';
        step.style.background = 'rgba(212, 175, 55, 0.1)';
        step.style.fontWeight = '600';
        step.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)';
      } else {
        step.style.color = 'rgba(255, 255, 255, 0.5)';
      }
    });
  }
  
  function styleSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.style.background = 'rgba(255, 255, 255, 0.03)';
      section.style.border = '1px solid rgba(212, 175, 55, 0.2)';
      section.style.borderRadius = '1.5rem';
      section.style.padding = '2.5rem 2rem';
      section.style.marginBottom = '2rem';
      section.style.backdropFilter = 'blur(10px)';
      section.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.4)';
      
      const h2 = section.querySelector('h2');
      if (h2) {
        h2.style.color = '#D4AF37';
        h2.style.fontWeight = '600';
        h2.style.marginBottom = '1.5rem';
      }
    });
  }
  
  function styleFormElements() {
    // 輸入框
    const inputs = document.querySelectorAll('input[type="text"], input[type="date"], input[type="time"], select, textarea');
    inputs.forEach(input => {
      input.style.background = 'rgba(255, 255, 255, 0.05)';
      input.style.border = '1px solid rgba(212, 175, 55, 0.2)';
      input.style.borderRadius = '0.75rem';
      input.style.padding = '0.875rem 1.125rem';
      input.style.color = '#FFFFFF';
      input.style.fontSize = '16px';
      input.style.transition = 'all 0.2s ease';
      
      input.addEventListener('focus', function() {
        this.style.borderColor = 'rgba(212, 175, 55, 0.6)';
        this.style.background = 'rgba(212, 175, 55, 0.05)';
        this.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
      });
      
      input.addEventListener('blur', function() {
        this.style.borderColor = 'rgba(212, 175, 55, 0.2)';
        this.style.background = 'rgba(255, 255, 255, 0.05)';
        this.style.boxShadow = 'none';
      });
    });
    
    // 單選按鈕
    const radioLabels = document.querySelectorAll('.radio-label');
    radioLabels.forEach(label => {
      const radioText = label.querySelector('.radio-text');
      if (radioText) {
        radioText.style.background = 'rgba(255, 255, 255, 0.05)';
        radioText.style.border = '2px solid rgba(212, 175, 55, 0.2)';
        radioText.style.borderRadius = '9999px';
        radioText.style.padding = '0.875rem 1.5rem';
        radioText.style.transition = 'all 0.2s ease';
        
        const radio = label.querySelector('input[type="radio"]');
        if (radio) {
          if (radio.checked) {
            radioText.style.background = 'linear-gradient(135deg, #D4AF37, #B8941F)';
            radioText.style.color = '#1a1520';
            radioText.style.borderColor = '#D4AF37';
            radioText.style.fontWeight = '600';
            radioText.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)';
          }
          
          radio.addEventListener('change', function() {
            document.querySelectorAll('.radio-label .radio-text').forEach(rt => {
              rt.style.background = 'rgba(255, 255, 255, 0.05)';
              rt.style.color = 'rgba(255, 255, 255, 0.7)';
              rt.style.borderColor = 'rgba(212, 175, 55, 0.2)';
              rt.style.fontWeight = '500';
              rt.style.boxShadow = 'none';
            });
            
            if (this.checked) {
              radioText.style.background = 'linear-gradient(135deg, #D4AF37, #B8941F)';
              radioText.style.color = '#1a1520';
              radioText.style.borderColor = '#D4AF37';
              radioText.style.fontWeight = '600';
              radioText.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)';
            }
          });
        }
      }
    });
  }
  
  function styleButtons() {
    const primaryBtns = document.querySelectorAll('.btn-primary, button.btn-primary');
    primaryBtns.forEach(btn => {
      btn.style.background = 'linear-gradient(135deg, #D4AF37, #B8941F)';
      btn.style.color = '#1a1520';
      btn.style.border = 'none';
      btn.style.borderRadius = '0.75rem';
      btn.style.padding = '0.875rem 1.75rem';
      btn.style.fontWeight = '600';
      btn.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)';
      btn.style.transition = 'all 0.2s ease';
      btn.style.cursor = 'pointer';
      
      btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.5)';
      });
      
      btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)';
      });
    });
    
    const outlineBtns = document.querySelectorAll('.btn-outline, .btn-secondary');
    outlineBtns.forEach(btn => {
      btn.style.background = '#24202a';
      btn.style.color = '#FFFFFF';
      btn.style.border = '1px solid rgba(212, 175, 55, 0.2)';
      btn.style.borderRadius = '0.75rem';
      btn.style.padding = '0.875rem 1.75rem';
      btn.style.transition = 'all 0.2s ease';
      btn.style.cursor = 'pointer';
      
      btn.addEventListener('mouseenter', function() {
        this.style.borderColor = '#D4AF37';
        this.style.background = 'rgba(212, 175, 55, 0.1)';
      });
      
      btn.addEventListener('mouseleave', function() {
        this.style.borderColor = 'rgba(212, 175, 55, 0.2)';
        this.style.background = '#24202a';
      });
    });
  }
  
  // 監聽 DOM 變化，確保動態新增的元素也能套用樣式
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        setTimeout(applyModernUI, 100);
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
})();
