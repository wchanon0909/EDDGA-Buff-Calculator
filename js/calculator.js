/* Pure calculation + state validation. No DOM or network dependencies. */
(function (root) {
  'use strict';

  const GROUPS = ['guild','donate','boss','weapon','armor','pass'];

  function createDefaultState(data) {
    const slots = {};
    data.armorSlots.forEach(slot => { slots[slot.id] = {refine:0, option:''}; });
    return {
      v:1,
      guild:{enabled:true,level:0},
      donate:{enabled:true,level:0},
      boss:{enabled:true,level:0},
      weapon:{enabled:true,type:'',refine:0,option:''},
      armor:{enabled:true,slots},
      pass:{enabled:true,level:0}
    };
  }

  function permittedLevel(raw, allowed) {
    const number = Number(raw);
    return Number.isInteger(number) && allowed.includes(number) ? number : 0;
  }

  function sanitizeState(raw, data) {
    const state = createDefaultState(data);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return state;
    GROUPS.forEach(key => {
      if (raw[key] && typeof raw[key] === 'object' && typeof raw[key].enabled === 'boolean') {
        state[key].enabled = raw[key].enabled;
      }
    });
    for (const key of ['guild','donate','boss','pass']) {
      const source = raw[key] || {};
      const allowed = data[key].map(x => x.level);
      state[key].level = permittedLevel(source.level, [0, ...allowed]);
    }
    const weapon = raw.weapon || {};
    const type = data.weapons.find(x => x.id === weapon.type);
    state.weapon.type = type ? type.id : '';
    state.weapon.refine = permittedLevel(weapon.refine, [0, ...data.refineLevels]);
    state.weapon.option = type && type.options.some(x => x.stat === weapon.option) ? weapon.option : '';
    if (!state.weapon.type || !state.weapon.refine) state.weapon.option = '';

    const slots = (raw.armor && raw.armor.slots && typeof raw.armor.slots === 'object') ? raw.armor.slots : {};
    data.armorSlots.forEach(slot => {
      const previous = slots[slot.id] || {};
      state.armor.slots[slot.id].refine = permittedLevel(previous.refine, [0, ...data.refineLevels]);
      const validOption = slot.options.some(x => x.stat === previous.option);
      state.armor.slots[slot.id].option = validOption && state.armor.slots[slot.id].refine ? previous.option : '';
    });
    return state;
  }

  function selectedRow(rows, level) {
    return rows.find(x => x.level === level);
  }

  function optionValue(rows, level, optionId) {
    if (!Number.isInteger(level) || level < 5 || level > 10) return null;
    const item = rows.find(x => x.stat === optionId);
    if (!item) return null;
    const value = item.values[level - 5];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  function calculate(inputState, data) {
    const state = sanitizeState(inputState, data);
    const totals = {};
    const breakdown = {};
    const sources = [];
    const selectedSystems = [];
    let optionCount = 0;

    function add(sourceId, sourceLabel, bonuses) {
      let hasStat = false;
      Object.entries(bonuses || {}).forEach(([stat, value]) => {
        if (!data.stats[stat] || !Number.isFinite(value) || value === 0) return;
        totals[stat] = (totals[stat] || 0) + value;
        (breakdown[stat] ||= []).push({sourceId, source:sourceLabel, value});
        hasStat = true;
      });
      if (hasStat) sources.push({id:sourceId,label:sourceLabel});
      return hasStat;
    }

    const namedGroups = [
      ['guild','Guild Buff','Lv.'],
      ['donate','Donate Rank','Lv.'],
      ['boss','Rank Boss','Lv.'],
      ['pass','Refine Pass','Set +']
    ];
    namedGroups.forEach(([key,label,prefix]) => {
      if (!state[key].enabled || !state[key].level) return;
      const row = selectedRow(data[key], state[key].level);
      if (row && add(key, `${label} ${prefix}${state[key].level}`, row.bonuses)) {
        selectedSystems.push(key);
      }
    });

    if (state.weapon.enabled && state.weapon.type && state.weapon.refine && state.weapon.option) {
      const weapon = data.weapons.find(x => x.id === state.weapon.type);
      const value = weapon ? optionValue(weapon.options, state.weapon.refine, state.weapon.option) : null;
      if (value !== null && add('weapon', `Weapon: ${weapon.label} +${state.weapon.refine}`, {[state.weapon.option]:value})) {
        selectedSystems.push('weapon');
        optionCount++;
      }
    }

    if (state.armor.enabled) {
      data.armorSlots.forEach(slot => {
        const settings = state.armor.slots[slot.id];
        if (!settings.refine || !settings.option) return;
        const value = optionValue(slot.options, settings.refine, settings.option);
        if (value !== null && add(`armor-${slot.id}`, `${slot.label} +${settings.refine}`, {[settings.option]:value})) {
          optionCount++;
          if (!selectedSystems.includes('armor')) selectedSystems.push('armor');
        }
      });
    }

    return {totals,breakdown,sources,selectedSystems,optionCount,state};
  }

  function formatBonus(stat, value, data) {
    const meta = data.stats[stat];
    const pretty = new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(value || 0);
    return `${value >= 0 ? '+' : ''}${pretty}${meta && meta.unit === '%' ? '%' : ''}`;
  }

  const api = {createDefaultState,sanitizeState,calculate,optionValue,formatBonus};
  root.EDDGA_CALC = api;
  if(typeof module !== 'undefined' && module.exports) module.exports=api;
})(typeof window !== 'undefined' ? window : globalThis);
