"use strict";

require("libram/kolmafia");

var _dailyLib = require("./daily-lib");

// eslint-disable-next-line node/no-unpublished-import
(0, _dailyLib.fillSomeSpleen)();
(0, _dailyLib.fillStomach)();
(0, _dailyLib.fillLiver)();

if (!(0, _dailyLib.getPropertyBoolean)('_distentionPillUsed') && Lib.myFullness() <= Lib.fullnessLimit()) {
  if (!Lib.use(1, Item.get('distention pill'))) {
    Lib.print('WARNING: Out of distention pills.');
  }
}

if (!(0, _dailyLib.getPropertyBoolean)('_syntheticDogHairPillUsed') && 1 <= Lib.myInebriety() && Lib.myInebriety() <= Lib.inebrietyLimit()) {
  if (!Lib.use(1, Item.get('synthetic dog hair pill'))) {
    Lib.print('WARNING: Out of synthetic dog hair pills.');
  }
}

if (3 <= Lib.myFullness() && Lib.myFullness() <= Lib.fullnessLimit() + 1 && 3 <= Lib.myInebriety() && Lib.myInebriety() <= Lib.inebrietyLimit() + 1) {
  (0, _dailyLib.useIfUnused)(Item.get('spice melange'), 'spiceMelangeUsed', 500000);
}

if (Lib.myFullness() + 4 === Lib.fullnessLimit()) {
  (0, _dailyLib.useIfUnused)(Item.get('cuppa Voraci tea'), '_voraciTeaUsed', 110000);
}

if (Lib.myInebriety() + 4 === Lib.inebrietyLimit()) {
  (0, _dailyLib.useIfUnused)(Item.get('cuppa Sobrie tea'), '_sobrieTeaUsed', 110000);
}

(0, _dailyLib.fillSomeSpleen)();
(0, _dailyLib.fillStomach)();
(0, _dailyLib.fillLiver)();
var mojoFilterCount = 3 - (0, _dailyLib.getPropertyInt)('currentMojoFilters');
(0, _dailyLib.getCapped)(mojoFilterCount, Item.get('mojo filter'), 10000);
Lib.use(mojoFilterCount, Item.get('mojo filter'));
(0, _dailyLib.fillSomeSpleen)();
(0, _dailyLib.useIfUnused)(Item.get('fancy chocolate car'), (0, _dailyLib.getPropertyInt)('_chocolatesUsed') === 0, 2 * _dailyLib.MPA);
var loveChocolateCount = Math.max(3 - Math.floor(20000 / _dailyLib.MPA) - (0, _dailyLib.getPropertyInt)('_loveChocolatesUsed'), 0);
var loveChocolateEat = Math.min(loveChocolateCount, Lib.itemAmount(Item.get('LOV Extraterrestrial Chocolate')));
Lib.use(loveChocolateEat, Item.get('LOV Extraterrestrial Chocolate'));
var choco = new Map([[Lib.toInt(Class.get('Seal Clubber')), Item.get('chocolate seal-clubbing club')], [Lib.toInt(Class.get('Turtle Tamer')), Item.get('chocolate turtle totem')], [Lib.toInt(Class.get('Pastamancer')), Item.get('chocolate pasta spoon')], [Lib.toInt(Class.get('Sauceror')), Item.get('chocolate saucepan')], [Lib.toInt(Class.get('Accordion Thief')), Item.get('chocolate stolen accordion')], [Lib.toInt(Class.get('Disco Bandit')), Item.get('chocolate disco ball')]]);

if (choco.has(Lib.toInt(Lib.myClass())) && (0, _dailyLib.getPropertyInt)('_chocolatesUsed') < 3) {
  var used = (0, _dailyLib.getPropertyInt)('_chocolatesUsed');
  var item = choco.get(Lib.toInt(Lib.myClass())) || Item.get('none');
  var count = (0, _dailyLib.clamp)(3 - used, 0, 3);
  Lib.use(count, item);
}

(0, _dailyLib.useIfUnused)(Item.get('fancy chocolate sculpture'), (0, _dailyLib.getPropertyInt)('_chocolateSculpturesUsed') < 1, 5 * _dailyLib.MPA);
(0, _dailyLib.useIfUnused)(Item.get('essential tofu'), '_essentialTofuUsed', 5 * _dailyLib.MPA);

if (Lib.getProperty('_timesArrowUsed') !== 'true' && Lib.mallPrice(Item.get("time's arrow")) < 5 * _dailyLib.MPA) {
  (0, _dailyLib.getCapped)(1, Item.get("time's arrow"), 5 * _dailyLib.MPA);
  Lib.cliExecute("csend 1 time's arrow to botticelli");
  Lib.setProperty('_timesArrowUsed', 'true');
}

if (Lib.mallPrice(Item.get('blue mana')) < 3 * _dailyLib.MPA) {
  var casts = Math.max(10 - (0, _dailyLib.getPropertyInt)('_ancestralRecallCasts'), 0);
  (0, _dailyLib.getCapped)(casts, Item.get('blue mana'), 3 * _dailyLib.MPA);
  Lib.useSkill(casts, Skill.get('Ancestral Recall'));
}