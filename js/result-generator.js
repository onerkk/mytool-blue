[file name]: result-generator.js
[file content begin]
/**
 * 靜月之光 - 結果頁面生成器 v1.0
 * 負責整合八字、梅花易數、塔羅牌、姓名學分析結果
 */

class ResultGenerator {
    constructor() {
        this.results = {
            userData: null,
            bazi: null,
            meihua: null,
            tarot: null,
            nameology: null
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadStoredData();
    }
    
    // 綁定事件
    bindEvents() {
        // 綁定生成報告按鈕
        const generateBtn = document.getElementById('generate-report');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateFullReport());
        }
        
        // 綁定重新開始按鈕
        const restartBtn = document.getElementById('start-over');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartSystem());
        }
        
        // 綁定跳過塔羅牌按鈕
        const skipTarotBtn = document.getElementById('skip-tarot');
        if (skipTarotBtn) {
            skipTarotBtn.addEventListener('click', () => this.skipToResult());
        }
        
        // 綁定維度標籤頁
        this.bindDimensionTabs();
        
        // 綁定進度指示器更新
        this.updateProgress();
    }
    
    // 載入儲存的數據
    loadStoredData() {
        try {
            // 從本地儲存載入數據
            const storedData = localStorage.getItem('jingyue-analysis-data');
            if (storedData) {
                this.results = JSON.parse(storedData);
                console.log('載入儲存的分析數據');
            }
        } catch (e) {
            console.warn('無法載入儲存的數據:', e);
        }
        
        // 如果沒有儲存數據，從當前表單獲取
        if (!this.results.userData) {
            this.extractUserDataFromForm();
        }
    }
    
    // 從表單提取用戶數據
    extractUserDataFromForm() {
        try {
            const name = document.getElementById('name')?.value || '';
            const gender = document.querySelector('input[name="gender"]:checked')?.value || '';
            const birthDate = document.getElementById('birth-date')?.value || '';
            const birthTime = document.getElementById('birth-time')?.value || '';
            const question = document.getElementById('question')?.value || '';
            
            this.results.userData = {
                name,
                gender,
                birthDate,
                birthTime,
                question,
                timestamp: new Date().toISOString()
            };
            
            // 儲存到本地
            this.saveToLocalStorage();
        } catch (e) {
            console.error('提取用戶數據失敗:', e);
        }
    }
    
    // 儲存到本地儲存
    saveToLocalStorage() {
        try {
            localStorage.setItem('jingyue-analysis-data', JSON.stringify(this.results));
        } catch (e) {
            console.warn('本地儲存失敗:', e);
        }
    }
    
    // 綁定維度標籤頁
    bindDimensionTabs() {
        const tabs = document.querySelectorAll('.dimension-tab');
        const panes = document.querySelectorAll('.dimension-pane');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const dimension = e.currentTarget.dataset.dimension;
                
                // 移除所有active類
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                
                // 添加active類到當前選項
                e.currentTarget.classList.add('active');
                document.getElementById(`${dimension}-pane`).classList.add('active');
                
                // 姓名學：若有 main 流程的 nameology，一律由 main 重新渲染，確保網頁/手機版同步
                if (dimension === 'name' && window.fortuneSystem && window.fortuneSystem.analysisResults && window.fortuneSystem.analysisResults.nameology) {
                    window.fortuneSystem.displayNameResult();
                    return;
                }
                // 如果是第一次點擊，生成該維度的結果
                if (!this.results[dimension]) {
                    this.generateDimensionResult(dimension);
                }
            });
        });
    }
    
    // 生成完整分析報告
    generateFullAnalysis() {
        console.log('開始生成完整分析報告');
        
        // 確保有用戶數據
        if (!this.results.userData) {
            this.extractUserDataFromForm();
        }
        
        // 顯示問題
        this.displayQuestion();
        
        // 生成各維度結果（姓名學：若有 main 流程的 nameology 則由 main 渲染，保持網頁/手機版一致）
        this.generateDimensionResult('bazi');
        this.generateDimensionResult('meihua');
        this.generateDimensionResult('tarot');
        if (window.fortuneSystem && window.fortuneSystem.analysisResults && window.fortuneSystem.analysisResults.nameology) {
            window.fortuneSystem.displayNameResult();
        } else {
            this.generateDimensionResult('name');
        }
        this.generateDimensionResult('cross');
        
        // 生成綜合結論
        this.generateFinalConclusion();
        
        
        // === v11 Store Promotion (Shopee/MyShip) ===
        this.generateStorePromotion();
        // 更新進度指示器
        this.updateProgress(true);
        
        console.log('完整分析報告生成完成');
    }
    
    // 顯示問題
    displayQuestion() {
        const questionDisplay = document.getElementById('question-display');
        const directAnswer = document.getElementById('direct-answer');
        
        if (!questionDisplay || !directAnswer) return;
        
        const question = this.results.userData?.question || '沒有提供問題';
        const name = this.results.userData?.name || '用戶';
        
        questionDisplay.innerHTML = `
            <div class="question-card">
                <div class="question-header">
                    <i class="fas fa-user-circle"></i>
                    <span>${name} 的諮詢問題</span>
                </div>
                <div class="question-text">
                    <p>"${question}"</p>
                </div>
                <div class="question-meta">
                    <small><i class="far fa-clock"></i> 諮詢時間: ${new Date().toLocaleString('zh-TW')}</small>
                </div>
            </div>
        `;
        
        // 簡單的直接回答（模擬）
        const answers = [
            "根據命理分析，這件事情的發展與您的個人命格有密切關係。",
            "從卦象顯示，此事需要耐心等待時機成熟。",
            "塔羅牌建議您採取積極行動，但同時保持謹慎。",
            "綜合分析顯示，這是一個轉變的機會，需要您主動把握。",
            "五行平衡分析建議您加強與他人的溝通合作。"
        ];
        
        directAnswer.textContent = answers[Math.floor(Math.random() * answers.length)];
    }
    
    // 生成維度結果
    generateDimensionResult(dimension) {
        console.log(`生成 ${dimension} 維度結果`);
        
        switch(dimension) {
            case 'bazi':
                this.generateBaziResult();
                break;
            case 'meihua':
                this.generateMeihuaResult();
                break;
            case 'tarot':
                this.generateTarotResult();
                break;
            case 'name':
                if (window.fortuneSystem && window.fortuneSystem.analysisResults && window.fortuneSystem.analysisResults.nameology) {
                    window.fortuneSystem.displayNameResult();
                } else {
                    this.generateNameologyResult();
                }
                break;
            case 'cross':
                this.generateCrossValidation();
                break;
        }
    }
    
    // 生成八字結果
    generateBaziResult() {
        const baziPane = document.getElementById('bazi-result');
        if (!baziPane) return;
        
        // 檢查是否有八字數據
        if (!this.results.bazi && window.BaziCalculator) {
            try {
                const calculator = new window.BaziCalculator();
                const birthDate = this.results.userData?.birthDate || '2000-01-01';
                const birthTime = this.results.userData?.birthTime || '12:00';
                
                this.results.bazi = calculator.calculateBazi(birthDate, birthTime);
                this.saveToLocalStorage();
            } catch (e) {
                console.error('八字計算失敗:', e);
            }
        }
        
        const baziData = this.results.bazi || {
            pillars: {
                year: { heavenly: '甲', earthly: '子' },
                month: { heavenly: '乙', earthly: '丑' },
                day: { heavenly: '丙', earthly: '寅' },
                hour: { heavenly: '丁', earthly: '卯' }
            },
            dayMaster: '丙火',
            wuxing: { 木: 2, 火: 2, 土: 2, 金: 1, 水: 1 },
            strength: '身強',
            favorableElements: ['水', '金'],
            unfavorableElements: ['火', '木']
        };
        
        baziPane.innerHTML = `
            <div class="dimension-header">
                <h4><i class="fas fa-calendar-alt"></i> 八字命理分析</h4>
                <span class="dimension-badge">${baziData.strength || '身強'}</span>
            </div>
            
            <div class="dimension-body">
                <div class="bazi-grid">
                    <div class="bazi-pillar">
                        <div class="pillar-label">年柱</div>
                        <div class="pillar-content">
                            <span class="heavenly">${baziData.pillars?.year?.heavenly || '甲'}</span>
                            <span class="earthly">${baziData.pillars?.year?.earthly || '子'}</span>
                        </div>
                    </div>
                    <div class="bazi-pillar">
                        <div class="pillar-label">月柱</div>
                        <div class="pillar-content">
                            <span class="heavenly">${baziData.pillars?.month?.heavenly || '乙'}</span>
                            <span class="earthly">${baziData.pillars?.month?.earthly || '丑'}</span>
                        </div>
                    </div>
                    <div class="bazi-pillar">
                        <div class="pillar-label">日柱</div>
                        <div class="pillar-content">
                            <span class="heavenly">${baziData.pillars?.day?.heavenly || '丙'}</span>
                            <span class="earthly">${baziData.pillars?.day?.earthly || '寅'}</span>
                        </div>
                    </div>
                    <div class="bazi-pillar">
                        <div class="pillar-label">時柱</div>
                        <div class="pillar-content">
                            <span class="heavenly">${baziData.pillars?.hour?.heavenly || '丁'}</span>
                            <span class="earthly">${baziData.pillars?.hour?.earthly || '卯'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-details">
                    <div class="detail-row">
                        <div class="detail-item">
                            <span class="detail-label">日主</span>
                            <span class="detail-value ${baziData.dayMaster?.includes('火') ? 'fire' : baziData.dayMaster?.includes('水') ? 'water' : ''}">
                                ${baziData.dayMaster || '丙火'}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">五行分佈</span>
                            <span class="detail-value">
                                ${this.formatWuxingDistribution(baziData.wuxing)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="detail-row">
                        <div class="detail-item">
                            <span class="detail-label">身強身弱</span>
                            <span class="detail-value ${baziData.strength === '身強' ? 'strong' : 'weak'}">
                                ${baziData.strength || '身強'}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">喜用神</span>
                            <span class="detail-value favorable">
                                ${(baziData.favorableElements || ['水', '金']).join('、')}
                            </span>
                        </div>
                    </div>
                    
                    <div class="insight-section">
                        <h5><i class="fas fa-lightbulb"></i> 命理啟示</h5>
                        <p>${this.getBaziInsight(baziData)}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 生成梅花易數結果
    generateMeihuaResult() {
        const meihuaPane = document.getElementById('meihua-result');
        if (!meihuaPane) return;
        
        // 檢查是否有梅花易數數據
        if (!this.results.meihua && window.PlumBlossomCalculator) {
            try {
                const calculator = new window.PlumBlossomCalculator();
                const question = this.results.userData?.question || '運勢';
                
                this.results.meihua = calculator.divine(question, 'character', { text: question });
                this.saveToLocalStorage();
            } catch (e) {
                console.error('梅花易數計算失敗:', e);
            }
        }
        
        const meihuaData = this.results.meihua || {
            originalHexagram: { name: '乾為天', nature: '剛健', luck: '吉' },
            mutualHexagram: { name: '天風姤', nature: '相遇' },
            changedHexagram: { name: '風天小畜', nature: '積蓄' },
            movingLine: 3,
            bodyUse: { type: '用生體', meaning: '大吉' }
        };
        
        meihuaPane.innerHTML = `
            <div class="dimension-header">
                <h4><i class="fas fa-yin-yang"></i> 梅花易數卦象</h4>
                <span class="dimension-badge ${meihuaData.bodyUse?.type === '用生體' ? 'auspicious' : ''}">
                    ${meihuaData.bodyUse?.type || '體用比和'}
                </span>
            </div>
            
            <div class="dimension-body">
                <div class="hexagram-grid">
                    <div class="hexagram-card">
                        <div class="hexagram-header">
                            <i class="fas fa-circle"></i> 本卦
                        </div>
                        <div class="hexagram-name">
                            ${meihuaData.originalHexagram?.name || '乾為天'}
                        </div>
                        <div class="hexagram-nature">
                            ${meihuaData.originalHexagram?.nature || '剛健中正'}
                        </div>
                        <div class="hexagram-luck ${meihuaData.originalHexagram?.luck === '吉' ? 'good' : ''}">
                            ${meihuaData.originalHexagram?.luck || '吉'}
                        </div>
                    </div>
                    
                    <div class="hexagram-card">
                        <div class="hexagram-header">
                            <i class="fas fa-exchange-alt"></i> 互卦
                        </div>
                        <div class="hexagram-name">
                            ${meihuaData.mutualHexagram?.name || '天風姤'}
                        </div>
                        <div class="hexagram-nature">
                            ${meihuaData.mutualHexagram?.nature || '相遇過程'}
                        </div>
                    </div>
                    
                    <div class="hexagram-card">
                        <div class="hexagram-header">
                            <i class="fas fa-redo"></i> 變卦
                        </div>
                        <div class="hexagram-name">
                            ${meihuaData.changedHexagram?.name || '風天小畜'}
                        </div>
                        <div class="hexagram-nature">
                            ${meihuaData.changedHexagram?.nature || '積蓄力量'}
                        </div>
                    </div>
                </div>
                
                <div class="analysis-details">
                    <div class="detail-row">
                        <div class="detail-item">
                            <span class="detail-label">動爻位置</span>
                            <span class="detail-value">
                                第${meihuaData.movingLine || 3}爻
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">體用關係</span>
                            <span class="detail-value ${meihuaData.bodyUse?.type === '用生體' ? 'favorable' : ''}">
                                ${meihuaData.bodyUse?.type || '體用比和'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="detail-row">
                        <div class="detail-item full-width">
                            <span class="detail-label">關係解讀</span>
                            <span class="detail-value">
                                ${meihuaData.bodyUse?.meaning || '體卦與用卦比和，代表事情發展順利。'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="insight-section">
                        <h5><i class="fas fa-brain"></i> 卦象啟示</h5>
                        <p>${this.getMeihuaInsight(meihuaData)}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 生成塔羅牌結果
    generateTarotResult() {
        const tarotPane = document.getElementById('tarot-result');
        if (!tarotPane) return;
        
        // 檢查塔羅牌數據
        const tarotData = this.results.tarot || {
            cards: [],
            spread: '凱爾特十字',
            overallTheme: '轉變與成長'
        };
        
        // 如果沒有塔羅牌數據，模擬一些
        if (!tarotData.cards || tarotData.cards.length === 0) {
            tarotData.cards = this.generateSampleTarotCards();
        }
        
        tarotPane.innerHTML = `
            <div class="dimension-header">
                <h4><i class="fas fa-cards"></i> 塔羅牌陣分析</h4>
                <span class="dimension-badge">${tarotData.spread || '凱爾特十字'}</span>
            </div>
            
            <div class="dimension-body">
                <div class="tarot-summary">
                    <div class="summary-card">
                        <div class="summary-header">
                            <i class="fas fa-cross"></i> 牌陣主題
                        </div>
                        <div class="summary-content">
                            ${tarotData.overallTheme || '轉變與成長'}
                        </div>
                    </div>
                </div>
                
                <div class="tarot-cards-grid">
                    ${tarotData.cards.slice(0, 5).map((card, index) => `
                        <div class="tarot-card-mini">
                            <div class="card-mini-header">
                                <span class="position-number">${index + 1}</span>
                                <span class="position-name">${card.position || '未知位置'}</span>
                            </div>
                            <div class="card-mini-img">
                                <img src="${this.getTarotCardImage(card)}" alt="${card.name || '塔羅牌'}" loading="lazy" onerror="this.src='images/back.jpg'">
                            </div>
                            <div class="card-mini-name">
                                ${card.name || '未知牌'}
                            </div>
                            <div class="card-mini-meaning">
                                ${card.upright?.substring(0, 30) || card.meaning?.substring(0, 30) || '...'}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="insight-section">
                    <h5><i class="fas fa-eye"></i> 牌陣整體解讀</h5>
                    <p>${this.getTarotInsight(tarotData)}</p>
                </div>
            </div>
        `;
    }
    
    // 生成姓名學結果
    generateNameologyResult() {
        const namePane = document.getElementById('name-result');
        if (!namePane) return;
        
        // 檢查是否有姓名學數據
        if (!this.results.nameology && window.NameAnalysisSystem) {
            try {
                const name = this.results.userData?.name || '';
                const birthYear = this.results.userData?.birthDate?.split('-')[0] || 2000;
                const gender = this.results.userData?.gender || 'male';
                
                if (name) {
                    const calculator = new window.NameAnalysisSystem();
                    this.results.nameology = calculator.analyzeFullName(name, birthYear, gender);
                    this.saveToLocalStorage();
                }
            } catch (e) {
                console.error('姓名學計算失敗:', e);
            }
        }
        
        const nameData = this.results.nameology || {
            fivePatterns: {
                heaven: 10,
                personality: 15,
                earth: 20,
                external: 5,
                total: 45
            },
            threeTalents: {
                combination: '木火土',
                luck: '大吉'
            },
            overallScore: 75
        };
        
        namePane.innerHTML = `
            <div class="dimension-header">
                <h4><i class="fas fa-signature"></i> 姓名學分析</h4>
                <span class="dimension-badge ${nameData.overallScore >= 80 ? 'auspicious' : nameData.overallScore >= 60 ? 'good' : ''}">
                    ${nameData.overallScore || 75}分
                </span>
            </div>
            
            <div class="dimension-body">
                <div class="nameology-grid">
                    <div class="pattern-card">
                        <div class="pattern-label">天格</div>
                        <div class="pattern-number">${nameData.fivePatterns?.heaven || 10}</div>
                        <div class="pattern-luck ${this.getNumberLuck(nameData.fivePatterns?.heaven || 10)}">
                            ${this.getNumberLuck(nameData.fivePatterns?.heaven || 10)}
                        </div>
                    </div>
                    
                    <div class="pattern-card">
                        <div class="pattern-label">人格</div>
                        <div class="pattern-number">${nameData.fivePatterns?.personality || 15}</div>
                        <div class="pattern-luck ${this.getNumberLuck(nameData.fivePatterns?.personality || 15)}">
                            ${this.getNumberLuck(nameData.fivePatterns?.personality || 15)}
                        </div>
                    </div>
                    
                    <div class="pattern-card">
                        <div class="pattern-label">地格</div>
                        <div class="pattern-number">${nameData.fivePatterns?.earth || 20}</div>
                        <div class="pattern-luck ${this.getNumberLuck(nameData.fivePatterns?.earth || 20)}">
                            ${this.getNumberLuck(nameData.fivePatterns?.earth || 20)}
                        </div>
                    </div>
                    
                    <div class="pattern-card">
                        <div class="pattern-label">總格</div>
                        <div class="pattern-number">${nameData.fivePatterns?.total || 45}</div>
                        <div class="pattern-luck ${this.getNumberLuck(nameData.fivePatterns?.total || 45)}">
                            ${this.getNumberLuck(nameData.fivePatterns?.total || 45)}
                        </div>
                    </div>
                </div>
                
                <div class="analysis-details">
                    <div class="detail-row">
                        <div class="detail-item">
                            <span class="detail-label">三才配置</span>
                            <span class="detail-value ${nameData.threeTalents?.luck === '大吉' ? 'favorable' : ''}">
                                ${nameData.threeTalents?.combination || '木火土'} (${nameData.threeTalents?.luck || '吉'})
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">姓名分數</span>
                            <span class="detail-value">
                                ${nameData.overallScore || 75}/100
                            </span>
                        </div>
                    </div>
                    
                    <div class="insight-section">
                        <h5><i class="fas fa-chart-line"></i> 姓名能量分析</h5>
                        <p>${this.getNameologyInsight(nameData)}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 生成交叉驗證
    generateCrossValidation() {
        const crossPane = document.getElementById('cross-result');
        if (!crossPane) return;
        
        crossPane.innerHTML = `
            <div class="dimension-header">
                <h4><i class="fas fa-check-double"></i> 多維度交叉驗證</h4>
                <span class="dimension-badge">一致性分析</span>
            </div>
            
            <div class="dimension-body">
                <div class="cross-validation-grid">
                    <div class="validation-card">
                        <div class="validation-header">
                            <i class="fas fa-shield-alt"></i> 八字驗證
                        </div>
                        <div class="validation-content">
                            <p>八字顯示: <strong>${this.results.bazi?.strength || '身強'}</strong></p>
                            <p>喜用神: <span class="favorable">${(this.results.bazi?.favorableElements || ['水', '金']).join('、')}</span></p>
                        </div>
                    </div>
                    
                    <div class="validation-card">
                        <div class="validation-header">
                            <i class="fas fa-yin-yang"></i> 梅花易數
                        </div>
                        <div class="validation-content">
                            <p>卦象: <strong>${this.results.meihua?.originalHexagram?.name || '乾為天'}</strong></p>
                            <p>吉凶: <span class="${this.results.meihua?.originalHexagram?.luck === '吉' ? 'good' : ''}">
                                ${this.results.meihua?.originalHexagram?.luck || '吉'}
                            </span></p>
                        </div>
                    </div>
                    
                    <div class="validation-card">
                        <div class="validation-header">
                            <i class="fas fa-cards"></i> 塔羅牌
                        </div>
                        <div class="validation-content">
                            <p>主題: <strong>${this.results.tarot?.overallTheme || '轉變'}</strong></p>
                            <p>牌數: ${this.results.tarot?.cards?.length || 0}張</p>
                        </div>
                    </div>
                    
                    <div class="validation-card">
                        <div class="validation-header">
                            <i class="fas fa-signature"></i> 姓名學
                        </div>
                        <div class="validation-content">
                            <p>評分: <strong>${this.results.nameology?.overallScore || 75}/100</strong></p>
                            <p>三才: <span class="${this.results.nameology?.threeTalents?.luck === '大吉' ? 'favorable' : ''}">
                                ${this.results.nameology?.threeTalents?.combination || '木火土'}
                            </span></p>
                        </div>
                    </div>
                </div>
                
                <div class="consistency-analysis">
                    <h5><i class="fas fa-balance-scale"></i> 一致性分析結果</h5>
                    <div class="consistency-meter">
                        <div class="meter-labels">
                            <span>低</span>
                            <span>中</span>
                            <span>高</span>
                        </div>
                        <div class="meter-bar">
                            <div class="meter-fill" style="width: ${this.calculateConsistency()}%"></div>
                        </div>
                        <div class="meter-value">
                            一致性: ${this.calculateConsistency()}%
                        </div>
                    </div>
                    
                    <div class="consistency-insights">
                        <p>${this.getConsistencyInsight()}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 生成最終結論
    generateFinalConclusion() {
        const conclusionContent = document.getElementById('conclusion-content');
        const planItems = document.getElementById('plan-items');
        const timingItems = document.getElementById('timing-items');
        const poeticSummary = document.getElementById('poetic-summary');
        const finalAdvice = document.getElementById('final-advice');
        
        if (!conclusionContent || !planItems || !timingItems || !poeticSummary || !finalAdvice) return;
        
        // 生成綜合結論
        conclusionContent.innerHTML = `
            <div class="conclusion-card">
                <div class="conclusion-header">
                    <i class="fas fa-star"></i> 綜合分析結論
                </div>
                <div class="conclusion-body">
                    <p>${this.getOverallConclusion()}</p>
                    
                    <div class="conclusion-stats">
                        <div class="stat-item">
                            <span class="stat-label">整體吉凶</span>
                            <span class="stat-value ${this.calculateOverallLuck() >= 70 ? 'good' : this.calculateOverallLuck() >= 50 ? 'medium' : 'poor'}">
                                ${this.calculateOverallLuck()} / 100
                            </span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">建議強度</span>
                            <span class="stat-value">${this.calculateAdviceStrength()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 更新可能性評估
        this.updateProbabilityMeter();
        
        // 生成行動計劃
        const plans = this.generateActionPlan();
        planItems.innerHTML = plans.map(plan => `
            <div class="plan-item">
                <div class="plan-checkbox">
                    <i class="far fa-circle"></i>
                </div>
                <div class="plan-text">${plan}</div>
            </div>
        `).join('');
        
        // 生成時機建議
        const timings = this.generateTimingSuggestions();
        timingItems.innerHTML = timings.map(timing => `
            <div class="timing-item">
                <div class="timing-icon">
                    <i class="fas ${timing.icon || 'fa-calendar-day'}"></i>
                </div>
                <div class="timing-content">
                    <div class="timing-title">${timing.title}</div>
                    <div class="timing-desc">${timing.description}</div>
                </div>
            </div>
        `).join('');
        
        // 生成詩意總結
        poeticSummary.innerHTML = `
            <div class="poetic-card">
                <div class="poetic-title">
                    <i class="fas fa-moon"></i> 靜月詩籤
                </div>
                <div class="poetic-content">
                    <p>"${this.generatePoeticSummary()}"</p>
                </div>
                <div class="poetic-author">
                    — 靜月之光
                </div>
            </div>
        `;
        
        // 生成最終建議
        finalAdvice.innerHTML = `
            <div class="advice-card">
                <div class="advice-header">
                    <i class="fas fa-hand-holding-heart"></i> 給您的建議
                </div>
                <div class="advice-body">
                    <p>${this.generateFinalAdvice()}</p>
                </div>
            </div>
        `;
    }
    
    // 輔助方法
    formatWuxingDistribution(wuxing) {
        if (!wuxing) return '平衡';
        
        const elements = ['木', '火', '土', '金', '水'];
        return elements.map(e => `${e}:${wuxing[e] || 0}`).join(' ');
    }
    
    getNumberLuck(number) {
        if (!number) return '平';
        
        const luckyNumbers = [1, 3, 5, 6, 8, 11, 13, 15, 16, 21, 23, 24, 29, 31, 32, 33, 35, 37, 39, 41, 45, 47, 48, 52, 57, 61, 63, 65, 67, 68, 73, 75, 77, 78, 81];
        const unluckyNumbers = [2, 4, 9, 10, 12, 14, 19, 20, 22, 26, 27, 28, 34, 36, 42, 43, 44, 46, 49, 50, 51, 53, 54, 56, 59, 60, 62, 64, 66, 69, 70, 71, 72, 74, 76, 79, 80];
        
        if (luckyNumbers.includes(number)) return '吉';
        if (unluckyNumbers.includes(number)) return '凶';
        return '平';
    }
    
    calculateConsistency() {
        // 簡單的一致性計算
        let consistency = 70; // 基礎一致性
        
        // 檢查各系統的吉凶一致性
        const baziLuck = this.results.bazi?.strength === '身強' ? 80 : 50;
        const meihuaLuck = this.results.meihua?.originalHexagram?.luck === '吉' ? 80 : 50;
        const nameologyLuck = this.results.nameology?.overallScore || 75;
        
        // 平均一致性
        consistency = Math.round((baziLuck + meihuaLuck + nameologyLuck) / 3);
        
        return Math.min(100, Math.max(0, consistency));
    }
    
    calculateOverallLuck() {
        const baziScore = this.results.bazi?.strength === '身強' ? 75 : 50;
        const meihuaScore = this.results.meihua?.originalHexagram?.luck === '吉' ? 80 : 60;
        const nameScore = this.results.nameology?.overallScore || 75;
        const tarotScore = 70; // 默認塔羅分數
        
        return Math.round((baziScore + meihuaScore + nameScore + tarotScore) / 4);
    }
    
    calculateAdviceStrength() {
        const luckScore = this.calculateOverallLuck();
        
        if (luckScore >= 80) return '強烈建議行動';
        if (luckScore >= 60) return '建議嘗試';
        if (luckScore >= 40) return '謹慎考慮';
        return '建議等待';
    }
    
    updateProbabilityMeter() {
        const probabilityValue = document.getElementById('overall-probability');
        const meterFill = document.getElementById('meter-fill');
        
        if (!probabilityValue || !meterFill) return;
        
        const probability = this.calculateOverallLuck();
        
        probabilityValue.textContent = `${probability}%`;
        meterFill.style.width = `${probability}%`;
        
        // 根據概率設置顏色
        if (probability >= 70) {
            meterFill.style.backgroundColor = '#4CAF50'; // 綠色
        } else if (probability >= 40) {
            meterFill.style.backgroundColor = '#FFC107'; // 黃色
        } else {
            meterFill.style.backgroundColor = '#F44336'; // 紅色
        }
    }
    
    // 模擬塔羅牌數據
    generateSampleTarotCards() {
        const sampleCards = [
            { name: '魔術師', position: '核心現況', upright: '創造力、行動力、技能', meaning: '新的開始，運用技能創造現實' },
            { name: '女祭司', position: '潛意識', upright: '直覺、神秘、內在智慧', meaning: '傾聽內在聲音，相信直覺' },
            { name: '皇后', position: '環境影響', upright: '豐盛、母性、創造力', meaning: '豐盛的環境，滋養與支持' },
            { name: '戰車', position: '未來發展', upright: '意志力、勝利、前進', meaning: '需要決心和行動力' },
            { name: '星星', position: '希望與恐懼', upright: '希望、靈感、平靜', meaning: '保持希望，靈感將會到來' },
            { name: '世界', position: '最終結果', upright: '完成、整合、成就', meaning: '事情將會圓滿完成' }
        ];
        
        return sampleCards;
    }
    
    // 生成各種啟示和建議
    getBaziInsight(baziData) {
        const insights = [
            '您的命格顯示具有領導才能，適合在專業領域發展。',
            '五行配置平衡，顯示您具有多方面的潛能。',
            '日主強旺，代表您有足夠的能量應對挑戰。',
            '喜用神為水金，建議多接觸相關元素的事物。',
            '命盤顯示您具有創新思維，適合開創性工作。'
        ];
        
        return insights[Math.floor(Math.random() * insights.length)];
    }
    
    getMeihuaInsight(meihuaData) {
        const insights = [
            '卦象顯示事情正在往好的方向發展，但需要耐心。',
            '體用關係和諧，代表內外環境配合良好。',
            '動爻位置顯示關鍵的變化點，需要特別注意。',
            '變卦提示最終結果可能會超出預期。',
            '卦象組合顯示這是一個學習和成長的機會。'
        ];
        
        return insights[Math.floor(Math.random() * insights.length)];
    }
    
    getTarotInsight(tarotData) {
        const insights = [
            '牌陣顯示您正處於轉變期，需要勇氣面對變化。',
            '多數牌卡指向積極方向，顯示整體趨勢良好。',
            '牌陣建議您保持開放態度，接納新的可能性。',
            '某些牌卡提醒您需要注意平衡與和諧。',
            '整體牌陣顯示這是一個實現目標的好時機。'
        ];
        
        return insights[Math.floor(Math.random() * insights.length)];
    }
    
    getNameologyInsight(nameData) {
        const insights = [
            '您的姓名顯示具有良好的人際關係能力。',
            '姓名數理配置有利於事業發展。',
            '三才配置和諧，顯示整體運勢平穩。',
            '姓名能量與您的出生信息配合良好。',
            '姓名分析建議您在溝通表達方面多加發揮。'
        ];
        
        return insights[Math.floor(Math.random() * insights.length)];
    }
    
    getConsistencyInsight() {
        const consistency = this.calculateConsistency();
        
        if (consistency >= 80) {
            return '各系統分析結果高度一致，可信度非常高。建議您可以更有信心地採取行動。';
        } else if (consistency >= 60) {
            return '各系統分析結果基本一致，顯示主要趨勢明確。可以參考綜合建議做出決定。';
        } else if (consistency >= 40) {
            return '各系統分析結果有些分歧，建議多方面考慮，謹慎決定。';
        } else {
            return '分析結果分歧較大，建議您重新審視問題，或等待更合適的時機。';
        }
    }
    
    getOverallConclusion() {
        const conclusions = [
            '綜合分析顯示，您所詢問的事情發展趨勢良好，但需要適當的行動配合。',
            '各系統一致指出這是一個轉變的機會，建議您把握時機，積極行動。',
            '分析結果建議您保持耐心，事情會在合適的時機自然發展。',
            '綜合來看，您當前處於有利位置，但需要避免過度自信。',
            '各維度分析都指向積極方向，顯示這是一個值得投入的時機。'
        ];
        
        return conclusions[Math.floor(Math.random() * conclusions.length)];
    }
    
    generateActionPlan() {
        return [
            '制定明確的短期目標和執行計劃',
            '加強與關鍵人物的溝通與合作',
            '學習相關技能，提升自身能力',
            '保持健康的生活方式，維持良好狀態',
            '定期回顧進展，調整策略'
        ];
    }
    
    generateTimingSuggestions() {
        return [
            { icon: 'fa-sun', title: '最佳行動時機', description: '下個月初，月相轉換時' },
            { icon: 'fa-calendar-check', title: '重要決策時點', description: '未來2-3週內' },
            { icon: 'fa-hourglass-half', title: '需要耐心等待', description: '某些進展可能需要1-2個月' },
            { icon: 'fa-users', title: '合作時機', description: '週末或社交場合較佳' }
        ];
    }
    
    generatePoeticSummary() {
        const summaries = [
            '月明如水照前程，星輝指引方向明。靜待花開時節至，自有佳音報喜聲。',
            '風起雲湧見真章，心定神閒自然強。莫問前程多險阻，自有貴人暗中幫。',
            '靜夜思量明方向，月華如練照心田。順勢而為天地闊，自有福緣在眼前。',
            '雲開月現正當時，心清意定見真知。循序漸進終有果，花開富貴可預期。',
            '星月交輝照夜行，心燈一盞自分明。順應天時地利合，自有佳音伴旅程。'
        ];
        
        return summaries[Math.floor(Math.random() * summaries.length)];
    }
    
    generateFinalAdvice() {
        const advices = [
            '請保持積極心態，但也要有足夠的耐心。命運的轉變往往需要時間，相信自己，也相信過程。',
            '記住，您是自身命運的主要創造者。這些分析只是參考工具，真正的力量在於您的選擇和行動。',
            '無論分析結果如何，請保持開放和靈活的心態。生活總是充滿驚喜，保持彈性能更好地應對變化。',
            '建議您定期回顧自己的目標和進展，適時調整方向。持續學習和成長是最重要的財富。',
            '保持平衡是關鍵。在追求目標的同時，不要忘記照顧好自己的身心靈健康。'
        ];
        
        return advices[Math.floor(Math.random() * advices.length)];
    }
    
    // 更新進度指示器
    updateProgress(isComplete = false) {
        const progressSteps = document.querySelectorAll('.progress-step');
        
        if (isComplete) {
            progressSteps.forEach(step => {
                step.classList.add('active');
            });
        } else {
            // 根據當前活動區域更新
            const activeSection = document.querySelector('.section.active');
            if (!activeSection) return;
            
            const sectionId = activeSection.id;
            let activeStep = 1;
            
            switch(sectionId) {
                case 'input-section': activeStep = 1; break;
                case 'bazi-section': activeStep = 2; break;
                case 'meihua-section': activeStep = 3; break;
                case 'tarot-section': activeStep = 4; break;
                case 'result-section': activeStep = 5; break;
            }
            
            progressSteps.forEach((step, index) => {
                if (index + 1 <= activeStep) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        }
    }
    
    // 生成完整報告（PDF下載）
    generateFullReport() {
        alert('完整報告生成功能開發中...\n\n目前顯示的分析結果已包含所有重要信息。\n您可以使用瀏覽器的「列印」功能保存頁面。');
        
        // 未來可以實現PDF生成
        // window.print(); // 可以調用瀏覽器打印功能
    }
    
    // 重新開始系統
    restartSystem() {
        if (confirm('確定要重新開始嗎？所有當前數據將會清除。')) {
            localStorage.removeItem('jingyue-analysis-data');
            window.location.href = window.location.pathname;
        }
    }
    
    // 跳過塔羅牌直接到結果
    skipToResult() {
        if (confirm('確定要跳過塔羅牌分析嗎？')) {
            // 設置塔羅牌為已跳過狀態
            this.results.tarot = {
                skipped: true,
                cards: [],
                spread: '已跳過',
                overallTheme: '未進行塔羅牌分析'
            };
            
            this.saveToLocalStorage();
            
            // 跳轉到結果頁面
            const resultLink = document.querySelector('.nav-link[href="#result-section"]');
            if (resultLink) {
                resultLink.click();
            }
        }
    }
}

// 導出到全局
if (typeof window !== 'undefined') {
    window.ResultGenerator = ResultGenerator;
    window.generateFullAnalysis = function() {
        if (!window.resultGenerator) {
            window.resultGenerator = new ResultGenerator();
        }
        window.resultGenerator.generateFullAnalysis();
    };
}
[file content end]
    // ==========================================================
    // v11 Store Promotion Module (Shopee/MyShip) - Add-on Only
    // 規則：不改原流程，只在結果頁插入「對症配方」導購卡片
    // ==========================================================
    generateStorePromotion() {
        try {
            const shopeeUrl = 'https://tw.shp.ee/2n5Mo2w';
            const myshipUrl = 'https://myship.7-11.com.tw/seller/profile?id=GM2601091690232';

            // 只在結果頁存在時插入
            const conclusionContent = document.getElementById('conclusion-content');
            const crossPane = document.getElementById('cross-result');
            if (!conclusionContent && !crossPane) return;

            // 避免重複插入
            if (document.getElementById('store-promo-section')) return;

            const q = (this.results.userData?.question || '').toString();
            const { issueTypeLabel, issueTypeKey } = this.inferIssueType(q);
            const elementNeed = this.getElementNeedSummary();

            const categories = [
                { key: '正財', icon: '💼', desc: '穩定收入、正職現金流、長線累積' },
                { key: '偏財', icon: '🎯', desc: '機會財、偏門機運、短期突破' },
                { key: '桃花', icon: '💗', desc: '人緣吸引、關係修復、溝通增溫' },
                { key: '健康', icon: '🛡️', desc: '穩定睡眠、減壓接地、氣場防護' }
            ];

            const preferred = this.rankPromoCategories(issueTypeKey);
            const topCards = preferred.map(k => categories.find(c => c.key === k)).filter(Boolean);

            const promoHTML = `
                <div class="store-promo-section" id="store-promo-section">
                    <div class="store-promo-header">
                        <div class="store-promo-title">你的下一步：對症能量配方</div>
                        <div class="store-promo-sub">
                            <span class="chip chip-primary">問題：${issueTypeLabel}</span>
                            <span class="chip chip-secondary">五行：${elementNeed}</span>
                        </div>
                    </div>

                    <div class="store-cards-grid">
                        ${topCards.map(card => `
                            <div class="store-card" data-cat="${card.key}">
                                <div class="store-card-top">
                                    <div class="store-icon">${card.icon}</div>
                                    <div class="store-card-meta">
                                        <div class="store-card-title">${card.key}</div>
                                        <div class="store-card-desc">${card.desc}</div>
                                    </div>
                                </div>
                                <div class="store-card-tags">
                                    <span class="tag">對應：${issueTypeLabel}</span>
                                    <span class="tag">補強：${elementNeed}</span>
                                </div>
                                <div class="store-card-actions">
                                    <a class="btn-store btn-shopee" href="${shopeeUrl}" target="_blank" rel="noopener">
                                        🛒 去蝦皮
                                    </a>
                                    <a class="btn-store btn-myship" href="${myshipUrl}" target="_blank" rel="noopener">
                                        📦 賣貨便
                                    </a>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="store-promo-footer">
                        <div class="store-note">提示：這是基於你本次「五行＋問題類型」的快速配方入口（少文字、快決策）。</div>
                    </div>
                </div>
            `;

            // 插入位置：綜合結論卡之後（優先），否則放在 cross-result 底部
            if (conclusionContent) {
                conclusionContent.insertAdjacentHTML('beforeend', promoHTML);
            } else if (crossPane) {
                crossPane.insertAdjacentHTML('beforeend', promoHTML);
            }

            // 浮動快捷入口（低干擾）
            this.ensureFloatingStoreButton(shopeeUrl);

        } catch (e) {
            console.warn('Store Promotion 插入失敗:', e);
        }
    }

    inferIssueType(questionText) {
        const q = (questionText || '').toLowerCase();
        // 財（正財/偏財）
        if (/[財錢賺薪工作升遷生意業績訂單投資]/.test(q)) {
            return { issueTypeKey: 'wealth', issueTypeLabel: '財運/事業' };
        }
        // 桃花/感情
        if (/[桃花感情戀愛交往結婚復合曖昧人緣伴侶]/.test(q)) {
            return { issueTypeKey: 'love', issueTypeLabel: '桃花/感情' };
        }
        // 健康
        if (/[健康生病痛睡眠失眠焦慮壓力疲勞精神]/.test(q)) {
            return { issueTypeKey: 'health', issueTypeLabel: '健康/狀態' };
        }
        return { issueTypeKey: 'general', issueTypeLabel: '綜合/未分類' };
    }

    rankPromoCategories(issueTypeKey) {
        // 混合模式：問題類型為主、其餘補位
        if (issueTypeKey === 'wealth') return ['正財', '偏財', '健康', '桃花'];
        if (issueTypeKey === 'love') return ['桃花', '健康', '正財', '偏財'];
        if (issueTypeKey === 'health') return ['健康', '桃花', '正財', '偏財'];
        return ['正財', '桃花', '健康', '偏財'];
    }

    getElementNeedSummary() {
        // 取八字喜用 / 五行缺口（若無則 fallback）
        const b = this.results.bazi || {};
        let els = [];

        if (Array.isArray(b.favorableElements) && b.favorableElements.length) {
            els = b.favorableElements;
        } else if (typeof b.favorableElement === 'string' && b.favorableElement) {
            els = [b.favorableElement];
        } else if (b.elementsScore && typeof b.elementsScore === 'object') {
            try {
                const scores = Object.entries(b.elementsScore)
                    .filter(([k,v]) => typeof v === 'number')
                    .sort((a,b) => a[1]-b[1])
                    .map(x => x[0]);
                els = scores.slice(0, 2);
            } catch(e){}
        }

        if (!els || els.length === 0) els = ['水', '金'];

        // 去重 + 最多2
        const uniq = [];
        els.forEach(x => { if (x && !uniq.includes(x)) uniq.push(x); });
        return uniq.slice(0,2).join(' / ');
    }


    getTarotCardImage(card) {
        // 優先使用 cardId / id / imagePath，否則用 name 推測圖片檔名
        try {
            if (!card) return 'images/back.jpg';
            const id = card.cardId || card.id || card.imageId || '';
            if (id) return `images/${id}.jpg`;
            if (typeof card.image === 'string' && card.image) return card.image;
            if (typeof card.imagePath === 'string' && card.imagePath) return card.imagePath;
            // name 推測（僅做容錯；若不確定就回牌背）
            return 'images/back.jpg';
        } catch(e) {
            return 'images/back.jpg';
        }
    }

    ensureFloatingStoreButton(shopeeUrl) {
        try {
            if (document.getElementById('floating-store-btn')) return;
            const btn = document.createElement('a');
            btn.id = 'floating-store-btn';
            btn.className = 'floating-store-btn';
            btn.href = shopeeUrl;
            btn.target = '_blank';
            btn.rel = 'noopener';
            btn.innerHTML = '🛒 蝦皮賣場';
            document.body.appendChild(btn);
        } catch(e){}
    }
