/**
 * 靜月之光能量占卜儀 v2.0 - Wizard 流程控制器
 * 建立日期: 2026-02-08
 * 用途: 管理分步式流程的狀態、驗證與導航
 */

(function(window) {
  'use strict';

  // ============================================
  // 常數定義
  // ============================================
  const WIZARD_STEPS = {
    WELCOME: 0,
    BASIC_INFO: 1,
    BIRTH_INFO: 2,
    QUESTION: 3,
    CONFIRM: 4,
    CALCULATING: 5,
    MEIHUA: 6,
    TAROT: 7,
    RESULT: 8
  };

  const STEP_NAMES = [
    '歡迎',
    '基本資料',
    '出生資訊',
    '問題類型',
    '確認資料',
    '計算中',
    '梅花起卦',
    '塔羅抽牌',
    '結果展示'
  ];

  const QUESTION_TYPES = {
    love: { icon: '💕', title: '愛情', description: '感情、婚姻、伴侶關係' },
    career: { icon: '💼', title: '事業', description: '工作、職涯發展、創業' },
    wealth: { icon: '💰', title: '財運', description: '投資、理財、收入' },
    health: { icon: '🏥', title: '健康', description: '身體狀況、養生保健' },
    general: { icon: '🌟', title: '運勢(綜合)', description: '整體運勢走向' },
    relationship: { icon: '👥', title: '人際', description: '人際關係、合作夥伴' },
    family: { icon: '🏠', title: '家庭', description: '家人關係、家庭和諧' },
    other: { icon: '❓', title: '其他', description: '自訂問題' }
  };

  const LOADING_TIPS = [
    '八字命盤是根據出生時間的天干地支組合推算，能反映個人的五行屬性與命運走向...',
    '梅花易數源自北宋邵雍所創，以數起卦，能預測事物吉凶與發展趨勢...',
    '塔羅牌起源於歐洲，透過牌陣解讀潛意識，提供心靈指引與建議...',
    '紫微斗數被譽為「天下第一神數」，綜合星曜位置推算人生格局...',
    '姓名學結合五行與筆畫數理，分析姓名對運勢的影響...'
  ];

  // ============================================
  // Wizard 類別定義
  // ============================================
  class WizardController {
    constructor(options = {}) {
      this.currentStep = WIZARD_STEPS.WELCOME;
      this.completedSteps = new Set();
      this.formData = {
        name: '',
        gender: '',
        birthDate: '',
        birthTime: '',
        birthCountry: '',
        birthCity: '',
        longitude: '',
        latitude: '',
        useTrueSolarTime: false,
        questionType: '',
        question: ''
      };
      this.validationErrors = {};
      this.onStepChange = options.onStepChange || null;
      this.onComplete = options.onComplete || null;

      this.init();
    }

    init() {
      console.log('[Wizard] 初始化...');
      this.bindEvents();
      this.renderCurrentStep();
    }

    // ============================================
    // 事件綁定
    // ============================================
    bindEvents() {
      // 監聽所有「下一步」按鈕
      document.addEventListener('click', (e) => {
        if (e.target.closest('[data-wizard-next]')) {
          e.preventDefault();
          this.handleNext();
        }

        if (e.target.closest('[data-wizard-prev]')) {
          e.preventDefault();
          this.handlePrev();
        }

        if (e.target.closest('[data-wizard-goto]')) {
          e.preventDefault();
          const step = parseInt(e.target.closest('[data-wizard-goto]').dataset.wizardGoto, 10);
          this.goToStep(step);
        }
      });

      // 監聽表單輸入變化
      document.addEventListener('input', (e) => {
        if (e.target.closest('[data-wizard-field]')) {
          const fieldName = e.target.dataset.wizardField || e.target.name || e.target.id;
          this.updateFormData(fieldName, e.target.value);
          this.clearFieldError(fieldName);
        }
      });

      // 監聽單選按鈕
      document.addEventListener('change', (e) => {
        if (e.target.type === 'radio' && e.target.closest('[data-wizard-field]')) {
          const fieldName = e.target.name;
          this.updateFormData(fieldName, e.target.value);
          this.clearFieldError(fieldName);
        }
      });
    }

    // ============================================
    // 步驟導航
    // ============================================
    handleNext() {
      if (this.validateCurrentStep()) {
        this.completedSteps.add(this.currentStep);
        this.currentStep++;
        this.renderCurrentStep();
        this.scrollToTop();
      }
    }

    handlePrev() {
      if (this.currentStep > WIZARD_STEPS.WELCOME) {
        this.currentStep--;
        this.renderCurrentStep();
        this.scrollToTop();
      }
    }

    goToStep(step) {
      if (step >= 0 && step < STEP_NAMES.length) {
        this.currentStep = step;
        this.renderCurrentStep();
        this.scrollToTop();
      }
    }

    scrollToTop() {
      const container = document.getElementById('page-scroll') || window;
      if (container.scrollTo) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    // ============================================
    // 表單資料管理
    // ============================================
    updateFormData(field, value) {
      this.formData[field] = value;
      console.log('[Wizard] 更新資料:', field, '=', value);
    }

    clearFieldError(field) {
      if (this.validationErrors[field]) {
        delete this.validationErrors[field];
        this.updateFieldUI(field, false);
      }
    }

    updateFieldUI(field, hasError) {
      const fieldElement = document.querySelector(`[data-wizard-field="${field}"], [name="${field}"], #${field}`);
      if (fieldElement) {
        const formField = fieldElement.closest('.form-field');
        if (formField) {
          if (hasError) {
            formField.classList.add('form-field--error');
          } else {
            formField.classList.remove('form-field--error');
          }
        }
      }
    }

    // ============================================
    // 驗證邏輯
    // ============================================
    validateCurrentStep() {
      this.validationErrors = {};

      switch (this.currentStep) {
        case WIZARD_STEPS.WELCOME:
          return true;

        case WIZARD_STEPS.BASIC_INFO:
          return this.validateBasicInfo();

        case WIZARD_STEPS.BIRTH_INFO:
          return this.validateBirthInfo();

        case WIZARD_STEPS.QUESTION:
          return this.validateQuestion();

        case WIZARD_STEPS.CONFIRM:
          return true;

        default:
          return true;
      }
    }

    validateBasicInfo() {
      let isValid = true;

      // 驗證姓名
      if (!this.formData.name || this.formData.name.trim() === '') {
        this.validationErrors.name = '請輸入姓名';
        this.updateFieldUI('name', true);
        isValid = false;
      } else if (!/^[\u4e00-\u9fa5]{2,10}$/.test(this.formData.name.trim())) {
        this.validationErrors.name = '請輸入2-10個中文字';
        this.updateFieldUI('name', true);
        isValid = false;
      }

      // 驗證性別
      if (!this.formData.gender) {
        this.validationErrors.gender = '請選擇性別';
        this.showAlert('請選擇性別', 'warning');
        isValid = false;
      }

      return isValid;
    }

    validateBirthInfo() {
      let isValid = true;

      // 驗證出生日期
      if (!this.formData.birthDate) {
        this.validationErrors.birthDate = '請選擇出生日期';
        this.updateFieldUI('birth-date', true);
        isValid = false;
      }

      // 驗證出生地
      if (!this.formData.birthCountry) {
        this.validationErrors.birthCountry = '請選擇出生國家/地區';
        this.updateFieldUI('birth-country', true);
        isValid = false;
      }

      if (!this.formData.birthCity) {
        this.validationErrors.birthCity = '請選擇出生城市';
        this.updateFieldUI('birth-city', true);
        isValid = false;
      }

      return isValid;
    }

    validateQuestion() {
      let isValid = true;

      // 驗證問題類型
      if (!this.formData.questionType) {
        this.validationErrors.questionType = '請選擇問題類型';
        this.showAlert('請選擇問題類型', 'warning');
        isValid = false;
      }

      // 驗證問題內容
      if (!this.formData.question || this.formData.question.trim() === '') {
        this.validationErrors.question = '請輸入諮詢問題';
        this.updateFieldUI('question', true);
        isValid = false;
      } else if (this.formData.question.trim().length < 5) {
        this.validationErrors.question = '問題至少需要5個字';
        this.updateFieldUI('question', true);
        isValid = false;
      }

      return isValid;
    }

    // ============================================
    // UI 渲染
    // ============================================
    renderCurrentStep() {
      this.updateProgressBar();
      this.updateStepContent();
      this.updateNavigationButtons();

      if (this.onStepChange) {
        this.onStepChange(this.currentStep, STEP_NAMES[this.currentStep]);
      }

      // 特殊步驟處理
      if (this.currentStep === WIZARD_STEPS.CALCULATING) {
        this.startCalculating();
      }
    }

    updateProgressBar() {
      const totalSteps = STEP_NAMES.length;
      const progress = ((this.currentStep + 1) / totalSteps) * 100;

      const stepNumber = document.querySelector('.wizard__step-number');
      if (stepNumber) {
        stepNumber.textContent = `步驟 ${this.currentStep + 1} / ${totalSteps}`;
      }

      const progressFill = document.querySelector('.wizard__progress-fill');
      if (progressFill) {
        progressFill.style.width = `${progress}%`;
      }

      // 更新 Stepper 樣式
      document.querySelectorAll('.stepper__step').forEach((step, index) => {
        step.classList.remove('stepper__step--active', 'stepper__step--completed');

        if (index === this.currentStep) {
          step.classList.add('stepper__step--active');
        } else if (index < this.currentStep) {
          step.classList.add('stepper__step--completed');
        }
      });

      document.querySelectorAll('.stepper__line').forEach((line, index) => {
        line.classList.remove('stepper__line--active');
        if (index < this.currentStep) {
          line.classList.add('stepper__line--active');
        }
      });
    }

    updateStepContent() {
      // 隱藏所有步驟內容
      document.querySelectorAll('[data-wizard-step]').forEach(el => {
        el.style.display = 'none';
        el.setAttribute('aria-hidden', 'true');
      });

      // 顯示當前步驟
      const currentStepEl = document.querySelector(`[data-wizard-step="${this.currentStep}"]`);
      if (currentStepEl) {
        currentStepEl.style.display = 'block';
        currentStepEl.setAttribute('aria-hidden', 'false');

        // 自動聚焦第一個輸入框
        setTimeout(() => {
          const firstInput = currentStepEl.querySelector('input:not([type="hidden"]):not([type="radio"]), select, textarea');
          if (firstInput && !firstInput.disabled) {
            firstInput.focus();
          }
        }, 300);
      }
    }

    updateNavigationButtons() {
      const backBtn = document.querySelector('.wizard__back');
      const prevBtn = document.querySelector('[data-wizard-prev]');

      if (backBtn) {
        backBtn.disabled = this.currentStep === WIZARD_STEPS.WELCOME;
      }

      if (prevBtn) {
        prevBtn.style.display = this.currentStep === WIZARD_STEPS.WELCOME ? 'none' : 'inline-flex';
      }
    }

    // ============================================
    // 特殊步驟處理
    // ============================================
    startCalculating() {
      let tipIndex = 0;
      const hintElement = document.querySelector('.loading-screen__hint');

      // 輪播提示文字
      const tipInterval = setInterval(() => {
        if (hintElement) {
          tipIndex = (tipIndex + 1) % LOADING_TIPS.length;
          hintElement.style.opacity = '0';
          setTimeout(() => {
            hintElement.textContent = LOADING_TIPS[tipIndex];
            hintElement.style.opacity = '1';
          }, 300);
        }
      }, 3000);

      // 模擬計算(實際會觸發原系統的八字計算)
      setTimeout(() => {
        clearInterval(tipInterval);
        this.triggerBaziCalculation();
      }, 2000);
    }

    triggerBaziCalculation() {
      console.log('[Wizard] 觸發八字計算...');

      // 觸發原系統的計算流程
      if (window.BaziSystem && typeof window.BaziSystem.calculateBazi === 'function') {
        window.BaziSystem.calculateBazi(this.formData);
      }

      // 自動進入下一步
      this.handleNext();
    }

    // ============================================
    // 工具函數
    // ============================================
    showAlert(message, type = 'info') {
      const alertContainer = document.getElementById('wizard-alerts');
      if (!alertContainer) return;

      const icons = {
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle'
      };

      const alert = document.createElement('div');
      alert.className = `alert alert--${type}`;
      alert.innerHTML = `
        <i class="fas ${icons[type]} alert__icon"></i>
        <div class="alert__content">
          <div class="alert__message">${message}</div>
        </div>
      `;

      alertContainer.appendChild(alert);

      setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
      }, 5000);
    }

    getFormData() {
      return { ...this.formData };
    }

    getProgress() {
      return {
        current: this.currentStep,
        total: STEP_NAMES.length,
        percentage: ((this.currentStep + 1) / STEP_NAMES.length) * 100,
        completed: Array.from(this.completedSteps)
      };
    }
  }

  // ============================================
  // 全域暴露
  // ============================================
  window.WizardController = WizardController;
  window.WIZARD_STEPS = WIZARD_STEPS;
  window.QUESTION_TYPES = QUESTION_TYPES;

})(window);
