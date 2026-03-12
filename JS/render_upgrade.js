// ══════════════════════════════════════════════════════════════════════
// 🌙 OFFLINE RENDERING UPGRADE
// 在既有渲染完成後，將頂規升級資料注入各面板
// 不動既有渲染函式，純新增 — 載入順序：所有 JS 之後最後載入
// ══════════════════════════════════════════════════════════════════════

// 共用樣式
var _U={
  card:'background:rgba(255,255,255,.03);border-radius:8px;padding:.6rem .8rem;margin-top:.5rem;border-left:3px solid ',
  title:'font-size:.78rem;font-weight:700;margin-bottom:.3rem;',
  body:'font-size:.82rem;line-height:1.7;color:var(--c-text-dim)',
  tag:'display:inline-block;margin:2px 3px;padding:1px 7px;border-radius:12px;font-size:.7rem;',
  section:'margin-top:.8rem;padding-top:.5rem;border-top:1px solid rgba(255,255,255,.06)',
  dim:'font-size:.75rem;opacity:.6;margin-top:.2rem'
};

// ══ 安全注入器：在目標元素末尾加 HTML ══
function _appendUpgrade(elId, html){
  var el=document.getElementById(elId);
  if(!el || !html) return;
  // 避免重複注入
  if(el.querySelector&&el.querySelector('.upgrade-section')) return;
  var div=document.createElement('div');
  div.className='upgrade-section';
  div.innerHTML=html;
  el.appendChild(div);
}

// ══════════════════════════════════════════════════════════════════════
// 1. 八字升級面板
// ══════════════════════════════════════════════════════════════════════
function renderBaziUpgrade(){
  var b=S.bazi; if(!b) return;
  var html='<div class="divider" style="margin:.8rem 0"></div>';
  html+='<h4 class="text-gold mb-sm serif" style="font-size:.88rem">🏯 深度格局分析</h4>';

  // 正格
  if(b.zhengGe){
    var ge=b.zhengGe;
    html+='<div style="'+_U.card+'var(--c-gold,#d4af37)">';
    html+='<div style="'+_U.title+'color:var(--c-gold)">格局：'+ge.geName+'</div>';
    if(ge.zh) html+='<div style="'+_U.body+'">'+ge.zh+'</div>';
    html+='</div>';
  }

  // 十神組合
  if(b.tenGodCombos&&b.tenGodCombos.length){
    html+='<div style="'+_U.card+'#a78bfa">';
    html+='<div style="'+_U.title+'color:#a78bfa">十神組合格局</div>';
    html+='<div style="'+_U.body+'">';
    b.tenGodCombos.forEach(function(c){
      html+='<div style="margin-bottom:.3rem">• <strong>'+c.name+'</strong>：'+c.zh+'</div>';
    });
    html+='</div></div>';
  }

  // 暗合拱合暗沖
  if(b.hiddenInteractions&&b.hiddenInteractions.length){
    html+='<div style="'+_U.card+'#60a5fa">';
    html+='<div style="'+_U.title+'color:#60a5fa">暗合·拱合·暗沖</div>';
    html+='<div style="'+_U.body+'">';
    b.hiddenInteractions.forEach(function(h){
      html+='<div style="margin-bottom:.2rem"><span style="'+_U.tag+'background:rgba(96,165,250,.1);color:#60a5fa">'+h.type+'</span> '+h.zh+'</div>';
    });
    html+='</div></div>';
  }

  // 歲運並臨
  if(b.suiYunBingLin&&b.suiYunBingLin.active){
    html+='<div style="'+_U.card+'#f87171">';
    html+='<div style="'+_U.title+'color:#f87171">⚡ 歲運特殊事件</div>';
    html+='<div style="'+_U.body+'">'+b.suiYunBingLin.zh+'</div>';
    html+='</div>';
  }

  // 額外神煞
  if(b.extraShenSha&&b.extraShenSha.length){
    html+='<div style="'+_U.card+'rgba(212,175,55,.4)">';
    html+='<div style="'+_U.title+'color:var(--c-gold)">貴人神煞</div>';
    html+='<div style="'+_U.body+'">';
    b.extraShenSha.forEach(function(s){ html+='<div style="margin-bottom:.2rem">✦ '+s.zh+'</div>'; });
    html+='</div></div>';
  }

  // 流月
  if(b.liuYue&&b.liuYue.length){
    html+='<details style="margin-top:.5rem"><summary style="cursor:pointer;color:var(--c-gold);font-size:.82rem;font-weight:600;padding:.3rem 0">📅 '+new Date().getFullYear()+'年十二月運勢</summary>';
    html+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding-top:.4rem">';
    b.liuYue.forEach(function(m){
      var color=m.label==='大吉'?'#4ade80':m.label==='吉'?'#86efac':m.label==='平'?'#94a3b8':m.label==='凶'?'#fbbf24':'#f87171';
      html+='<div style="text-align:center;padding:6px 4px;background:rgba(255,255,255,.03);border-radius:6px;border-bottom:2px solid '+color+'">';
      html+='<div style="font-size:.7rem;opacity:.6">'+m.monthName+'</div>';
      html+='<div style="font-size:.85rem;font-weight:700;color:var(--c-gold)">'+m.gz+'</div>';
      html+='<div style="font-size:.7rem;color:'+color+'">'+m.label+(m.isChong?' ⚡':'')+(m.isHe?' 💛':'')+'</div>';
      html+='</div>';
    });
    html+='</div></details>';
  }

  _appendUpgrade('d-bazi', html);
}

