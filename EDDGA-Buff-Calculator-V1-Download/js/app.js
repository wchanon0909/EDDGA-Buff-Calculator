/* Website UI: static, no framework and no server required. */
(function () {
  'use strict';
  const DATA = window.EDDGA_DATA;
  const CALC = window.EDDGA_CALC;
  if (!DATA || !CALC) {
    document.body.textContent = 'โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบไฟล์ js/data.js และ js/calculator.js';
    return;
  }

  const STORAGE_KEY = 'eddga-buff-calculator-v1';
  const GROUPS = ['guild','donate','boss','weapon','armor','pass'];
  const find = id => document.getElementById(id);
  const formatNumber = number => new Intl.NumberFormat('en-US').format(number);
  const node = (tag, cls, content) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (content !== undefined) n.textContent = content;
    return n;
  };

  function decodeToken(token) {
    if (!token || token.length > 12000 || !/^[A-Za-z0-9_-]+$/.test(token)) return null;
    try {
      const padded = token.replace(/-/g,'+').replace(/_/g,'/') + '='.repeat((4 - token.length % 4) % 4);
      return JSON.parse(atob(padded));
    } catch (_error) { return null; }
  }

  function loadState() {
    const params = new URLSearchParams(window.location.search);
    const linked = decodeToken(params.get('b'));
    if (linked) return CALC.sanitizeState(linked,DATA);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return CALC.sanitizeState(JSON.parse(saved),DATA);
    } catch (_error) { /* Some browsers block storage in private mode. */ }
    return CALC.createDefaultState(DATA);
  }

  let state = loadState();
  let toastTimer;

  function persist() {
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
    catch (_error) { /* Storage unavailable: the calculator still works. */ }
  }

  function forgetSharedUrl() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('b')) return;
    url.searchParams.delete('b');
    history.replaceState(null,'',url.pathname + url.search + url.hash);
  }

  function showToast(message) {
    const toast = find('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'),2700);
  }

  function putOptions(select, options, current) {
    select.replaceChildren();
    options.forEach(item => select.add(new Option(item.label,String(item.value))));
    select.value = String(current);
    if (select.selectedIndex < 0) select.selectedIndex = 0;
  }

  function levelOptions(section) {
    const levels = DATA[section];
    const first = section === 'pass' ? 'ไม่ใช้ Refine Pass' : 'ไม่ใช้โบนัสหมวดนี้';
    return [{value:0,label:first}, ...levels.map(item => ({
      value:item.level,
      label:section === 'pass' ? `Set Refine +${item.level}` : `Lv.${item.level}`
    }))];
  }

  function refineOptions() {
    return [{value:0,label:'ไม่ใช้ / ต่ำกว่า +5'}, ...DATA.refineLevels.map(n => ({value:n,label:`+${n}`}))];
  }

  function initSelections() {
    ['guild','donate','boss','pass'].forEach(section => putOptions(find(`${section}-level`),levelOptions(section),0));
    putOptions(find('weapon-type'),[
      {value:'',label:'เลือกประเภทอาวุธ'},
      ...DATA.weapons.map(x => ({value:x.id,label:x.label}))
    ],'');
    putOptions(find('weapon-refine'),refineOptions(),0);
    putOptions(find('weapon-option'),[{value:'',label:'เลือกประเภทอาวุธและระดับตีบวกก่อน'}],'');
  }

  const armorEls = new Map();
  function buildArmor() {
    const container = find('armor-list');
    for (const slot of DATA.armorSlots) {
      const wrap = node('div','armor-item');
      const identity = node('div','armor-ident');
      identity.append(node('strong','',slot.label),node('small','',slot.subtitle));
      const refineField = node('div','armor-control');
      const refineLabel = node('label','','ระดับตีบวก');
      refineLabel.htmlFor = `armor-refine-${slot.id}`;
      const refine = node('select');
      refine.id = refineLabel.htmlFor;
      refine.dataset.slotRefine = slot.id;
      putOptions(refine,refineOptions(),0);
      refineField.append(refineLabel,refine);
      const optionField = node('div','armor-control');
      const optionLabel = node('label','','ออฟชั่นที่สุ่มได้ (1 อย่าง)');
      optionLabel.htmlFor = `armor-option-${slot.id}`;
      const option = node('select');
      option.id = optionLabel.htmlFor;
      option.dataset.slotOption = slot.id;
      putOptions(option,[{value:'',label:'เลือกระดับตีบวกก่อน'}],'');
      optionField.append(optionLabel,option);
      const picked = node('div','armor-value');
      wrap.append(identity,refineField,optionField,picked);
      container.append(wrap);
      armorEls.set(slot.id,{refine,option,picked});
      refine.addEventListener('change',event => {
        const newLevel = Number(event.target.value);
        state.armor.slots[slot.id].refine = newLevel;
        if (!newLevel) state.armor.slots[slot.id].option = '';
        stateChanged();
      });
      option.addEventListener('change',event => {
        state.armor.slots[slot.id].option = event.target.value;
        stateChanged();
      });
    }
  }

  function previewPills(parent,bonuses) {
    parent.replaceChildren();
    if (!bonuses || Object.keys(bonuses).length === 0) {
      parent.append(node('span','preview-empty','เลือกระดับเพื่อดูโบนัสของหมวดนี้'));
      return;
    }
    const sorted = Object.entries(bonuses)
      .filter(([id]) => DATA.stats[id])
      .sort((a,b) => DATA.stats[a[0]].order - DATA.stats[b[0]].order);
    sorted.forEach(([stat,value]) => {
      const pill = node('div','preview-pill');
      pill.append(node('span','',DATA.stats[stat].label),node('strong','',CALC.formatBonus(stat,value,DATA)));
      parent.append(pill);
    });
  }

  function requirements(parent,items) {
    parent.replaceChildren();
    items.forEach(label => parent.append(node('span','requirement-chip',label)));
  }

  function setStatus(group,label,active) {
    const card = find(`card-${group}`);
    const badge = find(`status-${group}`);
    card.classList.toggle('is-off',!state[group].enabled);
    badge.classList.toggle('is-selected',active && state[group].enabled);
    badge.textContent = state[group].enabled ? label : 'ปิดใช้งาน';
  }

  function renderLevels() {
    for (const group of ['guild','donate','boss','pass']) {
      const selected = state[group];
      const select = find(`${group}-level`);
      select.value = String(selected.level);
      select.disabled = !selected.enabled;
      const item = DATA[group].find(x => x.level === selected.level);
      previewPills(find(`preview-${group}`),item?.bonuses);
      setStatus(group,selected.level ? `${group === 'pass' ? 'Set +' : 'Lv.'}${selected.level}` : 'ยังไม่เลือก',!!item);
      if(group === 'donate') requirements(find('requirements-donate'),item ? [`ยอดสะสม ${formatNumber(item.requiredBaht)} บาท`] : []);
      if(group === 'boss') requirements(find('requirements-boss'),item ? [`กำจัด Boss ${formatNumber(item.kills)} ตัว`,`ใช้ ${formatNumber(item.zeny)} Zeny`] : []);
    }
  }

  function optionLabels(rows,level) {
    return [{value:'',label:'เลือกออฟชั่นที่สุ่มได้จริง'},
      ...rows.map(item => ({
        value:item.stat,
        label:`${DATA.stats[item.stat].label} ${CALC.formatBonus(item.stat,CALC.optionValue(rows,level,item.stat),DATA)}`
      }))];
  }

  function renderWeapon() {
    const settings = state.weapon;
    const weapon = DATA.weapons.find(x => x.id === settings.type);
    const type = find('weapon-type');
    const refine = find('weapon-refine');
    const option = find('weapon-option');
    type.value = settings.type;
    refine.value = String(settings.refine);
    type.disabled = !settings.enabled;
    refine.disabled = !settings.enabled || !weapon;
    if (!weapon || !settings.refine) {
      putOptions(option,[{value:'',label:!weapon ? 'เลือกประเภทอาวุธก่อน' : 'เลือกระดับตีบวกก่อน'}],'');
      option.disabled = true;
    } else {
      putOptions(option,optionLabels(weapon.options,settings.refine),settings.option);
      option.disabled = !settings.enabled;
    }
    const picked = find('weapon-picked');
    picked.replaceChildren();
    const value = weapon ? CALC.optionValue(weapon.options,settings.refine,settings.option) : null;
    const active = value !== null;
    picked.classList.toggle('active',active && settings.enabled);
    if (active) {
      picked.append(node('span','',DATA.stats[settings.option].label),node('strong','',CALC.formatBonus(settings.option,value,DATA)));
    } else {
      picked.append(node('span','',weapon && settings.refine ? 'ยังไม่เลือกออฟชั่น (ยังไม่นับโบนัส)' : 'เลือกประเภท + ระดับตีบวก + ออฟชั่น เพื่อเริ่มคำนวณ'));
    }
    setStatus('weapon',active ? `${weapon.label} +${settings.refine}` : 'ยังไม่เลือก',active);
  }

  function renderArmor() {
    let count = 0;
    DATA.armorSlots.forEach(slot => {
      const settings = state.armor.slots[slot.id];
      const els = armorEls.get(slot.id);
      els.refine.value = String(settings.refine);
      els.refine.disabled = !state.armor.enabled;
      if (!settings.refine) {
        putOptions(els.option,[{value:'',label:'เลือกระดับตีบวกก่อน'}],'');
        els.option.disabled = true;
      } else {
        putOptions(els.option,optionLabels(slot.options,settings.refine),settings.option);
        els.option.disabled = !state.armor.enabled;
      }
      const value = CALC.optionValue(slot.options,settings.refine,settings.option);
      const active = value !== null;
      els.picked.replaceChildren();
      els.picked.classList.toggle('is-set',active);
      if (active) {
        count++;
        els.picked.append(node('span','',DATA.stats[settings.option].label),node('strong','',CALC.formatBonus(settings.option,value,DATA)));
      }
    });
    setStatus('armor',`${count} / 5 ชิ้น`,count>0);
  }

  function renderHighlights(totals) {
    const highlights = [
      ['DROP','drop_pct'],['EXP','exp_pct'],['ATK %','atk_pct'],
      ['MATK %','matk_pct'],['Max HP %','hp_pct'],['Max SP %','sp_pct']
    ];
    const parent = find('highlight-grid');
    parent.replaceChildren();
    highlights.forEach(([label,id]) => {
      const tile = node('div','highlight-tile');
      tile.append(node('small','',label),node('strong','',CALC.formatBonus(id,totals[id] || 0,DATA)));
      parent.append(tile);
    });
    find('mobile-drop').textContent = `Drop ${CALC.formatBonus('drop_pct',totals.drop_pct || 0,DATA)}`;
  }

  function renderBreakdown(result) {
    const parent = find('stat-list');
    parent.replaceChildren();
    const entries = Object.entries(result.totals).sort(([a],[b]) => DATA.stats[a].order - DATA.stats[b].order);
    find('stat-count').textContent = `${entries.length} รายการ`;
    if (!entries.length) {
      const empty = node('div','empty-stats');
      empty.append(node('span','', '✧'),node('div','','ยังไม่มีบัฟที่เปิดใช้งาน'),node('div','','ลองเลือก Lv.1 หรือกด “โหลดตัวอย่าง”'));
      parent.append(empty);
      return;
    }
    let currentGroup = '';
    entries.forEach(([id,total]) => {
      const stat = DATA.stats[id];
      if (stat.group !== currentGroup) {
        currentGroup = stat.group;
        parent.append(node('div','stat-group-title',currentGroup));
      }
      const details = node('details','stat-detail');
      const summary = node('summary');
      summary.append(node('span','stat-summary-name',`${stat.label}${stat.unit === '%' ? ' (%)' : ' (ค่า)'}`),node('strong','stat-summary-value',CALC.formatBonus(id,total,DATA)));
      const items = node('div','breakdown-entries');
      result.breakdown[id].forEach(item => {
        const element = node('div','breakdown-entry');
        element.append(node('span','',item.source),node('strong','',CALC.formatBonus(id,item.value,DATA)));
        items.append(element);
      });
      details.append(summary,items);
      parent.append(details);
    });
  }

  function render() {
    GROUPS.forEach(group => {
      const toggle = document.querySelector(`[data-enable="${group}"]`);
      toggle.checked = state[group].enabled;
    });
    renderLevels();
    renderWeapon();
    renderArmor();
    const result = CALC.calculate(state,DATA);
    renderHighlights(result.totals);
    renderBreakdown(result);
    find('active-system-count').replaceChildren(document.createTextNode(String(result.selectedSystems.length)),node('span','','/6'));
    find('chosen-option-count').replaceChildren(document.createTextNode(String(result.optionCount)),node('span','','/6'));
    persist();
  }

  function stateChanged() {
    forgetSharedUrl();
    state = CALC.sanitizeState(state,DATA);
    render();
  }

  function attachEvents() {
    document.querySelectorAll('[data-level]').forEach(select => {
      select.addEventListener('change',event => {
        const section = event.target.dataset.level;
        state[section].level = Number(event.target.value);
        stateChanged();
      });
    });
    document.querySelectorAll('[data-enable]').forEach(toggle => {
      toggle.addEventListener('change',event => {
        state[event.target.dataset.enable].enabled = event.target.checked;
        stateChanged();
      });
    });
    document.querySelectorAll('[data-fold]').forEach(button => {
      button.addEventListener('click',event => {
        const section = event.currentTarget.dataset.fold;
        const panel = find(`content-${section}`);
        panel.hidden = !panel.hidden;
        event.currentTarget.setAttribute('aria-expanded',String(!panel.hidden));
      });
    });
    find('weapon-type').addEventListener('change',event => {
      state.weapon.type = event.target.value;
      state.weapon.option = '';
      stateChanged();
    });
    find('weapon-refine').addEventListener('change',event => {
      state.weapon.refine = Number(event.target.value);
      if (!state.weapon.refine) state.weapon.option = '';
      stateChanged();
    });
    find('weapon-option').addEventListener('change',event => {
      state.weapon.option = event.target.value;
      stateChanged();
    });
    find('reset-button').addEventListener('click',() => {
      state = CALC.createDefaultState(DATA);
      stateChanged();
      showToast('ล้างค่าทั้งหมดเรียบร้อย');
    });
    find('example-button').addEventListener('click',() => {
      state = CALC.createDefaultState(DATA);
      state.guild.level = 3;
      state.donate.level = 2;
      state.boss.level = 1;
      state.pass.level = 5;
      state.weapon.type = 'dagger';
      state.weapon.refine = 8;
      state.weapon.option = 'atk_flat';
      state.armor.slots.helm = {refine:7,option:'drop_pct'};
      state.armor.slots.armor = {refine:9,option:'hp_pct'};
      state.armor.slots.boots = {refine:8,option:'aspd_pct'};
      stateChanged();
      showToast('โหลดตัวอย่างครบแล้ว ลองปรับออฟชั่นต่อได้เลย');
    });
    find('share-button').addEventListener('click',async () => {
      const payload = btoa(JSON.stringify(state)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
      const url = new URL(window.location.href);
      url.searchParams.set('b',payload);
      url.hash = '';
      const text = url.toString();
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard API unavailable');
        await navigator.clipboard.writeText(text);
        showToast('คัดลอกลิงก์ Build แล้ว ส่งให้เพื่อนได้เลย');
      } catch (_error) {
        const input = node('textarea');
        input.value = text;
        input.style.position = 'fixed';
        input.style.left = '-9999px';
        document.body.append(input);
        input.select();
        let copied = false;
        try {copied = document.execCommand('copy');} catch (_e) { /* unavailable */ }
        input.remove();
        if (copied) showToast('คัดลอกลิงก์ Build แล้ว ส่งให้เพื่อนได้เลย');
        else window.prompt('คัดลอกลิงก์ Build นี้:',text);
      }
    });
    find('mobile-jump').addEventListener('click',() => {
      find('result-section').scrollIntoView({behavior:'smooth',block:'start'});
    });
  }

  initSelections();
  buildArmor();
  attachEvents();
  render();
})();
