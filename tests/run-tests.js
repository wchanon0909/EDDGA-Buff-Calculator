const assert = require('node:assert/strict');
const data = require('../js/data.js');
const {createDefaultState,sanitizeState,calculate,optionValue,formatBonus} = require('../js/calculator.js');
let passed = 0;
function test(name,fn) {
  try { fn(); passed++; console.log(`PASS ${name}`); }
  catch (err) {console.error(`FAIL ${name}`);throw err;}
}
function start() {return createDefaultState(data);}
function sum(s) {return calculate(s,data);}

test('All six systems and all weapon/armor categories are available',() => {
  assert.equal(data.weapons.length,16);
  assert.equal(data.armorSlots.length,5);
  assert.deepEqual([data.guild.length,data.donate.length,data.boss.length,data.pass.length],[5,7,5,6]);
  assert.deepEqual(Object.keys(start()).filter(x => x !== 'v'),['guild','donate','boss','weapon','armor','pass']);
});

test('Every refine option is numeric and defined for all 6 levels',() => {
  const lists = [...data.weapons,...data.armorSlots];
  for(const category of lists) {
    assert.ok(category.options.length >= 8,category.id);
    const ids = new Set();
    for(const option of category.options) {
      assert.ok(data.stats[option.stat],`${category.id} / ${option.stat}`);
      assert.equal(option.values.length,6,`${category.id} / ${option.stat}`);
      assert.ok(option.values.every(x => typeof x === 'number' && x > 0),`${category.id} / ${option.stat}`);
      assert.ok(!ids.has(option.stat),`${category.id} duplicate ${option.stat}`);
      ids.add(option.stat);
    }
  }
});

test('Guild level 5 includes all stats and exact weight',() => {
  const s=start();s.guild.level=5;
  const t=sum(s).totals;
  assert.deepEqual([t.drop_pct,t.exp_pct,t.hp_pct,t.sp_pct,t.weight_flat,t.all_stats_flat],[15,50,10,10,500,1]);
});

test('Donate level 4 and 7 require correct cumulative donation amounts',() => {
  assert.equal(data.donate[3].requiredBaht,10000);
  assert.equal(data.donate[6].requiredBaht,100000);
  const s=start();s.donate.level=7;
  const t=sum(s).totals;
  assert.equal(t.drop_pct,30);
  assert.equal(t.all_stats_flat,3);
  assert.equal(t.all_size_resist_pct,10);
});

test('Rank Boss level 5 reports cost and additive stats',() => {
  assert.equal(data.boss[4].kills,100);
  assert.equal(data.boss[4].zeny,32000000);
  const s=start();s.boss.level=5;
  const t=sum(s).totals;
  assert.deepEqual([t.drop_pct,t.boss_resist_pct,t.hp_flat,t.sp_flat,t.weight_flat],[10,10,500,100,500]);
});

test('Refine Pass level 10 has all bonuses and all-type resistance',() => {
  const s=start();s.pass.level=10;
  const t=sum(s).totals;
  assert.deepEqual([t.drop_pct,t.atk_pct,t.matk_pct,t.hp_pct,t.weight_flat,t.all_stats_flat,t.all_type_resist_pct],[15,10,10,10,1000,1,3]);
});

test('Sample before equipment produces expected totals',() => {
  const s=start();s.guild.level=3;s.donate.level=2;s.boss.level=1;s.pass.level=5;
  const t=sum(s).totals;
  assert.deepEqual([t.drop_pct,t.exp_pct,t.atk_pct,t.matk_pct,t.hp_pct,t.sp_pct,t.weight_flat],[16,30,7,7,9,7,500]);
});

test('Weapon contributes only its one selected option',() => {
  const s=start();s.weapon.type='dagger';s.weapon.refine=8;s.weapon.option='atk_flat';
  let r=sum(s);
  assert.equal(r.totals.atk_flat,20);
  assert.equal(r.totals.str_flat,undefined);
  assert.equal(r.totals.boss_damage_pct,undefined);
  assert.equal(r.optionCount,1);
  s.weapon.refine=10;
  assert.equal(sum(s).totals.atk_flat,30);
});