// ══════════════════════════════════════════════════════════════════════
// 2. 西洋占星升級面板
// ══════════════════════════════════════════════════════════════════════
function renderNatalUpgrade(){
  var n=S.natal; if(!n) return;
  var html='';

  // Sect
  if(n.sect){
    html+='<div style="'+_U.card+(n.sect.isDaytime?'rgba(251,191,36,.4)':'rgba(96,165,250,.4)')+'">';
    html+='<div style="'+_U.title+'color:'+(n.sect.isDaytime?'#fbbf24':'#60a5fa')+'">☀/☽ '+(n.sect.isDaytime?'日盤（Diurnal）':'夜盤（Nocturnal）')+'</div>';
    html+='<div style="'+_U.body+'">派系之光：'+n.sect.sectLight+'・派系吉星：'+n.sect.sectBenefic+'・派系凶星：'+n.sect.sectMalefic+'</div>';
    html+='</div>';
  }

  // Aspect Patterns
  if(n.aspectPatterns&&n.aspectPatterns.length){
    html+='<div style="'+_U.card+'#a78bfa">';
    html+='<div style="'+_U.title+'color:#a78bfa">相位圖形</div>';
    html+='<div style="'+_U.body+'">';
    n.aspectPatterns.forEach(function(p){
      html+='<div style="margin-bottom:.4rem"><strong>'+p.zh+'</strong>（'+p.planets.join('、')+'）<br><span style="font-size:.78rem;opacity:.8">'+p.meaning+'</span></div>';
    });
    html+='</div></div>';
  }

  // Dispositor
  if(n.dispositorChain){
    html+='<div style="'+_U.card+'rgba(212,175,55,.4)">';
    html+='<div style="'+_U.title+'color:var(--c-gold)">定位星鏈</div>';
    html+='<div style="'+_U.body+'">'+n.dispositorChain.meaning+'</div>';
    html+='</div>';
  }

  // Mutual Receptions
  if(n.mutualReceptions&&n.mutualReceptions.length){
    html+='<div style="'+_U.card+'#4ade80">';
    html+='<div style="'+_U.title+'color:#4ade80">互容</div>';
    html+='<div style="'+_U.body+'">';
    n.mutualReceptions.forEach(function(mr){ html+='<div style="margin-bottom:.2rem">'+mr.meaning+'</div>'; });
    html+='</div></div>';
  }

  // Annual Profections
  if(n.profections){
    html+='<div style="'+_U.card+'#60a5fa">';
    html+='<div style="'+_U.title+'color:#60a5fa">📅 年主星法</div>';
    html+='<div style="'+_U.body+'">'+n.profections.summary+'<br>'+n.profections.meaning+'</div>';
    html+='</div>';
  }

  // Transit Highlights
  if(n.transits&&n.transits.aspects){
    var slowAsp=n.transits.aspects.filter(function(a){return a.isSlow;}).slice(0,5);
    if(slowAsp.length){
      html+='<div style="'+_U.card+'#f87171">';
      html+='<div style="'+_U.title+'color:#f87171">🔴 當前重要行運</div>';
      html+='<div style="'+_U.body+'">';
      slowAsp.forEach(function(a){
        var nat=a.nature==='challenging'?'⚡挑戰':'✦支持';
        html+='<div style="margin-bottom:.2rem">行運'+a.transitPlanet+' '+a.sym+' 本命'+a.natalPlanet+' <span style="opacity:.6">('+nat+'・容許度'+a.orb+'°)</span></div>';
      });
      html+='</div></div>';
    }
  }

  // Progressions
  if(n.progressions){
    html+='<details style="margin-top:.4rem"><summary style="cursor:pointer;color:var(--c-gold);font-size:.82rem;font-weight:600;padding:.3rem 0">🔮 次限推運・太陽弧</summary>';
    html+='<div style="'+_U.body+';padding-top:.3rem">'+n.progressions.summary+'</div>';
    if(n.solarArc){
      html+='<div style="'+_U.dim+'">太陽弧：'+n.solarArc.arc+'°（'+n.solarArc.ageYears+'歲）</div>';
    }
    if(n.solarReturn){
      html+='<div style="'+_U.dim+'">太陽回歸盤（'+n.solarReturn.date+'）：ASC '+n.solarReturn.ascSign.name+'</div>';
    }
    html+='</details>';
  }

  // Essential Dignity extremes
  if(n.essentialDignity){
    var digItems=[];
    ['太陽','月亮','水星','金星','火星','木星','土星'].forEach(function(pn){
      var ed=n.essentialDignity[pn];
      if(ed&&(ed.score>=4||ed.score<=-4)){
        var details=ed.dignities.map(function(d){return d.zh;}).concat(ed.debilities.map(function(d){return d.zh;}));
        digItems.push({name:pn,label:ed.label,score:ed.score,details:details.join('+')});
      }
    });
    if(digItems.length){
      html+='<details style="margin-top:.4rem"><summary style="cursor:pointer;color:var(--c-gold);font-size:.82rem;font-weight:600;padding:.3rem 0">⚖ Essential Dignity 尊貴度</summary>';
      html+='<div style="'+_U.body+';padding-top:.3rem">';
      digItems.forEach(function(d){
        var color=d.score>=4?'#4ade80':'#f87171';
        html+='<div style="margin-bottom:.2rem"><span style="color:'+color+'">'+d.name+'</span>：'+d.label+'（'+d.details+'）</div>';
      });
      html+='</div></details>';
    }
  }

  _appendUpgrade('d-natal-reading', html);
}

