// BEGIN GENERATED CONSULTATION EVIDENCE
/* Shared by the reading table and the single-message export. Always work from
 * the committed chart. A stop or missing input is also a useful thing to show. */
(function (root) {
  'use strict';
  const list = value => Array.isArray(value) ? value : [];
  const join = values => values.filter(value => typeof value === 'string' && value.trim()).join('；');
  const distinct = values => [...new Set(values.filter(Boolean))];
  const stations = {
    tarot: ['攤開你的牌陣', '翻看牌位', 'card'],
    ootk: ['循著代表牌開鑰', '查看操作', 'card'],
    lenormand: ['沿著牌列讀一句話', '查看牌路', 'card'],
    oracle: ['展讀你求得的籤', '展開籤句', 'slip'],
    bazi: ['讀你的四柱', '查看落點', 'pillar'],
    ziwei: ['循宮位看這件事', '入宮看星', 'sky'],
    astro: ['在星盤上定位問題', '查看星位', 'sky'],
    vedic: ['從本命看進分盤', '查看落點', 'sky'],
    liuyao: ['在六爻裡找用神', '查看爻位', 'gua'],
    yijing: ['展開這一卦的主辭', '展讀卦辭', 'gua'],
    meihua: ['循著體用看變化', '查看卦象', 'gua'],
    liuren: ['沿三傳看事情推進', '查看課傳', 'plate'],
    name: ['攤開名字逐字比', '查看姓名', 'ink'],
    compat: ['把兩個人的盤對著看', '查看作用', 'pair'],
    personality: ['看你的五軸怎麼算', '查看一軸', 'axis']
  };
  const make = (label, detail, reading, visual = {}) => ({ label, detail, reading, visual });
  const gap = (label, detail, reading) => make(label, detail, reading, { kind: 'limit' });
  const hex = (lines, position) => ({ lines: list(lines).map(Boolean), position });
  function fromItem(item, reading, visual) {
    if (!item?.summary) return null;
    return make(item.label, item.summary, reading, visual);
  }

  function cards(c, a) {
    const d = a.methodData, raw = c.tarotData || c, slots = list(raw.methodPlan?.slots);
    const all = list(d.records);
    const role = r => String(slots[r.index - 1]?.authority || slots[r.index - 1]?.role || '');
    const desired = [all.find(r => /state|core/.test(role(r))), all.find(r => /obstacle|interaction_force|cause/.test(role(r))),
      all.find(r => /outcome/.test(role(r))), all.find(r => /advice/.test(role(r)))];
    // A sequence or paired reading has no free-standing invented outcome slot.
    return distinct([...desired, ...all]).map(r => {
      const position = typeof r.position === 'string' ? r.position : '第' + r.index + '位';
      const direction = r.direction || '方向未記錄';
      const reading = /希望|恐懼|期待/.test(position) ? '這個位置讓你對照期待與擔心。判斷走向時，要另外看這副牌真正的結果位置。' :
        /結果|收束|最終/.test(position) ? '走到這個牌位，再看前面哪些條件會把事情帶到這裡。' :
        /建議|行動/.test(position) ? '想一件你自己能採取的行動，再回頭看它能處理哪個阻力。' :
        '先看這張在牌陣裡負責哪一件事，再跟相連的牌一起讀。';
      return make('第' + r.index + '位・' + position, r.name + '（' + direction + '）' + (r.meaning ? '。' + r.meaning : '。這次沒有登記可用的牌義。'), reading,
        { face: r.id, reversed: direction === '逆位', mark: r.name, edition: d.sourceProfile });
    });
  }

  function opening(c, a) {
    const d = a.methodData;
    return list(d.layerEvidence).map(layer => {
      const title = '第' + layer.index + '輪・' + layer.stage, op = list(d.operations).find(o => o.operation === layer.operation)?.data;
      if (!layer.valid || layer.readingStatus !== 'eligible' || !layer.counts.countingSteps || !layer.counts.activeCards || !d.significator)
        return gap(title, !layer.valid ? '操作停止或未成立。' : layer.readingStatus === 'context-mainline-pending' ? '本輪的主線仍待驗證。' : '代表牌或計數路徑缺少可核對的紀錄。', '這裡只能說明操作進度，不能據此替你的問題下結論。');
      const path = list(op.ringCountingPath).length ? op.ringCountingPath : list(op.countingPath);
      const names = path.slice(0, 3).map(p => list(op.activeCards).find(r => r.id === p.cardId)?.name).filter(Boolean);
      const territory = layer.domain?.label || layer.domain?.meaning || layer.domain?.value;
      const detail = join([typeof territory === 'string' ? territory : '', names.length ? '計數起段：' + names.join(' → ') : '', '記錄了' + path.length + '步']);
      return make(title, detail, '這一輪只承接自己的操作。回到實際計數與配對，看它為上一輪增加了什麼。', { mark: d.significator.name || '代表牌' });
    });
  }

  function lenormand(c, a) {
    const d = a.methodData, rows = list(d.records);
    const data = c.lenormandData || c, spread = data.spreadType || data.spread;
    const paths = list(d.paths);
    const route = spread === 'nine' ? [...paths.filter(p => p.includes(5) && (p[0] === 4 || p[0] === 2)), ...paths] : paths;
    return distinct(route).slice(0, 6).map(p => {
      const set = p.map(i => rows[i - 1]);
      const words = set.slice(0, 3).map(r => {
        const m = Array.isArray(r.meaning) ? r.meaning.join('、') : r.meaning;
        return typeof m === 'string' && m ? r.name + '：' + m : '';
      });
      return make('第' + p.join('、') + '位', set.map(r => r.name).join(' → '),
        join(words) || '沿這一條線把前後牌連成一句。保留這組牌的順序，另一分支要分開看。',
        { faces: set.slice(0, 3).map(r => r.id), mark: set[0].name });
    });
  }

  function oracle(c, a, q) {
    const d = a.methodData, rows = list(d.lines);
    const categories = [
      [/升遷|主管|考試|錄取|功名/, '功名'], [/生意|開店|攤位|營業/, '經商'], [/收入|款項|財運|錢/, '求財'],
      [/結婚|婚姻/, '婚姻'], [/搬家|移居/, '移居'], [/找人|尋人/, '尋人'], [/家人|家事/, '家事']
    ];
    const name = categories.find(([rx]) => rx.test(q))?.[1];
    const cat = list(d.categories).find(p => name && p.name === name && p.present);
    const tags = { supportive: '有利', caution: '留意阻力', conditional: '有成立條件', delay: '待時', late: '偏晚', early: '偏早', negative: '不利', neutral: '平', waiting: '需等待' };
    const qualified = cat && [...list(cat.textFeatureTags).map(t => tags[t]).filter(Boolean), ...list(cat.traditionalTimingTokens)].join('、');
    const clues = rows.map(r => make('第' + d.number + '籤・第' + r.index + '句', r.text,
      list(r.conditionWords).length ? '這句的轉折在「' + r.conditionWords.map(w => w.word).join('、') + '」。想想現實中對應的條件有沒有到。' : '把這一句放回前後句，看看它在描寫處境，還是在說下一步。', { mark: r.text }));
    if (d.reading?.summary) clues.splice(1, 0, make('本籤解意', d.reading.summary, d.reading.premises, { mark: d.ganzhi }));
    if (qualified) clues.splice(1, 0, make('本廟本・' + name + '附記', qualified, '這是本版本附記的要點。所問事項有自己的條件，可以跟整首籤的方向合看。', { mark: name }));
    return clues;
  }

  function gua(c, a, kind) {
    if (kind === 'yijing') return list(a.reading?.selections).map(r => make(r.role + '・' + r.hexagram + '卦' + r.label, r.text, a.reading.rule,
      hex((r.side === 'changed' ? c.changed : c.original)?.lines, r.position)));
    if (kind === 'meihua') return list(a.items).map((r, i) => fromItem(r, i === 0 ? '體卦先固定下來，你才看得出外在條件是在幫忙，還是要你多花力氣。' : i === 3 ? '回到原來的體卦，看變化之後，前面的作用有沒有改變。' : '互卦說的是中間過程，這一步要連回本卦和變卦。', hex(i === 3 ? a.changedLines : i === 0 ? a.originalLines : [...list(a.nuclear?.lower?.li), ...list(a.nuclear?.upper?.li)], i === 0 || i === 3 ? c.dong : null)));
    if (kind === 'liuren') return list(a.items).filter(i => /^transmission-/.test(i.id)).map((i, n) => {
      const t = i.evidence[0];
      return make(i.label, join([i.summary, t.empty ? '本傳旬空' : '', t.assessment?.monthlyBroken ? '月破' : '']),
        ['先看發端有沒有著力處，這會影響後面的承接。', '把這一步和初傳連起來看，事情要經過什麼轉折。', '這一步讀的是三傳收束。具體時日還要另有應期條件。'][n], { mark: t.branch, sector: t.branch && '子丑寅卯辰巳午未申酉戌亥'.indexOf(t.branch) });
    });
    const targets = list(a.targets), primary = targets.filter(t => t.priority === 'primary');
    const rows = (primary.length ? primary : targets).flatMap(t => {
      if (!list(t.candidates).length) return [gap(t.role, '本次沒有找到可確認的' + t.relative + '。', '缺少落點時，只能先核對取用條件。')];
      return t.candidates.map(r => {
        const state = r.assessment || {}, line = list(c.lines).find(l => l.position === r.position);
        const label = t.role + '・第' + r.position + '爻';
        const fact = (r.hidden ? '伏藏' : '明現') + t.relative + r.branch + (r.element || '');
        // A hidden spirit and its covering line have different kinship and strength.
        const detail = r.hidden ? join([fact, line ? '飛神為' + line.relative + line.branch : '', r.hiddenRelation || '']) :
          join([fact, state.monthInfluence, state.dayInfluence, state.voidStatus]);
        return make(label, detail, t.candidates.length > 1 ? '同一用神有多個位置，先分清它指的是哪個人或哪件事。' : r.hidden ? '先分清伏神和飛神，再看月日能否讓伏藏的作用顯出來。' : '月建、日辰和動變要一起看。遇到相反作用時，分清誰生誰、誰受制。',
          hex(c.original?.lines, r.position));
      });
    });
    return rows.concat(list(a.items).filter(i => /世|應/.test(i.label)).map(i => fromItem(i, '世應分別定位當事人和所問的一方，再核對它們與用神的關係。', hex(c.original?.lines, i.evidence[0].natal?.position))));
  }

  function natal(c, a, kind, primaryItems, question) {
    const items = list(a.items), find = id => items.find(p => p.id === id);
    if (a.coverage.provisional || c.input?.unknownTime || c.sensitivity?.unknownTime) {
      const limits = { bazi: '時柱、整體旺衰與精確起運要等時辰確認。', ziwei: '缺出生時辰，十二宮和星曜落宮不能確定。', vedic: '上升、宮位、分盤宮位與精確運期不能確定。', astro: '四角與宮位不能確定，月亮位置需看當天範圍。' };
      const available = kind === 'bazi' ? items.filter(i => /^pillar-(year|month|day)$/.test(i.id)).map(i => fromItem(i, '這是三柱中可核對的部分。', { mark: i.evidence[0]?.gan + i.evidence[0]?.zhi })) : [];
      if (kind === 'astro' || kind === 'vedic') {
        const signs = ['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'];
        for (const [key, name] of [['Sun','太陽'],['Moon','月亮']]) {
          let indices;
          if (kind === 'astro') indices = c.sensitivity?.planets?.find(p => p.key === key)?.signs;
          else if (c.sensitivity?.sampled && c.planets?.[key]) {
            const change = c.sensitivity.changes?.find(p => p.key === key + '/D1');
            indices = change?.alternatives || [c.planets[key].sign];
          }
          const found = distinct(list(indices).map(i => signs[i]));
          if (found.length) available.push(make(name + '・當日取樣', found.length === 1 ?
            '當天所取時點，' + name + '都在' + found[0] + '座。' :
            '當天取樣跨過' + found.join('、') + '座，要有時辰才能辨別。',
            '你仍可以用這一天的範圍來對照，無法就此指定它在哪一宮。', { mark:name }));
        }
      }
      return [gap('出生時辰待確認', limits[kind], '如果你能取得出生紀錄，再回來檢查這部分；目前只用已能定位的資料。'), ...available];
    }
    if (kind === 'astro' && c.input?.chartPurpose && c.input.chartPurpose !== 'natal') {
      const mode = c.input.chartPurpose;
      if (mode === 'horary') {
        const h = c.horary || a.horary;
        if (!h) return [gap('問事盤', '本次沒有可用的問事宮主資料。', '要有問事當下的資料，才能連接問事者和事情。')];
        return [make('問事盤・取用', join([h.selectedHouse ? '所問第' + h.selectedHouse + '宮' : '', h.querent?.lord ? '本方宮主' + (root.JYWestern?.zh?.(h.querent?.lord) || h.querent?.lord) : '', h.quesited?.lord ? '對方宮主' + (root.JYWestern?.zh?.(h.quesited?.lord) || h.quesited?.lord) : '']) || '本次依問事時刻起盤。', '入相、接納與阻斷條件要一起讀。', { mark: '問事' })];
      }
      if (a.relocated || c.relocated) {
        const r = c.relocated || a.relocated;
        return [make('遷居參照地', join([r.location || '', r.houses?.angles?.ASC != null ? '遷居上升 ' + Math.round(r.houses.angles.ASC * 100) / 100 + '°' : '']) || '已另排參照地盤。', '比較兩地的四角與落宮，把實際的居住條件留給你核對。', { mark: '遷居' })];
      }
    }
    const base = { bazi: ['pillar-month','pillar-day'], ziwei: ['palace-命宮','palace-福德'], vedic: ['house-1'], astro: ['house-1'] }[kind];
    const rows = distinct([...primaryItems, ...base.map(find)]);
    const cues = rows.map(i => {
      const ev = i.evidence[0] || {}, house = Number(i.id.split('-')[1]);
      const reading = { bazi: '把明透與藏支分開讀，再看月令是否支持它。才能談它在你所問的事上容易發揮在哪裡。', ziwei: '先看本宮，再看對宮與三方。借星、會照和本宮坐守各有不同的分量。', astro: '看這個宮的宮主落到哪裡，再核對它與其他星的作用，才知道哪兩件生活上的事連在一起。', vedic: '從這個宮追到宮主落點，再用對題的分盤與運期核對，不能把本命傾向直接當作事件日期。' }[kind];
      return fromItem(i, reading, { mark: ev.gan && ev.zhi ? ev.gan + ev.zhi : i.label.split(' · ')[0], sector: house >= 1 && house <= 12 ? house - 1 : null });
    });
    if (kind === 'vedic') {
      const focus = a.depthContract?.requestCoverage?.caseBasis?.focus;
      const explicit = [...String(question || '').matchAll(/\bD(\d{1,3})\b/gi)].map(m => Number(m[1]));
      const relevant = distinct([...explicit, ...list(focus?.divisions).filter(n => n !== 1 && n !== 9)]);
      const lord = [...primaryItems].find(i => i.evidence[0]?.house?.lord)?.evidence[0]?.house?.lord;
      for (const n of relevant.slice(0, 2)) {
        const v = c.vargas?.[n], pl = lord && v?.planets?.[lord];
        if (!v?.lagna?.signName) continue;
        cues.splice(1, 0, make('D' + n + '・' + (v.purpose || '分盤'), join(['分盤上升' + v.lagna.signName, pl?.signName ? (root.JYVedic?.zh(lord) || lord) + '在' + pl.signName + (pl.house ? '第' + pl.house + '宮' : '') : '']), '同一顆星在專項分盤的落點，是拿來核對本命傾向在這件事上怎麼發揮。', { mark: 'D' + n, sector: v.lagna.sign }));
      }
    }
    return cues;
  }

  function pairs(c, a) {
    if (a.system === 'ziwei') {
      if (!c.personA || !c.personB) return [gap('雙方定盤條件', '甲方' + (c.personA ? '有盤' : '未定盤') + '，乙方' + (c.personB ? '有盤' : '未定盤') + '。', '只能解讀資料齊全的一方，跨盤作用需要雙方都能定盤。')];
      const rows = list(c.projectionGroups), focus = list(c.focusPalaces);
      const relevant = rows.filter(r => focus.includes(r.targetPalace));
      return distinct([...relevant, ...rows]).slice(0, 4).map(r => make(r.sourcePerson + ' → ' + r.targetPerson, r.star + r.hua + '入' + r.targetPalace + '（' + r.targetBranch + '）', '先辨清誰引動、誰承接。同一生年與宮干投射合併時只算一個作用。', { mark: r.targetPalace }));
    }
    const out = [];
    if (c.dayMasters?.aToB?.label && c.dayMasters?.bToA?.label) out.push(make('雙方日主', '甲方對乙方：' + c.dayMasters.aToB.label + '；乙方對甲方：' + c.dayMasters.bToA.label, '這是兩個方向的關係，可以對照誰先帶動、誰承接。對方的實際意願仍要由對方表達。', { mark: [c.personA?.dayMaster, c.personB?.dayMaster].filter(Boolean).join('／') }));
    const rs = list(c.branchRelations);
    const relevant = rs.filter(r => r.aPillar === 'day' || r.bPillar === 'day');
    return out.concat(distinct([...relevant, ...rs]).slice(0, 3).map(r => make(r.type, r.description, '要看它落在雙方哪一柱。若日支同時有其他作用，也要一併考慮。', { mark: r.aBranch + '／' + r.bBranch })));
  }

  function names(c) {
    const people = list(c.names).length ? c.names : [c];
    return people.map(p => {
      const grid = list(p.fiveGrids?.grids).find(g => g.role === '人格');
      const strokes = list(p.characters).map(x => x.char + (x.stroke ?? x.strokes ?? x.effectiveStrokes ?? '待核')).join('、');
      const sound = list(p.phonetic?.characters).map(x => x.char + ' ' + (x.reading || list(x.candidates).join('／') || '待核') + (x.confirmed ? '（本人確認）' : '（待本人確認）'));
      const details = [strokes && '各字筆畫：' + strokes, grid?.num != null ? '人格 ' + grid.num + '（' + grid.level + '，' + grid.theme + '）' : '五格未定', sound.length ? '讀音：' + sound.join('、') : ''];
      return make(p.name + (p.name === c.baseline?.name ? '・原名' : ''), join(details), '逐個名字用同一筆畫口徑比較。你平常怎麼唸、希望名字表達什麼，也會改變實際取捨。', { mark: p.name });
    });
  }

  // Each school permits a different kind of conclusion from the same question.
  const conclusionScope = {
    tarot:'按本次牌陣的實際角色與牌義版本起斷。結果、短期、阻力各管一層；希望或恐懼不能充作結果，也不能當成第三人的心理。',
    ootk:'由問到的有效操作的代表牌、計數、配對與尊貴定主線。領域只限定所論何事；未完成的輪次沒有結局可取。',
    lenormand:'把同一實際牌路照順序連成一句，交代哪張修飾哪張。人物、關係及結局須由題牌、位置或組合承擔。',
    bazi:'以實際日主、月令、透藏及所問十神定原局能承受什麼；歲運有具體引動才斷時機。有某十神不能直接許某事件。',
    ziwei:'以題宮的星曜及三方四正定本命，再辨限年有無引動。單方夫妻宮論本人的關係傾向，不能指定另一個人的心意。',
    compat:'先辨甲乙、各自原局及雙向實際作用。相生、相合只說兩盤何處相應；是否已交往及另一方的意願各須另有依據。',
    astro:'依本次本命、問事或遷居用途取用。按實際題宮、宮主與相位解題；本命傾向與問事是否成象分開。',
    vedic:'以D1題宮及宮主起斷，用已展開的相關分盤與大／副運核實。喜見某星只論該層，落實到特定人事要有相應引動。',
    liuren:'依課內用神及初中末傳讀發端、承接與收束。旺衰、空破與生剋要落到當傳；候選應期逐日配原來的觸發條件。',
    liuyao:'以本題用神與世應辨人事，再查月日、動變、飛伏及空破。清楚說誰生誰、哪一爻受制，是否成事須看用神如何承接。',
    meihua:'固定原體，依本卦體用、互卦經過、變卦與原體的生剋定最後走向。分清誰生誰剋、誰得誰耗。',
    yijing:'依本次變占已選的主辭、參辭與所屬象傳取用。先辨辭判的是進退得失、免咎，還是直接回應原題所求之事。',
    oracle:'以本廟本籤的原句和轉折定進退。有條件、待時與明言可成是不同的判斷；典故只有題名不補故事。',
    name:'依本次字音形義、具名筆畫版本與五格三才比較。數理或名字寓意只論其取象，不當作現實事件、他人喜好或時間。',
    personality:'把五軸中切題的一軸連回四柱及本模型實算訊號。只論行為傾向，無法據此斷第三人或未來事件。'
  };

  function asksForPractical(question, priority) {
    const q=[question, priority].filter(Boolean).join('。');
    if (/(?:不要|不必|不用|只要|只從|只想).{0,6}(?:建議|做法|命理|卦象|盤象|看盤)/.test(q)) return false;
    return /(?:怎[麼麽樣]|如何)[^。！？\n]{0,5}(?:做|辦|試|談|處理|回應|爭取|改善|準備|開口|著手|面對|答覆)|怎辦|(?:可以|該|我能|要)(?:先)?做什麼|下一步|具體做法|行動建議|實際建議/.test(q);
  }

  function openingPoints(visit, entry, question) {
    const {method,points}=visit, find=rx=>points.find(p=>rx.test(p.label));
    let first=[];
    if(method==='tarot'){
      const slots=(entry.chart.tarotData||entry.chart).methodPlan?.slots||[];
      const authority=p=>slots[Number(p.label.match(/^第(\d+)位/)?.[1])-1]?.authority;
      const results=points.filter(p=>authority(p)==='outcome'||(!authority(p)&&!/希望|恐懼|期待|建議/.test(p.label)&&/最終|結果|收束/.test(p.label)));
      first=[...results,find(/短期|身前|即將/),find(/交叉|橫跨|阻力/)];
    } else if(method==='meihua') first=[find(/本卦/),find(/變卦/),find(/互卦/)];
    else if(method==='ootk'){
      const round=question.match(/第\s*([一二三四五1-5])\s*輪/);
      const i=round&&(Number(round[1])||'一二三四五'.indexOf(round[1])+1);
      const one=i&&find(new RegExp('^第'+i+'輪'));
      if(one)return [one];
      first=[points[0],points.at(-1)];
    } else if(method==='vedic'&&points[0]?.visual.kind!=='limit'){
      const requested=[...question.matchAll(/\bD(\d{1,3})\b/gi)].map(m=>'D'+m[1]+'・');
      first=[points[0],...points.filter(p=>requested.some(prefix=>p.label.startsWith(prefix))),...points.filter(p=>/^D\d+・/.test(p.label))];
    } else if(method==='name') first=points.filter(p=>p.visual.mark&&question.includes(p.visual.mark));
    return distinct([...first,...points]).slice(0,3);
  }

  function build(entry, question, primaryItems = []) {
    const { method, chart, analysis } = entry;
    const station = stations[method];
    if (!station) return null;
    let points;
    if (method === 'tarot') points = cards(chart, analysis);
    else if (method === 'ootk') points = opening(chart, analysis);
    else if (method === 'lenormand') points = lenormand(chart, analysis);
    else if (method === 'oracle') points = oracle(chart, analysis, question);
    else if (method === 'name') points = names(chart);
    else if (method === 'compat') points = pairs(chart, analysis);
    else if (method === 'personality') points = analysis.coverage.provisional ? [gap('時辰待確認', '本次未能計出完整五軸。', '先保留不確定的部分。')] : list(analysis.items).map(i => fromItem(i, '想一件你真的做過的事來對照這個傾向。生活經驗可以和這個模型不一樣。', { mark: i.evidence[0][i.evidence[0].rightSelected ? 'right' : 'left'] }));
    else if (['meihua','liuren','liuyao','yijing'].includes(method)) points = gua(chart, analysis, method);
    else points = natal(chart, analysis, method, primaryItems, question);
    points = points.filter(p => p?.label && p.detail);
    if (!points.length) points = [gap('可讀範圍', '本次尚無可定位的解讀落點。', '只保留已完成的程序，等缺少的資料補齊再看。')];
    return { method, source: entry.label || '', title: station[0], action: station[1], theme: station[2], points };
  }
  root.JYConsultationEvidence = Object.freeze({ build, openingPoints, asksForPractical, conclusionScope:Object.freeze(conclusionScope) });
})(typeof window === 'undefined' ? globalThis : window);
// END GENERATED CONSULTATION EVIDENCE
/* Canonical reading-message compiler. The full native computation stays in the
 * packet/JSON. Delivery is a bounded, self-contained reading projection, never
 * a substring of the old export and never a multi-message protocol. */