test('Armor counts at most one option per each of five slots',() => {
  const s=start();
  s.armor.slots.helm={refine:10,option:'atk_flat'};
  s.armor.slots.armor={refine:10,option:'hp_pct'};
  s.armor.slots.boots={refine:10,option:'hp_flat'};
  const r=sum(s);
  assert.equal(r.totals.atk_flat,50);
  assert.equal(r.totals.hp_pct,5);
  assert.equal(r.totals.hp_flat,1000);
  assert.equal(r.totals.exp_pct,undefined);
  assert.equal(r.optionCount,3);
  assert.deepEqual(r.selectedSystems,['armor']);
});

test('Flat and percentage bonuses remain separate',() => {
  const s=start();s.boss.level=4;s.armor.slots.helm={refine:10,option:'hp_flat'};
  s.armor.slots.armor={refine:7,option:'hp_pct'};
  const t=sum(s).totals;
  assert.equal(t.hp_flat,1400);
  assert.equal(t.hp_pct,3);
  assert.equal(t.atk_pct,4);
  assert.equal(t.atk_flat,undefined);
});

test('Disabling a whole group preserves choice but excludes contributions',() => {
  const s=start();s.guild.level=5;s.guild.enabled=false;
  const r=sum(s);
  assert.equal(r.totals.drop_pct,undefined);
  assert.equal(r.state.guild.level,5);
  assert.equal(r.selectedSystems.length,0);
});

test('Link state sanitization ignores forged stats, malformed levels, and unknown options',() => {
  const forged={
    guild:{enabled:true,level:999,bonuses:{drop_pct:999999}},
    donate:{enabled:'yes',level:7},
    weapon:{type:'dagger',refine:10,option:'invalid_stat'},
    armor:{enabled:true,slots:{helm:{refine:10,option:'made_up'},armor:{refine:7,option:'exp_pct'}}},
    pass:{level:11}
  };
  const s=sanitizeState(forged,data);
  assert.equal(s.guild.level,0);
  assert.equal(s.donate.enabled,true);
  assert.equal(s.donate.level,7);
  assert.equal(s.weapon.option,'');
  assert.equal(s.armor.slots.helm.option,'');
  assert.equal(s.armor.slots.armor.option,'exp_pct');
  assert.equal(s.pass.level,0);
  assert.equal(sum(s).totals.exp_pct,15);
});

test('Uncommon source values are intentionally retained',() => {
  const dagger=data.weapons.find(x=>x.id==='dagger');
  const axe2=data.weapons.find(x=>x.id==='two-hand-axe');
  const bow=data.weapons.find(x=>x.id==='bow');
  assert.equal(optionValue(dagger.options,9,'boss_damage_pct'),15);
  assert.equal(optionValue(axe2.options,9,'boss_damage_pct'),15);
  assert.equal(optionValue(bow.options,8,'boss_damage_pct'),13);
  assert.equal(optionValue(bow.options,10,'boss_damage_pct'),20);
});

test('Bonus formatting respects percent and flat units',() => {
  assert.equal(formatBonus('drop_pct',120,data),'+120%');
  assert.equal(formatBonus('weight_flat',1200,data),'+1,200');
  assert.equal(formatBonus('atk_flat',20,data),'+20');
});

test('Invalid refine level does not add an option',() => {
  const s=start();s.weapon.type='bow';s.weapon.refine=4;s.weapon.option='aspd_pct';
  const r=sum(s);
  assert.equal(r.optionCount,0);
  assert.equal(r.state.weapon.refine,0);
  assert.equal(r.totals.aspd_pct,undefined);
});

console.log(`\n${passed} tests passed.`);