// ══════════════════════════════════════════════════════════════════════
// 3. 吠陀占星升級面板
// ══════════════════════════════════════════════════════════════════════
function renderJyotishUpgrade(){
  var j=S.jyotish; if(!j) return;
  var html='';

  // Pratyantardasha (3rd layer dasha)
  if(j.currentPD){
    html+='<div style="'+_U.card+'#a78bfa">';
    html+='<div style="'+_U.title+'color:#a78bfa">第三層小運（Pratyantardasha）</div>';
    html+='<div style="'+_U.body+'">目前：'+j.currentPD.zh+'（'+j.currentPD.start.toISOString().slice(0,10)+' ~ '+j.currentPD.end.toISOString().slice(0,10)+'・'+j.currentPD.durationDays+'天）</div>';
    html+='</div>';
  }

  // Vargottama
  if(j.vargottama){
    var vList=[];
    Object.keys(j.vargottama).forEach(function(p){
      if(j.vargottama[p]&&j.vargottama[p].isVargottama) vList.push(j.vargottama[p].zh);
    });
    if(vList.length){
      html+='<div style="'+_U.card+'#4ade80">';
      html+='<div style="'+_U.title+'color:#4ade80">Vargottama 強化星</div>';
      html+='<div style="'+_U.body+'">'+vList.join('<br>')+'</div>';
      html+='</div>';
    }
  }

  // Gandanta
  if(j.gandanta){
    var gList=[];
    Object.keys(j.gandanta).forEach(function(p){ if(j.gandanta[p]) gList.push(j.gandanta[p].zh); });
    if(gList.length){
      html+='<div style="'+_U.card+'#f87171">';
      html+='<div style="'+_U.title+'color:#f87171">Gandanta 業力結點</div>';
      html+='<div style="'+_U.body+'">'+gList.join('<br>')+'</div>';
      html+='</div>';
    }
  }

  // Combustion
  if(j.combustion){
    var cList=[];
    Object.keys(j.combustion).forEach(function(p){
      var c=j.combustion[p];
      if(c&&c.isCombust){
        var cancel=j.combustionCancellation&&j.combustionCancellation[p];
        cList.push(c.zh+(cancel&&cancel.isCancelled?' → 已化解':''));
      }
    });
    if(cList.length){
      html+='<div style="'+_U.card+'#fbbf24">';
      html+='<div style="'+_U.title+'color:#fbbf24">焦傷行星</div>';
      html+='<div style="'+_U.body+'">'+cList.join('<br>')+'</div>';
      html+='</div>';
    }
  }

  // Karakamsa
  if(j.karakamsa){
    html+='<div style="'+_U.card+'rgba(212,175,55,.4)">';
    html+='<div style="'+_U.title+'color:var(--c-gold)">Karakamsa（靈魂指引）</div>';
    html+='<div style="'+_U.body+'">'+j.karakamsa.zh;
    if(j.karakamsa.readings&&j.karakamsa.readings.length){
      html+='<br>';
      j.karakamsa.readings.forEach(function(r){ html+='<div style="margin-top:.2rem">• '+r+'</div>'; });
    }
    html+='</div></div>';
  }

  // Avasthas (weak planets only)
  if(j.avasthas){
    var avItems=[];
    Object.keys(j.avasthas).forEach(function(p){
      var av=j.avasthas[p];
      if(av&&av.effectiveMultiplier<=0.4) avItems.push(av.zh);
    });
    if(avItems.length){
      html+='<details style="margin-top:.4rem"><summary style="cursor:pointer;color:#fbbf24;font-size:.82rem;font-weight:600;padding:.3rem 0">⚠ 虛弱行星狀態（Avasthas）</summary>';
      html+='<div style="'+_U.body+';padding-top:.3rem">'+avItems.join('<br>')+'</div>';
      html+='</details>';
    }
  }

  // Refined Gochar
  if(j.refinedGochar){
    var slowGochar=j.refinedGochar.filter(function(g){return g.isSlow;});
    if(slowGochar.length){
      html+='<details style="margin-top:.4rem"><summary style="cursor:pointer;color:var(--c-gold);font-size:.82rem;font-weight:600;padding:.3rem 0">🪐 精確行運（Gochar + Vedha + Bindu）</summary>';
      html+='<div style="'+_U.body+';padding-top:.3rem">';
      slowGochar.forEach(function(g){
        var color=g.effectiveGood?'#4ade80':'#f87171';
        html+='<div style="margin-bottom:.3rem;padding-left:.4rem;border-left:2px solid '+color+'">';
        html+=g.zh+'</div>';
      });
      html+='</div></details>';
    }
  }

  // Alternative Dashas
  if(j.yoginiDasha||j.charaDasha){
    html+='<details style="margin-top:.4rem"><summary style="cursor:pointer;color:var(--c-gold);font-size:.82rem;font-weight:600;padding:.3rem 0">🔄 替代大運系統</summary>';
    html+='<div style="'+_U.body+';padding-top:.3rem">';
    if(j.yoginiDasha&&j.yoginiDasha.current){
      var yg=j.yoginiDasha.current;
      html+='<div style="margin-bottom:.3rem"><strong>Yogini Dasha：</strong>'+yg.zh+'（'+yg.lordZh+'・'+yg.nature+'・'+yg.years+'年）</div>';
    }
    if(j.charaDasha&&j.charaDasha.current){
      var cd=j.charaDasha.current;
      html+='<div style="margin-bottom:.3rem"><strong>Chara Dasha：</strong>'+cd.signZh+'座（'+cd.lordZh+'・'+cd.years+'年）</div>';
    }
    html+='</div></details>';
  }

  // Bhava Bala
  if(j.bhavaBala){
    html+='<details style="margin-top:.4rem"><summary style="cursor:pointer;color:var(--c-gold);font-size:.82rem;font-weight:600;padding:.3rem 0">🏛 宮位力量（Bhava Bala）</summary>';
    html+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px;padding-top:.3rem">';
    j.bhavaBala.forEach(function(bh){
      var color=bh.label==='極強'?'#4ade80':bh.label==='偏強'?'#86efac':bh.label==='中等'?'#94a3b8':bh.label==='偏弱'?'#fbbf24':'#f87171';
      html+='<div style="text-align:center;padding:4px;background:rgba(255,255,255,.02);border-radius:4px;border-bottom:2px solid '+color+'">';
      html+='<div style="font-size:.65rem;opacity:.5">第'+bh.house+'宮</div>';
      html+='<div style="font-size:.72rem;color:'+color+'">'+bh.label+'</div>';
      html+='<div style="font-size:.6rem;opacity:.4">'+bh.lordZh+'</div>';
      html+='</div>';
    });
    html+='</div></details>';
  }

  _appendUpgrade('d-jyotish-deep', html);
}