(function(root){
  'use strict';
  const VERSION='20261123native131',LIMIT=12000,BYTES=28000;
  if(root.JYSinglePaste?.version===VERSION)return;
  const A=x=>Array.isArray(x)?x:[],P=(x,keys)=>Object.fromEntries(keys.filter(k=>x&&x[k]!==undefined).map(k=>[k,x[k]]));
  const keys=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Rahu','Ketu','Uranus','Neptune','Pluto','NorthNode','SouthNode'];
  const planets=['日','月','水','金','火','木','土','羅','計','天王','海王','冥王','北交','南交'];
  const signs=['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'];
  const names={bazi:'八字',ziwei:'紫微斗數',vedic:'印度占星',astro:'西洋占星',liuren:'大六壬',liuyao:'六爻',yijing:'易經',meihua:'梅花易數',name:'姓名學',compat:'合盤',personality:'五軸人格',tarot:'塔羅',lenormand:'雷諾曼',ootk:'五輪塔羅',oracle:'籤詩'};
  const zh=x=>planets[keys.indexOf(x)]||x;
  const num=x=>typeof x==='number'&&Number.isFinite(x)?Math.round(x*10000)/10000:x;
  const chars=x=>Array.from(String(x)).length;
  const bytes=x=>typeof TextEncoder==='function'?new TextEncoder().encode(String(x)).length:unescape(encodeURIComponent(String(x))).length;
  const json=x=>JSON.stringify(x,(_,v)=>typeof v==='number'?num(v):v);
  function txt(v){if(v==null)return '未定';if(v===true)return '是';if(v===false)return '否';if(typeof v==='number')return String(num(v));if(typeof v==='string')return v;if(Array.isArray(v))return v.map(txt).join('、');return typeof readable==='function'?'（'+readable(v,2)+'）':json(v);}
  function stamp(x){if(x==null)return '未定';const d=new Date(x);return Number.isFinite(+d)?d.toISOString().replace(/\.\d{3}Z$/,'Z'):String(x);}
  const interval=x=>x?stamp(x.start??x.startsAt)+'→'+stamp(x.endExclusive??x.end??x.endsAt):'未定';
  const state=x=>x==null?'?':x?1:0;
  const hasData=x=>x!==null&&x!==undefined&&x!==''&&(!Array.isArray(x)||x.length>0)&&(!(typeof x==='object'&&!Array.isArray(x))||Object.keys(x).length>0);
  const affirmative=x=>x===true||['established','structural','conditional','variant-structure','matched','timing-supported','weakened','undetermined'].includes(x);
  const guides={
    bazi:'依子平正統推演：先定四柱與節令，看日主得令、得地、得勢，通根與透藏；以月令取格，審格局成敗與救應；依《子平真詮》順逆取用、《滴天髓》論衰旺、《窮通寶鑑》論調候，分別交代三種取法的依據和條件。行運以大運管十年、流年管一年，看運歲干支對原局與格局的生剋合沖、成格破格，判吉凶與程度；應年取流年觸發之字，應月取流月。六親依《三命通會》論六親：男命以財為妻、官殺為子，女命以官殺為夫、食傷為子；妻看日支（夫妻宮），子女兼看時柱（子女宮），子數依子星在時支的十二長生與子息歌。神煞作參考。依原題取用：婚姻感情，男看財星、女看官殺的喜忌清濁與得位與否，並看日支夫妻宮的喜忌與刑沖合害；婚期取大運流年引動夫妻宮或配偶星之年（合日干日支、沖動夫妻宮、配偶星透出），紅鸞天喜為輔。事業看官殺、印與食傷生財是否成格及月柱；財運看財星有根與否、身能否任財、食傷能否生財、比劫是否奪財；健康只談傳統象徵，不能推定疾病或預後；學業考試看印星、官星與文昌。',
    ziwei:'依紫微斗數正統推演：以命宮、身宮與原題所屬宮位為主，合看三方四正與對宮；論主星廟旺利陷、輔佐與煞曜、生年四化，再看宮干飛化與自化。行運以大限十年、流年一年疊宮，看大限與流年四化入題宮及沖照，判吉凶、程度與應期。六親看對應宮位（夫妻、子女、父母、兄弟、交友）的主星、四化與三方四正。依原題取用：婚姻感情看夫妻宮，兼看福德宮、命宮與遷移宮，桃花星（紅鸞、天喜、貪狼、廉貞、天姚、咸池）與化忌落點；婚期看大限、流年的夫妻宮或命宮逢紅鸞天喜、化祿化科入夫妻，化忌沖夫妻主波折。事業看官祿宮及命、財帛三方；財運看財帛宮、田宅宮（財庫）與福德宮，及祿存、化祿、武曲、天府、太陰落點；健康看疾厄宮、命宮與煞忌所沖；出外看遷移宮；學業看文昌文曲與化科。',
    vedic:'依帕拉薩拉（BPHS）正統推演：以上升與原題所屬宮位為主，看宮主落宮、尊貴、合相與相位，以 D9 驗證強弱，專項看相關分盤；以維姆紹塔里大運的主運、副運、次副運主星所掌宮位與其本命狀態論事情何時發生，再以土星、木星行運過題宮及從月亮起算的位置印證。六親看對應宮位、宮主與自然代表星：子女看五宮、木星與 D7，配偶看七宮、金星與 D9，父親看九宮與太陽，母親看四宮與月亮。依原題取用：婚姻以金星為男命妻星、木星為女命夫星，並參婚姻象點；婚期落在七宮主、金星或七宮內星的主運副運，且木星與土星行運同時照到七宮或七宮主之時。事業看十宮、十宮主、D10 與土星；財運看二宮、十一宮及其宮主。',
    astro:'依傳統占星正統推演：本命看原題所屬宮位的宮頭星座、宮主星落宮與本質尊貴、宮內行星與相位；時機以行運、二次推運、太陽回歸與年度小限論，外行星與土星、木星過題宮或觸及宮主為應期。卜卦盤依卜卦規則看問卜者與所問事之宮主是否入相成事。六親看對應宮位與宮主：子女五宮，配偶七宮，父母十宮與四宮，手足三宮。依原題取用：婚姻感情看七宮宮頭、宮主與宮內星，男命重月亮與金星、女命重太陽與火星，戀愛看五宮；事業看十宮與天頂主星、六宮日常工作與土星；財運看二宮（自己賺）、八宮（他人之財與債務）、十一宮（收益）、木星與福點；健康看一宮、六宮及其宮主與受剋行星。應期以年度小限走到題宮或其宮主所在宮、該年主星在太陽回歸盤的狀態，配合行運與次限月亮觸及題宮宮主論。',
    liuren:'依大六壬正統推演：排天地盤、四課、三傳與天將，依課體（賊剋、比用、涉害、遙剋、昴星、別責、八專、伏吟、返吟）定發用；以日干為問卜的人、日支為所問的對方或事，論干支上神、三傳生剋遞進、天將吉凶、旺相休囚與空亡，判事情的起頭、過程與結果；應期取三傳與用神所在之支，及沖合空填之日。依原題取類神：婚姻古法不論誰來問都以干為男方、支為女方，青龍為夫、天后為妻，男占兼看妻財、女占兼看官鬼，六合主媒合，干支上神生合則成、刑沖剋害則難；求財看妻財與青龍；官職功名看官鬼與青龍（文）、太常（武）；文書考試看朱雀與父母；子女看子孫與六合；疾病看白虎與官鬼，子孫為醫藥；失物盜賊看玄武；訴訟看勾陳、朱雀與官鬼。類神入課傳、旺相不空則事實，空亡墓絕則虛。天將分吉凶：貴人、六合、青龍、太常、太陰、天后是吉將，螣蛇、朱雀、勾陳、天空、白虎、玄武是凶將；吉將旺相不空才助事，凶將乘旺又克日干才為害，不把吉將讀成凶事。',
    liuyao:'依京房納甲及《增刪卜易》《卜筮正宗》正統推演：依原題取用神，世爻為己、應爻為彼；論用神旺衰（月建、日辰的生剋沖合）、動變（化進化退、回頭生剋）、原神忌神仇神、飛伏、旬空月破、六沖六合與三合局，判吉凶與程度；應期依用神旺衰、動靜、空破、合沖之正統取法定出。各類用神：婚姻男占取妻財、女占取官鬼；求財取妻財，子孫為財源、兄弟為劫財；工作功名取官鬼，父母為文書；考試取父母與官鬼；疾病以官鬼為病、子孫為醫藥，問誰的病就取代表那個人的六親；子女取子孫；長輩、房屋、契約取父母；朋友同輩取兄弟；出行看世爻；失物取妻財。',
    yijing:'依朱子《易學啟蒙》考變占法推演：依本次變爻數取占辭（本卦卦辭、本卦變爻辭、之卦卦辭或之卦不變爻辭），參合彖傳、象傳與爻位，判現在的處境與進退之道。依原題把占辭落到實事：辭裡的利與不利、往與來、吉凶悔吝，對應他問的那件事該進、該守還是該退；只有本次選到爻辭才以爻位（初為事之始、二五居中、上為事之終，得位得中與否、有無應與）看事情的進退次序。把本次主辭與參照的傳文分開，同一句在不同表格出現只算一個依據。',
    meihua:'依邵雍《梅花易數》正統推演：動爻所在之卦為用、不動之卦為體，論本卦體用生剋與當令旺衰，互卦看過程，變卦看結局，參看動爻爻辭與卦象取象；應期依卦氣、體用之數與事情遲速定出。體為自己、用為所問之事或對方：用生體、體用比和為吉為得，體剋用可成但費力，用剋體為凶為損，體生用為耗洩；婚姻以用生體易成，求財以體剋用或用生體有得，疾病最忌用剋體；並以八卦萬物類象取人、物與方位。以原來的體卦比較本、互、變的先後；同一卦數可用不同時間單位，未定單位時只談階段與可觀察的轉折。',
    name:'依姓名學正統推演：先看音、形、義與使用場合，再論五格數理、三才配置、生肖與生辰喜用、姓名卦；比較多個名字時用同一版本與筆畫依據。依原題取用：問事業與一生主軸看人格與總格，問人際與外來助力看外格，問早年與家庭根基看天格與地格，問身心與順逆看三才是否相生；取名改名要回到本人生辰喜用與實際使用是否方便。這個方法論的是名字本身，不定應期，也看不出他最近發生什麼事或心裡在想什麼：回覆要把音形義、五格、三才、兩套筆畫的差別、姓名卦，以及有資料時的生肖與生辰喜用，各自支持或牽制什麼講清楚，不拿名字去推他眼前的心情與事件。讀音尚待本人確認時，指出哪個候選讀音會改變聲調或諧音；兩套筆畫評價不同時交代差異出在哪一格。',
    compat:'依子平合婚正統推演：先各自定命局格局與喜用，再看雙方日柱干支的合沖、夫妻宮互動、彼此五行對對方喜忌的補益或剋洩，以及雙方大運流年是否同步，論相處、互補與時機。相處看彼此日干是對方的什麼十神（財、官、印、食傷或比劫，定出誰讓誰、誰管誰、誰付出），各自配偶星的狀態，以及對方是否正是自己命中配偶星的樣貌；婚期與關係關卡取雙方大運流年同時引動夫妻宮或配偶星的年份。',
    personality:'依本站五軸生日模型，挑與原題有關的軸，說清該軸採用哪項輸入。用具體情境示範這種傾向何時幫得上忙、何時容易卡住；請本人用自己的做法核對。沒有實際行為或量表分數時，不把模型類型當成心理測驗結果。',
    tarot:'依偉特（RWS）正統推演：依本次牌陣每個牌位的意義讀該位置的牌（正逆位依實際記錄）。每張牌的意思依下方標示的牌義版本，逆位牌列的已經是它的逆位義；你熟悉的其他流派或通行說法與表上不同時，用表上的，不混用，也不把表上沒有的意思加給這張牌。再依牌陣的讀法鏈把牌串成完整敘事；參看大牌、花色元素、數字與宮廷牌在整組中的比重，判吉凶、程度與建議；以本陣實際的時間位說先後；只有另外記錄時間對應與單位時，才引用該口徑。整組牌先看比重：聖杯多主情感、權杖多主行動與事業、寶劍多主衝突與思慮、錢幣多主金錢與實務，大牌多表示事情不全由本人作主，一張大牌都沒有表示事情多半是日常層面、還在本人手上。',
    lenormand:'依雷諾曼正統推演：依本次牌陣的幾何（線陣的前後、九宮與大牌陣的房屋、近遠、鏡像、騎士步與對角）把相鄰牌組合成句，以代表牌與題目主題牌為中心；快慢依牌的性質與距離判斷。主題牌：感情看心（24）與戒指（25），當事男女看 28 與 29 號人物牌；工作看狐狸（14）或錨（35），名聲看月亮（32）；金錢看魚（34）與熊（15）；健康看樹（5）；消息文件看騎士（1）與信（27）。主題牌出現時，讀它四周及通往代表牌的實際連線；主題牌未抽到就依該陣已發出的牌位作答，雙路選擇只比較各自支線與共同背景。',
    ootk:'依金色黎明 Book T 開鑰之法正統推演：不讀正逆位，牌力由相鄰牌的元素尊貴決定；五輪依序以代表牌所落之堆（第一輪四字母堆）、宮（第二輪十二宮）、星座（第三輪）、三十六牌環（第四輪，依原稿以計數與 1↔36 配對推演，不換算旬或日期）、質點（第五輪生命之樹），連同整條計數路徑與配對敘事，讀出事情的現況、發展、處境、推演與結局，最後合成結論。問成不成、是不是的題，結論以第五輪的結局為主，前四輪用來說明過程；各輪吉凶相反時照這個先後定，相反的那一輪寫進反證那一行。',
    mathers:'依 Mathers《The Tarot》(1888) 原書推演：依該書的發牌與配對程序（第一法馬蹄依 A、C、E 組讀組內故事與首尾配對；第三法 66 張依大圓與代表牌），每張牌依本次正逆位取原書牌義，把組內與配對串成完整敘事，判吉凶、程度與建議。',
    oracle:'依本次廟本解籤，先選最切原題的一句，說明其中的處境、轉折或成立條件，再與本題事項的附記及籤解核對。若全詩偏吉而所問事項要等，說明眼前要等的是什麼。典故只有題名時，只可點出題名，回到籤句解意；籤上時間字保留其原有尺度。'
  };;
  const rules=[
    '用台灣繁體中文，像一位細心聽他說話的命理師，當面回覆這個人。第一句用自然、不叫名字的稱呼接住他的問題，性別輩分未明就用中性稱呼。用手機好讀的短段落，不用標題、粗體、條列或引號強調。不必自稱有多年資歷。讓關心落在他明說的取捨：說清一個判斷對他意味著什麼，不替他命名情緒。',
    '第一段直接斷原題。稱呼後點出本盤最切題的一處，按末段「本題起斷」的取法說清作用與所問結果。遇到行為得失、免禍或單方傾向，先辨它能否回答成事、得財或交往。能定方向就直斷，沒有成象就明講，不能一律回有機會。每個主要判斷串起原題的一個細節、可點名的盤面落點，以及這個落點在此情境為何支持該方向。同源只算一次。兩處證據有分歧，辨明是不同人、不同階段還是真的相抵。好壞照實，講方向、程度、成立條件和何時改判，不用線索數換算機率。',
    '只用本次原題與下列實算資料，不補造盤面沒有的資料。本人補充照原意取用。分清本人觀察、願望、轉述、待確認事項及象徵推測。已知事實優先，現實相反就修正解讀。原題沒交代的過去、個性、第三人的心思都留待核對；不要引用帳號記憶或舊對話。沒有關鍵資料就說清缺什麼，接著回答其餘有依據的部分。醫療、法律、財務決定配合實況與專業意見。'
  ];
  const baziEvidence='先依日主、月令及透藏看格局。格局順逆、扶抑與調候分別說明，有衝突就交代條件。計數只描述分布，同一關係不重複計票。神煞和五行缺項不能單獨判吉凶。問句預設、古訣子數與象徵都不能當成已發生的事。';
  const ziweiEvidence = '只讀本包已列盤面。原題的期待不能用作證據。比較與題目直接相關的星宮組合及不同運限的牽動，同一四化的重述只算一次；把握用定性語句，不換算機率。缺少某一層就說明缺口並繼續回答其餘部分。';
  const footer='[靜月之光蝦皮賣場](https://shopee.tw/a50h95648d?tab=shop)\n願你諸事順遂。';
  const closingReminder='【下筆前最後確認】依序交付對他說的話（含對照）、我怎麼看出來的、手鍊段及最後三行。@@STYLECHECK@@。理由要找得到本盤落點；現況只引用本人說過的事；未有時點不指定日期。首段寫明本盤落點及其象義。只推薦一款能交代五行取法的手鍊。';
  /* 2026-11-12 root92：品類順序依題目文字打散。原本固定順序加上一串舉例，四份真實回答有三份都推海藍寶。 */
  /* 2026-11-16 deep112：使用者要求手鍊必須真的從命盤推出來。改成五行配色（傳統取象）：程式依方法告訴 AI 從盤上取哪一個五行，再從該五行的材質裡選，並要它講出盤面依據。 */
  const BRACELET_CATS=["木（綠）—綠幽靈", "火（紫、粉、紅）—紫水晶、粉晶、草莓晶、摩根石", "土（黃、褐）—黃水晶、虎眼石、茶晶、煙晶", "金（白、金、鐵）—白水晶、鈦晶、月光石、天鐵", "水（黑、藍、海）—黑曜石、黑碧璽、海藍寶、青金石、藍紋瑪瑙、拉長石、龍宮舍利"];
  const THEME_BASIS='這個方法沒有五行可取，依這次最需要照顧的那件事的性質取：要穩、要守取土，要決斷、要護身取金，要沉靜、要放下取水，要重新開始、要生長取木，要熱度、要表達取火',SEVEN='太陽、火星屬火，月亮、水星屬水，木星屬木，金星屬金，土星屬土，羅睺與計都隨它們的定位星';
  const BRACELET_BASIS={bazi:'取你依本盤旺衰、格局與調候定出的喜用神五行，並在第二部分寫出喜用是怎麼定的；喜用不只一個時，取其中正好是所問之事那個十神的五行（問感情，男取財、女取官殺；問錢取財；問工作取官殺；問學業取印；問表現與作品取食傷），都不是時取格局最先要的那一個',compat:'取你依提問者本人命局定出的喜用神五行',ziwei:'取所問宮位主星的五行（紫微、天府、天梁屬土，天機、貪狼屬木，太陽、廉貞屬火，武曲、七殺屬金，天同、太陰、巨門、天相、破軍屬水；空宮用借來的對宮主星）',vedic:'取所問宮位宮主星的五行（'+SEVEN+'）',astro:'取所問宮位宮主星的五行（'+SEVEN+'）',liuren:'取能生日干的五行',liuyao:'取能生用神的五行',meihua:'取能生體卦的五行',tarot:'取整組牌裡最少或沒有出現的元素（權杖火、聖杯水、錢幣土、寶劍風，風配金）；一樣多時取結果位那張牌的元素',ootk:'取代表牌的元素所缺的助力：看最後一輪結局牌的元素（權杖火、聖杯水、錢幣土、寶劍風，風配金）',mathers:'取整組牌裡最少或沒有出現的元素（權杖火、聖杯水、錢幣土、寶劍風，風配金）',name:'資料裡有生辰喜用時取喜用五行；沒有時，'+THEME_BASIS};
  const shuffledCats=q=>{let h=2166136261;const t=String(q||'');for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}const a=BRACELET_CATS.slice();for(let i=a.length-1;i>0;i--){h=(Math.imul(h,1664525)+1013904223)>>>0;const j=h%(i+1);const x=a[i];a[i]=a[j];a[j]=x;}return a.join('；');};
  const CLOSING_NOTICE='以上屬傳統象徵解讀，供參考，不保證事件；醫療、法律、財務決定要配合實際資料與專業意見。';
  /* 2026-11-12 vary101：使用者指出回覆「太固定、不像真人講話有變化」。根因是提示詞把每一段的內容、順序、甚至收尾那句話都寫死，模型每次都照同一副骨架填；
     再叫它「要有變化」沒有用。改由程式替每一次解讀抽一組不同的寫法（開場、把握的說法、順序、做法的寫法、收尾、篇幅、手鍊段的切入），
     都是安排而不是句子。同一題同一盤會得到同一組，不同的題或盤就不同。 */
  const STYLE={
    open:['叫他之後不鋪陳，直接進正文。','稱呼後直接用一句話回答原題，連回他寫明的處境；他只問方向時，不替他補背景。','叫他之後先用一兩句講盤上（籤、牌、卦或命盤）最醒目的那個畫面再進正文；不猜他的心情。'],
    address:['稱呼用平輩朋友之間的叫法。','稱呼用自然的「朋友」，接著答原題。','稱呼用親近、把他當自己人的叫法。','稱呼用客氣但不生分的叫法。'],
    conf:['用平常說話的字眼講清楚哪一點最有把握。','不報數字，用程度的說法讓他知道把握有多大。','用條件來講把握：什麼情況下會成，什麼情況下不會。'],
    /* 2026-11-16 free119：使用者指出每一份解讀都是同一套流程。原因是骨架寫死（複述問題→答案與成數→對照→原因→走向→做法），抽籤只換了細節。改成抽整篇的走法，五種骨架差別很大。 */
    order:['從最能定方向的落點說起，再解釋另一處如何支持或牽制。','先把斷語與它的象義說在一起，再說此象能管到哪裡。','首段斷所問結果，依本法確有的時位講先後。','按原題各子題的順序說判斷，各自連回實際落點。','先說主判，再釐清可能讓人讀錯的另一處。'],
    advice:['原題也問做法時，最後接回盤象說一件事。','原題也問做法時，說明哪個象支持進、哪個象支持守。'],
    close:['最後回到他問題裡的那個字眼收住。','最後用盤上那個畫面收住。','最後用一句只對這個人、這一題才成立的肯定收住。','最後回到本盤對原題能斷到的程度。'],
    len:['這一部分寫四百到六百字。','這一部分寫六百到八百字。','這一部分寫八百到一千字。'],
    bracelet:['手鍊段照舊排在「我怎麼看出來的」之後，開頭接回本盤剛才的判斷。','手鍊段照舊排在「我怎麼看出來的」之後，開頭接回盤上的那個畫面。','手鍊段照舊排在「我怎麼看出來的」之後，開頭接回他最放不下的那件事。']
  };
  const CONF_CHECK=['已說明最有把握的一點','講把握的地方沒有出現成數、百分比或任何數字','把握是用成立與不成立的條件講的'],LEN_CHECK=['第一部分數過字數，在四百到六百字之間、分成好幾段','第一部分數過字數，在六百到八百字之間、分成好幾段','第一部分數過字數，在八百到一千字之間、分成好幾段'];
  let lastStyleCheck='';
/* 2026-11-16 deep112：使用者指出真人算命師會先說中個性、選擇或過去的事，讓人覺得準，而我們的回覆只有保守的建議。
     根因：前面為了防 AI 亂編，把所有關於本人的話都要求成推測口氣，結果沒有任何一句可以讓人拿自己的經歷去對。
     傳統論命本來就先「驗盤」：先講盤上寫明的性情與已經過去的運期，對得上再往下論。這裡把這一步加回來，但只准講盤上指得出的、只講領域與性質、不編具體事件。 */
  const NATAL=new Set(['bazi','ziwei','vedic','astro','compat','personality']);
  const verifyFor=m=>'【先讓他對照】'+(NATAL.has(m)?'盤上有可以對照的題宮或運期才寫，經歷由他確認。':'對照主判與參象管的範圍。原題沒有互動經過就留白，不擬對話、回訊或約見情節。');
  const styleFor=(d,steps,sparse)=>{
    let h=2166136261;
    for(const ch of [d.method,d.question,d.styleSalt].join('|'))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;
    const pick=list=>{h=(Math.imul(h,1664525)+1013904223)>>>0;return list[(h>>>8)%list.length];};
    const conf=pick(STYLE.conf),length=pick(STYLE.len);
    lastStyleCheck=sparse?'證據只有一兩處就各說清楚，無須湊字數':CONF_CHECK[STYLE.conf.indexOf(conf)]+'，'+LEN_CHECK[STYLE.len.indexOf(length)];
    return '【本次寫法】'+[pick(STYLE.address),pick(STYLE.open),conf,pick(STYLE.order),steps?pick(STYLE.advice):'原題只問走向就專心斷走向。',pick(STYLE.close),sparse?'不為篇幅反覆重講。':length,'直接寫給他。'].join('');
  };
  const ASK_BRACELET=/手鍊|手串|手珠|水晶|礦石|天鐵|舍利|佩戴|配戴|戴什麼/;
  function wearingIntent(q){
    if(!ASK_BRACELET.test(q))return '';
    if(/(?:哪一|哪種|哪款|什麼|何種).{0,10}(?:手鍊|手串|水晶)|(?:選|戴|推薦).{0,5}(?:哪|什麼|何種)|推薦.{0,5}(?:手鍊|水晶)/.test(q))return 'choose';
    return /這樣如何|這樣好嗎|戴法|這組|這款|戴.{0,15}適合嗎/.test(q)?'current':'';
  }
  const WHOLE_BASIS={bazi:BRACELET_BASIS.bazi,compat:BRACELET_BASIS.compat,ziwei:'取命宮主星的五行（紫微、天府、天梁屬土，天機、貪狼屬木，太陽、廉貞屬火，武曲、七殺屬金，天同、太陰、巨門、天相、破軍屬水；空宮用借來的對宮主星）',vedic:'取上升主星的五行（'+SEVEN+'）',astro:'取上升主星的五行（'+SEVEN+'）'};
  const commercialFor=(q,m)=>(wearingIntent(q)==='choose'?'原題問的就是適合他的手鍊，所以這一題的答案就是選材：第一部分一開始就講出選哪一款、盤上憑什麼定這個五行，前面「手鍊留到第三部分才講」那一句這一題不適用；第三部分只用兩三句收尾，不換成別款。\n':wearingIntent(q)==='current'?'原題問現有戴法。先照實際戴的組合論本盤能辨的五行，不編左右手及手指的作用。\n':'')+'這是第三部分，寫在「我怎麼看出來的」之後。用二到四句，推薦本人佩戴的一款手鍊，不另起標題：先說出這次解讀裡最需要照顧的一件事（必須是前面已經講過的一個結論），再照下面的選材依據從盤上定出一個五行，從那個五行的材質裡選一款，用一句話講出是盤上哪一項讓你定這個五行，講明它只是提醒自己的信物，並接回你剛才斷出的進退。選材依據：'+(((wearingIntent(q)||(m==='ziwei'&&/^完整命盤$/.test(String(q).trim())))&&WHOLE_BASIS[m])||BRACELET_BASIS[m]||THEME_BASIS)+'。五行配材質（五行配色是傳統取象，不是療效；排列沒有先後之分）：'+shuffledCats(q)+'。只挑一款；五行照選材依據直接取，不另外加減判斷，換一個人來照同一張盤也要取到同一個五行，同一個五行裡有幾款時挑最貼近那件要照顧的事的。不說礦物有療效、能改運、能挽回感情或帶來收益，不編庫存、價格、產地、成分與認證，不把凶象說重來促購。他手頭緊或不想買時，告訴他用身邊現有的東西也能當同樣的提醒。最後自然邀他到靜月之光挑喜歡的設計；盤面無效或程序停止時不做命理選材。\n'+closingReminder.replace('@@STYLECHECK@@',lastStyleCheck)+'\n第四部分：手鍊段之後，另起一行原樣輸出這句提醒：\n'+CLOSING_NOTICE+'\n全文最後兩行原樣輸出：\n'+footer;
  function compactObject(v){
    if(Array.isArray(v))return v.map(compactObject);
    if(!v||typeof v!=='object')return v;
    const skip=new Set(['schema','version','sourceAudit','sourceSHA256','sourceSha256','sourceTextSHA256','retrieved','license','policy','disclaimer','scope','encoding','model','basis','note','notes','predictionValidated']);
    return Object.fromEntries(Object.entries(v).filter(([k,z])=>!skip.has(k)&&z!==undefined).map(([k,z])=>[k,compactObject(z)]));
  }
  function briefChecks(rows){return A(rows).filter(p=>affirmative(p.status)||p.established===true||p.matched===true||p.selected===true).map(p=>({name:p.name||p.id,status:p.status??p.established??p.matched,conditions:compactObject(p.conditions||p.checks||[]),missing:p.missing}));}
  function row(cols){return cols.map(x=>x==null?'?':txt(x)).join('/');}
  const nak=n=>n&&n.name?String(n.name).replace(/\s+/g,'')+(n.pada?n.pada:'')+(n.lord?'('+zh(n.lord)+')':''):undefined;
  const NAKS=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','PurvaPhalguni','UttaraPhalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','PurvaAshadha','UttaraAshadha','Shravana','Dhanishta','Shatabhisha','PurvaBhadrapada','UttaraBhadrapada','Revati'],NAKLORD=['計','金','日','月','火','羅','木','土','水'];
  const nakOf=lon=>{if(!Number.isFinite(lon))return null;const w=360/27,i=Math.floor((((lon%360)+360)%360)/w);return NAKS[i]+(Math.floor(((((lon%360)+360)%360)-i*w)/(w/4))+1)+'('+NAKLORD[i%9]+')';};
  const dig=d=>d&&typeof d==='object'?(d.status||d.name||(typeof readable==='function'?readable(d,2):json(d))):d;
  function planetRows(ps,full=true){return Object.entries(ps||{}).map(([k,p])=>row([zh(k),p.signName||signs[p.sign],p.degree??(Number.isFinite(p.longitude)?p.longitude%30:null),p.house,p.retrograde?'逆':'順',full?dig(p.dignity):undefined,full&&p.solar?(['Sun','Rahu','Ketu','NorthNode','SouthNode'].includes(k)||p.solar.combust==null?'距日'+num(p.solar.separationDegrees)+'（燃燒不適用）':'距日'+num(p.solar.separationDegrees)+'燃燒'+txt(p.solar.combust)):undefined,full&&p.nakshatra?nak(p.nakshatra):undefined].filter(x=>x!==undefined))).join('\n');}
  function aspectRows(as){return A(as).map(p=>row([zh(p.a||p.from),zh(p.b||p.to),p.name||p.angle||p.step,p.orb??p.strength,p.phase??p.toHouse,p.toPlanets?.map(zh),p.utc].filter(x=>x!==undefined))).join(';');}
  function period(p){return p&&Object.keys(p).length?zh(typeof p.lord==='number'?signs[p.lord]:p.lord)+' '+interval(p):'未定';}
  function periods(d){if(!d)return '未提供';return [d.system||d.profile||'運期',...['maha','antar','pratyantar'].filter(k=>d.current?.[k]).map(k=>k+'='+period(d.current[k])),...A(d.periods).map(p=>period(p)+(p.children?.length?'('+p.children.map(period).join(';')+')':''))].join('\n');}
  function gua(g){return g?{number:g.number,name:g.fullName||g.name||g.n,lines:g.lines,palace:g.palace}:null;}
  function calendar(c){return P(c,['wall','instant','timezoneOffset','dayBoundaryMode','year','month','day','hour','monthBranch','voidBranches','dayGanzhi','engine','precision']);}
  /* ── 唯一出口的中文化：所有區段的資料（物件、陣列、字串）都經過這裡，鍵名與英文列舉值查同一份對照表；
     純英文的引擎技術附註不送給 AI。新增欄位若漏翻，tests/prompt-zh-lint-20261023.cjs 會失敗。 ── */
  const ZH={"status":"狀態","label":"名稱","name":"名稱","type":"類型","kind":"類別","mode":"模式","role":"角色","domainNotes":"事項附註","premises":"成立前提","reading":"解讀","sourceNote":"版本說明","storyStatus":"典故狀態","storyTitles":"典故","summary":"摘要","startUtc8":"起（UTC+8）","endExclusiveUtc8":"迄（UTC+8，不含）","with":"且","not":"不","in":"在","of":"的","and":"與","to":"到","not-in-favorable-house":"不在有利宮","favorable-house-unobstructed":"有利宮且未受阻","favorable-house-obstructed":"有利宮但受阻","supported-with-pressure":"有撐但有壓","clash-with-support":"沖但有扶","not-performed":"未執行","procedure":"程序","mathers_continuous":"Mathers 連續計數法","countRule":"計數規則","bindings":"預先綁定","procedureProfile":"程序版本","confirmedBeforeDeal":"發牌前已確認","countDirection":"計數方向","right":"右","left":"左","deal_order":"發牌順序","op3Policy":"第三輪政策","strict_inherit_proceed_as_before":"嚴格沿用前一輪做法","courtMapping":"宮廷牌對應","expectedPile":"預期堆","primaryHouse":"主宮","cognateHouse":"同類宮","expectedSign":"預期星座","expectedSephirah":"預期質點","fire":"火堆","water":"水堆","air":"風堆","earth":"土堆","two":"雙牌","three":"三張線","five":"五張線","seven":"七張線","choice":"雙路比較","grand":"大牌陣（4×8＋4）","grand_nines":"大牌陣（4×9）","branches":"多子題分線","entity":"對象","op1":"第一輪","op2":"第二輪","op3":"第三輪","op4":"第四輪","op5":"第五輪","default60-calendar-days":"未給期限，站內預設六十天","question-year":"依原題年份","question-explicit-domain":"依原題明示類別","within-symbolic-month":"象徵月內","within-symbolic-year":"象徵年內","within-xun":"旬內","multiple":"多個","wealth":"財務","stage":"階段","phase":"階段","love":"感情","career":"事業","health":"健康","spiritual":"靈性","relationship":"關係","study":"學業","legal":"法律","finance":"財務","enumeration_guidance":"列舉指引","threshold_verification":"門檻核對","relative_timing":"相對時間","focused":"聚焦","deep":"深入","original_request":"原始請求","needs_revision":"需要修訂","review":"檢查","revision":"修訂","compare":"比較","comparison":"比較","yesno":"是否","direction":"方向","advice":"建議","enumeration":"列舉","reason":"原因","person":"人物","location":"地點","choice":"選擇","state":"現況","realization":"會不會成","bounded_outcome":"結果範圍","trajectory":"後續走向","attention_focus":"注意重點","amount":"數量","count":"數量","rate":"比率","business":"生意","move":"遷移","timing":"時間","cause":"成因","outcome":"結果","obstacle":"阻礙","enabler":"助力","antecedent":"既有影響","timeline":"時間段","environment":"環境","person_aggregate":"對方","person_known":"已知對方","synthesis":"總結","interaction_force":"交叉力量","development":"走向","structural_depth":"結構深度","hidden":"隱藏","external":"外部","pattern":"模式","single_complex":"單一複雜題","deep_overview":"整體深入","earthIndex":"地盤序","earthElement":"地盤五行","sky":"天盤","skyIndex":"天盤序","skyElement":"天盤五行","distinctions":"區分","check":"核對","lexicalUncertainty":"用詞不確定","not-established":"未成立","branchIndex":"地支序","generalIndex":"天將序","generalShort":"天將簡稱","stemIndex":"天干序","elementIndex":"五行序","source":"來源","sources":"來源","note":"備註","notes":"備註","reason":"原因","message":"訊息","method":"方法","policy":"政策","profile":"版本設定","version":"版本","versions":"各版本","value":"值","values":"各值","data":"資料","index":"序","number":"號","position":"位置","positions":"位置","side":"側","text":"原文","line":"爻","lines":"各爻","item":"項目","finding":"所見","support":"支持","caution":"提醒","cautions":"提醒","evidence":"依據","conditions":"條件","criteria":"判準","limits":"限制","errors":"錯誤","warnings":"警示","missing":"缺漏","unavailable":"無法提供","provisional":"暫定","computation":"計算","integrity":"完整性","complete":"完整","partial":"部分","unknown":"未知","none":"無","null":"未定","undefined":"未定","QUERY_EVENT":"原題主事件","CROSS_CHART_DISTRIBUTION_ONLY":"只作跨盤五行分布參考，不論成化","LEGACY_UNVERIFIED":"舊版（來源未核）","MIDNIGHT_00":"午夜00:00換日","ZI_HOUR_23":"23時子初換日","SAME_MONTH":"閏月整月作本月","SPLIT_AT_15":"閏月十五日後作次月","CDI_125":"三才125組（CDI版）","LINGZHAO_125":"三才125組（靈兆版）","IZTRO_261":"iztro 2.6.1四化表","DONGHAI_60_WITH_XIANGSHAN_5_POEM":"東海六十籤附香山五首籤詩","true":"是","false":"否","default":"預設","primary":"主","main":"主","alternative":"替代","alternatives":"候選","alternate":"替代","candidate":"候選","candidates":"候選","selected":"已選","selection":"取用","selections":"取用","target":"目標","targets":"目標","placements":"落位","focus":"焦點","scope":"範圍","topic":"題目類別","question":"問題","input":"輸入","output":"輸出","raw":"原始","model":"模型","module":"模組","system":"系統","schema":"格式","delivery":"交付方式","single":"單則","calculated":"已算","verified":"已核","recorded":"已記錄","established":"成立","structural":"結構成立","insufficient":"資料不足","matched":"符合","unique":"唯一","eligible":"適用","ineligible":"不適用","available":"可用","supported":"有撐","unsupported":"沒撐","obstructed":"受阻","unobstructed":"未受阻","incomplete":"未完成","completed":"已完成","notCompleted":"未完成","unresolved":"未決","unconfirmed":"未確認","explicit":"明示","given":"已給","named":"具名","historical":"史上","residual":"殘留","tied":"並列","winner":"勝出","tier":"等級","benefic":"吉","malefic":"凶","natal":"本命","native":"原生","universal":"通用","personal":"個人","baseline":"原名","baseline_field":"原名欄位","time":"時間","date":"日期","dates":"日期","day":"日","days":"日","month":"月","monthly":"每月","year":"年","years":"年","hour":"時","utc":"世界時","instant":"時刻","start":"起","end":"迄","startDate":"起日","endDate":"迄日","endDateInclusive":"迄日（含）","endExclusive":"迄（不含）","endExclusiveUtc":"迄（世界時，不含）","startUtc":"起（世界時）","originalStartDate":"原起日","window":"區間","interval":"區間","calendarDays":"天數","inspected":"已檢查日數","timezone":"時區","timezoneOffset":"時區差","displayTimezone":"顯示時區","timeBasis":"時間基準","reference":"參照","referenceInstant":"參照時刻","referenceUTC":"參照世界時","referenceJieDate":"參照節氣時刻","birthInstant":"出生時刻","civil":"民用時間","clock":"時鐘","calendar":"曆法","seasonal":"季節","dayBoundaryMode":"換日方式","annualBoundary":"換年依據","trueSolarTimeApplied":"已用真太陽時","sixty":"六十","part":"段","gender":"性別","male":"男","female":"女","qiyun":"起運","startAgeText":"起運歲數","direction":"方向","backward":"逆行","forward":"順行","commander":"人元司令","gan":"天干","zhi":"地支","ganzhi":"干支","elapsedDaysAfterJie":"交節後天數","pillar":"柱","pillars":"四柱","stem":"天干","branch":"地支","branches":"地支","hidden":"藏干","tenGod":"十神","element":"五行","elements":"五行","strength":"強弱","roots":"根","rootKind":"根的類型","kongwang":"空亡","changsheng":"長生","dayMaster":"日主","dayMasters":"日主","favorable":"喜","unfavorable":"忌","mainQi":"本氣","transformationStatus":"化合狀態","clash":"沖","combine":"合","harm":"害","destruction":"破","same":"伏吟","punishes":"刑出","punishedBy":"被刑","clashedBy":"被沖","yang":"陽","classicalAdjudication":"古法裁決","classicalBalance":"古法平衡","schoolCompletion":"流派完成度","luckTimingProvisionalA":"甲方運限暫定","luckTimingProvisionalB":"乙方運限暫定","unknownTimeA":"甲方時辰未知","unknownTimeB":"乙方時辰未知","hourRelationsExcluded":"時柱關係不計","aDayPillar":"甲方日柱","bDayPillar":"乙方日柱","aToB":"甲對乙","bToA":"乙對甲","aViewsB":"甲看乙","bViewsA":"乙看甲","roleA":"甲方角色","roleB":"乙方角色","currentA":"甲方現運","currentB":"乙方現運","spousePalace":"夫妻宮","stemRelation":"天干關係","branchRelations":"地支關係","relation":"關係","relations":"關係","control":"剋","controlled":"被剋","scenario":"情境","participants":"人物","kinship":"六親","transmission":"傳","transmissions":"三傳","edges":"走向","edgeLegend":"圖例","ganUpper":"干上神","zhiUpper":"支上神","ganToZhi":"干上神對支上神","scales":"取期規則","topicRules":"分類占法","interpretationScope":"解讀範圍","readingScope":"讀法範圍","void":"旬空","empty":"旬空","combinations":"合局","transformations":"化合","activePositions":"動位","assessmentLine":"評估爻位","changed":"變卦","original":"本卦","hexagram":"卦","judgment":"卦辭","image":"象辭","greatImage":"大象","lineImages":"小象","tuan":"彖辭","movingLine":"動爻","nameGua":"姓名卦","analysis":"分析","structure":"結構","spread":"牌陣","drawProcedure":"抽牌程序","eventGroups":"事件分組","eventId":"事件代號","sourceProfile":"牌義版本","rws_reversals":"偉特正逆位","commonContext":"共同背景","activeCards":"牌序","countingPath":"計數路徑","keyCards":"關鍵牌","pairs":"配對","significator":"代表牌","poem":"籤詩","cast":"起卦","groups":"組","surname":"姓氏","purpose":"用途","strokeBasis":"筆畫依據","kangxi":"康熙","modern":"現代","sancaiProfile":"三才版本","sanCai":"三才","configuration":"配置","readingConfirmation":"讀音確認","toneSequence":"聲調","grids":"五格","yinYang":"陰陽","differences":"差異","alternateBasis":"替代依據","char":"字","candidateNames":"候選名","nameIndex":"名序","zodiac":"生肖","chartPurpose":"盤的用途","chartType":"盤類型","houseSystem":"宮制","orbs":"容許度","minorOrbs":"次要相位容許度","angle":"角度","angles":"四角","aspect":"相位","aspects":"相位","angleAspects":"四角相位","overlay":"疊盤","orb":"容許度","symbol":"符號","cusps":"宮頭","obliquity":"黃赤交角","ramc":"赤經天頂","positionPolicy":"入宮規則","latitude":"緯度","longitude":"經度","location":"地點","sign":"星座","signName":"星座","house":"宮","degree":"度","planets":"行星","lord":"宮主","lagna":"上升","annualLagna":"年度上升","muntha":"年度穆塔","fromAnnualLagna":"從年度上升起算","yearLord":"年主","yearHouse":"年度宮","yearOfLife":"歲次","dasha":"大運","maha":"主運","antar":"副運","pratyantar":"次副運","vimshottari":"毗紹塔里大運","ashtottari":"阿什托塔里大運","profileDependent":"視版本而定","applicability":"適用性","rahuKendraTrineFromLagnaLord":"羅睺在上升主星角宮或三方","dayKrishnaOrNightShukla":"日生虧月或夜生盈月","nakshatra":"月宿","bphs":"帕拉薩拉經典","calculations":"計算","moolatrikona":"根本三方","exalted":"入廟","debilitated":"落陷","neutral":"中性","friend":"友宮","enemy":"敵宮","own":"自宮","node":"交點","kendra":"角宮","dispositor":"定位星","mean":"平均","lahiri":"拉希里歲差","whole":"整宮","polarity":"極性","nature":"性質","loss":"損","marriage":"婚姻","storage":"儲存","translation":"譯法","title":"標題","key":"鍵","uncertainty":"不確定性","pressure":"有壓","harmless":"無害","initial":"初","general":"一般","domain":"領域","tarot":"塔羅","lenormand":"雷諾曼","ootk":"開鑰之法","oracle":"靈籤","bazi":"八字","ziwei":"紫微","vedic":"印度占星","astro":"西洋占星","liuyao":"六爻","liuren":"六壬","meihua":"梅花","yijing":"易經","compat":"合盤","personality":"五軸","nine":"九","remain":"保留","grave":"墓","variants":"異派","separately":"另行","ageEnd":"迄歲","ageStart":"起歲","caveat":"附註","computed":"已算","conditional":"有條件","dignities":"尊貴","from":"自","mutual":"互","outside":"範圍外","relative":"相對","rule":"規則","use":"用"};
  const URL_RE=/https?:\/\/\S+/g,CODE_RE=/(?<![A-Za-z0-9-])[a-z][A-Za-z0-9_]{2,}(?:-[A-Za-z0-9_]+)*(?![A-Za-z0-9])/g;
  // 牌陣代號一律查引擎自己的方法登記（名稱以引擎為準），不在這裡另抄一份。
  const methodLabel=w=>{const m=root.JYTarotFoundation?.METHODS?.[w];return m&&m.label?m.label:null;};
  // 同一個英文字在不同方法裡意思不同時，以方法專屬對照優先（例：zodiac 在占星是黃道、在姓名學是生肖）。
  const ZH_BY_METHOD={astro:{zodiac:'黃道',sign:'星座',house:'宮'},vedic:{zodiac:'黃道'},name:{zodiac:'生肖'},bazi:{sign:'記號'},liuren:{earth:'地盤',sky:'天盤',general:'天將'},liuyao:{hidden:'伏神','hidden-only':'用神不上卦、只見伏神',flightRelation:'飛伏關係'}};
  const PLANET_ZH={Sun:'太陽',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星',Rahu:'羅睺',Ketu:'計都',Uranus:'天王星',Neptune:'海王星',Pluto:'冥王星',NorthNode:'北交點',SouthNode:'南交點'};
  ZH['question-date-range']='原題明示的日期範圍';
  let zhMethod='';
  const zhWord=w=>{const o=ZH_BY_METHOD[zhMethod];if(o&&Object.prototype.hasOwnProperty.call(o,w))return o[w];return Object.prototype.hasOwnProperty.call(ZH,w)?ZH[w]:methodLabel(w)||w;};
  function zhText(str){
    str=String(str);
    if(!/[\u3400-\u9fff]/.test(str)&&str.trim().split(/\s+/).filter(w=>/[A-Za-z]{2,}/.test(w)).length>=4&&!URL_RE.test(str)){URL_RE.lastIndex=0;return '（引擎技術附註略）';}
    URL_RE.lastIndex=0;
    const parts=str.split(/(https?:\/\/\S+)/);
    const tr=w=>{const o=ZH_BY_METHOD[zhMethod];return o&&Object.prototype.hasOwnProperty.call(o,w)?o[w]:null;};
    const tr2=w=>tr(w)||(Object.prototype.hasOwnProperty.call(ZH,w)?ZH[w]:methodLabel(w)?methodLabel(w):/-/.test(w)?w.split('-').map(x=>Object.prototype.hasOwnProperty.call(ZH,x)?ZH[x]:x).join(''):w);
    // 每一段非網址文字各自翻譯與清除殘留代號；網址段原樣保留（先前整段清除會把網址裡的英文字刪掉）。
    const fix=seg=>seg.replace(/(?<![A-Za-z0-9_])[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+(?![A-Za-z0-9_])/g,w=>Object.prototype.hasOwnProperty.call(ZH,w)?ZH[w]:w).replace(/(?<![A-Za-z0-9-])[a-z][A-Za-z0-9_]*(?:-[A-Za-z0-9_]+)*(?![A-Za-z0-9])/g,w=>w==='to'?'到':w.length<3&&!/-/.test(w)?w:tr2(w)).replace(/(?<![A-Za-z])(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Rahu|Ketu|Uranus|Neptune|Pluto|NorthNode|SouthNode)(?![A-Za-z])/g,w=>PLANET_ZH[w]).replace(CODE_RE,'').replace(/[：；、／]\s*(?=[；、／）\n]|$)/g,'').replace(/（\s*）/g,'').replace(/[ \t]{2,}/g,' ');
    return parts.map((seg,i)=>i%2?seg:fix(seg)).join('');
  }
  // 站內免責附註（不是古籍原文）在出口逐句移除，事實部分保留；古籍、規則區與正統取法不經過這裡。
  const DISCLAIMER=/事件保證|不保證|不等於(?:生活)?事件|不等於已|不當(?:獨立|事件)|不得單憑|不能斷言|不能換算|不能由理論|不能挑未列|不作額外吉凶依據|不能凌駕|不以符號保證|不代表雙方已有|須與現實處境合參|不能只取其中|不能當独立票數|不預測胎兒性別/;
  function stripDisclaimers(str){return String(str).split('\n').map(line=>line.split(/(?<=[；。])/).filter(cl=>!DISCLAIMER.test(cl)).join('').replace(/[；，]\s*$/,'')).filter((l,i,arr)=>l.trim()||!arr[i]).join('\n');}
  function zhScalar(v){if(v===true)return '是';if(v===false)return '否';if(v===null||v===undefined)return '未定';if(typeof v==='number')return String(num(v));return zhText(v);}
  function readable(v,depth){
    depth=depth||0;
    if(v===null||typeof v!=='object')return zhScalar(v);
    if(Array.isArray(v)){
      const items=v.filter(x=>hasData(x));
      if(items.every(x=>x===null||typeof x!=='object'))return items.map(zhScalar).filter(x=>String(x).trim()).join('、');
      if(items.every(Array.isArray))return items.map(r=>r.map(x=>x!==null&&typeof x==='object'?readable(x,depth+2):zhScalar(x)).join('／')).join(depth?'；':'\n');
      return items.map(x=>readable(x,depth+1)).join(depth?'；':'\n');
    }
    const parts=Object.entries(v).filter(([k,x])=>hasData(x)&&k!=='id').map(([k,x])=>{const r=readable(x,depth+1),nested=x!==null&&typeof x==='object'&&!Array.isArray(x);if(!String(r).trim())return '';const lab=zhWord(k)!==k?zhWord(k):zhText(k);return (lab?lab+'：':'')+(nested&&depth>0?'（'+r+'）':nested?'\n'+r.split('\n').map(l=>'  '+l).join('\n'):r);});
    return parts.filter(Boolean).join(depth?'；':'\n');
  }
  // 子平論子息：照正統順序寫成句子（子星→落位→時柱子女宮→生扶制剋→已成立作用→古訣子數→運限觸動）。
  function renderChildren(ch){
    const PL={year:'年',month:'月',day:'日',hour:'時'},QI={main:'本氣',middle:'中氣',residual:'餘氣'};
    const pos=x=>PL[x.pillar]+(x.visible?'干':'支')+x.stem+x.god+(x.visible?'（透）':'（藏，'+(QI[x.qi]||'')+'）');
    const rel=r=>[r.clash&&'沖',r.harm&&'害',r.combine&&'合',r.destruction&&'破'].filter(Boolean).join('、');
    const L=[];
    A(ch.branches).forEach(br=>{
      L.push((br.gender==='male'?'男命':'女命')+'子星：'+(br.gender==='male'?'剋日干者（官殺）':'日干所生者（食傷）')+'，五行'+br.targetElement+'，陽干'+br.targetYang+'（依《三命通會》卷七論六親）');
      if(A(br.placements).length)L.push('子星落位：'+br.placements.map(pos).join('、')+'；透'+(br.visibleCount??0)+'、有根'+(br.rootCount??0)+(br.monthlyMainMatches?'；月令本氣即子星':''));
      if(A(br.supporters).length)L.push('生扶子星：'+br.supporters.map(pos).join('、'));
      if(A(br.controllers).length)L.push('制剋子星：'+br.controllers.map(pos).join('、')+(A(br.controlCandidates).length?'（'+br.controlCandidates.map(cc=>cc.stems+(cc.samePillar?'同柱':'隔'+cc.distance+'位')).join('、')+'；實際力量依季節、透藏、全局制化與救應判）':''));
      const est=A(br.actualMechanisms).filter(m=>m.status==='established'||m.status==='structural').map(m=>m.name);if(est.length)L.push('已成立作用：'+est.join('、'));
      const ct=br.count;if(ct&&ct.stage)L.push('古訣子數：子星陽干'+ct.targetYang+'在時支為「'+ct.stage+'」；'+A(ct.tables).map(t=>({yuanhai:'《淵海子平》子息歌',['ziping-xu']:'《子平真詮評註》'}[t.profile]||t.profile)+'數'+(t.rawNumber??'—')+(t.historicalRetainedNumber!=null?'、養位留'+t.historicalRetainedNumber:'')).join('；')+'（古訣數指男孩或生養之數，非今生親生總數）');
      const lk=A(br.luck).filter(d=>d.targetStem||A(d.targetHidden).length||d.controllerStem||d.supportStem||rel(d.hourRelations||{})).map(d=>d.gz+'運（'+d.ageStart+'–'+d.ageEnd+'歲'+(d.isCurrent?'，當期':'')+'）：'+[d.targetStem&&'子星透干',A(d.targetHidden).length&&'子星藏支',d.supportStem&&'生扶子星',d.controllerStem&&'制剋子星',rel(d.hourRelations||{})&&'與時支'+rel(d.hourRelations)].filter(Boolean).join('、'));
      if(lk.length)L.push('大運觸動：'+lk.join('；'));
      const an=A(br.annuals).filter(y=>y.targetStem||A(y.targetHidden).length||rel(y.hourRelations||{})).map(y=>y.year+y.gz+'：'+[y.targetStem&&'子星透干',A(y.targetHidden).length&&'子星藏支',rel(y.hourRelations||{})&&'與時支'+rel(y.hourRelations)].filter(Boolean).join('、'));
      if(an.length)L.push('流年觸動：'+[...new Set(an)].join('；'));
    });
    const h=ch.hour;if(h)L.push('時柱（子女宮）：'+h.gan+h.zhi+(A(h.relations).filter(r=>rel(r)).length?'；與'+h.relations.filter(r=>rel(r)).map(r=>PL[r.from]+'支'+r.branches+rel(r)).join('、'):'；與年月日支無沖害合破'));
    if(A(ch.sourceVariants).length)L.push('版本差異：'+ch.sourceVariants.join('；'));
    return L.join('\n');
  }
  function createContext(e,data){
    const b=[],prefix=e.label?e.label+' · ':'';
    const section=label=>data.sections.find(s=>s.label===prefix+label)?.data;
    const displayPrefix=e.label&&data.sourceCoverage?.requestedRecords>1?e.label+'／':'';
    const add=(label,v,priority=0)=>{zhMethod=e.method;if(hasData(v))b.push({label:displayPrefix+label,value:/規則來源/.test(label)?(typeof v==='string'?v:json(v)):stripDisclaimers(typeof v==='string'?zhText(v):readable(v)),priority,method:e.method});};
    return {e,data,b,section,add,c:e.chart,a:e.analysis};
  }
  function bazi(ctx){const{c,a,section:s,add}=ctx,core=s('四柱、節令與換日依據')||s('三柱與未知時辰界線')||{},st=s('旺衰、格局與制化')||{};
    add('定盤設定',{gender:core.gender||c.gender||null,calendar:P(c.calculationPolicy,['birthInstant','dayBoundaryMode','annualBoundary','trueSolarTimeApplied','timezoneOffset','referenceInstant']),qiyun:a.coverage?.provisional?null:{...P(c.qiyun,['startAgeText','startUtc','direction','referenceJieDate']),'大運歲數':'起運足歲整數起列，每步十年，以交運日期分段','起運算法':'按原始出生瞬間到節氣的分鐘差折算（三日一年）','交運時間（UTC+8）':c.qiyun?.startUtc8},commander:P(c.renyuan,['gan','elapsedDaysAfterJie']),unknown:!!a.coverage?.provisional});
    if(!a.coverage?.provisional&&Number.isFinite(c._birthTimestamp)){
      add('排盤採用的出生鐘面（'+(c.calculationPolicy?.trueSolarTimeApplied?'真太陽時':'民用時')+'）',
        new Date(c._birthTimestamp).toISOString().slice(0,19).replace('T',' '));
    }
    /* deep113：走過的大運與近十年流年寫成句子（十神、與原局四支的沖合、是否屬喜忌），供「先讓他對照」用。 */
    {const G='甲乙丙丁戊己庚辛壬癸',Z='子丑寅卯辰巳午未申酉戌亥',GE='木木火火土土金金水水',MAIN={子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'},SH={木:'火',火:'土',土:'金',金:'水',水:'木'},KE={木:'土',土:'水',水:'火',火:'金',金:'木'},CH={子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'},HE={子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
      const dm=core.dm||c.dm||'',di=G.indexOf(dm),el=g=>GE[G.indexOf(g)]||'';
      const god=g=>{const i=G.indexOf(g);if(di<0||i<0)return '';const a=el(dm),b=el(g),same=(di%2)===(i%2);return a===b?(same?'比肩':'劫財'):SH[a]===b?(same?'食神':'傷官'):KE[a]===b?(same?'偏財':'正財'):KE[b]===a?(same?'七殺':'正官'):(same?'偏印':'正印');};
      const nat=A(core.pillars||a.pillars).map(p=>({label:String(p.label||'').replace(/柱$/,''),zhi:p.zhi})).filter(p=>p.zhi);
      const J=v=>Array.isArray(v)?v.filter(x=>typeof x==='string'):[],fav=J(c.fav),unf=J(c.unfav);
      const tag=e=>fav.includes(e)?'喜':unf.includes(e)?'忌':'';
      const one=gz=>{const g=gz[0],z=gz[1],hit=nat.filter(p=>CH[p.zhi]===z).map(p=>'沖'+p.label+'支'+p.zhi).concat(nat.filter(p=>HE[p.zhi]===z).map(p=>'合'+p.label+'支'+p.zhi));
        return gz+'：天干'+g+'（'+el(g)+tag(el(g))+'）是'+god(g)+'，地支'+z+'本氣'+MAIN[z]+'（'+el(MAIN[z])+tag(el(MAIN[z]))+'）是'+god(MAIN[z])+(hit.length?'，'+hit.join('、'):'');};
      const cyc=A(c.qiyun?.cycles),cur=Number(String(c.calculationPolicy?.referenceInstant||'').slice(0,4))||new Date().getFullYear(),by=Number(String(c.qiyun?.startDate||'').slice(0,4))-(Number(c.qiyun?.age)||0);
      if(di>=0&&!a.coverage?.provisional&&cyc.length){const L=[],past=cyc.filter(k=>k.startYear<=cur&&/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/.test(k.gz||''));
        if(past.length)L.push('走過的大運（含現行）：'+past.map(k=>k.startYear+'到'+k.endYear+'年 '+one(k.gz)).join('；')+'。');
        const ys=[];for(const d of A(c.dayun))for(const y of A(d.liuNian)){
          if(y.year<cur-10||y.year>=cur||!y.gz)continue;
          ys.push(y.year+'年（'+d.gz+'運'+(y.partialStart||y.partialEnd?'，適用 '+interval(y.window):'')+'）'+one(y.gz));
        }
        L.push('近十年流年：'+ys.join('；')+'。'+(fav.length||unf.length?'括號裡標「喜」「忌」的是對照本命喜忌。':''));
        add('走過的大運與近十年流年（引擎已寫成句；供對照過去用）',L.join('\n'),1);}}
    add('四柱：柱/干支/十神/藏干十神氣/長生/納音',A(core.pillars||a.pillars).map(p=>row([p.label,(p.gan||'')+(p.zhi||''),p.pillar==='day'?'日主':p.god,A(p.hidden).map(h=>h.stem+h.god+'('+h.qi+')'),p.lifeStage,p.nayin])).join('\n'));
    const natal=A(core.pillars||a.pillars);
    if(natal.length){
      const elements=['木','火','土','金','水'], gods=['比肩','劫財','食神','傷官','偏財','正財','七殺','正官','偏印','正印'];
      const counts=new Map([...elements,...gods].map(k=>[k,[0,0]]));
      function count(k,plain,weighted){const v=counts.get(k);if(v){v[0]+=plain;v[1]+=weighted;}}
      for(const p of natal){
        count(p.element,1,10);
        if(p.pillar!=='day')count(p.god,1,10);
        A(p.hidden).forEach((h,i)=>{count(h.element,Number(i===0),[10,6,3][i]);count(h.god,Number(i===0),[10,6,3][i]);});
      }
      add('已知柱結構計數（天干加支本氣／天干加藏干；藏干依序權重1、0.6、0.3；十神排除日干）',
        [elements,gods].map(group=>group.map(k=>k+' '+counts.get(k)[0]+'/'+counts.get(k)[1]/10).join('、')).join('\n'));
    }
    if(a.coverage?.provisional)return;
    const gz=x=>x&&x.gan?x.gan+x.zhi+(x.nayin?'('+x.nayin+')':''):null,kw=core.kongwang||c.kongwang;
    add('命宮胎元身宮與旬空',[gz(core.mingGong||c.mingGong)&&'命宮'+gz(core.mingGong||c.mingGong),gz(core.taiYuan||c.taiYuan)&&'胎元'+gz(core.taiYuan||c.taiYuan),gz(core.shenGong||c.shenGong)&&'身宮'+gz(core.shenGong||c.shenGong),kw?.day&&'日柱旬空'+A(kw.day).join(''),kw?.year&&'年柱旬空'+A(kw.year).join('')].filter(Boolean).join('；'));
    add('神煞落柱：名/柱/字/查法（輔助象義，先論格局喜忌）',A(core.extraShenSha||c.extraShenSha).map(p=>row([p.name,p.pillar,p.char,p.base])).join(';'),1);
    {const sa=st.strengthAssessment||{},PL={year:'年柱',month:'月柱',day:'日柱',hour:'時柱'},pl=x=>PL[x]||x;
      const L=['強弱：'+(sa.level||'')+(sa.integratedDirection?'（'+sa.integratedDirection+'）':'')+(sa.monthSupportClass?'，月令'+sa.monthSupportClass:'')+(sa.lean?'；站內傾向'+sa.lean.direction+'（'+A(sa.lean.basis).join('、')+'）—'+sa.lean.usage:'')+(sa.conflict?'；衝突：'+sa.conflictReason:'')];
      if(A(c.tongGen?.list).length)L.push('通根：'+c.tongGen.list.join('、'));
      const span=(a,b,field)=>{
        const keys=['year','month','day','hour'],i=keys.indexOf(a),j=keys.indexOf(b);
        if(i<0||j<0)return '';
        const between=keys.slice(Math.min(i,j)+1,Math.max(i,j)).map(k=>pl(k)+(c.pillars[k]?.[field]||''));
        return '，間距'+Math.abs(i-j)+(between.length?'，中隔'+between.join('、'):'，貼鄰');
      };
      for(const [group,element] of [['寅卯辰','木'],['巳午未','火'],['申酉戌','金'],['亥子丑','水']]){
        const members=natal.filter(p=>group.includes(p.zhi));
        if(new Set(members.map(p=>p.zhi)).size!==2||!members.some(p=>p.zhi===group[1]))continue;
        members.forEach((p,i)=>members.slice(i+1).filter(q=>p.zhi!==q.zhi).forEach(q=>
          L.push('半會'+element+'：'+p.label+p.zhi+'、'+q.label+q.zhi+span(p.pillar,q.pillar,'zhi')+'；同方兩支，未成三會')));
      }
      A(c.branchInteractions).forEach(b=>L.push('地支'+b.type+'：'+A(b.branches).join('')+'（'+A(b.pillars).map(pl).join('、')+'）'+(b.pillars?.length===2?span(...b.pillars,'zhi'):'')+(b.resultElement?'→'+b.resultElement:'')+(b.transformationStatus?'，'+b.transformationStatus:'')+(b.effect?'—'+b.effect:'')));
      A(c.functionalAssessment?.combinations).forEach(x=>L.push('天干合：'+pl(x.a)+'與'+pl(x.b)+(x.stems?'（'+x.stems+'）':'')+(x.daySelf?'，日主自合':'')+span(x.a,x.b,'gan')+(x.competition?'，爭合':'')+(x.transformationCertified?'，成化':x.removalCertified?'，合去':'，合而不化')));
      const fy=c.fuyiAssessment||{};if(fy.map)L.push('扶抑標記：'+Object.entries(fy.map).map(([k,v])=>k+v).join('、')+(fy.conclusion?'—'+fy.conclusion:''));
      A(fy.mechanisms).forEach(m=>L.push('通路'+(m.type||'')+'：'+(m.action||'')+(A(m.evidence).length?'（'+m.evidence.join('、')+'）':'')+(m.status?'；'+m.status:'')));
      const ms=st.classical?.monthSelection;if(ms)L.push('取格：月令取'+(ms.selectedStem||'')+(ms.selectedGod||'')+'為'+(ms.selectedPattern||'')+'格'+(A(ms.candidates).length?'；候選：'+ms.candidates.map(v=>v.stem+v.god+(v.mainQi?'（本氣）':'')+(A(v.exposed).length?'透'+v.exposed.map(z=>pl(z.pillar)).join('、'):'未透')).join('、'):''));
      add('根氣與制化（引擎已寫成句）',L.join('\n'));}
    let patUse=null;
    const cl=st.classical,pat=cl?.monthSelection?.selectedPattern,dmEl=c.dmEl||({甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'})[c.dm];
    if(pat&&dmEl){const SG={木:'火',火:'土',土:'金',金:'水',水:'木'},KG={木:'土',火:'金',土:'水',金:'木',水:'火'},inv=m=>Object.keys(m).find(k=>m[k]===dmEl),E={比劫:dmEl,食傷:SG[dmEl],財:KG[dmEl],官殺:inv(KG),印:inv(SG)},f=k=>k+'('+E[k]+')';
      const R={正官:['官喜透財以相生、生印以護官；評注：傷官為忌','喜'+f('財')+'、'+f('印')+'；忌傷官('+(()=>{const G='甲乙丙丁戊己庚辛壬癸',i=G.indexOf(c.dm);return i<0?E.食傷:G.split('').find((g,j)=>({0:'木',1:'木',2:'火',3:'火',4:'土',5:'土',6:'金',7:'金',8:'水',9:'水'})[j]===E.食傷&&j%2!==i%2)+E.食傷;})()+'，同五行的食神不在此列)'],財:['財喜食神以相生、生官以護財','喜'+f('食傷')+'、'+f('官殺')],印:['印喜官殺以相生、劫財以護印','喜'+f('官殺')+'、'+f('比劫')],食神:['食喜身旺以相生、生財以護食','喜'+f('比劫')+'、'+f('財')],七殺:['七殺喜食傷以制伏，忌財印以資扶','喜'+f('食傷')+'；忌'+f('財')+'、'+f('印')],傷官:['傷官喜配印以制伏、生財以化傷','喜'+f('印')+'、'+f('財')],陽刃:['陽刃喜官殺以制伏，忌官殺之俱無','喜'+f('官殺')],建祿月劫:['月劫透官以制伏，用財而透食以化劫','喜'+f('官殺')+'；或'+f('財')+'配'+f('食傷')]}[pat];
      const mz=(A(core.pillars||a.pillars).find(p=>/月/.test(p.label||''))||{}).zhi||'',urgent=/[亥子丑]/.test(mz)&&/[金水]/.test(dmEl)?'冬令金水，太寒，調候為急':/[巳午未]/.test(mz)&&/[木火]/.test(dmEl)?'夏令木火，太燥，調候為急':'不屬冬令金水或夏令木火，依評注調候不為急，以月令格局為主、調候為輔';
      if(R){const [likeTxt,hateTxt='']=R[1].split(/；忌/),els=t=>new Set([...String(t).matchAll(/\(([木火土金水])\)/g)].map(m=>m[1]));patUse={good:els(likeTxt),badEl:els(hateTxt),badStem:new Set([...String(hateTxt).matchAll(/([甲乙丙丁戊己庚辛壬癸])[木火土金水]/g)].map(m=>m[1]))};}
      if(R)add('月令格局順逆用法（子平真詮論用神原則換成本盤五行；仍須合調候與成敗救應才定喜忌）',pat+'格：'+R[0]+'。本盤即'+R[1]+'。'+dmEl+'日生'+mz+'月：'+urgent+'。',1);}
    {const ST={'not-present':'無','present':'有','structural-candidate':'輕重看位置','needs-judgment':'要你判'};const KW={formation:'成格條件',failure:'破格',taboo:'所忌',rescue:'救應'};
      add('取格成立與破救（引擎已寫成句）',A(cl?.patterns).filter(p=>p.selected).map(p=>p.name+'格：'+['formation','failure','taboo','rescue'].map(k=>KW[k]+'—'+(A(p[k]).map(r=>r.name+'('+(r.value===true?'有':r.value===false?'無':'?')+(r.status&&ST[r.status]&&ST[r.status]!=='有'&&ST[r.status]!=='無'?'，'+ST[r.status]:'')+')').join('、')||'無')).join('；')).join('\n'),1);}
    const y=s('大運與所問年度');if(y){const decades=A(y.decades).filter(d=>y.range?.all||y.range?.requestedDecades||d.isCurrent||A(y.annualSegments).some(v=>v.dayun===d.gz));add('所問區間大運',decades.map(d=>row([d.gz,d.ageStart+'–'+d.ageEnd+'歲',interval(d.window),d.isCurrent?'當期':''])).join('\n'));/* 2026-11-12：問「今生什麼時候」這類長期題時，原本只給當期與下一步大運，AI 只能說『五十五歲之後資料不完整』。補上其後各步大運的干支與歲數。 */{const cur=A(y.decades).find(d=>d.isCurrent),lastShown=decades.length?Math.max(...decades.map(d=>d.ageStart)):-1,rest=A(y.decades).filter(d=>!decades.includes(d)&&cur&&d.ageStart>cur.ageStart&&d.ageStart>lastShown&&d.ageStart<95);if(rest.length)add('其後各步大運（長期題用；干支/歲數/起年）',rest.map(d=>d.gz+' '+d.ageStart+'–'+d.ageEnd+'歲（'+String(interval(d.window)).slice(0,4)+'年起）').join('、'));}const dc=new Map();A(y.annualSegments).forEach(v=>{if(!dc.has(v.dayun))dc.set(v.dayun,A(v.connections).filter(z=>z.from==='大運'));});const PLN={year:'年柱',month:'月柱',day:'日柱',hour:'時柱'},BR={combine:'六合',clash:'六沖',harm:'六害',same:'伏吟',punish:'相刑',destroy:'相破',triple:'三合',directional:'三會'},brw=x=>A(Array.isArray(x)?x:String(x||'').split(/[,、]/).filter(Boolean)).map(v=>BR[v]||v).join('、'),yn=x=>x===true||x==='是'?'是':'',conn=z=>(PLN[z.to]||z.to)+'：干'+(z.stemRelation||'無')+(yn(z.stemCombination)?'、干合':'')+(brw(z.branchRelations)?'、支'+brw(z.branchRelations):'')+(yn(z.repeatedPillar)?'、重柱':'');add('各大運對四柱作用（干生剋以大運為主詞）',[...dc].map(([k,rs])=>k+'：'+rs.map(conn).join('；')).join('\n'));{const GE0={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'},ZE0={子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'},tg0=(ch,el,st)=>patUse&&((st&&patUse.badStem.has(ch))||patUse.badEl.has(el))?'忌':patUse&&patUse.good.has(el)?'喜':'平',pl0=gz=>gz&&gz.length===2?'干'+tg0(gz[0],GE0[gz[0]],true)+'支'+tg0(gz[1],ZE0[gz[1]],false):'';
      add('所問流年：年/大運/流年/十神/區間/對原局作用'+(patUse?'/月令格局喜忌（流年干支）':''),A(y.annualSegments).map(v=>row([v.year,v.dayun,v.annual,v.god,interval(v.window),A(v.connections).filter(z=>z.from!=='大運').map(conn).join('；')].concat(patUse?[pl0(String(v.annual||''))]:[]))).join('\n'));}add('年度缺項',y.missingYears);const ss=[...A(y.decades).filter(d=>A(d.shensha).length&&decades.includes(d)).map(d=>'大運'+d.gz+':'+d.shensha.join('、')),...A(y.annualSegments).filter(v=>A(v.shensha).length).map(v=>v.year+v.annual+':'+v.shensha.join('、'))];add('所問運歲引動神煞與旬空（輔助）',[...new Set(ss)].join('\n'),1);const ly=core.liuNianPeriod?.year||c.liuNianPeriod?.year;const LY=A(y.liuYue||c.liuYue),allFlat=LY.length&&LY.every(p=>!p.label||p.label==='平'),GE={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'},ZE={子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'},tag=(ch,el,isStem)=>patUse&&((isStem&&patUse.badStem.has(ch))||patUse.badEl.has(el))?'忌':patUse&&patUse.good.has(el)?'喜':'平',patLab=gz=>'干'+tag(gz[0],GE[gz[0]],true)+'支'+tag(gz[1],ZE[gz[1]],false);
      add('流月'+(ly?'（'+ly+'年，立春換年、各節換月）':'')+'：月/干支/干十神/支十神/'+(allFlat&&patUse?'月令格局喜忌（扶抑中和，依本盤格局取用標干支）':'站內扶抑標記')+'/日支沖/日支合',LY.map(p=>row([p.monthName||p.month,p.gz,p.god||'',p.zGod||'',allFlat&&patUse?patLab(String(p.gz||'')):p.label,p.isChong?'沖':'',p.isHe?'合':''])).join(';'),2);}
    const child=s('子女議題實算與數量假定');if(child)add('子女（論子息）實算',renderChildren(child));
    const qt=s('調候與本月原文條件');add('調候取用前提（引擎已寫成句）',[...A(qt?.stems).map(x=>x.stem+(x.element?'（'+x.element+'）':'')+'：'+(x.status||'')+(A(x.exposed).length?'，透於'+x.exposed.join('、'):'')+(A(x.hidden).length?'，藏於'+x.hidden.join('、'):'')+(A(x.roots).length?'，根在'+x.roots.join('、'):'')+(A(x.constraints).length?'，限制：'+x.constraints.join('、'):'')+(x.usableAutomatically?'，可直接取用':A(x.exposed).length?(A(x.roots).length?'，透干有根，調候可用':'，透而無根，調候力弱'):A(x.hidden).length?'，藏而未透，調候力弱，待運歲引出':'，原局缺此字，調候要靠運歲補')),qt?.conclusion?'結論：'+qt.conclusion:''].filter(Boolean).join('\n'));add('當月調候原文',A(qt?.classicalClauses?.sourceParagraphs).map(p=>p.text).join('\n'),2);
  }
  function ziwei(ctx){const{c,a,section:s,add}=ctx,core=s('本命十二宮与指定四化');if(!core){add('時辰未定',s('出生輸入與未定盤界線'));return;}
    const birth=core.birthInput||{}, lunar=core.birthLunar||{}, policy=core.calculationPolicy||{};
    const bureau={2:'水二局',3:'木三局',4:'金四局',5:'土五局',6:'火六局'};
    const boundary={normal:'農曆正月初一',exact:'立春交節瞬間'};
    const ageRule=policy.ageDivide==='birthday'
      ? ({ON_DATE:'農曆生日當日增虛歲',AFTER_DATE_IZTRO261:'農曆生日翌日增虛歲'}[policy.birthdayBoundary]||'按農曆生日增虛歲')
      : policy.ageDivide==='normal'?'農曆新年增虛歲':'未定';
    add('出生與政策（引擎已寫成句）',[
      [birth.civilDate,birth.civilTime,{male:'男命',female:'女命'}[birth.gender],birth.hourBranch&&birth.hourBranch+'時',
        policy.trueSolarTime===true?'真太陽時':policy.trueSolarTime===false?'民用時':''].filter(Boolean).join(' '),
      lunar.year&&'農曆'+lunar.year+'年'+(lunar.isLeap?'閏':'')+lunar.month+'月'+lunar.day+'日',bureau[core.wuxingJu],
      '生年以'+(boundary[policy.yearDivide]||'未定界線')+'換年','運限以'+(boundary[policy.horoscopeDivide]||'未定界線')+'換年',ageRule,
      {MIDNIGHT_00:'00:00換日',ZI_HOUR_23:'23:00換日'}[policy.dayBoundaryMode],'四化表 '+(policy.sihuaProfileName||policy.sihuaProfile||'未定').replace(/^iztro/i,''),
      {LUNAR_MONTH:'流月按農曆月',JIE_INSTANT:'流月干支按交節時刻，命宮依農曆月'}[policy.monthGzBoundary],
      policy.referenceHoroscopeYear&&'參照年'+policy.referenceHoroscopeYear
    ].filter(Boolean).join('；'));
    if(core.mingZhu||core.laiYin)add('命主身主與來因宮',[core.mingZhu&&'命主'+core.mingZhu,core.shenZhu&&'身主'+core.shenZhu,core.laiYin&&'來因宮'+core.laiYin.name+'（'+(core.laiYin.gan||'')+(core.laiYin.branch||'')+'，宮干同生年干）'].filter(Boolean).join('；'),1);
    add('十二宮：宮名/干支/身宮/全部星曜與亮度（*主星）',A(core.palaces).map(p=>row([p.name,(p.gan||'')+p.branch,p.isShen?'身':'',A(p.stars).map(st=>{const bright=root.getStarBright?.(st.name,'子丑寅卯辰巳午未申酉戌亥'.indexOf(p.branch));return (st.type==='major'?'*':'')+st.name+(bright?.label?'['+bright.label+']':'')+(st.hua?'['+st.hua+']':'');})])).join('\n'));
    add('十二宮附表：宮名/長生/博士/將前/歲前',A(core.palaces)
      .filter(p=>p.changsheng||p.boshi12||p.jiangqian12||p.suiqian12)
      .map(p=>row([p.name,p.changsheng,p.boshi12,p.jiangqian12,p.suiqian12])).join('\n'),2);
    add('生年四化：星/化/宮',A(core.sihua).map(p=>row([p.star,p.hua,p.palace])).join(';'));
    add('自化：宮/星/化/方向/來源',A(core.selfHua).map(p=>row([p.palace,p.star,p.type,p.direction,p.from||(p.direction==='↓'?p.palace:null)])).join(';'));
    add('宮干飛化：來源/來源支/星/化/去向/去向支/自化/向心',A(core.northern?.flights).map(f=>row([f.from||f.sourcePalace,f.fromBranch,f.star,f.kind,f.to||f.targetPalace,f.toBranch,f.self,f.centripetal])).join(';'));
    function layer(p){if(!p)return '';return row([p.layer||'大限',p.year??p.ageStart,p.month??p.ageEnd,p.gz||(p.gan||'')+(p.branch||''),p.mingBranch||p.branch,p.context?.age??p.age,p.decadeCandidates?.map(d=>d.ageStart+'–'+d.ageEnd+'歲'),A(p.hua).map(h=>(h.star||'')+(h.hua||'')+'→'+(h.palaceBranch||h.branch||''))]);}
    
    const l=s('運限疊宮')||{};
    const current=A(l.decades).find(d=>core.currentAge!=null&&core.currentAge>=d.ageStart&&core.currentAge<=d.ageEnd);
    if(current)add('當前大限',row([current.ageStart+'–'+current.ageEnd+'虛歲',current.gz||current.gan+current.branch,current.palaceName||current.branch]));
    const past=[];
    const year=l.annual?.year, birthYear=c.lunar?.year||lunar.year;
    if(Number.isInteger(year)&&birthYear&&typeof c.getLiuNianZw==='function'){
      for(let y=Math.max(1900,birthYear,year-10);y<year;y++){
        const annual=c.getLiuNianZw(y);
        if(!annual)continue;
        const age=y-birthYear+1;
        const ages=policy.ageDivide==='birthday'?[Math.max(1,age-1),age]:[age];
        const decades=A(l.decades).filter(d=>ages.some(a=>a>=d.ageStart&&a<=d.ageEnd));
        past.push(row([y,annual.gz,annual.mingPalace,[...new Set(ages)].join('–'),decades.map(d=>d.gz||d.gan+d.branch),
          A(annual.hua).map(h=>h.star+h.hua+'→'+h.natalPalace)]));
      }
    }
    add('過去十年流年：年/干支/本命宮/年度虛歲/大限候選/四化落本命宮',past.join('\n'),1);
    const annualStars=c.getLiuNianZw&&year?c.getLiuNianZw(year)?.flowStars:[];
    add('當年流曜：星／地支',A(annualStars).map(x=>row([x.displayName||x.star,x.branch])).join('、'),1);
    add('大限：起歲/迄歲/干支/大限命宮地支/四化→地支（各層宮職以該層命宮重標）',A(l.decades).map(p=>row([p.ageStart,p.ageEnd,p.gz||(p.gan||'')+(p.branch||''),p.mingBranch||p.branch,A(p.hua).map(h=>(h.star||'')+(h.hua||'')+'→'+(h.palaceBranch||h.branch||''))])).join('\n'));add('當期與所問流年：年/干支/命支/虛歲/生日跨限候選/四化→地支/小限宮',[l.annual,...A(s('明示年度流年'))].filter(Boolean).map(p=>row([p.year,p.gz,p.mingBranch,p.context?.age??p.age??'',A(p.decadeCandidates).map(d=>d.ageStart+'–'+d.ageEnd+'歲'),A(p.hua).map(h=>(h.star||'')+(h.hua||'')+'→'+(h.palaceBranch||h.branch||'')),p.minor?.palace?p.minor.palace+p.minor.branch:''])).join('\n'));A(s('明示年度流月')).forEach((y,yi)=>add(y.year+'年流月：月/干支/流月命支/四化→地支',A(y.months).flatMap(m=>(A(m.segments).length?m.segments:[m]).map(z=>
      row([z.startsAt?m.month+' '+interval({start:z.startsAt,end:z.endsAt}):m.month,z.gz,z.mingBranch,A(z.hua).map(h=>h.star+h.hua+'→'+(h.palaceBranch||h.branch||''))]))).join('\n'),2+yi));{const mrow=p=>row([p.year,p.month,p.gz||(p.gan||'')+(p.branch||''),p.mingBranch||p.branch,A(p.hua).map(h=>(h.star||'')+(h.hua||'')+'→'+(h.palaceBranch||h.branch||''))]);add('全部已算流月：年/月/干支/流月命支/四化→地支',A(l.months).map(p=>A(p.segments).length?p.segments.map(z=>interval({start:z.startsAt,end:z.endsAt})+' '+mrow({...z,month:z.month??p.month})).join('\n'):mrow(p)).join('\n'),1);}{const hx=p=>A(p?.hua).map(h=>(h.star||'')+(h.hua||'')+'→本命'+(h.natalPalace||h.palace||'')+'宮（'+(h.palaceBranch||h.branch||'')+'）').join('、'),fx=p=>A(p?.flowStars).map(q=>(q.displayName||q.star||'')+'→'+(q.branch||'')).join('、'),sl=(p,name,when)=>p?name+(when?'（'+when+'）':'')+'：干支'+(p.gz||'')+'，'+name+'命宮在'+(p.mingBranch||'')+(p.mingPalace?'（本命'+p.mingPalace+'宮）':'')+(hx(p)?'；四化：'+hx(p):'')+(fx(p)?'；流曜：'+fx(p):''):'',mn=a.currentMinor,dc=l.daily?.context||{},hc=l.hourly?.context||{};add('目前小限、流日、流時（引擎已寫成句）',[mn&&mn.palace?'小限：虛歲'+(mn.age??'')+'，小限在本命'+mn.palace+'宮（'+(mn.branch||'')+'）':'',sl(l.daily,'流日',dc.civilDate),sl(l.hourly,'流時',[hc.civilDate,hc.civilTime].filter(Boolean).join(' '))].filter(Boolean).join('\n'),4);}add('年度缺項',s('流年輸出範圍')?.missingYears);
    {const pats=A(s('格局條件核對')?.patterns);add('實際格局與轉象（引擎已寫成句）',[...pats.map(p=>p.name+'：'+(p.status==='structural'?'結構成立':p.status==='variant-structure'?'變體成立':p.status||'')+(A(p.conditions).length?'（'+p.conditions.map(c0=>c0.label+(c0.passed?'✓':'✗')).join('、')+'）':'')),...A(core.northern?.transitions).map(t=>'轉象：'+(t.incoming?.from||'')+'宮'+(t.incoming?.star||'')+'化'+(t.incoming?.kind||'')+'飛入'+(t.incoming?.to||'')+'宮，遇生年'+(t.birthTransformation?.star||'')+(t.birthTransformation?.hua||'')+'→依「'+(t.rule||'')+'」規則，飛化改讀成生年那一化的同類象'+(t.sourceSection?'（'+t.sourceSection+'）':''))].join('\n'),2);}
  }
  function vedic(ctx){const{c,a,section:s,add}=ctx,core=s('D1九曜與掌宮相位')||{};
    const vi=core.input||c.input||{},vp=core.policy||c.policy||{},vl=core.lagna||{};
    const unknown=!!(vi.unknownTime||a.coverage?.provisional);
    const ps=core.planets||c.planets||{}, moon=ps.Moon, sun=ps.Sun, star=moon?.nakshatra;
    add('定盤：出生UTC／參照UTC／緯經／民用日期時間時區／大運歲長／歲差制與度／交點／宮制／上升／時辰未知',row([
      stamp(vi.utc),stamp(vi.reference),[vi.latitude,vi.longitude],vi.civil?[vi.civil.date,vi.civil.time,vi.civil.timezone]:null,
      vi.yearDays,vp.ayanamsa,vp.ayanamsaDegrees,vp.node,vp.houses,unknown?null:vl.signName,unknown]));
    const placement=p=>p&&p.signName+(unknown||!p.house?'':'第'+p.house+'宮');
    const summary=[!unknown&&vl.signName&&'上升'+vl.signName,moon&&'月亮'+placement(moon),
      star&&'月宿 '+star.name+' 第'+star.pada+'足（宿主'+(ps[star.lord]?.name||zh(star.lord))+'）',sun&&'太陽'+placement(sun)];
    add(unknown?'出生時刻未確認：參照時刻落點':'D1核心落點（恆星黃道）',summary.filter(Boolean).join('；'));
    const longitudes=keys.slice(0,9).filter(k=>Number.isFinite(ps[k]?.longitude)).map(k=>ps[k].name+' '+ps[k].longitude.toFixed(5)+'°');
    if(!unknown&&Number.isFinite(vl.longitude))longitudes.unshift('上升 '+vl.longitude.toFixed(5)+'°');
    add('黃經核對（已扣本盤歲差，從牡羊0度起算）',longitudes.join('、'));
    const sensitivity=core.sensitivity||c.sensitivity||{};
    if(sensitivity.sampled){
      const changes=A(sensitivity.changes).filter(x=>['Moon/nakshatra','Moon/pada','Moon/D1','Lagna/D1'].includes(x.key));
      add('出生時間取樣：變動項',changes.map(x=>x.key+'：'+x.alternatives.join('、')).join('；')||'取樣中的月宿、足與本命星座未見變動。');
    }
    if(unknown){
      add('時辰未定的解讀範圍','九曜黃經僅代表參照時刻。上升、宮位、分盤上升與交運日期未定；月宿及足以所列取樣範圍核對。');
      add('參照時刻分盤星座（不定宮位）',A(s('二十分盤')).map(v=>'D'+v.division+' '+keys.slice(0,9).map(k=>zh(k)+(v.planets?.[k]?.signName||'未定')).join('、')).join('\n'),2);
      const transits=c.transits?.planets||{};
      add('參照日行運星位（不定本命宮位）',Object.entries(transits).map(([key,p])=>zh(key)+' '+p.signName+' '+num(p.degree)+'°').join('、'));
      return;
    }
    if(c.dasha?.firstLord&&Number.isFinite(c.dasha.balanceYears))add('維姆紹塔里起運依據',
      '依未四捨五入的出生月亮黃經定位月宿。出生時'+zh(c.dasha.firstLord)+'主運餘'+num(c.dasha.balanceYears)+'運年，每運年'+c.dasha.yearDays+'日；以下主副運日期採世界時。');
    /* 2026-11-12：吠陀原本九張代碼表、沒有任何句子段，是最容易被讀錯的一種。本命九曜與十二宮改用句子寫（內容與原表相同：星座、度、宮、順逆、尊貴、近日、星宿、掌宮、同宮；宮主落點、宮內星、受照、SAV）。 */
    {const PL=core.planets||c.planets||{},nm=k=>PL[k]?.name||zh(k),HS=A(core.houses),D=n=>Number.isFinite(n)?(Math.round(n*10)/10)+'°':'',dasha=c.dasha?.current||{};
      const rules=k=>HS.filter(h=>h.lord===k).map(h=>h.house),sgn=p=>p?.signName||signs[p?.sign]||'';
      const one=k=>{const p=PL[k];if(!p)return '';const r=rules(k),co=keys.filter(o=>o!==k&&PL[o]&&PL[o].sign===p.sign&&PL[o].house===p.house).map(nm),nk=p.nakshatra;
        return nm(k)+'在'+sgn(p)+D(p.degree)+'、第'+p.house+'宮'+(p.retrograde?'，逆行':'')+(p.dignity?.label?'，'+p.dignity.label:'')+(p.solar?.combust?'，被太陽燃燒（這顆星受損，不是太陽受損）':'')+(r.length?'，掌第'+r.join('、')+'宮':'')+(co.length?'，與'+co.join('、')+'同宮':'')+(nk?.name?'，星宿'+String(nk.name).replace(/\s+/g,'')+(nk.pada?'第'+nk.pada+'段':'')+(nk.lord?'（宿主'+nm(nk.lord)+'）':''):'');};
      const ll=HS.find(h=>h.house===1)?.lord,lines=[];
      if(vl&&(vl.signName||Number.isInteger(vl.sign)))lines.push('上升在'+sgn(vl)+D(vl.degree)+(ll&&PL[ll]?'；上升主'+nm(ll)+'落第'+PL[ll].house+'宮'+sgn(PL[ll])+(PL[ll].dignity?.label?'（'+PL[ll].dignity.label+'）':''):'')+'。');
      keys.forEach(k=>{const t=one(k);if(t)lines.push(t+'。');});
      const mk=x=>x&&x.lord?nm(x.lord)+(PL[x.lord]?'（在第'+PL[x.lord].house+'宮'+sgn(PL[x.lord])+(rules(x.lord).length?'，掌第'+rules(x.lord).join('、')+'宮':'')+'）':'')+(x.start&&x.end?'，'+stamp(x.start).slice(0,10)+'至'+stamp(x.end).slice(0,10):''):'';
      const now=Date.parse(vi.reference||'')||null,sub=now&&A(dasha.maha?.children).find(z=>z.start<=now&&now<z.end)||dasha.antar||dasha.antara||null;
      if(dasha.maha?.lord)lines.push('現行大運主：'+mk(dasha.maha)+(sub?.lord?'；現行副運主：'+mk(sub):'')+'。');
      {const all=A(c.dasha?.periods),ix=all.findIndex(z=>z.lord===dasha.maha?.lord&&z.start===dasha.maha?.start),nx=ix>=0?all.slice(ix+1,ix+4):[];/* 問「什麼時候」的題目要看後面幾步大運，原本只有現行與下一步。 */if(nx.length)lines.push('之後三步大運：'+nx.map(mk).join('；')+'。');}
      if(lines.length)add('本命九曜與現行運（引擎已寫成句）',lines.join('\n'));
      /* deep113：已經走過的主運與近十年副運寫成句子，供「先讓他對照」用。 */
      if(now){const all=A(c.dasha?.periods),birth=Number(c.dasha?.birth)||0,past=all.filter(z=>z.end>birth&&z.start<=now),L=[];
        if(past.length)L.push('走過的主運（含現行）：'+past.map(z=>mk({lord:z.lord,start:Math.max(z.start,z.visibleStart||birth||z.start),end:z.end})).join('；')+'。');
        const from=now-10*365.2425*864e5,subs=[];past.forEach(z=>A(z.children).forEach(ch=>{if(ch.end>from&&ch.start<=now)subs.push(nm(z.lord)+'主運－'+nm(ch.lord)+'副運'+(PL[ch.lord]?'（'+nm(ch.lord)+'在第'+PL[ch.lord].house+'宮'+(rules(ch.lord).length?'，掌第'+rules(ch.lord).join('、')+'宮':'')+'）':'')+'，'+stamp(ch.start).slice(0,7)+'至'+stamp(ch.end).slice(0,7));}));
        if(subs.length)L.push('近十年的副運：'+subs.join('；')+'。');
        if(L.length)add('走過的運期（引擎已寫成句；供對照過去用）',L.join('\n'),1);}
      if(HS.length)add('十二宮（引擎已寫成句）',HS.map(h=>'第'+h.house+'宮'+(h.signName||signs[h.sign])+'：宮主'+nm(h.lord)+'落第'+h.lordHouse+'宮；宮內'+(A(h.occupants).length?A(h.occupants).map(nm).join('、'):'無星')+'；'+(A(h.aspectedBy).length?'受'+A(h.aspectedBy).map(nm).join('、')+'照':'無星照')+(h.sav!=null?'；SAV '+h.sav:'')).join('\n'));}
    const pc=core.panchanga||c.panchanga,lm=pc?.limbs||{},kr=A(core.karakas||c.karakas);
    add('上升月宿、五支曆、角色星',['上升星宿'+(nakOf(vl.longitude)||'?'),pc?'五支曆：'+[lm.vaara?.name&&'曜日 '+lm.vaara.name,lm.tithi?.name&&((lm.tithi.paksha||'')+' '+lm.tithi.name).trim(),lm.nakshatra?.name&&'月宿'+String(lm.nakshatra.name).replace(/\s+/g,'')+(lm.nakshatra.pada||''),lm.yoga?.name&&'Yoga '+lm.yoga.name,lm.karana?.name&&'Karana '+lm.karana.name].filter(Boolean).join('、'):null,kr.length?'角色星：'+kr.map(k=>k.role+zh(k.planet)+(k.tied?'(同度待核)':'')).join(' '):null].filter(Boolean).join('\n'),1);

    add('星座相位與定位（座序0牡羊；行星相位已逐宮列於受照欄）',A(core.aspects?.rasi).map(p=>zh(p.from)+'→'+A(p.toSigns).join(',')).join(';')+'\n同座距角='+A(core.aspects?.conjunctions).map(p=>A(p.planets).map(zh).join('–')+':'+num(p.separation)).join(';')+'\n定位鏈='+A(core.dispositors).map(p=>A(p.chain).map(zh).join('→')).join(';'));
    {const S1='牡金雙蟹獅處秤蠍射摩瓶魚',g=i=>Number.isInteger(i)&&S1[i]||'?';add('20分盤：D/上升星座/九曜星座（依序日月水金火木土羅計；星座取首字：牡金雙蟹獅處秤蠍射摩瓶魚）',A(s('二十分盤')).map(v=>'D'+v.division+'/'+g(v.lagna?.sign)+'/'+keys.slice(0,9).map(k=>g(v.planets?.[k]?.sign)).join('')).join('\n'));}
    const str=s('六力與Bhava力量');add('力量（不是吉凶）：曜/總/門檻/足額/Ishta/Kashta',A(str?.strength?.planets).map(p=>row([zh(p.planet),p.totalVirupas,p.minimumVirupas,p.meetsMinimum,p.ishtaKashta?.ishta,p.ishtaKashta?.kashta])).join('\n'));add('十二宮力',A(str?.bhavaStrength?.houses).map(p=>[p.house,num(p.totalVirupas)]));
    const y=s('格局與落陷抵消')||{},formed=briefChecks([...(y.yogas||[]),...A(y.specialRules?.checks),...A(y.additional?.checks)]);
    const firm = new Set([true,'established','matched','timing-supported']);
    const checkRows = rows => [...new Map(rows.map(p => [p.name+'|'+p.status,row([p.name,p.status])])).values()].join(';');
    add('已核對成立的格局與檢查：名稱/狀態',checkRows(formed.filter(p=>firm.has(p.status))));
    add('待審結構：保留原始狀態，核對條件後才能定論',checkRows(formed.filter(p=>!firm.has(p.status))));
    add('落陷救應：曜/是否抵消/實際規則與通過值（仍保留原強弱及近日）',A(y.additional?.neechabhanga).filter(p=>p.debilitated).map(p=>row([zh(p.planet),p.structuralCancellation,A(p.conditions).map(z=>[z.id,z.passed])])).join('\n'));
    const ds=s('所問運期與行運')||{};add('主運、副運、次副運及所問區間',periods(ds.vimshottari));
    {const PL=core.planets||c.planets||{},ma=PL.Mars,ju=PL.Jupiter,ve=PL.Venus,mo=PL.Moon,from=r=>Number.isInteger(r)&&ma?((ma.sign-r+12)%12)+1:null,hit=[1,2,4,7,8,12];
      if(ma){const refs=[['上升',vl.sign],['月亮',mo?.sign],['金星',ve?.sign]].map(([n,s])=>[n,from(s)]).filter(([,h])=>h),on=refs.filter(([,h])=>hit.includes(h)),jA=ju?((ma.sign-ju.sign+12)%12)+1:null;
        add('火星婚姻位置（流行判法：火星落上升、月亮、金星起算第1、2、4、7、8、12宮；各派分級與豁免不同）',refs.map(([n,h])=>n+'起第'+h+'宮').join('、')+'；'+(on.length?'落在'+on.map(([n])=>n).join('、')+'起算的位置':'三處都不在這些位置')+'。可減輕的條件：'+([[0,7,9].includes(ma.sign)?'火星在本垣或擢升':null,jA&&[1,5,7,9].includes(jA)?'木星同座或照到火星':null].filter(Boolean).join('、')||'本盤沒有常見的入廟或木星照應')+'；雙方都有時傳統視為相抵。',1);}}
    const ap=a.applicability?.dashaSelection||{};add('多運法適用性',{primary:ap.primary,eligible:A(ap.eligibleSupporting).map(k=>[k,ap.systems?.[k]?.status,A(ap.systems?.[k]?.currentLords).map(zh)]),profileDependent:A(ap.profileDependent).map(k=>[k,ap.systems?.[k]?.profiles?.map(p=>[p.id,p.status])]),unknown:ap.conditionUnknown});
    add('當期次副運明細',A(ds.vimshottari?.current?.pratyantars).map(period).join('\n'),1);
    const ts=Array.isArray(ds.transits)?ds.transits:Object.entries(ds.transits?.planets||c.transits?.planets||{}).map(([planet,p])=>({planet,...p}));
    add('已算行運：曜/座/度/順逆/月宮/升宮/BAV/SAV',ts.map(p=>row([zh(p.planet),p.signName||signs[p.sign],p.degree,p.retrograde==null?null:p.retrograde?'逆':'順',p.fromMoon,p.fromLagna,p.bav,p.sav])).join('\n'));
    const sat=ts.find(p=>p.planet==='Saturn'),jup=ts.find(p=>p.planet==='Jupiter');
    if(sat?.fromMoon)add('土星與木星對出生月亮（行運常用判讀）','土星在月亮起算第'+sat.fromMoon+'宮'+({12:'：七年半考驗期第一段（Sade Sati 起）',1:'：七年半考驗期第二段（壓在月亮上，最重）',2:'：七年半考驗期第三段（收尾）',4:'：月亮第四宮土星（Kantaka／Ardhashtama，家宅與心安）',8:'：月亮第八宮土星（Ashtama，突變與暗中阻礙）'}[sat.fromMoon]||'：不在七年半與第四、八宮週期')+(jup?.fromMoon?'；木星在月亮起算第'+jup.fromMoon+'宮'+([2,5,7,9,11].includes(jup.fromMoon)?'（傳統有利位，仍看阻擋表）':'（非傳統有利位）'):''),1);
    const tr=s('行運逐項核算');add('行運阻擋：曜/月宮/有利/阻宮/阻曜/狀態（不在有利宮時阻宮標—）',A(tr?.vedha).map(p=>row([zh(p.planet),p.fromMoon,p.auspiciousHouse,p.vedhaHouse??'—',A(p.blockers).map(zh),p.status])).join('\n'),1);
    const av=s('八分法所有分盤');add('AV原表：D/SAV/BAV日/月/水/金/火/木/土；SAV逗號分隔，BAV各12個位數逐字對牡羊至雙魚',Object.entries(av?.vargas||{}).map(([d,v])=>'D'+d+'/'+v.sav.join(',')+'/'+keys.slice(0,7).map(k=>A(v.bav?.[k]).join('')).join('/')).join('\n'));
    const t=s('本次歲時完整核算');if(t){add('本次年度範圍',{status:t.status,muntha:t.muntha,yearLord:P(t.ruleLedger?.yearLord,['status','winner','alternatives','tier']),annualLagna:P(t.annual?.lagna,['signName','degree']),interval:interval(t.window)});add('年度星位',planetRows(t.annual?.planets,false),2);add('當期月與細段',[t.currentMonth,t.currentSixtyHour].filter(Boolean).map(p=>({kind:p.kind,interval:interval(p.window),lagna:P(p.chart?.lagna,['signName','degree']),planets:planetRows(p.chart?.planets,false),lord:P(p.monthLord||p.ruleLedger?.yearLord,['status','winner','alternatives','tier'])})),4);}
    const sc=s('Sudarsana三重年運月運細運');add('三重年運',sc?{status:sc.status,yearOfLife:sc.yearOfLife,yearHouse:sc.yearHouse,interval:interval(sc.window)}:null,4);
    {const SIGN=['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'],AN={AL:'上升象（AL）',UL:'婚姻象（UL）'};
      const vg=s('Jaimini與特殊點')?.vargas||{};
      add('Arudha 象點（Jaimini；依 PVR 算法）',Object.entries(vg).map(([d,v])=>{const ar=v.arudhas||{};
        const bh=A(ar.bhava).map(r=>(AN[r.name]||r.name+'（第'+r.house+'宮象）')+'在'+(SIGN[r.sign]||'?')+'（宮主'+zh(r.lordSelection?.winner||'')+(r.exception?'，例外規則':'')+'）').join('；');
        const gr=A(ar.graha).map(r=>zh(r.planet)+'象在'+(SIGN[r.sign]||'?')+(r.exception?'（例外規則）':'')).join('；');
        return 'D'+d+'：'+bh+(gr?'\nD'+d+'行星象：'+gr:'');}).join('\n'),5);}
  }
  function westernNatalSummary(core,add){
    const ps=core.planets||{}, unknown=core.sensitivity?.unknownTime;
    const asc=core.houses?.angles?.ASC;
    function position(key){
      const p=ps[key];
      return p&&root.JYWestern.zh(key)+'在'+p.signName+(p.house?'第'+p.house+'宮':'')+(p.retrograde?'（逆行）':'');
    }
    if(!root.JYWestern||!ps.Sun||!ps.Moon)return;
    const main=[position('Sun'),position('Moon')];
    if(!unknown&&Number.isFinite(asc)){
      main.push('上升'+signs[Math.floor(asc/30)]+'座',core.chartRuler&&ps[core.chartRuler]?'命主星'+position(core.chartRuler):null);
    }
    if(unknown)main.push('出生時刻未知；星位為參照時刻，宮位與四角未定');
    add('本命核心落點',main.filter(Boolean).join('；'));
    const distribution=core.distribution;
    if(distribution){
      const format=group=>Object.entries(group||{}).map(([key,n])=>key+n).join('、');
      const lines=[format(distribution.elements),format(distribution.modalities)];
      if(!unknown&&core.houses){
        const houses=new Array(12).fill(0);
        root.JYWestern.KEYS.forEach(k=>{const h=ps[k]?.house;if(h>=1&&h<=12)houses[h-1]++;});
        const peak=Math.max(...houses);
        if(peak>0)lines.push('最多行星：'+houses.flatMap((n,i)=>n===peak?['第'+(i+1)+'宮×'+n]:[]).join('、'));
      }
      add('十顆行星分布（交點與角點不計）',lines.filter(Boolean).join('；'));
    }
    const groups=[['自我與目標','Sun'],['情緒與安全感','Moon'],['思維與溝通','Mercury'],
      ['關係與親密','Venus'],['行動與衝突','Mars'],['責任與成長','Saturn']];
    const aspects=A(core.aspects).slice().sort((a,b)=>a.orb-b.orb);
    const rows=groups.map(([theme,key])=>{
      const seen=new Set(),matches=[];
      for(const a of aspects){
        if(a.a!==key&&a.b!==key)continue;
        const other=a.a===key?a.b:a.a, axis=other.endsWith('Node')?'交點軸':other;
        if(seen.has(axis))continue;
        seen.add(axis);
        matches.push(root.JYWestern.zh(key)+a.name+(axis==='交點軸'&&a.angle===90?axis:root.JYWestern.zh(other))+'（'+num(a.orb)+'°）');
        if(matches.length===2)break;
      }
      return theme+'：'+(matches.join('、')||position(key)||'未列');
    });
    add('本命主題索引（每題最緊兩項；重複列出的相位只算一次）',rows.join('\n'));
  }
  function astro(ctx){const{c,a,section:s,add}=ctx,core=s('本次用途、完整星位與宮位')||{};
    add('輸入與宮制',{input:core.input,policy:P(core.policy,['zodiac','houseSystem','chartType','node','orbs','minorOrbs']),unknown:!!a.coverage?.provisional});
    if(core.input?.chartPurpose==='natal'){
      westernNatalSummary(core,add);
      add('本命相位收錄口徑','行星依本盤相位容許度；涉及月交點或上升、天頂時採3度。本包未列黑月莉莉絲或太陽弧。');
    }
    const lt=core.lots;if(lt?.fortune)add('福點與精神點（Lot of Fortune／Spirit）',['福點','精神點'].map((n,i)=>{const x=i?lt.spirit:lt.fortune;return n+'在'+x.signName+num(x.degree)+'度第'+x.house+'宮，主星'+zh(x.lord)+'（'+x.formula+'）';}).join('；')+'。福點看身體與財物際遇，精神點看心志與作為。',1);
    const pf=core.profection;if(pf)add('年度小限（整宮制）','滿'+pf.age+'歲：小限到第'+pf.house+'宮'+pf.signName+'，年主星'+zh(pf.lord)+(pf.lordNatal?'（本命在'+pf.lordNatal.signName+'第'+pf.lordNatal.house+'宮）':'')+'；'+interval(pf.window)+'。年主星的行運、相位與回歸盤狀態是這一年的主軸。');
    /* deep115：過去十年的年度小限寫成句子，供「先讓他對照」用（原本西洋占星沒有任何過去運期，Gemini 自己編了年份）。 */
    if(pf&&Number.isInteger(pf.age)&&Number.isInteger(pf.sign)&&core.planets&&!Array.isArray(core.planets)){const SG=['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'],RU=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'],y0=Number(String(pf.window?.start||'').slice(0,4)),mo=Number(String(pf.window?.start||'').slice(5,7)),rowsP=[];
      for(let k=10;k>=1;k--){const age=pf.age-k;if(age<0||!y0)continue;const sg=((pf.sign-k)%12+12)%12,h=((pf.house-1-k)%12+12)%12+1,L=RU[sg],n=core.planets[L];
        const hard=[],soft=[];A(core.aspects).forEach(q=>{const x=q.a||q.from,y2=q.b||q.to;if(x!==L&&y2!==L)return;const o=zh(x===L?y2:x),nmA=String(q.name||'');if(/四分|對分/.test(nmA))hard.push(o);else if(/三分|六分/.test(nmA))soft.push(o);});
        rowsP.push((y0-k)+'年'+mo+'月到'+(y0-k+1)+'年'+mo+'月（滿'+age+'歲）：小限在第'+h+'宮'+SG[sg]+'，年主星'+zh(L)+(n?'（本命在'+n.signName+'第'+n.house+'宮'+(n.dignity?.name&&!/^無/.test(n.dignity.name)?'，'+n.dignity.name:'')+(hard.length?'，受'+hard.join('、')+'的四分或對分':'')+(soft.length?'，得'+soft.join('、')+'的三分或六分':'')+'）':''));}
      if(rowsP.length)add('過去十年的年度小限（引擎已寫成句；供對照過去用）',rowsP.join('\n'),1);}
    add('全部星位：曜/座/度/宮/順逆/尊貴',planetRows(core.planets));add('宮頭與四角',compactObject(core.houses));add('本命相位',aspectRows(core.aspects));
    {const DW={sign:'入廟',exaltation:'擢升',triplicity:'三分主',term:'界主',face:'面主'},dw=l=>A(l).map(k=>DW[k]||k).join('、');
      const ed=core.essentialDignities||{},sol=A(core.specialConditions?.solar||core.conditions?.solar),solOf=k=>sol.find(x=>x.planet===k),SOL={cazimi:'日心（被太陽抱住，傳統反而視為有力）',combust:'燃燒（被太陽燒掉，弱）','under-beams':'日光下（偏弱）',clear:''};
      const rows=A(ed.planets).map(p=>zh(p.planet)+'：'+(A(p.held).length?'持有'+dw(p.held):'無本質尊貴')+(p.detriment?'、失勢':'')+(p.fall?'、落陷':'')+(p.peregrine?'、游離（沒根，靠接納）':'')+(solOf(p.planet)&&SOL[solOf(p.planet).state]?'、'+SOL[solOf(p.planet).state]:'')+'；所在度數由'+zh(p.signLord)+'（座）'+(p.exaltationLord?'、'+zh(p.exaltationLord)+'（擢）':'')+'、'+zh(p.triplicityLord)+'（三分）、'+zh(p.termLord)+'（界）、'+zh(p.faceLord)+'（面）管');
      const mut=A(ed.mutualHosting).map(m=>zh(m.a?.host)+'與'+zh(m.b?.host)+'互容（'+dw(m.b?.dignities)+'／'+dw(m.a?.dignities)+'）—兩顆星互相有辦法，問題能互相解');
      add('尊貴與接納（引擎已寫成句）',[(core.sect?.name?'盤別：'+core.sect.name+'；':'')+'盤主星'+zh(core.chartRuler||''),...rows,...(mut.length?['互容：'+mut.join('；')]:[])].join('\n'));}
    {const sc=core.specialConditions||{},sh=core.chartShapes||{},SOL={cazimi:'日心（有力）',combust:'燃燒（弱）','under-beams':'日光下（偏弱）',clear:'日光外'};
      add('形狀與特殊條件（引擎已寫成句）',[A(core.patterns).length?'相位圖形：'+core.patterns.map(p=>(p.name||p.type||'')+(A(p.planets).length?'（'+p.planets.map(zh).join('、')+'）':'')).join('、'):'相位圖形：無',A(sh.matched).length?'盤形：'+sh.matched.map(m=>m.name+'—'+(m.condition||'')).join('；')+(sh.largestEmptyGap?'；最大空區在'+zh(sh.largestEmptyGap.after)+'到'+zh(sh.largestEmptyGap.before)+'之間（'+Math.round(sh.largestEmptyGap.degrees)+'度）':''):'',A(sc.unaspected).length?'無相位行星：'+sc.unaspected.map(zh).join('、'):'',A(sc.outOfSign).length?'跨座相位：'+sc.outOfSign.map(a=>zh(a.a)+a.name+zh(a.b)).join('、'):'',A(sc.nearStations).length?'近停滯：'+sc.nearStations.map(zh).join('、'):'',A(sc.solar).length?'與太陽的關係：'+sc.solar.map(x=>zh(x.planet)+SOL[x.state]||x.state).join('、'):''].filter(Boolean).join('\n'),2);}
    const future=s('實算行運次限與回歸')||{};for(const [k,p0]of Object.entries(future)){if(!p0)continue;const ov=A(p0.natalHouseOverlay),p=ov.length&&ov[0].progressedHouse===undefined&&p0.planets?{...p0,natalHouseOverlay:[],planets:Object.fromEntries(Object.entries(p0.planets).map(([pk,pv])=>[pk,{...pv,house:ov.find(v=>v.planet===pk)?.natalHouse??pv.house}]))}:p0;const kn=({transits:'行運',progressions:'次限推運',returnAnalysis:'太陽回歸'})[k]||k;add(kn+'時點與相位'+(k==='transits'?'（行運星／本命點）':k==='progressions'?'（推運星／本命點；世界時為推運星曆日）':''),{utc:p.utc,referenceUTC:p.referenceUTC,purpose:p.purpose,aspects:aspectRows(p.aspects),angleAspects:aspectRows(p.angleAspects),overlay:Array.isArray(p.natalOverlay)&&p.natalOverlay[0]?.a?aspectRows(p.natalOverlay):A(p.natalHouseOverlay||p.natalOverlay).map(v=>[zh(v.planet),v.progressedHouse,v.natalHouse])});add(kn+'星位'+(k==='transits'?'（宮欄＝落在本命第幾宮）':''),planetRows(p.planets,false),k==='transits'?1:2);}
    const h=(s('問事及搬遷')||{}).horary;if(h){add('卜卦取用',{significators:h.significators,selectedHouse:h.selectedHouse,querent:h.querent,quesited:h.quesited,moon:compactObject(h.moon),orbPolicy:h.orbPolicy});add('傳光集光及受阻',compactObject({translation:h.translationChecks||h.translationCandidates,collection:h.collectionChecks||h.collectionCandidates,denials:h.denialChecks||h.perfectionAndInterference,light:h.lightChecks}),1);add('卜卦實際時序',compactObject(h.timeline),3);}
  }
  function liuren(ctx){const{c,a,section:s,add}=ctx,core=s('天地盤、四課三傳與時令')||{};
    addCandidateDays(ctx,a.timing,sixRenDay);
    const clock=core.clock,method=core.method;
    {const t=core.time||{},pp=t.pillars||{};add('日時與取課（引擎已寫成句）',['占時：'+(t.civilDate||'')+' '+(t.civilTime||'')+(t.timezoneOffset!=null?'（UTC'+(t.timezoneOffset>=0?'+':'')+t.timezoneOffset+'）':'')+'，四柱'+['year','month','day','hour'].map(k=>pp[k]?pp[k].gan+pp[k].zhi:'').join(' ')+(t.previousQi?'；節氣在'+t.previousQi.name+'後、'+(t.nextQi?.name||'')+'前':''),'日干'+(core.day?.gan||'')+'（'+(core.day?.element||'')+'，寄宮'+(core.day?.residence||'')+'）、日支'+(core.day?.zhi||'')+'；月將'+(core.monthGeneral?.branch||'')+(core.monthGeneral?.name?'（'+core.monthGeneral.name+'）':'')+'；時支'+(core.hourBranch||'')+'；'+(core.daytime?'晝占':'夜占')+'；貴人'+(core.noble?.branch||'')+(core.noble?.direction?'、'+core.noble.direction:'')+'；旬首'+(core.xun?.head||'')+'，旬空'+A(core.xun?.empty).join(''),'取課：'+(method?.gate||'')+'→'+(method?.type||'')+(A(method?.selectedCourses).length?'（取第'+method.selectedCourses.join('、')+'課）':'')+(A(method?.trace).length?'；程序：'+method.trace.map(x=>x.step).join('→'):''),clock?('時制：'+(clock.trueSolarTimeApplied?'已用真太陽時':'民用時辰')+(clock.astronomy?.status==='coordinates-unavailable'?'（未提供座標）':'')):'',A(core.participants).length?'人物：'+core.participants.map(x=>x.label+'＝'+(x.source||'未提供')).join('、'):''].filter(Boolean).join('\n'));}
    /* 2026-11-12：六壬原本只給十六欄的代碼表，Gemini 讀錯（把與日支同支的標記當成伏吟課、把三合全局當成停滯、說末傳空亡），得出與盤相反的結論。
       把定吉凶真正要用的幾件事先寫成句子：干支上神、四課、三傳、十二天將與五類六親的落點。細表仍附在後面供核對。 */
    {const HE={子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'},CH={子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'},HAI={子:'未',未:'子',丑:'午',午:'丑',寅:'巳',巳:'寅',卯:'辰',辰:'卯',申:'亥',亥:'申',酉:'戌',戌:'酉'};
      const SAN=[['申','子','辰','水'],['亥','卯','未','木'],['寅','午','戌','火'],['巳','酉','丑','金']];
      const br=p=>p?.sky||p?.upper||p?.branch||'',st=p=>{const x=p?.assessment||{};return br(p)+'（'+(p?.kinship||'')+'）乘'+(p?.general||'')+'，'+(x.season||'?')+'，'+(p?.empty?'旬空':'不空');};
      const link=(a,b)=>!a||!b?'':HE[a]===b?'六合':CH[a]===b?'六沖':HAI[a]===b?'六害':a===b?'同支':'無合沖害';
      const cs=A(core.courses),ts=A(core.transmissions),pl=A(core.plate),gu=br(cs[0]),zu=br(cs[2]);
      const lines=[];
      if(gu&&zu){const BE={子:'水',亥:'水',寅:'木',卯:'木',巳:'火',午:'火',申:'金',酉:'金',辰:'土',戌:'土',丑:'土',未:'土'},GE={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'},SH={木:'火',火:'土',土:'金',金:'水',水:'木'},KE={木:'土',土:'水',水:'火',火:'金',金:'木'};
        /* 2026-11-14 vary105：原本只寫「干上神對支上神是受克」，Gemini 讀成日干受克（實際支上神申金生日干壬水）。改成每一組都寫出誰生誰、誰克誰，連同五行。 */
        const rel=(an,ae,bn,be)=>!ae||!be?'':ae===be?an+'與'+bn+'同屬'+ae:SH[ae]===be?an+'（'+ae+'）生'+bn+'（'+be+'）':SH[be]===ae?bn+'（'+be+'）生'+an+'（'+ae+'）':KE[ae]===be?an+'（'+ae+'）克'+bn+'（'+be+'）':bn+'（'+be+'）克'+an+'（'+ae+'）';
        const dg=core.day?.gan||'',dz=core.day?.zhi||'',de=GE[dg]||core.day?.element||'';
        lines.push('干支上神：日干'+dg+'上是'+gu+'，日支'+dz+'上是'+zu+'；兩個上神'+link(gu,zu)+'。生剋（寫明誰對誰）：'+[rel('干上神'+gu,BE[gu],'支上神'+zu,BE[zu]),rel('干上神'+gu,BE[gu],'日干'+dg,de),rel('支上神'+zu,BE[zu],'日干'+dg,de),rel('支上神'+zu,BE[zu],'日支'+dz,BE[dz]),rel('日干'+dg,de,'日支'+dz,BE[dz])].filter(Boolean).join('；')+'。');}
      if(cs.length)lines.push('四課（上神臨下）：'+cs.map((p,i)=>'第'+(i+1)+'課 '+st(p)+'，臨'+(p.lower||p.earth||'')).join('；')+'。');
      if(ts.length){const names=['初傳','中傳','末傳'],set=ts.map(br),sj=SAN.find(g=>g.slice(0,3).every(z=>set.includes(z))),mid=sj&&ts.find(p=>'子午卯酉'.includes(br(p)));
        lines.push('三傳：'+ts.map((p,i)=>(names[i]||'')+' '+st(p)).join('；')+(sj?'；三傳合成'+sj[3]+'局'+(mid?.kinship?'（對日干是'+mid.kinship+'局）':''):'')+'。');}
      if(pl.length){lines.push('十二天將落點（天盤支臨地盤支）：'+pl.map(p=>(p.general||'')+'乘'+br(p)+'臨'+(p.earth||'')+(p.empty?'（旬空）':'')).join('、')+'。');
        const inT=z=>{const i=ts.findIndex(p=>br(p)===z);return i<0?'':'，入'+['初傳','中傳','末傳'][i];};
        lines.push('五類六親落點：'+['妻財','官鬼','父母','子孫','兄弟'].map(k=>{const v=pl.filter(p=>p.kinship===k);return k+'＝'+(v.length?v.map(p=>br(p)+'（乘'+(p.general||'')+'，'+((p.assessment||{}).season||'?')+'，'+(p.empty?'旬空':'不空')+inT(br(p))+'）').join('、'):'不見');}).join('；')+'。');
        /* 2026-11-14 vary106：感情題兩家 AI 都沒去看天后、青龍。取法裡有寫類神，但資料沒有把「這一題該看誰」點出來；改由程式依原題挑出類神並寫明落點與狀態。 */
        {const q=String(ctx.data?.question||''),TOP=[[/感情|戀|愛|喜歡|曖昧|桃花|交往|男友|女友|老公|老婆|丈夫|妻|婚|正緣|伴侶|對象|復合|分手|前任/,'感情婚姻',['天后','青龍','六合'],'妻財、官鬼'],[/財|錢|收入|薪|投資|生意|賺|營收|業績|流量|訂單|買賣|股/,'求財',['青龍'],'妻財'],[/工作|事業|升遷|職|面試|公司|主管|老闆|創業|跳槽/,'工作官職',['青龍','太常'],'官鬼'],[/考|文書|合約|契約|證照|申請|簽約/,'文書考試',['朱雀'],'父母'],[/子女|小孩|孩子|懷孕|生育|兒子|女兒/,'子女',['六合'],'子孫'],[/病|健康|手術|身體/,'疾病',['白虎'],'官鬼（子孫為醫藥）'],[/遺失|失物|不見了|被偷|找回|弄丟/,'失物',['玄武'],''],[/官司|訴訟|提告|糾紛|法院/,'訴訟',['勾陳','朱雀'],'官鬼']];
          const where=z=>{const t=ts.findIndex(p=>br(p)===z),k=cs.findIndex(p=>br(p)===z);return t>=0?'入'+['初傳','中傳','末傳'][t]:k>=0?'在第'+(k+1)+'課':'不入課傳';};
          const hit=TOP.filter(t=>t[0].test(q)).slice(0,3);
          if(hit.length)lines.push('本題類神（依原題用字挑出；落點與狀態已算好）：'+hit.map(t=>t[1]+'看'+t[2].map(g=>{const x=pl.find(p=>p.general===g);return x?g+'乘'+br(x)+'臨'+(x.earth||'')+'（'+(x.kinship||'')+'，'+((x.assessment||{}).season||'?')+'，'+(x.empty?'旬空':'不空')+'，'+where(br(x))+'）':g;}).join('、')+(t[3]?'，並看'+t[3]+'（落點見上一行）':'')).join('；')+'。');}}
      if(lines.length)add('四課三傳與類神（引擎已寫成句；旺相休囚死依月令，細表附後供核對）',lines.join('\n'));}
    const pos=p=>{const x=p.assessment||{};return [p.index??p.role??'—',p.earth,p.sky||p.upper||p.branch,p.lower??'—',p.general,p.kinship,state(p.empty),p.hiddenStem??(p.empty?'—':null),x.season,state(x.monthlyBroken),x.dayRelation,x.generalRelation,x.groundRelation,state(x.innerBattle),state(x.outerBattle),Object.entries(x.dayLinks||{}).filter(([,v])=>v).map(([k])=>(k==='fuyin'||k==='same')?'與日支同支':k)];};
    add('天地盤：序/地/天/下/將/六親/空/遁干/季/破/日/將/地生剋/內戰/外戰/日支關係（1是0否，—不適用，?未知）',A(core.plate).map(p=>row(pos(p))).join('\n'));add('四課（同欄序）',A(core.courses).map(p=>row(pos(p))).join('\n'));add('三傳（同欄序）',A(core.transmissions).map(p=>row(pos(p))).join('\n'));add('生剋方向與干支',{edges:A(core.edges).map(p=>[p.from,p.to,p.branches,p.relation,p.links]),ganUpper:core.ganZhi?.ganUpper?.branch,zhiUpper:core.ganZhi?.zhiUpper?.branch,ganToZhi:core.ganZhi?.ganToZhi,edgeLegend:'from→to；punishes是前者刑後者、punishedBy是被後者刑；五行比和不能消除刑沖。'});
    const topics=s('分類問事與處境線索')||a.topicRules;
    add('問事取用與可核線索',A(topics?.checks).map(p=>({...P(p,['id','topic','status','source','readingScope']),evidence:
      p.id==='work-self-environment'?{selfCourse:1,environmentCourse:3,transmissions:'完整三傳及有向作用見上表'}:
      p.id==='initial-void'?{transmission:1,empty:p.evidence?.empty}:p.evidence})));
    const cl=s('六十四課三值判定');
    add('成立或未決課體：課/狀態/版本條件/缺項（1真0假?未定；課名只是《課經》的分類標籤，吉凶仍以上面干支上神、三傳與類神的旺衰空亡為準，不照課名字面論斷）',A(cl?.checks).filter(p=>p.status!=='not-established'&&p.established!==false).map(p=>row([p.name,p.status,A(p.variants).map(v=>[v.name,state(v.value),A(v.conditions).map(x=>[x.condition,state(x.value)])]),p.missing])).join('\n'));
    const tm=s('取用與候選日實算');add('取用與候選範圍',{selection:{mode:tm?.selection?.mode,status:tm?.selection?.status,targets:A(tm?.selection?.targets).map(p=>({kinship:p.kinship,role:p.role,placements:A(p.placements).map(v=>[v.role,v.branch||v.upper,v.earth]),transmissions:A(p.transmissions).map(v=>[v.role,v.branch])}))},window:tm?.window,status:tm?.status,candidates:tm?.candidateCount,inspected:tm?.inspectedDayCount,scales:compactObject(tm?.scales)});add('實際命中神煞',A(s('神煞實際命中與不足')?.active).map(p=>P(p,['name','location','hits'])),3);
  }
  function sixRenDay(day){
    const lines=A(day.conditions).map(condition=>{
      const months=A(condition.monthConstraints);
      const constraints=months.map(m=>{
        const limits=[m.monthBranch&&m.monthBranch+'月',m.season,m.monthlyBroken?'月破':'',m.dayEmpty?'旬空':''].filter(Boolean);
        if(months.length>1)limits.unshift(stamp(m.start)+'至'+stamp(m.endExclusive)+'前');
        return limits.join('、');
      });
      return [condition.target,condition.role,condition.branch].filter(Boolean).join('')+'：'+A(condition.why).map(x=>x.id).join('、')+
        (constraints.length?'（'+constraints.join('／')+'）':'');
    });
    return lines.join('；');
  }

  function sixYaoDay(day){
    return A(day.segments).map(segment=>{
      const lines=A(segment.triggers).map(t=>{
        const limits=[...A(t.conditions),t.futureStates?.monthBroken?'當段月破':'',t.futureStates?.void?'當段旬空':''].filter(Boolean);
        return (t.hidden?'伏':'')+t.relative+t.position+'爻：'+A(t.reasons).join('、')+(limits.length?'（'+limits.join('、')+'）':'');
      });
      const when=stamp(segment.start)+'至'+stamp(segment.endExclusive)+'前';
      return when+' '+lines.join('；');
    }).join('／');
  }

  function addCandidateDays(ctx,timing,describe){
    const days=A(timing?.candidates);
    if(!days.length)return;
    // One compact line per distinct condition set. Keep a representative, explicitly
    // counted sample when multi-year or multi-target results would eclipse the chart.
    function table(count){
      const groups=new Map();
      for(let i=0;i<count;i++){
        const day=days[count===1?0:Math.round(i*(days.length-1)/(count-1))];
        const conditions=describe(day);
        if(!conditions)continue;
        if(!groups.has(conditions))groups.set(conditions,[]);
        groups.get(conditions).push(day.date);
      }
      return [...groups].map(([conditions,dates])=>dates.join('、')+'｜'+conditions).join('\n');
    }
    let count=Math.min(days.length,60),rows=table(count);
    while(count>1&&chars(rows)>1800){count=Math.ceil(count/2);rows=table(count);}
    if(!rows)return;
    const scope=count===days.length?'全列'+count+'日':'共'+days.length+'日，依日序等距摘列'+count+'日';
    const wantsTime=/何時|什麼時候|哪(?:一|幾|些|個)?[天日月年]|應期|候選日|時間|時機|多久|期間|之間|以前|之前|月底|本月|下月|今年|明年|下週|這週|日期|\d日/.test(ctx.data.question);
    ctx.add('應期候選日與實算條件（'+scope+'；依本課日界，分段起迄為世界時）',rows+'\n這些日期只表示列出的條件被觸發。請保留同日的牽制，實際進展仍須看原題中的人或事。',wantsTime?1:3);
  }
  function hiddenLine(line,calendar){
    const hidden=line.hidden;
    if(!hidden)return '';
    const state=hidden.states||{},direction=root.JYLiuyaoCore?.relationDirection;
    const target='伏神'+hidden.branch+hidden.element;
    const notes=direction?[
      direction('飛神'+line.branch+line.element,hidden.flightRelation,target),
      direction('月建'+(calendar.monthBranch||''),state.monthRelation,target),
      direction('日辰'+(calendar.day||''),state.dayRelation,target)]:[];
    if(state.void)notes.push('伏神旬空');
    if(state.monthBroken)notes.push('伏神月破');
    if(state.dayClash)notes.push('日沖伏神，須核生扶');
    if(line.states?.void)notes.push('飛神旬空');
    if(line.moving)notes.push('飛神發動');
    return '；'+line.label+'伏神為'+hidden.relative+'，'+(hidden.stem||'')+hidden.branch+'屬'+hidden.element+'：'+notes.join('、');
  }
  function liuyao(ctx){const{section:s,add}=ctx,core=s('完整起卦與六爻')||{},v=s('完整作用網路與讀法')||{};
    addCandidateDays(ctx,v.timing,sixYaoDay);
    {const cal=core.calendar||{},og=core.original||{},cg=core.changed||{};add('起卦與六爻（引擎已寫成句）',[cal.wall?'起卦 '+cal.wall:'',[cal.year,cal.month,cal.day,cal.hour].filter(Boolean).length?'四柱／日辰 '+[cal.year,cal.month,cal.day,cal.hour].filter(Boolean).join(' '):'',cal.monthBranch?'月建'+cal.monthBranch:'',A(cal.voidBranches).length?'旬空'+cal.voidBranches.join(''):''].filter(Boolean).join('，')+'；六爻值（初→上）'+A(core.values).join(',')+'，動爻'+(A(core.movingPositions).length?core.movingPositions.join('、'):'無')+'；本卦'+(og.name||'')+(og.palace?'（'+og.palace.name+'宮'+(og.palace.element||'')+'、'+(og.palace.generation||'')+'，世'+og.palace.shi+'應'+og.palace.ying+'）':'')+(core.hasChange===false||(cg.name&&cg.name===og.name&&!A(core.movingPositions).length)?'，六爻皆靜':(cg.name?'→變卦'+cg.name:'')));}
    const st=core.structures,kind=(c6,h6)=>c6?'六沖':h6?'六合':'非沖非合';if(st)add('六沖六合卦（內外三對爻支全沖或全合）','本卦'+kind(st.sixClash,st.sixCombine)+(A(core.movingPositions).length?'，變卦'+kind(st.changedSixClash,st.changedSixCombine)+(st.sixCombine&&st.changedSixClash?'（合變沖：先聚後散）':st.sixClash&&st.changedSixCombine?'（沖變合：先散後聚）':''):'，無動爻')+'。沖主散、急、難久，合主聚、成、拖延；仍以用神旺衰與動變為主。');
    const hiddenPositions=new Set();
    const hiddenTargets=A(v.targets).flatMap(target=>A(target.candidates).filter(z=>z.hidden).map(z=>{
      const line=A(core.lines).find(p=>p.position===z.position&&p.hidden?.branch===z.branch);
      if(!line)return '';
      hiddenPositions.add(line.position);
      return line.label+'明現的是'+line.relative+line.branch+line.element+'（飛神）；'+line.label+'伏藏的是'+line.hidden.relative+line.hidden.branch+line.hidden.element+'，才是「'+target.role+'」此次取的用神。'+hiddenLine(line,core.calendar||{}).slice(1);
    })).filter(Boolean);
    if(hiddenTargets.length)add('本題用神在伏爻（分清同一爻位的兩個角色）',[...new Set(hiddenTargets)].join('\n'));
    {const stTxt=st=>{st=st||{};const b=[];if(st.void)b.push('旬空');if(st.monthBroken)b.push('月破');if(st.monthSame)b.push('月建同氣');if(st.monthCombine)b.push('月合');if(st.daySame)b.push('日辰同氣');if(st.dayClash)b.push('日沖');if(st.dayCombine)b.push('日合');return b.join('、')||'無空破合沖';};
      add('六爻（每爻一句：位・干支・六親・世應・六神；月日狀態；動變；伏神）',A(core.lines).map(p=>p.label+(p.role?'（'+p.role+'）':'')+'：'+(p.stem||'')+p.branch+p.relative+'乘'+p.spirit+'，'+(p.valueName||'')+'；'+stTxt(p.states)+(p.changed&&p.moving?'；動化'+p.changed.relative+p.changed.branch+(p.transition?.returnLabel?'（'+p.transition.returnLabel+(p.transition.advance?'、進神':p.transition.retreat?'、退神':'')+'）':'')+'，變爻'+stTxt(p.changed.states):'；靜')+(!hiddenPositions.has(p.position)?hiddenLine(p,core.calendar||{}):'')).join('\n'));}
    if(!A(v.targets).length)add('事情取用','引擎未能從原題自動定出用神；請先依《增刪卜易》〈用神章〉從原題所問之人或事取用（例：男問女方取妻財、女問男方取官鬼、問工作取官鬼、問錢財取妻財、問文書房屋取父母、問子女晚輩取子孫、問同輩取兄弟，兩造互動另看世應），在回答第一段用一句話說明取了哪一爻與理由，再依該爻推演。');
    add('事情取用（評估爻位指同位全部爻狀態，伏神另列）',A(v.targets).map(p=>({role:p.role,relative:p.relative,status:p.status,selection:p.selection,candidates:A(p.candidates).map(z=>({position:z.position,hidden:z.hidden,branch:z.branch,...(JSON.stringify(z.assessment)===JSON.stringify(A(v.lines).find(l=>l.position===z.position))?{assessmentLine:z.position}:{assessment:compactObject(z.assessment)})})),alternatives:compactObject(p.calendarAlternatives)})));
    add('全部爻狀態：位/季/月/日/強度/日沖/可用/生扶動爻/障礙/空/墓/長生',A(v.lines).map(p=>row([p.position,p.season?.label,p.monthInfluence,p.dayInfluence,p.strength,p.dayEffect,p.availability,p.supportingMovingPositions,p.obstacles,p.voidStatus,p.tombStatus,p.lifeStages])).join('\n'));
    add('全部作用方向：事情/目標位/作用爻位/六親/作用/動靜/可用/障礙',A(v.influences).flatMap(p=>A(p.candidates).flatMap(z=>A(z.network).map(n=>row([p.role,z.position,n.position,n.relative,n.function,n.movement,n.availability,n.obstacles])))).join('\n'));
    add('動變與合沖',compactObject({combinations:v.combinations,transformations:v.transformations}),1);
    add('應期範圍',P(v.timing,['status','window']));
  }
  function yijing(ctx) {
    const {section,add}=ctx,core=section('完整起卦與六爻')||{},v=section('完整作用網路與讀法')||{};
    const moving=A(core.movingPositions), changed=moving.length>0;
    const cal=core.calendar||{};
    add('起卦記錄（引擎已寫成句）',[
      cal.wall&&'起卦 '+cal.wall,
      '六爻值（初→上）'+A(core.values).join(','),
      '動爻'+(changed?moving.join('、'):'無'),
      '本卦'+core.original?.name+(changed?'→變卦'+core.changed?.name:'，六爻皆靜')
    ].filter(Boolean).join('，'));
    add('本次擇辭主參（完整原文）',v.reading);
    const study=/逐爻|全部爻辭|所有爻辭|完整(?:原文|經文|爻辭)|六爻(?:原文|皆解|都解)|文言傳/.test(ctx.data.question);
    const chosen=A(v.reading?.selections),wings=v.expositions||{};
    const passages={selected:wings.selectedCompanions};
    for(const [side,key,title] of [['original','originalText','本卦'],['changed','changedText','之卦']]){
      if(side==='changed'&&!changed)continue;
      if(study&&v[key])add(title+'全文（研讀用，取占依所選主參）',P(v[key],['number','name','judgment','lines','use','image']));
      if(study&&wings[side])passages[side]=P(wings[side],['tuan','greatImage','lineImages','wenyan','useImage']);
      else if(wings[side]&&chosen.some(r=>r.side===side&&r.kind==='judgment'))passages[side]=P(wings[side],['greatImage']);
    }
    add('彖象與所選原文對讀',compactObject(passages));
    if(study||/互卦|錯卦|綜卦/.test(ctx.data.question)){
      add('互錯綜（只補充卦形）',Object.entries(v.complementaryViews||{}).filter(([side])=>side==='original'||changed).map(([side,h])=>
        (side==='original'?'本卦':'之卦')+'：互卦'+h.mutual?.hexagram?.name+'、綜卦'+h.overturned?.hexagram?.name+'、錯卦'+h.opposite?.hexagram?.name).join('；'));
    }
  }

  function selectedYiEvidence(e,question) {
    const a=e.analysis, chosen=A(a.reading?.selections),wings=A(a.expositions?.selectedCompanions);
    const lines=[a.reading?.rule];
    for(const s of chosen){
      const wing=wings.find(w=>w.side===s.side && w.kind===s.kind && w.position===s.position);
      const geom=(s.side==='changed'?a.changedGeometry:a.originalGeometry)?.[s.position-1];
      if(s.kind==='line'&&geom){
        const where=s.position===6?'處全卦之終':s.position===1?'在事之初':geom.central?'居中':'';
        lines.push(s.hexagram+s.label+'的爻位｜'+[where,geom.proper?'當位':'未當位'].filter(Boolean).join('、')+'。爻位輔讀該爻之辭。');
      }
      if(wing?.text)lines.push(s.role+'所據'+(s.kind==='judgment'?'彖傳':'小象')+'｜'+wing.text);
    }
    const relationship=/交往|在一起|成為伴侶|復合|婚姻|結婚/.test(question);
    if(relationship && chosen.some(s=>/取女吉|娶女吉/.test(s.text)))
      lines.push('占辭明言取女吉，婚配是這句直接論的事；可斷所問關係有相感之利。保留原辭條件，不推作對方已答應。');
    if(chosen.some(s=>/[无無]咎/.test(s.text))){
      lines.push('「無咎」判所述處置可免其咎。若同爻另有吉、凶、婚媾或其他具體斷語，分句取義；免咎本身不能證成事件。');
      // A bare keyword cannot classify the whole verse. Limit this conclusion
      // to selected lines whose own Image explains avoidance or proper station.
      const avoidanceOnly=chosen.every(s=>/[无無]咎/.test(s.text) && !/[吉凶]|婚|媾|娶|取女/.test(s.text) &&
        wings.some(w=>w.side===s.side && w.position===s.position && /遠害也|正位也/.test(w.text)));
      if(relationship && avoidanceOnly){
        lines.push('問兩人能否成局：這次所選主、參辭皆言無咎，沒有直接許成的斷辭。把原題答到「成象未見」，保留日後未知。');
      }
    }
    if(e.chart.hasChange&&!chosen.some(s=>s.side==='changed'))lines.push('之卦'+e.chart.changed.name+'只記卦變，本次未取其卦爻辭。不能從卦名另推結果或行動路線。');
    return lines.filter(Boolean);
  }

  function meihua(ctx){const{c,section:s,add}=ctx,m=s('本互變與起卦輸入')||c,tri=x=>x&&x.name?x.name+(x.nat||'')+'('+(x.el||'')+')':null,hx=x=>x?(x.n||'')+(x.j?'：'+x.j:''):null;add('起卦與本互變',{上卦:tri(c.up),下卦:tri(c.lo),動爻:c.dong,體卦:tri(c.tiG),用卦:tri(c.yoG),起卦時點:c.castContext?.timestamp,本卦:hx(c.ben),互卦:hx(c.hu),變卦:hx(c.bian),互卦取法:c.nuclear?.exception?c.nuclear.note:undefined});
    if(m.movingLine)add('本卦動爻爻辭（原典：成卦先看爻辭；以時間數字起的先天卦以體用為主、爻辭參照）',m.movingLine.hexagram+m.movingLine.label+'：'+m.movingLine.text);{const WS={旺:'當令最強',相:'有力',休:'退氣',囚:'受困',死:'無力'};add('原體四階段實際作用（引擎已寫成句）',A(s('原體四階段作用')).map(st=>st.label+'：'+A(st.evidence).map(ev=>'體'+ev.bodyElement+'對用'+ev.useElement+ev.relation+'；體在'+(ev.bodySeason?.monthZhi||'')+'月'+(WS[ev.bodySeason?.level]||ev.bodySeason?.level||'')+'、用'+(WS[ev.useSeason?.level]||ev.useSeason?.level||'')).join('；')).join('\n'));}
    const an=c.analysis||{},nb=an.narrativeBlocks||{},yq=c.yingQi||an.yingQi||{},tm=c.timing||an.timingFull||{},rk=c.risk||{},st=c.strategy||{};
    const WS={旺:'當令最強',相:'有力',休:'退氣',囚:'受困',死:'無力'};
    const L=[];
    if(an.tiYong)L.push('體用：'+an.tiYong.rel+'（'+(an.tiYong.judge||'')+'）—'+(an.tiYong.desc||'')+'；體卦'+(an.wangShuai?.ti?.level?WS[an.wangShuai.ti.level]||an.wangShuai.ti.level:'')+'、用卦'+(an.wangShuai?.yo?.level?WS[an.wangShuai.yo.level]||an.wangShuai.yo.level:'')+'（本節令'+(an.wangShuai?.ti?.monthZhi||'')+'月）');
    if(nb.situation)L.push('處境：'+nb.situation);if(nb.coreTension)L.push('張力：'+nb.coreTension);if(nb.trend)L.push('走向：'+nb.trend);/* vary108：這一欄常是吉象的結論（如「變卦比和體：結局吉」），掛「風險」會誤導；已包含在走向裡就不重複，吉象改標「結局」。 */if(nb.risk&&nb.risk!==nb.trend&&!String(nb.trend||'').includes(String(nb.risk)))L.push((/凶|損|克體|剋體|耗|阻|難/.test(nb.risk)?'風險：':'結局：')+nb.risk);
    if(an.eventNature)L.push('事情的性質（本卦五行取象）：'+(an.eventNature.label||'')+'—'+A(an.eventNature.events).join('、')+'；節奏'+(an.eventNature.speed||'')+(an.eventNature.timing?'；對應季節候選：'+an.eventNature.timing:''));
    if(tm.label||tm.windowLabel)L.push('應期：'+(tm.label||tm.windowLabel||'')+(tm.label&&(tm.range||tm.windowLabel)?'（'+(tm.range||tm.windowLabel)+'）':'')+(tm.note?'；'+tm.note:''));
    if(yq.jiTxt||yq.layerTxt)L.push('應期候選（卦氣）：'+[yq.layerTxt,yq.jiTxt,yq.baiTxt].filter(Boolean).join('；'));
    if(A(st.advice).length)L.push('站內策略傾向：'+st.advice.join('、')+'（'+({wait:'先等',push:'可推',hold:'守住',retreat:'退一步'}[st.mode]||'')+'）');
    if(A(rk.points).length)L.push('風險提醒：'+rk.points.join('；'));
    add('進退與時間界線（引擎已寫成句）',L.join('\n'));}
  function name(ctx){const{section:s,add}=ctx,core=s('原名與候選、拆分及比較條件')||{};add('比較條件',P(core,['surname','purpose','baseline','candidateNames','criteria']));
    const grids=g=>({status:g?.status,grids:A(g?.grids).map(v=>[v.role,v.num,v.formula,v.originalNumerology?.theme,v.originalNumerology?.tone,v.originalNumerology?.summary,v.commonModernTable?.level]),sanCai:{configuration:g?.sanCai?.configuration,profile:g?.sanCai?.profile,versions:A(g?.sanCai?.versions).map(v=>[v.profile,v.level]),relations:g?.sanCai?.relations},yinYang:g?.yinYang?.sequence});
    A(s('所有姓名實算')).forEach(p=>{add(p.name+'字音形義：字/採筆畫/康熙/現代/候選讀音/字義/部首/字根',A(p.characters).map(v=>row([v.char,v.stroke,v.kangxi,v.modern,v.readings,v.meaning,v.radical,v.roots])).join('\n'));add(p.name+'主讀數理（五格欄序：格/數/公式/原著主題/傾向/摘要/通行版）',{role:p.comparisonRole,strokeBasis:p.inputPolicy?.strokeBasis,sancaiProfile:p.inputPolicy?.sancaiProfile,readingConfirmation:p.phonetic?.resolution?.confirmedReading,toneSequence:p.phonetic?.toneSequence,warnings:p.phonetic?.warnings,...grids(p.fiveGrids)});add(p.name+'筆畫異讀敏感性',{differences:p.strokeSensitivity?.differences,alternateBasis:p.strokeSensitivity?.alternateBasis,alternate:p.strokeSensitivity?.alternateFiveGrids?{grids:A(p.strokeSensitivity.alternateFiveGrids.grids).map(g=>[g.role,g.num,g.formula,g.originalNumerology?.theme,g.originalNumerology?.tone]),sanCai:{configuration:p.strokeSensitivity.alternateFiveGrids.sanCai?.configuration,versions:A(p.strokeSensitivity.alternateFiveGrids.sanCai?.versions).map(v=>[v.profile,v.level])},yinYang:p.strokeSensitivity.alternateFiveGrids.yinYang?.sequence}:null});/* 2026-11-14 vary107：生肖與八字原本只送「狀態：完整」，算好的結果沒有送出去，AI 只能說「標示完整卻沒有內容」。改成把命中的字根與喜忌寫成句子。 */
      const J=v=>Array.isArray(v)?v.filter(x=>typeof x==='string'||typeof x==='number').join('、'):(typeof v==='string'||typeof v==='number')?String(v):'';
      const zoLine=z=>z&&z.status==='complete'?'屬'+J(z.zodiac)+'；'+A(z.characters).map(ch=>ch.char+'：'+(A(ch.hits).length?ch.hits.map(h=>h.direction+'（字根'+J(h.roots)+(h.label?'，'+h.label:'')+(h.reason?'：'+h.reason:'')+'）').join('、'):'沒有命中的字根')).join('；')+'。這是生肖取象的民俗說法，沒命中不代表不合。':P(z,['status','reason']);
      const bzLine=b=>b&&b.status==='complete'?[J(b.dayMaster)?'日主'+J(b.dayMaster):'',J(b.favored)?'喜'+J(b.favored):'',J(b.unfavored)?'忌'+J(b.unfavored):'',J(b.tiaohou?.need)?'調候取'+J(b.tiaohou.need):''].filter(Boolean).join('，')+'；各字字根五行：'+A(b.characterAlignment).map(ch=>ch.char+'＝'+(A(ch.references).length?ch.references.map(r=>r.element+'（'+J(r.matchedRoots)+'）').join('、'):'字根不帶五行')+(A(ch.fuyiMatches).length?'，合喜用'+J(ch.fuyiMatches):'')).join('；')+'。字根五行只是字形取象，不等於補到用神。':P(b,['status','reason']);
      add(p.name+'其他方法狀態',{zodiac:zoLine(p.zodiac),bazi:bzLine(p.bazi),nameGua:p.nameGua?{status:p.nameGua.status,movingLine:p.nameGua.movingLine,original:P(p.nameGua.original,['name','judgment','line']),changed:P(p.nameGua.changed,['name','judgment'])}:null});});
    add('方法矩陣',compactObject(s('比較方向與方法矩陣')),4);
  }
  function compat(ctx){const{section:s,add}=ctx,c=s('雙方及雙向原盤作用')||{};
    // 紫微雙向與八字雙向形狀不同：紫微交給專屬寫入器，避免整包宮位星曜與逐條投射被當成必要資料。
    if(ctx.a.system==='ziwei')return compatZiwei(ctx,c);
    add('雙方角色與精度',{scenario:c.scenario,uncertainty:c.uncertainty});
    add('出生時間核對',compactObject(c.birthTimeAudit),3);
    for(const k of ['personA','personB']){const p=c[k];if(!p)continue;add((k==='personA'?'甲方':'乙方')+'原局',{...P(p,['name','gender','pillars','dayMaster','strength','favorable','unfavorable','uncertainty','birthInput','birthLunar','sihua']),kongwang:p.auxiliary?.kongwang||undefined,palaces:p.palaces?A(p.palaces).map(v=>P(v,['name','branch','stars'])):undefined,roots:A(p.functionalAssessment?.rootContext).filter(v=>v.hasRoot&&v.stem===p.dayMaster).map(v=>({stem:v.stem,roots:A(v.roots).map(z=>P(z,['pillar','branch','stem','mainQi','rootKind','clashedBy']))})),seasonal:P(p.seasonalAssessment,['conclusion'])});}
    /* 2026-11-12：合盤原本沒有句子段，定調的幾件事（彼此是對方的什麼十神、日柱干支關係、喜忌能否互補、哪些作用落在日柱）散在三張代碼表裡。先寫成句子，細表仍附後。 */
    {const pa=c.personA||{},pb=c.personB||{},sp=c.spousePalace||{},ec=c.elementComplement||{},PLZ={year:'年',month:'月',day:'日',hour:'時'},lines=[];
      const SRZ={generate:'甲方日主生乙方日主',receive:'乙方日主生甲方日主',control:'甲方日主剋乙方日主',controlled:'乙方日主剋甲方日主',same:'雙方日主同五行'};
      const dtg=Object.entries(c.directionalTenGods||{}),dayGod=vs=>A(vs).find(v=>v.partnerPillar==='day'||v.partnerPillar==='日'||v.partnerPillar==='日柱')?.tenGod;
      if(pa.dayMaster&&pb.dayMaster)lines.push('甲方日主'+pa.dayMaster+(pa.dayMasterElement||'')+(pa.strength?'（'+pa.strength+'）':'')+'，乙方日主'+pb.dayMaster+(pb.dayMasterElement||'')+(pb.strength?'（'+pb.strength+'）':'')+(sp.stemRelation?'；'+(SRZ[sp.stemRelation.type]||'')+(sp.stemRelation.label?'（'+sp.stemRelation.label+'）':''):'')+'。');
      const g=dtg.map(([k,vs])=>{const t=dayGod(vs);return t?zhText(k)+'：對方日主是'+t:'';}).filter(Boolean);if(g.length)lines.push('十神定位（'+g.join('；')+'）。');
      if(sp.aDayPillar&&sp.bDayPillar)lines.push('日柱（夫妻宮）：甲方'+sp.aDayPillar+'、乙方'+sp.bDayPillar+'；日支之間'+(A(sp.branchRelations).length?A(sp.branchRelations).map(v=>v.type||v.label||v).join('、'):'沒有合沖刑害破')+'。');
      const onDay=[...A(c.stemRelations).filter(v=>(v.aPillar==='day'||v.bPillar==='day')&&v.type&&v.type!=='天干生剋').map(v=>v.type+'（甲'+(PLZ[v.aPillar]||v.aPillar)+'柱'+v.aStem+'—乙'+(PLZ[v.bPillar]||v.bPillar)+'柱'+v.bStem+'）'),...A(c.branchRelations).filter(v=>v.aPillar==='day'||v.bPillar==='day').map(v=>v.type+'（甲'+(PLZ[v.aPillar]||v.aPillar)+'支'+v.aBranch+'—乙'+(PLZ[v.bPillar]||v.bPillar)+'支'+v.bBranch+'）')];
      lines.push('牽動到日柱的跨盤作用：'+(onDay.length?onDay.join('、'):'沒有')+'。');
      const cnt={};[...A(c.stemRelations),...A(c.branchRelations)].forEach(v=>{if(v.type&&v.type!=='天干生剋'&&v.type!=='同干'&&v.type!=='同支重疊')cnt[v.type]=(cnt[v.type]||0)+1;});
      if(Object.keys(cnt).length)lines.push('全部跨盤合沖刑害計數：'+Object.entries(cnt).map(([k,n])=>k+n+'組').join('、')+'。');
      const el=(a,t)=>A(a).length?t+A(a).join('、'):'';const comp=[el(ec.partnerMaySupportA,'乙方偏強而甲方喜用的五行：'),el(ec.partnerMaySupportB,'甲方偏強而乙方喜用的五行：'),el(ec.partnerMayLoadA,'乙方偏強而甲方所忌的五行：'),el(ec.partnerMayLoadB,'甲方偏強而乙方所忌的五行：')].filter(Boolean);
      lines.push('喜忌互補：'+(comp.length?comp.join('；'):'雙方偏強的五行都不在對方的喜忌清單裡')+'。');
      if(lines.length)add('合盤重點（引擎已寫成句；細表附後供核對）',lines.join('\n'));}
    add('雙向十神：對方柱/天干/十神/藏干',Object.entries(c.directionalTenGods||{}).map(([k,vs])=>k+':'+A(vs).map(v=>row([v.partnerPillar,v.partnerStem,v.tenGod,v.hidden])).join(';')).join('\n'));
    add('雙方日主與夫妻宮',{dayMasters:c.dayMasters,spousePalace:c.spousePalace});
    const SR={generate:'甲生乙',receive:'乙生甲',control:'甲剋乙',controlled:'乙剋甲',same:'同五行'},PL={year:'年',month:'月',day:'日',hour:'時'};
    add('跨盤天干作用：甲柱/乙柱/甲干/乙干/作用',A(c.stemRelations).map(v=>row([PL[v.aPillar]||v.aPillar,PL[v.bPillar]||v.bPillar,v.aStem,v.bStem,v.typeCode==='STEM_COMBINATION'?'五合(化'+(v.candidateElement||'?')+'候選，未必成化)':v.type==='同干'?'同干':(v.typeCode==='STEM_CLASH'?'相沖・':'')+(SR[v.relation]||v.relation)])).join('\n'));
    if(c.elementComplement)add('五行互補（站內相對權重，偏強五行是否落在對方喜忌）',{甲偏強:c.elementComplement.dominantA,乙偏強:c.elementComplement.dominantB,乙可助甲:c.elementComplement.partnerMaySupportA,甲可助乙:c.elementComplement.partnerMaySupportB,乙加重甲負擔:c.elementComplement.partnerMayLoadA,甲加重乙負擔:c.elementComplement.partnerMayLoadB},1);
    add('跨盤地支作用：類型/甲柱/乙柱/甲支/乙支/成化狀態（只有合局才論成化，其餘標—）',A(c.branchRelations).map(v=>row([v.type,v.aPillar,v.bPillar,v.aBranch,v.bBranch,v.transformationStatus??'—'])).join('\n'));
    add('跨盤三合三會與其他組合',{groups:A(c.groupRelations).map(v=>P(v,['type','branches','element','participants','transformationStatus','interpretationScope'])),overlays:compactObject(c.overlays),directions:compactObject(c.directions),projectionGroups:compactObject(c.projectionGroups)},2);
    const sy=c.luckSynchronization;const periods=p=>A(p?.segments).length?p.segments:[p].filter(Boolean);const annual=p=>periods(p).map(v=>[v.dayun,v.gz||v.annual,v.god,interval(v.window),v.connections?v.connections.map(z=>[z.from,z.to,z.stemRelation,z.stemCombination,z.branchRelations]):[v.level,A(v.events).join('；')].filter(Boolean)]);
    const now=Date.now(),years=A(sy?.years),live=years.filter(v=>!v.window?.endExclusive||Date.parse(v.window.endExclusive)>now),near=new Set((live.length?live:years).slice(0,3));
    const yr=v=>({year:v.year,window:interval(v.window),a:annual(v.a),b:annual(v.b)});
    add('同步運限（目前起三年）',{currentA:sy?.aCurrent?{ganzhi:sy.aCurrent.gz,ageStart:sy.aCurrent.ageStart,ageEnd:sy.aCurrent.ageEnd,interval:interval(sy.aCurrent.window)}:null,currentB:sy?.bCurrent?{ganzhi:sy.bCurrent.gz,ageStart:sy.bCurrent.ageStart,ageEnd:sy.bCurrent.ageEnd,interval:interval(sy.bCurrent.window)}:null,years:years.filter(v=>near.has(v)).map(yr)});
    add('同步運限（其他年份）',{years:years.filter(v=>!near.has(v)).map(yr)},2);
    add('紫微雙向運限',compactObject(c.timeline),2);
  }
  function compatZiwei(ctx,c){const{add}=ctx;
    const MAIN=new Set(['major','sha','lucky']),hua=h=>String(h||'').replace('化','');
    const star=x=>x.name+(x.brightness||'')+(x.natalHua?hua(x.natalHua):'');
    const focus=new Set(A(c.focusPalaces));
    add('紫微雙方角色與精度',{scenario:c.scenarioId,focusPalaces:c.focusPalaces,policy:c.policy,unavailable:c.unavailable});
    add('紫微出生時間核對',compactObject(c.birthTimeAudit),3);
    for(const [k,tag] of [['personA','甲'],['personB','乙']]){const p=c[k];if(!p)continue;
      const head={yearGanZhi:(p.yearStem||'')+(p.yearBranch||''),wuxingJu:p.wuxingJu,mingZhu:p.mingZhu,shenZhu:p.shenZhu,currentAge:p.currentAge,natalSihua:A(p.natalTransformations).map(t=>t.star+hua(t.hua)+'→'+t.targetPalace).join('、')};
      Object.keys(head).forEach(x=>{if(head[x]===''||head[x]==null)delete head[x];});
      add('紫微'+tag+'方本命：宮/支/干/主星與煞曜（亮度、生年四化）',(Object.keys(head).length?readable(head)+'\n':'')+A(p.palaces).map(v=>row([v.name+(v.isMing?'(命)':'')+(v.isShen?'(身)':''),v.branch,v.gan,A(v.stars).filter(x=>MAIN.has(x.type)).map(star).join(' ')||'空宮'])).join('\n'));
      const cur=A(p.decades).find(d=>d.isCurrent)||A(p.decades).find(d=>p.currentAge>=d.ageStart&&p.currentAge<=d.ageEnd);
      if(cur)add('紫微'+tag+'方目前大限',{age:cur.ageStart+'–'+cur.ageEnd,ganZhi:(cur.gan||'')+(cur.branch||''),natalPalace:cur.palaceName,sihua:A(cur.transformations||cur.sihua).map(t=>t.star+hua(t.hua)+'→'+(t.targetPalace||t.natalPalace||'')).join('、')||undefined});
      add('紫微'+tag+'方輔佐雜曜',A(p.palaces).map(v=>v.name+':'+A(v.stars).filter(x=>!MAIN.has(x.type)).map(x=>x.name).join(' ')).join('\n'),4);
      add('紫微'+tag+'方宮干飛化與自化',compactObject({palaceFlights:p.palaceFlights,selfTransformations:p.selfTransformations}),3);
      add('紫微'+tag+'方三方四正、格局與來因',compactObject({sanFangSiZheng:p.sanFangSiZheng,patternAssessment:p.patternAssessment,laiYin:p.laiYin}),4);
    }
    add('紫微宮位疊合：地支/甲方宮/乙方宮',A(c.overlays).map(v=>row([v.branch,v.aPalace+(v.aBody?'(身)':''),v.bPalace+(v.bBody?'(身)':'')])).join('\n'));
    const pg=A(c.projectionGroups),hit=v=>focus.has(v.targetPalace)||v.targetPalace==='命宮';
    const line=v=>row([v.sourcePerson+'→'+v.targetPerson,v.stem,v.star+hua(v.hua),v.targetPalace,v.targetBranch,A(v.origins).map(o=>o.palace||'生年').join('+'),v.independentCount]);
    add('紫微跨盤四化投射・題目主宮（方向/干/星化/落宮/支/來源/獨立次數；跨盤引動參照，非受方自身四化）',pg.filter(hit).map(line).join('\n'));
    add('紫微跨盤四化投射・其他宮位',pg.filter(v=>!hit(v)).map(line).join('\n'),2);
    add('紫微雙向運限',compactObject(c.timeline),2);
  }
  function personality(ctx){const{section:s,add}=ctx;const p=s('五軸實算與模型界線')||{};add('模型及五軸（本地模型，不是臨床量表）',[(p.name?'型別：'+p.name+(p.code?'（'+p.code+'）':''):''),A(p.axes).length?'五軸：'+p.axes.map(a=>(a.left||'')+'／'+(a.right||'')+'→偏'+(a.rightSelected?a.right:a.left)+(a.evidence?'（'+a.evidence+'）':'')).join('；'):'',A(p.traits).length?'特質：'+p.traits.map(t=>t.name||t.label||t).join('、'):'',A(p.strengths).length?'長處：'+p.strengths.map(t=>t.name||t.label||t).join('、'):'',A(p.watch).length?'要注意：'+p.watch.map(t=>t.name||t.label||t).join('、'):''].filter(Boolean).join('\n'));}
  function cards(ctx){const{a,e,section:s,add}=ctx,c=e.method==='lenormand'?(ctx.c.lenormandData||ctx.c):ctx.c,d=s('本次完整操作與牌籤作用')||a.methodData||{};
    if(e.method==='oracle'){add('籤詩與本次版本',P(d,['number','ganzhi','poem','source','profile','sourceNote','reading','storyTitles','storyStatus']));{const TAG={supportive:'有利',caution:'要小心',conditional:'有條件',negative:'不利',delay:'要等',waiting:'要等',late:'偏晚',early:'偏早',neutral:'平'};const cats=A(d.categories).filter(x=>x.present!==false);
      add('事項附記（籤文各事項的傾向；附記優先於整首吉意）',cats.map(x=>x.name+'：'+(A(x.textFeatureTags).map(t=>TAG[t]||'').filter(Boolean).join('、')||'有附記')+(A(x.traditionalTimingTokens).length?'（時間字：'+x.traditionalTimingTokens.join('、')+'）':'')).join('；'),2);}return;}
    if(e.method==='ootk'){
      const dict=new Map();for(const op of A(d.operations).filter(op=>op.valid&&!op.abandoned)){const o=op.data||op;for(const card of [...A(o.activeCards),...A(o.openingCards).map(p=>p.card)])if(card&&card.id!=null&&!dict.has(card.id))dict.set(card.id,card);}
      const id=x=>x&&typeof x==='object'?x.id:x==null?'?':[...dict.values()].find(p=>p.name===x)?.id??x;
      const direction=x=>({right:'右',left:'左',deal_order:'序'})[x]??x;
      const relation=x=>({weaken:'弱',friendly:'友',strengthen:'強',neutral:'中'})[x]??x;
      const dignity=p=>row([id(p.card),p.pile||'',relation(p.relation)||'',id(p.leftCard),relation(p.leftDignity)||'',id(p.rightCard),relation(p.rightDignity)||'',state(p.fullDignity),state(p.neutralizedByContraryFlanks)]);
      add('程序、代表牌及預先綁定',{status:d.status,completed:d.completed,notCompleted:d.notCompleted,significator:d.significator,integrity:P(d.integrity,['status','errors','missing']),procedure:d.context?.procedureProfile,countRule:d.context?.countRule,bindings:d.context?.predeclaredBindings,courtMapping:d.context?.sourceContract?.courtMapping});
      add('Book T核心義：牌號/牌名/元素/計數值/原典核心（每張只列一次）',[...dict.values()].sort((a,b)=>a.id-b.id).map(p=>row([p.id,p.name,p.element,p.countValue,p.coreMeaning||p.bookTTitle||'本次未提供原典牌義'])).join('\n'));
      const name=x=>{const o=typeof x==='object'&&x?x:dict.get(typeof x==='number'?x:Number(x))||[...dict.values()].find(p=>p.name===x);return o?o.name:String(x??'?');};
      const core=x=>{const o=typeof x==='object'&&x?x:dict.get(typeof x==='number'?x:Number(x))||[...dict.values()].find(p=>p.name===x);return o&&(o.coreMeaning||o.bookTTitle)?String(o.coreMeaning||o.bookTTitle).split(/[；;。]/)[0]:'';};
      const relWord=x=>({weaken:'削弱',friendly:'友善',strengthen:'增強',neutral:'中性'})[x]||x||'未記錄';
      const pileWord=x=>({fire:'火堆（事業、行動）',water:'水堆（感情、關係）',air:'風堆（思考、口舌、是非）',earth:'土堆（金錢、物質、實際事務）'})[x]||x;
      const sig=d.significator,sigId=sig&&sig.id,b=d.context?.predeclaredBindings||{},opNames={op1:'第一輪（當下狀態）',op2:'第二輪（展開與推進）',op3:'第三輪（心裡的想法與處境）',op4:'第四輪（時間與轉折）',op5:'第五輪（結局）'};
      const pathIds=new Map();const cid_=x=>typeof x==='object'&&x?x.id:x;
      A(d.operations).forEach(op=>{const o=op.data||op;const key=op.operation;const L=[];
        if(!op.valid){add((opNames[key]||key)+'：未完成或無效，不補造',o.abandonReason||'程序未成立');return;}
        if(op.abandoned){add((opNames[key]||key)+'：已放棄，不補造',o.abandonReason||'本輪已停止。');return;}
        if(!sig || !A(o.activeCards).length || !A(o.ringCountingPath||o.countingPath).length){add((opNames[key]||key)+'：程序記錄不足', '這一輪缺少可核對的代表牌或計數路徑，只記操作狀態。');return;}

        const dom=o.domainMeaning||o.sephirahMeaning;const where=o.activePile??o.activeHouse??o.activeSign??o.activeSephirah;
        if(key==='op1'){const match=b.expectedPile&&where?(b.expectedPile===where):null;L.push('代表牌'+name(sigId)+'落在'+pileWord(where)+(match===true?'，即問題所屬之堆':match===false?'；問題所屬為'+pileWord(b.expectedPile):''));}
        else if(key==='op2'){L.push('代表牌落第'+where+'宮'+(dom?'（'+dom+'）':'')+(b.primaryHouse&&Number(where)!==Number(b.primaryHouse)?'；問題所屬為第'+b.primaryHouse+'宮':'，即問題所屬之宮'));}
        else if(key==='op3'){L.push('代表牌落'+where+(dom?'（'+dom+'）':'')+(b.expectedSign&&String(where)!==String(b.expectedSign)?'；問題所屬星座為'+b.expectedSign:''));}
        else if(key==='op4'){L.push('三十六牌環，代表牌在第'+(o.sigPosition??'?')+'位');}
        else if(key==='op5'){L.push('結局落'+where+(dom?'（'+dom+'）':''));}
        if(A(o.openingCards).length)L.push('四堆翻面初示牌：'+o.openingCards.map(pc=>pileWord(pc.pile).split('（')[0]+' '+name(cid_(pc.card))+(pc.pileDignity?.relation?'（'+relWord(pc.pileDignity.relation)+'）':'')).join('、')+'');
        const path=A(o.countingPath||o.countingSteps||o.counting);const cards=A(o.activeCards);
        if(path.length){const chain=path.map(st=>{const cid=st.cardId??st.id;const c0=cards.find(x=>x.id===cid)||dict.get(cid);const inv=c0&&(c0.ootkInverted===true||c0.physicalOrientation==='inverted');if(cid!=null){if(!pathIds.has(cid))pathIds.set(cid,new Set());pathIds.get(cid).add(key);}return name(cid)+(core(cid)?'＝'+core(cid):'');});L.push('計數路徑：'+chain.join(' → '));}
        const pairs=A(o.pairs||o.pairing);const sp=pairs.find(pr=>cid_(pr.left)===sigId||cid_(pr.right)===sigId||name(cid_(pr.left))===name(sigId)||name(cid_(pr.right))===name(sigId));
        if(sp){const l=cid_(sp.left),r=cid_(sp.right);const other=(l===sigId||name(l)===name(sigId))?r:l;L.push('代表牌與'+name(other)+'配對（'+relWord(sp.dignity)+'）'+(core(other)?'：'+name(other)+'＝'+core(other):''));}
        const dg=A(o.dignities||o.elementalDignities).find(x=>cid_(x.card)===sigId||name(cid_(x.card))===name(sigId));
        if(dg){const lc=cid_(dg.leftCard),rc=cid_(dg.rightCard);L.push('代表牌兩側：'+(lc!=null?name(lc)+'（'+relWord(dg.leftDignity)+'）':'無')+'、'+(rc!=null?name(rc)+'（'+relWord(dg.rightDignity)+'）':'無')+(dg.neutralizedByContraryFlanks===true?'，兩側相反':dg.fullDignity===true?'，兩側同性':''));}
        const orient=()=>'';
        if(cards.length)L.push('牌序（'+cards.length+'張，完整）：'+cards.map(pc=>name(pc.id)+orient(pc)).join('、'));
        const others=pairs.filter(pr=>pr!==sp).map(pr=>name(cid_(pr.left))+'＋'+name(cid_(pr.right))+'（'+relWord(pr.dignity)+'）');
        if(others.length)L.push('其餘配對（'+others.length+'組）：'+others.join('、'));
        const pathSet=new Set(path.map(st=>st.cardId??st.id));const dgs=A(o.dignities||o.elementalDignities).filter(x=>x!==dg&&pathSet.has(cid_(x.card)));
        if(dgs.length)L.push('路徑牌尊貴：'+dgs.map(x=>name(cid_(x.card))+'—左'+(cid_(x.leftCard)!=null?name(cid_(x.leftCard))+relWord(x.leftDignity):'無')+'、右'+(cid_(x.rightCard)!=null?name(cid_(x.rightCard))+relWord(x.rightDignity):'無')+(x.neutralizedByContraryFlanks===true?'（抵銷）':'')).join('；'));
        add(opNames[key]||key,L.join('\n'));
      });
      const recur=[...pathIds].filter(([cid,ops])=>ops.size>=2&&cid!==sigId).map(([cid,ops])=>name(cid)+'（'+[...ops].map(k=>k.replace('op','第')+'輪').join('、')+'）'+(core(cid)?'＝'+core(cid):''));
      if(recur.length)add('跨輪重現的牌（出現兩輪以上）',recur.join('\n'));
      return;
    }
    add('牌陣與程序',{method:c.methodPlan?.method||c.methodPlan?.id||c.tarotData?.methodPlan?.id,sourceProfile:d.sourceProfile||c.sourceProfile||c.tarotData?.sourceProfile,spread:c.spreadType||c.spread||c.lenormandData?.spreadType||c.tarotData?.spreadZh||c.tarotData?.spreadType,drawProcedure:d.drawProcedure,eventGroups:d.eventGroups,commonContext:d.commonContext});
    const ln=e.method==='lenormand',mathers=d.sourceProfile==='mathers_1888';// 雷諾曼沒有逆位，不印「方向?」讓AI誤以為缺資料
    add(ln?'全部牌序：位置/牌號/牌名/含義/人物事件綁定（雷諾曼不分正逆）':'全部牌序：位置/牌號/牌名/方向/含義/人物事件綁定',A(d.records).map(p=>row(ln?[p.position||p.index,p.id,p.name,p.keywords||p.meaning,p.binding??'—']:[p.position||p.index,p.id,p.name,p.direction,mathers?(p.meaning?'見同序原義':'原義未載'):p.keywords||p.meaning,p.binding??'—'])).join('\n'));
    if(!ln&&A(d.records).length){const R=A(d.records),SU=[['wand','權杖','火'],['cup','聖杯','水'],['sword','寶劍','風'],['pent','錢幣','土']],majors=R.filter(r=>r.suit==='major'),rev=R.filter(r=>r.direction==='逆位'),miss=SU.filter(([k])=>!R.some(r=>r.suit===k)).map(([,n,el])=>n+'('+el+')'),at=ix=>A(ix).map(i=>R[i-1]?.position).filter(Boolean).join('、');
      add('整組牌結構（數量本身就是讀牌線索）',['大牌'+majors.length+'/'+R.length+'張'+(majors.length?'（'+majors.map(r=>r.position).join('、')+'）':''),'花色：'+SU.map(([k,n,el])=>n+'('+el+')'+R.filter(r=>r.suit===k).length).join(' ')+(miss.length&&R.length>=5?'；缺'+miss.join('、'):''),R.some(r=>r.direction==='正位'||r.direction==='逆位')?'逆位'+rev.length+'張':null,A(d.courtPositions).length?'宮廷牌在：'+at(d.courtPositions):'沒有宮廷牌',A(d.rankEchoes).length?'重複數字：'+d.rankEchoes.map(x=>(({ace:'王牌',page:'侍者',knight:'騎士',queen:'皇后',king:'國王'})[x.rank]||x.rank)+'（'+at(x.positions)+'）').join('；'):null].filter(Boolean).join('；'));
      const mt=R.filter(r=>r.meaning);if(mt.length)add(d.sourceProfile==='gd_book_t'?'金色黎明 Book T 牌義（依牌位與相鄰元素讀取）':mt.some(r=>r.meaningTopic==='Mathers原義')?'牌義（Mathers《The Tarot》1888 原書；序號對應上表的牌位與正逆）':(mt.every(r=>r.meaningTopic==='偉特原義')?'RWS牌義（Waite《塔羅圖解》原典；依牌位與原題情境轉述）':mt.some(r=>r.meaningTopic==='偉特原義')?'RWS牌義（標〔偉特原義〕者為 Waite《塔羅圖解》原典，其餘為站內依題型整理；依牌位與原題情境轉述）':'RWS牌義（站內依題型整理的偉特系牌義；依牌位與原題情境轉述）'),mt.map(r=>mathers?r.index+'｜'+r.meaning:r.position+'｜'+r.name+r.direction+(r.meaningTopic?'〔'+r.meaningTopic+'〕':'')+'：'+r.meaning).join('\n'),mathers?0:1);}
    if(e.method==='tarot'&&A(d.records).length){
      // 牌陣結構由引擎的方法登記（牌位權責＋依賴鏈）寫成句子；不靠牌位名稱猜。
      const plan=c.methodPlan||c.tarotData?.methodPlan||null,R=A(d.records),slots=A(plan?.slots),deps=A(plan?.dependencies);
      const AUTH={state:'現況',cause:'成因',enabler:'助力（推動這件事的力量）',obstacle:'阻礙',advice:'建議／介入',outcome:'結果',antecedent:'既有影響（過去）',timeline:'時間段',stage:'階段',environment:'環境／他人',person_aggregate:'對方',comparison:'比較路',domain:'生活領域',structural:'結構層',synthesis:'總結',interaction_force:'交叉力量',development:'走向',cause_action:'成因與行動'};
      const nm=i=>R[i]?(R[i].name+(R[i].direction||'')):'?',lab=i=>slots[i]?.label||R[i]?.position||('第'+(i+1)+'張');
      const normA=a=>/outcome/.test(String(a||''))?'outcome':/antecedent|receding|prior|past/.test(String(a||''))?'antecedent':/^person/.test(String(a||''))?'person_aggregate':String(a||'structural');
      if (!ctx.safetyFirst && d.sourceProfile === 'rws_reversals' && slots.length === R.length) {
        const suits = {wand:'火',cup:'水',sword:'風',pent:'土'};
        const counts = Object.keys(suits).map(k=>({element:suits[k], count:R.filter(r=>r.suit===k).length}));
        const least = Math.min(...counts.map(x=>x.count));
        const tied = counts.filter(x=>x.count===least);
        const outcomes = R.filter((_,i)=>normA(slots[i].authority||slots[i].role)==='outcome');
        const last = outcomes.length===1 ? outcomes[0] : null;
        const element = tied.length===1 ? tied[0].element : last?.element;
        const reason = tied.map(x=>x.element).join('、')+'各'+least+'張'+(tied.length===1?'，數量最少':'，同為最少');
        const material = ({風:'金',水:'水',火:'火',土:'土'})[element];
        add('本站手鍊取象的實算依據', material ? reason+(tied.length>1?'。結果位第'+last.index+'張'+last.name+'屬'+element:'')+'，按本站規則取'+material+'。' :
          reason+'。本陣沒有唯一可用的結果位元素，無法按此規則定出單一五行。這次可用身邊現有信物。',1);
      }
      const byAuth={};slots.forEach((sl,i)=>{if(!R[i])return;const a=normA(sl.authority||sl.role);(byAuth[a]=byAuth[a]||[]).push(lab(i)+'＝'+nm(i));});
      const order=['state','person_aggregate','cause','enabler','antecedent','obstacle','interaction_force','environment','advice','timeline','stage','development','comparison','outcome','domain','structural','synthesis'];
      const unmapped=[...new Set(slots.map(sl=>normA(sl.authority||sl.role)).filter(a=>!AUTH[a]))];if(unmapped.length)order.push(...unmapped);
      const lines=order.filter(a=>byAuth[a]).map(a=>(AUTH[a]||a)+'：'+byAuth[a].join('；'));
      const mid=String(c.methodPlan?.id||c.tarotData?.methodPlan?.id||c.spreadType||'');
      const chainNote={celtic_cross:['交叉：第一張被第二張橫壓，先講核心被什麼牽制','縱軸：根基→核心→可能成形，是這件事從底到頂的結構','橫軸：身後→核心→身前，是時間流向','杖列：本人、環境、希望或恐懼、結果，由下往上讀成結論','希望或恐懼對著結果看：期待的和會發生的是不是同一件'],cross:['交叉：核心被阻礙牽制','過去→核心→未來是時間流','建議要對著交叉的阻礙講'],five_card:['成因→現況→阻礙是為什麼卡','介入→阻礙→現況→結果是怎麼解'],three_card:['基礎→現況→結果一條線'],timeline:['五段依序，轉折在中間，最後一段是落點，不換算日期'],either_or:['A路：背景→A狀態→A走向','B路：背景→B狀態→B走向，同一標準比較'],relationship:['你→對方→關係本身','限制對著關係本身','介入→限制→關係→走向'],horseshoe:['過去→現在→隱藏影響是起點','他人→阻礙是外力','建議→他人→阻礙→結果是解法到落點'],tree_of_life:['右柱（慈悲）：智慧、慈悲、勝利','左柱（嚴厲）：理解、嚴厲、榮耀','中柱：王冠→美→基礎→結果，中柱是主線'],zodiac:['對宮成對：一宮對七宮、二對八、三對九、四對十、五對十一、六對十二；先讀題目所在的宮與它的對宮，再總結'],minor_arcana:['成因→現況→阻礙','環境→資源→介入→結果'],fifteen_card:['中列三張是核心','四組各三張：自然走向、替代走向、決策依據、不可控條件'],mathers_21:['三列各七張，由右到左讀成三段敘事'],mathers_horseshoe:['三組馬蹄，由右到左先成連貫答案，再首尾配對'],year_review:['前三張回顧，後五張展望，不是八個月份'],monthly:['十二張各一個月，第十三張總結'],multi_option:['每個選項各三張：現況、限制、走向，同一尺度比較'],multi_question:['每個子題五張各自成句，不互借牌位']}[mid]||[];
      const chains=deps.map((g,k)=>(chainNote[k]?chainNote[k]+'：':'')+g.map(i=>lab(i)+'（'+nm(i)+'）').join('→'));
      if(lines.length||chains.length)add('牌陣結構讀法（引擎依方法登記寫成；先讀鏈，再讀單張）',lines.concat(chains.length?['讀法鏈：\n'+chains.join('\n')]:[]).join('\n'));
    }
    if(e.method==='lenormand'&&A(d.records).length===9&&String(c.spreadType||c.spread||c.lenormandData?.spreadType)==='nine'){const N=i=>d.records[i-1]?.name,g=ix=>ix.map(N).join('、');add('九宮格讀法（中心是核心；左欄已發生、中欄現在、右欄將來；上列想法意識、中列現實、下列潛在根基；四角是框住整件事的條件）','中心：'+N(5)+'；四角：'+g([1,3,7,9])+'；左欄：'+g([1,4,7])+'；中欄：'+g([2,5,8])+'；右欄：'+g([3,6,9])+'；上列：'+g([1,2,3])+'；下列：'+g([7,8,9])+'；兩條對角：'+g([1,5,9])+'／'+g([3,5,7]));}
    if(e.method==='lenormand'&&d.tableau){const tb=d.tableau,q=String(ctx.data.question||''),cellOf=id=>A(tb.cells).find(x=>x.id===id),dist=(a,b)=>{const x=cellOf(a),y=cellOf(b);return x&&y&&typeof x.row==='number'&&typeof y.row==='number'?Math.max(Math.abs(x.row-y.row),Math.abs(x.col-y.col)):null;};
      const topic=[[/感情|戀|恋|喜歡|喜欢|復合|复合|曖昧|婚|對象|对象|伴侶|伴侣|桃花|交往|分手/,[24,25]],[/工作|事業|事业|職|职|面試|升遷|老闆|同事|公司|創業/,[35,14,19]],[/年終|年终|獎金|奖金|紅利|分紅|加薪|津貼|補助|退稅|錢|钱|財|财|收入|投資|投资|生意|薪|賣場|副業|網拍|經營|開店|客人|訂單|營收|電商|店/,[34,15,3,20]],[/健康|身體|身体|病|手術/,[5,8]],[/家|房|搬家|住/,[4]],[/消息|聯絡|联络|訊息|回覆|回复/,[27,1,12]]].filter(([re])=>re.test(q)).flatMap(([,ids])=>ids);
      add('指示牌九宮格與主題牌距離（左已發生、右將來、上想法、下潛在根基；距離1為貼身）',A(tb.significators).map(s=>s.name+'('+s.id+')在第'+s.position+'格（第'+s.row+'列第'+s.col+'欄）：'+Object.entries(s.around).map(([k,v])=>k+v).join('、')+([...new Set(topic)].length?'；主題牌距離：'+[...new Set(topic)].map(id=>{const c=cellOf(id),d0=dist(s.id,id);return c?c.name+(d0==null?'在尾排':d0):null;}).filter(Boolean).join('、'):'')).join('\n')+(A(tb.significators).length?'':'本盤無紳士／淑女牌'));
      add('大牌陣宮位：格/宮名/落入的牌（自宮：'+(A(tb.ownHouses).join('、')||'無')+'；四角：'+A(tb.corners).join('、')+'）',A(tb.houses).map(h=>h.house+h.houseName+'宮:'+h.card).join(' '),1);}
    if(e.method==='lenormand'){
      const R=A(d.records),N=i=>R[i-1]?.name||('第'+i+'張'),g=c.declaredGender||d.declaredGender,pr=c.personRep||d.personRep,cf=c.customFocus||d.customFocus;
      const inSpread=id=>R.find(r=>r.id===id);
      add('代表牌規則（引擎依性別聲明決定，不由牌面推）',(pr?'本人='+pr.name+'（'+pr.basis+'）'+(inSpread(pr.id)?'，在'+ (inSpread(pr.id).position||'第'+(R.indexOf(inSpread(pr.id))+1)+'張')+'；它周圍的牌是本人現在的處境':'，本次未抽到，整個牌陣直接當成本人的事來讀'):(g?'已聲明性別但無對應代表牌':'未聲明性別：紳士／淑女出現時只是牌面裡的一位男性／女性人物，不自動當本人'))+(cf?'；另指定焦點牌'+cf.name+'（代表本題那件事）'+(inSpread(cf.id)?'在'+(inSpread(cf.id).position||''):'未抽到'):'')+(R.some(r=>(r.id===28||r.id===29)&&!(pr&&pr.id===r.id))?'；牌面上另有'+R.filter(r=>(r.id===28||r.id===29)&&!(pr&&pr.id===r.id)).map(r=>r.name).join('、')+'：是別人（主管、同事、對象或家人），依題目決定是誰，不當本人':''));
      const paths=A(d.paths),mirror=A(d.mirror),knights=A(d.knights),spread=String(c.spreadType||c.spread||d.spreadType||''),md=c.methodData||d.methodData||{};
      const pairNames=list=>list.map(m=>N(m.a)+'↔'+N(m.b)).join('、');
      if(spread==='two'&&R.length===2){add('雙牌讀法（引擎幾何）','主題'+N(1)+'，修飾'+N(2)+'：第二張形容第一張，讀成一句「'+N(1)+'，而且是'+N(2)+'那種」；沒有中心、沒有鏡像，不要讀成線。');}
      else if(spread==='choice'&&R.length===7){add('雙路比較讀法（引擎幾何）','A路：'+[1,2,3].map(N).join('→')+'；共同背景：'+N(4)+'；B路：'+[5,6,7].map(N).join('→')+'。兩路各自先讀成一句，共同背景同時套在兩路上，再用同一個標準比較；分線不跨接，A3與B1不相鄰。'+(pr&&inSpread(pr.id)?'本人'+pr.name+'落在'+inSpread(pr.id).position+'：只表示他的心思現在站在那一路，不代表那一路結果較好。':''));}
      else if(spread==='branches'&&A(md.branches).length){const br=A(md.branches);add('分線讀法（引擎幾何，每路獨立）',br.map((b,i)=>'第'+(i+1)+'路「'+(b.entity||b.question||'')+'」：'+[1,2,3].map(j=>N(i*3+j)).join('→')+'—單獨讀成一句').join('\n')+'\n路與路之間不相鄰、不比牌面吉凶總數；逐路答完原句的每個子題，再講共同條件。');}
      else if(spread==='nine'&&R.length===9){add('九宮格鏡像與騎士步（引擎幾何）','鏡像成對（隔著中心對照）：'+pairNames(mirror)+'；騎士步（隔格相望，較遠的影響）：'+pairNames(knights)+'。先讀中心與四正，再用鏡像補因果，騎士步只在改變結論時用。');}
      else if(d.tableau&&R.length===36){const rowLen=spread==='grand_nines'?9:8,rows=[];for(let r=0;r<4;r++)rows.push(R.slice(r*rowLen,r*rowLen+rowLen).map(x=>x.name).join('→'));const tail=rowLen===8?R.slice(32,36).map(x=>x.name).join('→'):'';
        const sigRec=pr&&inSpread(pr.id);let sigGeo='';if(sigRec){const idx=R.indexOf(sigRec);if(idx<32||rowLen===9){const r=Math.floor(idx/rowLen),cc=idx%rowLen;const col=[];for(let k=0;k<4;k++)col.push(R[k*rowLen+cc]?.name);const dg1=[],dg2=[];for(let k=-3;k<=3;k++){const rr=r+k,c1=cc+k,c2=cc-k;if(rr>=0&&rr<4&&c1>=0&&c1<rowLen)dg1.push(R[rr*rowLen+c1].name);if(rr>=0&&rr<4&&c2>=0&&c2<rowLen)dg2.push(R[rr*rowLen+c2].name);}
          const mr=mirror.filter(m=>m.a===idx+1||m.b===idx+1).map(m=>N(m.a===idx+1?m.b:m.a)),kn=knights.filter(m=>m.a===idx+1||m.b===idx+1).map(m=>N(m.a===idx+1?m.b:m.a));
          sigGeo='\n本人'+pr.name+'所在橫列：'+rows[r]+'；直欄：'+col.filter(Boolean).join('→')+'；兩條斜線：'+dg1.join('→')+'／'+dg2.join('→')+(mr.length?'；鏡像牌：'+mr.join('、'):'')+(kn.length?'；騎士步牌：'+kn.join('、'):'')+'。橫列是他這段時間的主線，左邊已發生、右邊將發生；直欄上面是他想的、下面是壓在底下的。';}
          else sigGeo='\n本人'+pr.name+'落在尾排（第'+(idx-31)+'張）：尾排是整件事的結語，不與主盤連線。';}
        add('大牌陣四列與尾排（引擎幾何；每列由左到右就是時間順序）',rows.map((x,i)=>'第'+(i+1)+'列：'+x).join('\n')+(tail?'\n尾排（結語，獨立讀）：'+tail:'')+sigGeo+'\n其他牌的橫直斜線同理用它的列欄取，不從牌號算。');}
      else if(paths.length===1&&R.length>=3){const mid=Math.ceil(R.length/2);add('線陣讀法（引擎幾何）','整條線：'+paths[0].map(N).join('→')+'；中心'+N(mid)+'是這件事的核心，左邊'+paths[0].slice(0,mid-1).map(N).join('、')+'是已經在發生或推著它的，右邊'+paths[0].slice(mid).map(N).join('、')+'是它接下來的走向。相鄰兩張連成一句：'+paths[0].slice(0,-1).map((p,i)=>N(p)+'＋'+N(paths[0][i+1])).join('、')+(mirror.length?'。鏡像成對（繞中心對照，常是因果或一體兩面）：'+pairNames(mirror):'')+'。先把整條讀成一句話，再回頭看哪一段對本題最重。');}
      else {add('合法全線',d.paths);add('鏡像及騎士步',P(d,['mirror','knights']),3);}
    }
    else add('實際牌陣特殊作用',compactObject(d.methodData),1);
  }
  /* 本題焦點層與邊界層已移除：解讀依各法正統取法與完整實算資料推演，不另加站內判斷規則。 */
  const writers={bazi,ziwei,vedic,astro,liuren,liuyao,yijing,meihua,name,compat,personality,tarot:cards,lenormand:cards,ootk:cards,oracle:cards};
  function readingProcedure(entry){
    const {method,chart,analysis}=entry;
    if(method==='tarot'){
      const profile=analysis.methodData?.sourceProfile;
      const recorded=chart.tarotData||chart;
      const spread=recorded.spreadType||recorded.methodPlan?.id||'';
      const layout=/^mathers_/.test(spread)?'依本次 Mathers 牌陣已記錄的組別、讀序與配對閱讀。':'依本次實際牌陣的牌位與讀序閱讀。';
      if(profile==='mathers_1888')return {name:'Mathers 塔羅',guide:layout+'每張牌依本次方向取 Mathers《The Tarot》(1888) 所列的牌義。缺少該版條目時保留空缺。',trade:false};
      if(profile==='gd_book_t')return {name:'金色黎明塔羅',trade:false,guide:layout+'依金色黎明 Book T，從實際牌位及該牌的本義出發。只有牌陣記錄的相鄰關係才能用來比較元素尊貴。先說哪個位置提供主線，哪張鄰牌加強或牽制它，再回到原題。牌的實體朝向不另取偉特逆位義。'};
      if(profile!=='rws_reversals')return {name:'塔羅',trade:false,guide:layout+'依已知牌名與原題閱讀。資料未確認牌義體系，保留版本差異。'};
      if(/^mathers_/.test(spread))return {name:'偉特塔羅',guide:layout+'個別牌義依本次選定的偉特系正逆位解讀。'};
    }
    if(method==='compat'){
      const scenario=chart.scenario?.id||chart.scenarioId;
      const relationship=chart.scenario?.name||'本次關係';
      if(analysis.system==='ziwei'||chart.personA?.palaces?.length){
        return {name:'紫微斗數合盤',guide:'依紫微斗數雙盤，核對甲乙的本命宮位、題宮三方與已列的疊宮、飛化。分清誰的宮干起化、落到誰的哪一宮，解釋雙向作用是否一致。按'+relationship+'的實際角色讀相處與可協商之處，運期僅採雙方均已列出的交集。'};
      }
      if(scenario&&scenario!=='marriage'&&scenario!=='couple')return {name:'八字合盤',guide:'依雙方原局與本次'+relationship+'角色，先看各自承擔和需求，再比較雙向十神、跨柱合沖及實有的共同運期。用一個具體互動說明誰受益、誰承受成本，雙方的意願須由實際相處核對。'};
    }
    if(method==='astro'&&chart.input?.chartPurpose==='event')return {name:'西洋事件盤',guide:'依事件所選時地的星位、四角與相位讀當時的條件與發展，區分正在形成及已過的相位。事件盤沒有提供個人的出生特質。'};
    if(method==='astro'&&chart.input?.chartPurpose==='horary')return {name:'西洋卜卦占星',trade:false,guide:'依本次卜卦盤的問事宮、雙方主星與月亮，核對接納、入相、換座或停滯前的實際成相，以及傳光、集光與介入受阻。用資料裡的先後說明哪個條件能使事情推進，候選相位尚待成相時要保留條件。'};
    return {name:names[method]||method,guide:guides[method]||'依本法實際資料推演。'};
  }

  function measurementText(m){
    if(typeof m==='string')return m;
    if(!m)return '';
    const cadence={monthly:'每月',weekly:'每週',yearly:'每年',annual:'每年',daily:'每天'}[m.cadence]||'';
    const threshold=m.threshold?.surface??m.threshold?.value??'';
    const comparison={gt:'超過',gte:'達到',lt:'低於',lte:'不超過',eq:'等於'}[m.threshold?.operator]||'';
    const metric=[cadence,m.metric,threshold!==''?comparison:'',threshold,m.currency].filter(x=>x!=null&&x!=='').join('');
    return [metric,m.recurrence?.required?'分清單次和持續達標':'',m.ambiguity?'營收與淨額的口徑須分開核對':''].filter(Boolean).join('，');
  }

  // Repeat only explicit decision inputs near the answer instructions. A missing offer
  // and a confirmed arrangement can occur in the same sentence and belong to different people.
  function statedConditions(question,notes){
    const rows=[];
    const pending=/(?:還沒|尚未|仍未|沒有|未曾|未)(?:有|能)?(?:提供|告知|確認|確定|查到|公布|說明|報價|開出|得知|取得|談妥)|尚不清楚|不確定|不知道|不詳|未知|待(?:定|確認|查證)/;
    const reported=/如果|假設|假如|若是|聽說|據說|傳聞|他說|她說|「|」|[“”"]/;
    const questionFacts=[];
    for(const sentence of String(question||'').match(/[^。！？!?；;\n]+[。！？!?；;]?/gu)||[]){
      if(reported.test(sentence))continue;
      for(const piece of sentence.split(/，|,(?!\d)/u)){
        const clause=piece.trim().replace(/[。；;]$/u,'');
        if(/[？?]|是否|有沒有|會不會|能不能|要不要|該不該|嗎$|哪(?:一|個|些|種)/.test(clause))continue;
        if(pending.test(clause)||/已(?:經|確認|確定|收到|簽訂|拿到)|(?:目前|現在)(?:是|有|只有)|(?:是|採)固定/.test(clause))questionFacts.push(clause);
      }
    }
    const sentences=[...new Set([...String(notes||'').split(/[。！？!?；;\n]+/u),...questionFacts])];
    for(const sentence of sentences){
      const quote=sentence.trim();
      if(!quote)continue;
      if(reported.test(quote)){rows.push({kind:'提到的假設或轉述，按原語氣',text:quote});continue;}
      for(const clause of quote.split(/，|,(?!\d)/u)){
        const part=clause.trim();
        if(!part)continue;
        const kind=pending.test(part)?'尚待確認或取得':/希望|打算|期待|想要|看重|重視/.test(part)?'本人表明的期待':'本人自述的現況';
        const last=rows[rows.length-1];
        if(last?.kind===kind&&/^(?:也|而且|並且|以及)/.test(part))last.text+='，'+part;
        else if(!rows.some(r=>r.kind===kind&&r.text===part))rows.push({kind,text:part});
      }
    }
    if(!rows.some(r=>r.kind==='尚待確認或取得'))return '';
    const wants=String(question||'').split(/[。！？!?；;\n，]+/u).map(x=>x.trim()).filter(x=>/^我(?:最|特別|比較)?(?:看重|在意|重視)|^我的(?:底線|首要條件)/.test(x));
    const shown=[...wants.map(text=>({kind:'本人表明的取捨標準',text})),...rows];
    const lines=shown.map(r=>r.kind+'：'+r.text).join('\n');
    // The complete original statement stays in the header, irrespective of this recap.
    if(chars(lines)>520)return '';
    return '【作答前核對本人給的條件】\n'+lines+'\n先按每句的對象與原意比較。某一方的未知條件保持未知。從已知的安排推不到生活結果時，就交代還缺哪一項；不要把推測寫成當事人做得到或做不到。說明問清哪一件事會改變建議。';
  }

  function asksForOccupation(question){
    return /(?:適合|適合我|能做|可以做|選擇|推薦|改做|想做|考慮).{0,8}(?:什麼|哪些|哪種|哪一種|哪個|哪一行).{0,6}(?:工作|職業|行業|副業|生意|發展|做)|(?:做什麼|哪一行|哪種行業|哪些行業|哪種職業|哪些職業)|(?:工作|職業|行業|副業).{0,8}(?:有哪些選擇|有哪些方向|有什麼選擇|有什麼方向|推薦哪)/.test(String(question||''));
  }

  // Bind topic roles to the method's own generated items. The complete tables remain in the packet.
  const topicItems={
    career:{bazi:'career',ziwei:'官祿',vedic:10,astro:10},
    'work-obligations':{bazi:'career',ziwei:'官祿',vedic:6,astro:6},
    finance:{bazi:'resources',ziwei:'財帛',vedic:2,astro:2},
    relationship:{bazi:'relationships',ziwei:'夫妻',vedic:7,astro:7},
    children:{ziwei:'子女',vedic:5,astro:5},
    home:{ziwei:'田宅',vedic:4,astro:4},
    study:{bazi:'learning',vedic:9,astro:9},
    parents:{ziwei:'父母',vedic:4,astro:4}, health:{ziwei:'疾厄',vedic:6,astro:6}, spiritual:{ziwei:'福德',vedic:9,astro:9}
  };
  function topicEvidence(ctx){
    const {e,a,c,add}=ctx;
    const selected=new Set();
    if(a.coverage?.provisional||(c.input?.unknownTime||c.sensitivity?.unknownTime)||(e.method==='astro'&&c.input?.chartPurpose!=='natal'))return selected;
    const focus=a.depthContract?.requestCoverage?.caseBasis?.focus;
    for(const aspect of A(focus?.aspects)){
      const role=topicItems[aspect.id]?.[e.method];
      if(!role)continue;
      const id=e.method==='ziwei'?'palace-'+role:typeof role==='number'?'house-'+role:role;
      const item=A(a.items).find(x=>x.id===id);
      if(item?.summary&&A(item.evidence).length)selected.add(item);
    }
    if(selected.size){
      const rows=[...selected].map(item=>[item.label+'：'+item.summary,
        A(item.support).length?'支持：'+item.support.join('、'):'',
        A(item.caution).length?'牽制：'+item.caution.join('、'):''].filter(Boolean).join('；'));
      add('原題對應的本命依據（與後文同一盤，只算一次）',rows.join('\n'));
    }
    return selected;
  }
  const plans=new Map();
  function observationText(observation){
    return '【本人點選的落點與回應】\n'+[observation.source+'／'+observation.location,observation.evidence,observation.experience&&'本人對照：'+observation.experience,observation.note&&'本人補充：'+JSON.stringify(observation.note),'先就這個落點回答原題。本人說不吻合時，說清楚要修正哪個推論；尚未確認的繼續保留。'].filter(Boolean).join('\n');
  }
  function compile(entries,data){
    if(!Object.hasOwn(data,'knownFacts'))data={...data,knownFacts:root.JYKnownFacts?.get?.()||''};
    const caseNotes=[data.notes,data.knownFacts,data.priority,data.followUp?.note].filter(Boolean).join('\n');
    const safe=root.JYReadingWorkflow?.careContext?.(data.question,caseNotes)?.level==='safety-first';
    const steps=root.JYConsultationEvidence.asksForPractical(data.question,data.priority);
    const natalWestern=data.method==='astro'&&entries.length===1&&entries[0].chart?.input?.chartPurpose==='natal';
    const header=['【一次貼上・完整解讀提示詞】',json({schema:'jy.native-analysis/1',method:data.method,delivery:'single-message',build:VERSION}),'【原問題】\n'+JSON.stringify(data.question),hasData(data.notes)?'【本次補充】\n'+JSON.stringify(data.notes):'',data.knownFacts?'【原題補充：他自己寫的實際情況】\n'+JSON.stringify(data.knownFacts):'', data.priority?'【本人希望這次幫忙釐清的事】\n'+JSON.stringify(data.priority)+'\n這是他看重的標準，不能當成已經發生的事。':'', data.followUp?observationText(data.followUp):'', '【解讀與查證規則】\n'+(safe?[rules[0],'本次優先照顧眼前安全，暫停占斷。',rules[2]]:rules).join('\n'),
      '【資料閱讀方式】\n以下是本次實算資料。表格依標題欄序還原，?是未定；不需要附件。'].filter(Boolean);
    const visits=[],openingBlocks=[];
    const blocks=[];const add=(label,v,priority=0)=>{zhMethod=data.method;if(hasData(v))blocks.push({label,value:typeof v==='string'?zhText(v):readable(v),priority,method:'shared'});};
    const tasks=data.requestCoverage?.[0]?.coverage?.requirements?.tasks;if(A(tasks).length>1||A(tasks).some(t=>A(t.measurement).length)){const GW={general:'這個子題本身',direction:'方向／會不會',compare:'比較',comparison:'比較',timing:'時間',amount:'數量金額',count:'數量',rate:'比率',state:'現況',yesno:'是否',reason:'原因',cause:'原因',person:'人物',enumeration:'列出有哪些',advice:'該怎麼做',choice:'選哪一個',location:'在哪裡',vocation:'適合做什麼'},OW0=root.JYTarotFoundation?.OBSERVABLES||{},OW=Object.assign({},OW0,{existence:'有沒有',independent_subjects:'每個人、每件事分開講',independent_options:'每個選項分開講',state:'現在的狀況',realization:'會不會成',trajectory:'接下來怎麼走',conditional_outcome:'照現況下去的結果',bounded_outcome:'到他說的期限時會怎樣',threshold_outcome:'過不過得了那個門檻',comparison_outcome:'兩邊用同一把尺比',enumeration:'逐項列出',attention_focus:'最該注意什麼',cause:'為什麼會這樣',antecedent:'之前的影響',obstacle:'卡住的地方',enabler:'幫得上忙的力量',advice:'可以怎麼做',dyad:'兩個人各自的狀態與互動',temporal_sequence:'先後順序',annual_overview:'整年各方面',domain_coverage:'各方面分開講',hidden:'檯面下的因素',external:'外在條件',location:'在哪裡的線索',structural_depth:'更深一層的原因',narrative:'來龍去脈',exhaustive:'完整走一遍',willingness:'對方的意願',event_action:'實際會不會行動',invitation_or_arrangement:'邀約與安排',participant_structure:'牽涉哪些人',reported_event:'他提到的那件事',causal_layers:'背景、原因與結果',evaluation_outcome:'這個人或這件事適不適合他',relationship_context:'關係現況',option_set:'有哪些選項',decision_criteria:'用什麼標準選',action_guidance:'下一步怎麼做',threshold_timing:'什麼時候達到',recurrence_context:'會不會再發生',count:'數量',amount:'金額',rate:'比率',timing:'時間',comparison:'比較',person:'對方',reason:'原因'}),zhOnly=v=>/[A-Za-z]/.test(String(v||''))?null:v;const lines=tasks.map((t,i)=>{
        const source=t.source||'';
        const goal=['general','direction','yesno','state'].includes(t.goal)?'':GW[t.goal];
        const observables=[...new Set(A(t.requiredObservables).map(x=>OW[x]||zhOnly(x)).filter(Boolean))];
        const amounts=A(t.measurement).map(measurementText).filter(Boolean);
        return '子題'+(i+1)+'「'+source+'」'+(goal?'：'+goal:'')+(observables.length?'；要講到'+observables.join('、'):'')+(amounts.length?'；原題衡量條件：'+amounts.join('、'):'');
      });
      // Source text can contain Latin names, units and punctuation. Preserve it verbatim.
      blocks.push({label:'原句子題核對（每一題都要各自答）',value:lines.join('\n'),priority:0,method:'shared'});
    }
    const situation=root.JYReadingWorkflow?.situation?.(data.question,caseNotes)||data.requestCoverage?.[0]?.coverage?.situation;
    if(data.sourceCoverage?.requestedRecords>1)add('合讀方式','先依每份標記辨別資料屬於誰、來自哪一種方法。只有資料明示是雙人關係盤時才作雙向推論。同一出生資料的衍生結果不可重複計票；結果有歧異時交代各自適用的條件。');
    if(A(data.failures).length)add('未納入的紀錄',data.failures.map(f=>P(f,['sourceEntryIndex','label','method','status','reason','errorCode'])));
    for(const e of entries){const ctx=createContext(e,data);ctx.safetyFirst=safe;
      const procedure=readingProcedure(e);
      ctx.add('本法正統取法（'+procedure.name+'）',procedure.guide);
      const primaryItems=topicEvidence(ctx);
      const visit=root.JYConsultationEvidence.build(e,data.question,primaryItems);
      if(visit)visits.push(visit);
      (writers[e.method]||cards)(ctx);
      const a=e.analysis;/* 2026-11-12：資料正常時這一段只有「暫定：否／已核」，沒有資訊；只有暫定、未核或輸入有缺時才送。 */{const prov=!!a.coverage?.provisional,st=a.computationAudit?.status,lim=a.coverage?.limitations;if(prov||hasData(lim)||(st&&!/^(verified|ok|pass|passed|已核)$/i.test(String(st))))ctx.add('資料完整度',{provisional:prov,computation:P(a.computationAudit,['status']),inputLimits:lim});}
      {const informative=A(a.items).filter(p=>!primaryItems.has(p)).filter(p=>hasData(p.support)||hasData(p.caution)||(p.summary&&!/^依本次原生操作保留作用關係$/.test(String(p.summary).trim()))).filter(p=>!/引擎JSON|原始JSON/.test(JSON.stringify([p.support,p.caution])||'')&&!/^已算$|：已算／/.test(String(p.summary||'').trim()));/* 指向本提示詞沒有附上的資料、或只寫「已算」的項目不送：AI 看不到那些資料，留著只會引它編造 *//* 只有制式佔位句的項目不送（大牌陣曾送出36行同一句），避免稀釋真正的資料 *//* 吠陀：六力、宮力、八分法、五支曆、分盤等項目在前面各有專屬資料段，這裡只留十二宮逐宮作用，不重複送。 *//* 牌卡類（塔羅、雷諾曼、五輪）：這一段若沒有佐證或反證，內容只是把前面牌序表與牌義表的牌義再抄一次，不送。 */const shown=e.method==='vedic'?informative.filter(p=>/^\d{1,2}宮/.test(String(p.label||''))):(['tarot','lenormand','ootk','mathers','yijing','name','compat'].includes(e.method)&&!informative.some(p=>hasData(p.support)||hasData(p.caution)))?[]:informative;/* 2026-11-12：這幾種方法的逐項段在沒有佐證或反證時，只是把前面的牌義、爻辭或「見上表」再寫一次（已逐一看過內容），不送；五軸人格的逐項段是各軸的實際判定，保留。 */if(shown.length)ctx.add('逐項作用與相反依據',shown.map(p=>({item:p.label,finding:p.summary,support:p.support,caution:p.caution})),6);}
      const sources=[...new Set(A(a.sources).map(x=>x.url).filter(Boolean))];ctx.add('規則來源（供你自行查證；回答裡不要引用、提及或附上這些網址）',sources.join('\n'),3);
      /* 2026-11-15 vary111：印度占星的資料段有二十幾張表，Gemini 在事業題讀錯主星、把副運當成二十年、依據行直接貼資料。
         與原題無關的表（事業題裡的火星婚姻位置、當月細段、二十張分盤等）只會稀釋重點；改成依原題只送相關的。題目要求全部時不篩。 */
      /* free119：問適合做什麼時附上傳統行業取象表。先前回覆只講「靠頭腦與表達」這種性質，沒有講出任何一行，因為資料裡沒有取象、規則又要求不給通用建議。 */
      {const PLN='太陽—公職、管理、醫療、黃金與名望相關；月亮—餐飲食品、照護、大眾零售、飲品、居家與不動產；火星—工程機械、金屬加工、軍警保全、運動、土地；水星—寫作文案、教學、買賣仲介、會計與數據、程式資訊、占算諮詢、翻譯；木星—教育顧問、法律、金融理財、宗教與身心靈、出版；金星—美感設計、飾品珠寶與水晶、服飾美容、藝術娛樂、精品；土星—勞力與技術工、製造工廠、礦石金屬、農業、舊物維修、長期服務、體制內工作；羅睺—外國事務、科技網路、非傳統行業、影像；計都—玄學靈性、研究、程式、療癒、冷門專技',
        FIVE='木—文教出版、設計、木材紙業、花藝植栽、醫藥保健；火—電子能源、餐飲、美容美髮、影音媒體；土—不動產、營建、倉儲、農牧、陶瓷石材與礦石、仲介；金—金融、機械五金與金屬加工、珠寶飾品、法務、精密技術；水—貿易物流、水產飲品、清潔、傳播行銷、旅遊、資訊流通',GUA='乾—金屬、管理、公職、貴重品；兌—口才、餐飲、娛樂、金融、飾品；離—文書、影像、電子、美容、文化；震—運輸、機電、開創、體育；巽—貿易、木材、設計、傳播、仲介；坎—水產、物流、清潔、酒水、資訊；艮—不動產、倉儲、石材礦石、宗教、守成的工作；坤—農牧、土地、布料、大眾服務、後勤',SUIT='權杖—創業、業務、行動與體力、創意企劃；聖杯—服務、照護、藝術、與人和情感有關的工作；寶劍—文字、分析、法律、技術、資訊；錢幣—實業、手藝、財務、買賣、不動產',
        TRADE={vedic:'取法：先看十宮主、十宮內的星與 D10，再看二宮主與十一宮主（錢從哪裡來）；有力、得位的星所主的行業排前面，落陷、被燃燒、落六八十二宮的星所主的行業要明說不利。九曜所主：'+PLN+'。',
          astro:'取法：先看十宮主、十宮內的星與天頂主星，再看二宮主與十一宮主；入廟擢升、得吉相的星所主的行業排前面，落陷失勢、受剋重的星所主的行業要明說不利。七政與交點所主：'+PLN+'。',
          bazi:'取法：先定喜用神，喜用的五行與格局所用的十神所主的行業排前面，忌神五行所主的行業要明說不利。五行所主：'+FIVE+'。十神所主：食神傷官—技藝、創作、表達與教學；正財偏財—經營買賣與業務；正官七殺—管理、體制與專業執照；正印偏印—學術研究、宗教身心靈、顧問；比肩劫財—合夥、自營、體力與競技。',
          ziwei:'取法：先看官祿宮與命宮主星，再看財帛宮；廟旺、得祿權科的主星所主的行業排前面，落陷或化忌的主星所主的行業要明說不利。主星所主：紫微—管理、精品高價品；天機—企劃、資訊、機械、顧問；太陽—公眾、傳播、能源、外務；武曲—金融、金屬五金、財務；天同—服務、餐飲、休閒、照護；廉貞—電子、公關、法務、美感；天府—財務管理、倉儲、不動產；太陰—不動產、清潔、居家與女性用品；貪狼—業務、娛樂、美容、才藝教學、身心靈；巨門—口才、教學、法律、餐飲、命理；天相—服務、文書代辦、服飾；天梁—醫藥、保險、監察、宗教、顧問；七殺—軍警、開創、技術、重工業；破軍—拆舊換新、運輸、開創、消耗品。',
          meihua:'取法：體卦與生體之卦所主的行業排前面，克體之卦所主的行業要明說不利；變卦看這一行做久了的結果。八卦所主：'+GUA+'。',
          yijing:'取法：本卦上下兩個三爻卦所主的行業是眼前的路，之卦上下卦所主的是往後的路；占辭吉的一邊排前面，占辭凶吝的一邊要明說不利。八卦所主：'+GUA+'。',
          liuyao:'取法：用神與原神的五行所主的行業排前面，忌神五行所主的行業要明說不利；用神旺相不空才算站得住。五行所主：'+FIVE+'。',
          liuren:'取法：干上神、末傳與青龍所乘之支的五行所主的行業排前面，剋日干而無制的五行所主的行業要明說不利；空亡的不取。五行所主：'+FIVE+'。',
          tarot:'取法：資源位、建議位與結果位的牌所屬花色所主的行業排前面，阻礙位的花色所主的行業要明說不利；大牌依它的元素歸到同元素的花色。花色所主：'+SUIT+'。',
          ootk:'取法：代表牌的花色與最後一輪結局牌的花色所主的行業排前面，削弱代表牌的敵對元素花色所主的行業要明說不利。花色所主：'+SUIT+'。',
          mathers:'取法：結果位置的牌所屬花色所主的行業排前面，逆位多的花色所主的行業要明說不利。花色所主：'+SUIT+'。'};
        if(TRADE[e.method]&&asksForOccupation(data.question)&&procedure.trade!==false)ctx.add('行業取象表（傳統取象；他問適合做什麼時，從這裡定出叫得出名稱的項目）',TRADE[e.method],1);}
      if(e.method==='vedic'){const q=String(data.question||'')+' '+caseNotes;
        if(!/所有|全部|完整|逐年|二十分盤|20分盤/.test(q)){const love=/感情|戀|愛|喜歡|曖昧|桃花|交往|男友|女友|老公|老婆|丈夫|妻|婚|正緣|伴侶|對象|復合|分手|前任/.test(q),near=/這個月|本月|這幾天|最近|近期|這週|這星期|今天|這陣子|下個月/.test(q),year=near||/今年|明年|這一年|年度|年底|年初|\d{4}/.test(q);
          const declared=s=>A(ctx.section('分盤分析範圍')?.[s]);
          const keepV=new Set(declared('detailedDivisions').map(n=>'D'+n));
          for(let i=ctx.b.length-1;i>=0;i--){const L=ctx.b[i].label;
            if(/火星婚姻位置/.test(L)&&!love||/多運法適用性/.test(L)||/當期月與細段/.test(L)&&!near||/年度星位|三重年運/.test(L)&&!year||/Arudha/.test(L)&&!(love||/名聲|形象|地位|別人怎麼看/.test(q)))ctx.b.splice(i,1);
            else if(/^([^·／]*[·／] ?)?20分盤/.test(L)&&typeof ctx.b[i].value==='string'){const rows=ctx.b[i].value.split('\n').filter(r=>!keepV.size||keepV.has(r.split('/')[0]));if(rows.length)ctx.b[i]={...ctx.b[i],label:L.replace('20分盤','與本題相關的分盤'),value:rows.join('\n')};}
            else if(/AV原表/.test(L)&&typeof ctx.b[i].value==='string'){const rows=ctx.b[i].value.split('\n').filter(r=>!keepV.size||keepV.has(r.split('/')[0]));if(rows.length)ctx.b[i]={...ctx.b[i],value:rows.join('\n')};}}}}
      if(e.method==='ziwei'&&!/月|何時|什麼時候|幾時|時間點|所有|全部|完整|逐/.test(String(data.question||'')))for(let i=ctx.b.length-1;i>=0;i--)if(/流月/.test(ctx.b[i].label))ctx.b.splice(i,1);
      if(visit && !safe){
        const native=root.JYConsultationEvidence, picked=native.openingPoints(visit,e,data.question);
        const usable=picked.some(p=>p.visual.kind!=='limit'), restricted=visit.points[0]?.visual.kind==='limit';
        const cues=picked.slice(0,data.sourceCoverage?.requestedRecords>1?1:3).map(p=>p.label+'｜'+p.detail);
        if(!usable)cues.push('程序未成立或資料未定，只說清這次能讀到哪一步。');
        else {
          if(restricted)cues.push('先指出缺少哪一層，只依可定位的部分說明。');
          cues.push(native.conclusionScope[e.method]);
          if(e.method==='yijing')cues.push(...selectedYiEvidence(e,data.question));
          if(e.method==='liuyao'&&/伏神|伏財|飛伏/.test(data.question)){
            const hidden=ctx.b.find(b=>b.label.includes('本題用神在伏爻'));
            if(hidden)cues.push(hidden.value.split('\n')[0]);
          }
          const dated=ctx.b.find(b=>b.label.includes('應期候選日'));
          if(dated&&/日期|幾號|哪.{0,4}[日天]|應期/.test(data.question))cues.push('所問時日取「'+dated.label+'」的日期與觸發條件。');
        }
        ctx.add('本題起斷（'+procedure.name+'）',cues.filter(Boolean).join('\n'));
        openingBlocks.push(ctx.b.pop());
      }
      blocks.push(...ctx.b);
    }
    blocks.push(...openingBlocks);
    const methodDepth={
      vedic:'用繁體中文親切稱呼，直接答所問。全盤先用上升、月宿與太陽說明性格及情緒需求，再連到事業、行動、關係與當前節奏。月宿、足與宿主分開說明。用生活例子呈現傾向，讓本人自行核對，不猜已發生的事件。以D1及相關宮主為主，僅用本包展開的分盤、格局、主運／副運／次副運與行運交叉核對。說明主運的長期主題與副運的階段條件。力量足額、落陷救應及吉凶是不同問題；同源證據不重複計算。只在已列區間內談趨勢，勿把交運日當事件日期。時辰未定時不作依賴宮位的判斷或選材。',
      astro:'親切稱呼開場，分短段直接答原題。全盤從日月上升及命主星出發，把人格、情緒、親密關係、工作行動與壓力成長講成生活情境。單題只選有關的宮位、宮主與相位。用本人能對照的傾向來寫，勿把經歷、伴侶想法或健康狀況說成已知。白話說明關鍵組合和反證。主題索引只供導讀，以完整落點與相位表核對。交點兩端或同一相位出現在多宮，不算獨立佐證。先說本命，再依原題選用實際列出的行運、次限、回歸或年度小限。單一觀察時刻不能確定整月應期；次限星曆時刻與現實參照日期分開。未列的點位、太陽弧與指定日期不可外推。',
      bazi:'用親切稱呼，以繁體中文分短段說明。完整命盤先說日主和月令在生活上的主線，再談事業、財、感情、身心與家庭，以及當前大運與流年。具體問題先答所問。僅將過去的象徵傾向供本人核對。健康只作生活提醒，勿由命盤推斷病症或壽命。挑最重要的兩三處，交代本命、格局或歲運層次及相反線索。貼鄰和隔柱分開；半會、虛拱不等於成局。只引用本包展開的運、年、月；節氣月不能直接當成國曆月。缺日期就停在已知層級，交運年按實際區間分段。只給定性把握，不算機率。',
      ziwei:'用繁體中文，以親切稱呼開場，分短段，先用白話回應。問單一主題就先答該題；問完整命盤時，從命身福德與命財官遷看行事方式，帶到事業、財務、感情、健康與家庭，再說當前大限與今年流年。可邀他用過去一段運期對照，語氣保留，不把盤象當經歷。簡短說明最重要的依據及反證。六組對宮按題選用：命遷、財福、夫妻官祿、兄弟交友、子女田宅、父母疾厄。空宮借對宮；先看本命與生年四化，再辨宮干飛化、自化及限年。流年配當年所屬大限，小限另看。年資料只談年，流月依本盤月界，指定日時只用相符的快照。未展開、未列或超出範圍的資料不補排。',
    };
    const depth=data.method==='astro'&&!natalWestern?'':methodDepth[data.method];
    const unknownHouse=entries.some(e=>(e.method==='vedic'||e.method==='astro')&&(e.chart?.input?.unknownTime||e.chart?.sensitivity?.unknownTime));
    const safetyClose='先提供安全支持，暫停手鍊、導購與賣場收尾。';
    const end=[
      !safe&&depth?'【本法解讀重點】'+(data.method==='bazi'?baziEvidence:data.method==='ziwei'?ziweiEvidence:'')+depth:'',
      !safe&&'【這則回覆的樣子】第一部分像當面回訊息。先回答所問，在同一段把主判與本法實際落點的關係說透。再依本盤說哪一處支持或牽制，只有一處就解透一處。年度就談年，有相應時位才談月份。問比較就用同一取法逐項判。',
      !safe&&'第二部分用一句自然的話帶出「我怎麼看出來的」，每行用生活語言講一件事，括號標出讀者能在本包找到的宮位、牌位、卦爻、詩句或算式。行數依切題依據多寡，有一條就解釋透一條。反證要說明哪一點會讓主要判斷改變；資料沒有相反線索就省略。同一判斷只說一次，重點讓他聽得懂。依本次寫法安排第一部分，再接第二部分及適用的收尾。',
      !safe&&'【把判斷落回這個人】用他明說的問題限定所取的象。未提供的職業、行為、焦慮與對方的想法都留白。兩人互動的常理不能替代成局之象。物件選材也只回扣已成立的判斷。',
      !safe&&steps&&situation?.checks?.length&&'原題也問做法，斷盤之後才可補一件切題的事：'+situation.checks[0].question,
      !safe&&styleFor(data,steps,visits.length===1&&visits[0].points.length<=2), !safe&&verifyFor(data.sourceCoverage?.requestedRecords>1&&!entries.some(e=>e.method==='compat')?'combined':data.method),
      !safe&&statedConditions(data.question,data.knownFacts),
      safe?(root.JYReadingWorkflow?.prepareDeliveryText?.(safetyClose,{question:data.question,notes:caseNotes,methods:entries.map(e=>e.method)})||safetyClose):unknownHouse?'時辰未定，省略依宮主選材。文末保留提醒。\n'+CLOSING_NOTICE+'\n'+footer:'【成稿收尾】\n'+commercialFor(data.question,data.sourceCoverage?.requestedRecords>1&&!entries.some(e=>e.method==='compat')?'combined':data.method)
    ].filter(Boolean).join('\n\n');
    const render=bs=>header.join('\n\n')+'\n\n'+bs.map(b=>'【'+b.label+'】\n'+b.value).join('\n\n')+'\n【資料結束】\n\n'+end;
    const fit=t=>chars(t)<=LIMIT&&bytes(t)<=BYTES;
    const core=blocks.filter(b=>b.priority===0),selected=new Set(core),optionalCount=new Set(blocks.filter(b=>b.priority>0).map(b=>b.label)).size,essential=render(core).replace('\n【資料結束】',optionalCount?'\n【未展開細表】另有'+optionalCount+'項旁系細表未展開（完整清單在本工具）。\n【資料結束】':'\n【資料結束】');
    if(!fit(essential)){const error=new Error('本次原題與必要資料共有'+chars(essential)+'字，超過單次貼上預算；內容未截斷，也不會分段複製。請縮小一次要求的年度或比較份數後重新產生。');error.code='SINGLE_PROMPT_CORE_OVER_BUDGET';error.characters=chars(essential);error.utf8Bytes=bytes(essential);error.blocks=core.map(b=>({label:b.label,characters:chars(b.value)}));error.limits={characters:LIMIT,utf8Bytes:BYTES};throw error;}
    // Fill optional blocks in priority order while always counting the scope
    // receipt of whatever is still not expanded. A second pass retries blocks
    // skipped early (the receipt only shrinks as blocks are added), so removing
    // or skipping a large block never strands smaller ones that would fit.
    const receiptOf=pend=>pend.length?'【未展開細表】'+[...new Set(pend.map(b=>b.label))].join('、')+'；不據此精斷。':'';
    const build=()=>{const kept=blocks.filter(b=>selected.has(b)),pend=blocks.filter(b=>!selected.has(b)),body=render(kept),put=r=>body.replace('\n【資料結束】',r?'\n'+r+'\n【資料結束】':'\n【資料結束】'),full=put(receiptOf(pend));return fit(full)||!pend.length?full:put('【未展開細表】另有'+new Set(pend.map(b=>b.label)).size+'項旁系細表未展開（完整清單在本工具）；不據此精斷。');};
    const optional=blocks.filter(b=>b.priority>0).sort((a,b)=>a.priority-b.priority);
    for(let pass=0;pass<2;pass++)for(const b of optional){if(selected.has(b))continue;selected.add(b);if(!fit(build()))selected.delete(b);}
    const kept=blocks.filter(b=>selected.has(b)),pending=blocks.filter(b=>!selected.has(b));
    let result=build();
    if(!fit(result)){const error=new Error('單次貼上範圍說明超過長度預算；未複製不完整資料。');error.code='SINGLE_PROMPT_SCOPE_OVER_BUDGET';throw error;}
    const plan={version:VERSION,mode:'single-message',limits:{characters:LIMIT,utf8Bytes:BYTES},characters:chars(result),utf8Bytes:bytes(result),coreBlocks:core.map(b=>b.label),includedBlocks:kept.map(b=>b.label),notExpanded:pending.map(b=>b.label),completeCore:true,originalQuestionPreserved:true,sourceChartMutated:false,consultation:visits,intake:{facts:data.knownFacts||'',priority:data.priority||''},usesReferences:false,requiresAttachment:false,guaranteedExternalPlatformLimit:false};
    // Keep the same rendered data sections available to the reader, including dates
    // or source text the external model may skip. Unexpanded sections have no entry.
    plan.referenceSections=kept.filter(b=>b.method!=='shared'&&!/本法正統取法|規則來源|行業取象表/.test(b.label))
      .map(b=>({label:b.label,value:b.value}));
    plans.set(result,plan);if(plans.size>40)plans.delete(plans.keys().next().value);return result;
  }
  root.JYSinglePaste=Object.freeze({version:VERSION,limits:{characters:LIMIT,utf8Bytes:BYTES},compile,observationText,get:text=>plans.get(String(text))||null,chars,bytes,guides});
  if(typeof module!=='undefined'&&module.exports)module.exports=root.JYSinglePaste;
})(typeof window==='undefined'?globalThis:window);
