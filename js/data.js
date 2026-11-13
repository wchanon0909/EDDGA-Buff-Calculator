/* EDDGA Hi-Class buff tables. Source URLs are listed in README.md.
   Percentages are numeric percentage POINT bonuses; flat values are absolute.
   Refine rows are in the order +5, +6, +7, +8, +9, +10. */
(function (root) {
  'use strict';

  const STAT_META = {
    drop_pct:           { label: 'Drop',                 unit: '%', group: 'ฟาร์ม / ทรัพยากร', order: 1 },
    exp_pct:            { label: 'EXP',                  unit: '%', group: 'ฟาร์ม / ทรัพยากร', order: 2 },
    weight_flat:        { label: 'น้ำหนักบรรทุก',          unit: '',  group: 'ฟาร์ม / ทรัพยากร', order: 3 },
    atk_pct:            { label: 'ATK',                  unit: '%', group: 'พลังโจมตี', order: 10 },
    matk_pct:           { label: 'MATK',                 unit: '%', group: 'พลังโจมตี', order: 11 },
    atk_flat:           { label: 'ATK',                  unit: '',  group: 'พลังโจมตี', order: 12 },
    matk_flat:          { label: 'MATK',                 unit: '',  group: 'พลังโจมตี', order: 13 },
    boss_damage_pct:    { label: 'โจมตี Boss แรงขึ้น',     unit: '%', group: 'พลังโจมตี', order: 14 },
    all_size_damage_pct:{ label: 'โจมตีทุกขนาดแรงขึ้น',   unit: '%', group: 'พลังโจมตี', order: 15 },
    element_damage_pct: { label: 'โจมตีทุกธาตุแรงขึ้น',    unit: '%', group: 'พลังโจมตี', order: 16 },
    player_damage_pct:  { label: 'โจมตีผู้เล่นแรงขึ้น',    unit: '%', group: 'พลังโจมตี', order: 17 },
    pvp_physical_pct:   { label: 'กายภาพต่อผู้เล่นมนุษย์',unit: '%', group: 'พลังโจมตี', order: 18 },
    close_damage_pct:   { label: 'โจมตีระยะใกล้แรงขึ้น',  unit: '%', group: 'พลังโจมตี', order: 19 },
    ranged_damage_pct:  { label: 'โจมตีระยะไกลแรงขึ้น',    unit: '%', group: 'พลังโจมตี', order: 20 },
    critical_damage_pct:{ label: 'ความแรง Critical',      unit: '%', group: 'พลังโจมตี', order: 21 },
    critical_flat:      { label: 'Critical',              unit: '',  group: 'พลังโจมตี', order: 22 },
    hit_flat:           { label: 'HIT',                   unit: '',  group: 'พลังโจมตี', order: 23 },
    hp_pct:             { label: 'Max HP',               unit: '%', group: 'HP / SP', order: 30 },
    sp_pct:             { label: 'Max SP',               unit: '%', group: 'HP / SP', order: 31 },
    hp_flat:            { label: 'Max HP',               unit: '',  group: 'HP / SP', order: 32 },
    sp_flat:            { label: 'Max SP',               unit: '',  group: 'HP / SP', order: 33 },
    boss_resist_pct:    { label: 'ป้องกัน Boss',          unit: '%', group: 'พลังป้องกัน', order: 40 },
    all_size_resist_pct:{ label: 'ป้องกันทุกขนาด',        unit: '%', group: 'พลังป้องกัน', order: 41 },
    all_type_resist_pct:{ label: 'ป้องกันทุกประเภท',      unit: '%', group: 'พลังป้องกัน', order: 42 },
    human_resist_pct:   { label: 'ป้องกันมนุษย์',          unit: '%', group: 'พลังป้องกัน', order: 43 },
    human_player_resist_pct:{label:'ลดดาเมจจากผู้เล่นมนุษย์',unit:'%',group:'พลังป้องกัน',order:44},
    ranged_resist_pct:  { label: 'ป้องกันระยะไกล',        unit: '%', group: 'พลังป้องกัน', order: 45 },
    element_resist_pct: { label: 'ป้องกันทุกธาตุ',         unit: '%', group: 'พลังป้องกัน', order: 46 },
    def_flat:           { label: 'DEF',                   unit: '',  group: 'พลังป้องกัน', order: 47 },
    mdef_flat:          { label: 'MDEF',                  unit: '',  group: 'พลังป้องกัน', order: 48 },
    aspd_pct:           { label: 'ASPD',                  unit: '%', group: 'ความสามารถเพิ่มเติม', order: 50 },
    cast_reduction_pct: { label: 'ลดเวลาร่ายเวท',         unit: '%', group: 'ความสามารถเพิ่มเติม', order: 51 },
    delay_reduction_pct:{ label: 'ลดดีเลย์',              unit: '%', group: 'ความสามารถเพิ่มเติม', order: 52 },
    flee_flat:          { label: 'FLEE',                  unit: '',  group: 'ความสามารถเพิ่มเติม', order: 53 },
    all_stats_flat:     { label: 'All Stats',             unit: '',  group: 'ค่าสเตตัส', order: 60 },
    str_flat:           { label: 'STR',                   unit: '',  group: 'ค่าสเตตัส', order: 61 },
    agi_flat:           { label: 'AGI',                   unit: '',  group: 'ค่าสเตตัส', order: 62 },
    vit_flat:           { label: 'VIT',                   unit: '',  group: 'ค่าสเตตัส', order: 63 },
    int_flat:           { label: 'INT',                   unit: '',  group: 'ค่าสเตตัส', order: 64 },
    dex_flat:           { label: 'DEX',                   unit: '',  group: 'ค่าสเตตัส', order: 65 },
    luk_flat:           { label: 'LUK',                   unit: '',  group: 'ค่าสเตตัส', order: 66 }
  };

  const guild = [
    { level: 1, bonuses: {drop_pct:3,exp_pct:10,hp_pct:2,sp_pct:2,atk_pct:1,matk_pct:1,pvp_physical_pct:1,human_player_resist_pct:1,weight_flat:200} },
    { level: 2, bonuses: {drop_pct:6,exp_pct:20,hp_pct:4,sp_pct:4,atk_pct:2,matk_pct:2,pvp_physical_pct:2,human_player_resist_pct:2,weight_flat:250} },
    { level: 3, bonuses: {drop_pct:9,exp_pct:30,hp_pct:6,sp_pct:6,atk_pct:3,matk_pct:3,pvp_physical_pct:3,human_player_resist_pct:3,weight_flat:300} },
    { level: 4, bonuses: {drop_pct:12,exp_pct:40,hp_pct:8,sp_pct:8,atk_pct:4,matk_pct:4,pvp_physical_pct:4,human_player_resist_pct:4,weight_flat:350} },
    { level: 5, bonuses: {drop_pct:15,exp_pct:50,hp_pct:10,sp_pct:10,atk_pct:5,matk_pct:5,pvp_physical_pct:5,human_player_resist_pct:5,weight_flat:500,all_stats_flat:1} }
  ];

  const donate = [
    {level:1,requiredBaht:1000,bonuses:{drop_pct:1,atk_pct:1,matk_pct:1}},
    {level:2,requiredBaht:3000,bonuses:{drop_pct:3,atk_pct:3,matk_pct:3,hp_pct:1,sp_pct:1}},
    {level:3,requiredBaht:5000,bonuses:{drop_pct:5,atk_pct:5,matk_pct:5,hp_pct:2,sp_pct:2}},
    {level:4,requiredBaht:10000,bonuses:{drop_pct:10,atk_pct:7,matk_pct:7,hp_pct:3,sp_pct:3,all_size_resist_pct:3,all_stats_flat:1}},
    {level:5,requiredBaht:30000,bonuses:{drop_pct:15,atk_pct:10,matk_pct:10,hp_pct:4,sp_pct:4,all_size_resist_pct:5,all_stats_flat:2}},
    {level:6,requiredBaht:50000,bonuses:{drop_pct:20,atk_pct:13,matk_pct:13,hp_pct:5,sp_pct:5,all_size_resist_pct:7,all_stats_flat:3}},
    {level:7,requiredBaht:100000,bonuses:{drop_pct:30,atk_pct:15,matk_pct:15,hp_pct:10,sp_pct:10,all_size_resist_pct:10,all_stats_flat:3}}
  ];

  const boss = [
    {level:1,kills:20,zeny:2000000,bonuses:{drop_pct:2,boss_damage_pct:2,boss_resist_pct:2}},
    {level:2,kills:40,zeny:4000000,bonuses:{drop_pct:4,boss_damage_pct:4,boss_resist_pct:4}},
    {level:3,kills:60,zeny:8000000,bonuses:{drop_pct:6,boss_damage_pct:6,boss_resist_pct:6,atk_pct:2,matk_pct:2,hp_flat:200,sp_flat:30}},
    {level:4,kills:80,zeny:16000000,bonuses:{drop_pct:8,boss_damage_pct:8,boss_resist_pct:8,atk_pct:4,matk_pct:4,hp_flat:400,sp_flat:60}},
    {level:5,kills:100,zeny:32000000,bonuses:{drop_pct:10,boss_damage_pct:10,boss_resist_pct:10,atk_pct:5,matk_pct:5,hp_flat:500,sp_flat:100,weight_flat:500}}
  ];

  const pass = [
    {level:5,bonuses:{drop_pct:2,atk_pct:1,matk_pct:1,hp_pct:2,weight_flat:200}},
    {level:6,bonuses:{drop_pct:4,atk_pct:2,matk_pct:2,hp_pct:3,weight_flat:300}},
    {level:7,bonuses:{drop_pct:6,atk_pct:3,matk_pct:3,hp_pct:4,weight_flat:400}},
    {level:8,bonuses:{drop_pct:8,atk_pct:4,matk_pct:4,hp_pct:5,weight_flat:500}},
    {level:9,bonuses:{drop_pct:10,atk_pct:5,matk_pct:5,hp_pct:6,weight_flat:600}},
    {level:10,bonuses:{drop_pct:15,atk_pct:10,matk_pct:10,hp_pct:10,all_stats_flat:1,all_type_resist_pct:3,weight_flat:1000}}
  ];

  const V = {
    stat:   [1,1,2,2,3,3],
    attack: [5,10,15,20,25,30],
    aspd:   [1,1,2,3,4,7],
    aspdFast:[1,2,3,4,5,7],
    dmg:    [1,2,3,4,5,7],
    pvp:    [1,1,2,3,4,5],
    boss:   [3,6,9,13,17,20],
    bossAxe2:[3,6,9,13,15,20],
    critDagger:[3,6,9,13,15,17],
    critKatar:[1,2,4,6,8,10],
    def:    [1,1,2,3,4,5],
    defMusical:[1,1,2,2,3,3],
    cast:   [1,2,3,4,5,7],
    hp:     [100,200,300,400,500,1000]
  };
  const row = (stat, values) => ({stat, values: Array.isArray(values) ? values : V[values]});
  const physicalSwords = [
    row('str_flat','stat'),row('agi_flat','stat'),row('int_flat','stat'),
    row('atk_flat','attack'),row('hit_flat','attack'),row('boss_damage_pct','boss'),
    row('aspd_pct','aspd'),row('player_damage_pct','pvp'),row('close_damage_pct','dmg')
  ];
  const physicalAxes = (bossSeries) => [
    row('str_flat','stat'),row('agi_flat','stat'),row('vit_flat','stat'),
    row('atk_flat','attack'),row('hit_flat','attack'),row('aspd_pct','aspd'),
    row('all_size_damage_pct','dmg'),row('player_damage_pct','pvp'),
    row('boss_damage_pct',bossSeries)
  ];
  const magicWeapons = [
    row('vit_flat','stat'),row('int_flat','stat'),row('dex_flat','stat'),
    row('def_flat','def'),row('matk_flat','attack'),row('element_damage_pct','dmg'),
    row('delay_reduction_pct','cast'),row('cast_reduction_pct','cast'),row('human_resist_pct','pvp')
  ];
  const musicalWeapons = [
    row('vit_flat','stat'),row('int_flat','stat'),row('dex_flat','stat'),
    row('def_flat','defMusical'),row('hp_flat','hp'),row('aspd_pct','aspdFast'),
    row('delay_reduction_pct','pvp'),row('ranged_resist_pct','pvp'),row('human_resist_pct','pvp')
  ];
  const weapons = [
    {id:'dagger',label:'Dagger',options:[
      row('str_flat','stat'),row('agi_flat','stat'),row('vit_flat','stat'),
      row('atk_flat','attack'),row('hit_flat','attack'),
      row('critical_damage_pct','critDagger'),row('critical_flat','critDagger'),
      row('boss_damage_pct',[3,6,9,13,15,20]),row('aspd_pct','aspd'),row('all_size_damage_pct','dmg')
    ]},
    {id:'one-hand-sword',label:'One Hand Sword',options:physicalSwords},
    {id:'two-hand-sword',label:'Two Hand Sword',options:physicalSwords},
    {id:'one-hand-spear',label:'One Hand Spear',options:physicalSwords},
    {id:'two-hand-spear',label:'Two Hand Spear',options:physicalSwords},
    {id:'mace',label:'Mace',options:physicalAxes('boss')},
    {id:'bow',label:'Bow',options:[
      row('agi_flat','stat'),row('dex_flat','stat'),row('luk_flat','stat'),
      row('atk_flat','attack'),row('hit_flat','attack'),row('aspd_pct','aspd'),
      row('ranged_damage_pct','dmg'),row('critical_damage_pct','dmg'),
      row('player_damage_pct','pvp'),row('boss_damage_pct','boss')
    ]},
    {id:'one-hand-axe',label:'One Hand Axe',options:physicalAxes('boss')},
    {id:'two-hand-axe',label:'Two Hand Axe',options:physicalAxes('bossAxe2')},
    {id:'one-hand-staff',label:'One Hand Staff',options:magicWeapons},
    {id:'two-hand-staff',label:'Two Hand Staff',options:magicWeapons},
    {id:'book',label:'Book',options:magicWeapons},
    {id:'katar',label:'Katar',options:[
      row('str_flat','stat'),row('agi_flat','stat'),row('vit_flat','stat'),
      row('atk_flat','attack'),row('hit_flat','attack'),row('aspd_pct','aspdFast'),
      row('critical_damage_pct','critKatar'),row('critical_flat','critKatar'),
      row('player_damage_pct','pvp'),row('boss_damage_pct','boss')
    ]},
    {id:'knuckle',label:'Knuckle',options:[
      row('agi_flat','stat'),row('str_flat','stat'),row('dex_flat','stat'),
      row('atk_flat','attack'),row('hit_flat','attack'),row('aspd_pct','aspdFast'),
      row('cast_reduction_pct','pvp'),row('player_damage_pct','pvp'),row('boss_damage_pct','boss')
    ]},
    {id:'musical',label:'Musical',options:musicalWeapons},
    {id:'whip',label:'Whip',options:musicalWeapons}
  ];

  const armorSlots = [
    {id:'helm',label:'Helm',subtitle:'หมวก',options:[
      row('exp_pct',[5,10,15,20,25,30]),row('drop_pct',[2,3,4,5,6,7]),
      row('atk_pct',[1,1,2,3,4,5]),row('matk_pct',[1,1,2,3,4,5]),
      row('atk_flat',[5,10,15,20,30,50]),row('matk_flat',[5,10,15,20,30,50]),
      row('hp_flat',[100,200,300,400,500,1000]),row('sp_flat',[20,40,60,80,100,200]),
      row('aspd_pct','aspd'),row('def_flat','def'),row('human_resist_pct','pvp'),row('ranged_resist_pct','pvp')
    ]},
    {id:'armor',label:'Armor',subtitle:'เสื้อเกราะ',options:[
      row('exp_pct',[5,10,15,20,25,30]),row('drop_pct',[2,3,4,5,6,7]),
      row('atk_pct',[1,2,3,4,5,5]),row('matk_pct',[1,2,3,4,5,5]),
      row('hp_pct',[1,2,3,4,5,5]),row('sp_pct',[1,2,3,4,5,5]),
      row('critical_damage_pct',[3,6,9,12,15,17]),row('human_resist_pct','pvp'),
      row('ranged_resist_pct','pvp'),row('cast_reduction_pct',[1,2,3,4,5,6]),
      row('flee_flat',[2,4,6,8,10,15]),row('hit_flat','attack')
    ]},
    {id:'shield',label:'Shield',subtitle:'โล่',options:[
      row('def_flat','def'),row('mdef_flat','def'),
      row('hp_flat',[100,200,300,400,500,1000]),row('sp_flat',[20,40,60,80,100,200]),
      row('element_resist_pct',[1,2,3,4,5,7]),row('boss_resist_pct',[5,10,15,20,25,30]),
      row('human_resist_pct','pvp'),row('ranged_resist_pct','pvp'),
      row('cast_reduction_pct',[1,2,3,4,5,6]),row('delay_reduction_pct','pvp')
    ]},
    {id:'garment',label:'Garment',subtitle:'ผ้าคลุม',options:[
      row('exp_pct',[5,10,15,20,25,30]),row('drop_pct',[2,3,4,5,6,7]),
      row('atk_pct',[1,2,3,4,5,6]),row('matk_pct',[1,2,3,4,5,6]),
      row('atk_flat',[5,10,15,20,30,50]),row('matk_flat',[5,10,15,20,30,50]),
      row('aspd_pct','aspd'),row('human_resist_pct','pvp'),row('ranged_resist_pct','pvp'),
      row('flee_flat',[3,6,10,15,20,30]),row('hit_flat','attack')
    ]},
    {id:'boots',label:'Boots',subtitle:'รองเท้า',options:[
      row('exp_pct',[5,10,15,20,25,30]),row('drop_pct',[2,3,4,5,6,7]),
      row('atk_pct',[1,2,3,4,5,6]),row('matk_pct',[1,2,3,4,5,6]),
      row('hp_flat',[100,200,300,400,500,1000]),row('sp_flat',[20,40,60,80,100,200]),
      row('aspd_pct','aspd'),row('def_flat','def'),row('human_resist_pct','pvp'),
      row('ranged_resist_pct','pvp'),row('delay_reduction_pct','pvp'),
      row('cast_reduction_pct',[1,2,3,4,5,6])
    ]}
  ];

  const DATA = {
    updated:'2026-11-13',
    stats:STAT_META,
    guild, donate, boss, pass, weapons, armorSlots,
    refineLevels:[5,6,7,8,9,10],
    noOptionArmor:['Cotton Shirt [1]','Adventurer\'s Suit [1]','Jacket [1]','Hood [1]','Sandals [1]'],
    sources: {
      weapon:'https://eddga-hiclass.gitbook.io/eddga-hiclass-docs/refine-option-system/weapon-refine-options',
      armor:'https://eddga-hiclass.gitbook.io/eddga-hiclass-docs/refine-option-system/armor-refine-options',
      pass:'https://eddga-hiclass.gitbook.io/eddga-hiclass-docs/refine-pass-system'
    }
  };
  root.EDDGA_DATA=DATA;
  if(typeof module !== 'undefined' && module.exports) module.exports=DATA;
})(typeof window !== 'undefined' ? window : globalThis);