// ══════════════════════════════════════════════════════════════════════
// 4. 塔羅升級面板
// ══════════════════════════════════════════════════════════════════════
function renderTarotUpgrade(){
  var ta=S.tarot; if(!ta||!ta.drawn||!ta.drawn.length) return;
  var el=document.getElementById('r-tarot'); if(!el) return;
  var html='';

  // Numerology
  if(ta.numerology){
    var nm=ta.numerology;
    html+='<div style="'+_U.card+'#a78bfa">';
    html+='<div style="'+_U.title+'color:#a78bfa">🔢 牌號數字學</div>';
    html+='<div style="'+_U.body+'">化約數：'+nm.finalNum+'（'+nm.finalMeaning+'）';
    if(nm.dominantNums&&nm.dominantNums.length){
      html+='<br>';
      nm.dominantNums.forEach(function(d){ html+='<div style="margin-top:.2rem">• '+d.zh+'</div>'; });
    }
    html+='</div></div>';
  }

  // Suit Analysis
  if(ta.suitAnalysis){
    html+='<div style="'+_U.card+'rgba(212,175,55,.4)">';
    html+='<div style="'+_U.title+'color:var(--c-gold)">🎴 牌組能量分析</div>';
    html+='<div style="'+_U.body+'">'+ta.suitAnalysis.zh+'</div>';
    html+='</div>';
  }

  // Kabbalah
  if(ta.kabbalah&&ta.kabbalah.length){
    html+='<details style="margin-top:.4rem"><summary style="cursor:pointer;color:var(--c-gold);font-size:.82rem;font-weight:600;padding:.3rem 0">🌳 卡巴拉生命之樹對應</summary>';
    html+='<div style="'+_U.body+';padding-top:.3rem">';
    ta.kabbalah.forEach(function(kb){
      html+='<div style="margin-bottom:.3rem"><strong>'+kb.cardName+'</strong>：路徑'+kb.path+'（'+kb.sephirotZh+'）<br><span style="opacity:.7;font-size:.78rem">'+kb.meaning+'</span></div>';
    });
    html+='</div></details>';
  }

  _appendUpgrade('r-tarot', html);
}

// ══════════════════════════════════════════════════════════════════════
// 5. 梅花升級面板
// ══════════════════════════════════════════════════════════════════════
function renderMeihuaUpgrade(){
  var mh=S.meihua; if(!mh) return;
  var html='';

  // 體用深度
  if(mh.tiYongDeep){
    html+='<div style="'+_U.card+'rgba(212,175,55,.4)">';
    html+='<div style="'+_U.title+'color:var(--c-gold)">⚖ 體用力量精算</div>';
    html+='<div style="'+_U.body+'">'+mh.tiYongDeep.zh+'</div>';
    html+='</div>';
  }

  // 互卦深度
  if(mh.huGuaDeep){
    html+='<div style="'+_U.card+'#60a5fa">';
    html+='<div style="'+_U.title+'color:#60a5fa">🔍 互卦深度</div>';
    html+='<div style="'+_U.body+'">'+mh.huGuaDeep.zh+'</div>';
    html+='</div>';
  }

  // 動爻
  if(mh.dongYaoDeep){
    html+='<div style="'+_U.card+'#a78bfa">';
    html+='<div style="'+_U.title+'color:#a78bfa">📍 動爻詳解</div>';
    html+='<div style="'+_U.body+'">'+mh.dongYaoDeep.zh+'</div>';
    html+='</div>';
  }

  // 萬物類象
  if(mh.upWanwu||mh.loWanwu){
    html+='<details style="margin-top:.4rem"><summary style="cursor:pointer;color:var(--c-gold);font-size:.82rem;font-weight:600;padding:.3rem 0">🌏 萬物類象</summary>';
    html+='<div style="'+_U.body+';padding-top:.3rem">';
    if(mh.upWanwu){
      var uw=mh.upWanwu;
      html+='<div style="margin-bottom:.4rem"><strong>上卦 '+(mh.up?mh.up.name:'')+'（'+uw.wuxing+'）</strong>：'+uw.person+' ｜ '+uw.thing+' ｜ '+uw.place+' ｜ 性質：'+uw.nature+'</div>';
    }
    if(mh.loWanwu){
      var lw=mh.loWanwu;
      html+='<div><strong>下卦 '+(mh.lo?mh.lo.name:'')+'（'+lw.wuxing+'）</strong>：'+lw.person+' ｜ '+lw.thing+' ｜ '+lw.place+' ｜ 性質：'+lw.nature+'</div>';
    }
    html+='</div></details>';
  }

  _appendUpgrade('r-meihua', html);
}

// ══════════════════════════════════════════════════════════════════════
// 6. 姓名學升級面板
// ══════════════════════════════════════════════════════════════════════
function renderNameUpgrade(){
  var nr=S.nameResult; if(!nr) return;
  var html='';

  // 81數理詳解
  var geList=['renGe','diGe','zongGe'];
  var geNames={renGe:'人格',diGe:'地格',zongGe:'總格'};
  var hasDetail=false;
  geList.forEach(function(ge){
    if(nr[ge]&&nr[ge].shuliDetail){
      hasDetail=true;
    }
  });
  if(hasDetail){
    html+='<div style="'+_U.card+'rgba(212,175,55,.4)">';
    html+='<div style="'+_U.title+'color:var(--c-gold)">📖 81數理詳解</div>';
    html+='<div style="'+_U.body+'">';
    geList.forEach(function(ge){
      if(nr[ge]&&nr[ge].shuliDetail){
        var sd=nr[ge].shuliDetail;
        var color=sd.ji.includes('吉')?'#4ade80':'#f87171';
        html+='<div style="margin-bottom:.3rem"><strong>'+geNames[ge]+'</strong>（'+nr[ge].num+'）<span style="color:'+color+'">'+sd.ji+'</span>：'+sd.zh+'</div>';
      }
    });
    html+='</div></div>';
  }

  // 三才詳解
  if(nr.sanCaiDetail){
    html+='<div style="'+_U.card+'#a78bfa">';
    html+='<div style="'+_U.title+'color:#a78bfa">三才配置解讀（'+(nr.sanCai||[]).join('')+'→'+nr.sanCaiLevel+'）</div>';
    html+='<div style="'+_U.body+'">'+nr.sanCaiDetail+'</div>';
    html+='</div>';
  }

  // 姓名×八字
  if(nr.baziMatch){
    var bm=nr.baziMatch;
    var color=bm.score>=60?'#4ade80':bm.score>=40?'#fbbf24':'#f87171';
    html+='<div style="'+_U.card+color+'">';
    html+='<div style="'+_U.title+'color:'+color+'">🔗 姓名×八字用神契合度</div>';
    html+='<div style="'+_U.body+'">'+bm.zh+'</div>';
    if(bm.details&&bm.details.length){
      html+='<div style="margin-top:.3rem">';
      bm.details.forEach(function(d){ html+='<div style="font-size:.75rem;opacity:.8">'+d.zh+'</div>'; });
      html+='</div>';
    }
    html+='</div>';
  }

  _appendUpgrade('d-name', html);
}

// ══════════════════════════════════════════════════════════════════════
// HOOK: 在 runAnalysisV2 完成後自動注入
// ══════════════════════════════════════════════════════════════════════
(function(){
  // 等既有渲染完成後再注入
  var _origRunAnalysisV2 = typeof runAnalysisV2 === 'function' ? runAnalysisV2 : null;
  if(_origRunAnalysisV2){
    runAnalysisV2 = function(){
      _origRunAnalysisV2.apply(this, arguments);
      // 延遲注入，確保 DOM 已更新
      setTimeout(function(){
        try { renderBaziUpgrade(); } catch(e){ console.error('renderBaziUpgrade:', e); }
        try { renderNatalUpgrade(); } catch(e){ console.error('renderNatalUpgrade:', e); }
        try { renderJyotishUpgrade(); } catch(e){ console.error('renderJyotishUpgrade:', e); }
        try { renderTarotUpgrade(); } catch(e){ console.error('renderTarotUpgrade:', e); }
        try { renderMeihuaUpgrade(); } catch(e){ console.error('renderMeihuaUpgrade:', e); }
        try { renderNameUpgrade(); } catch(e){ console.error('renderNameUpgrade:', e); }
      }, 300);
    };
  }
})();
