// eslint-disable-next-line node/no-unpublished-import
import 'libram/kolmafia';

import {
  getPropertyInt,
  getPropertyBoolean,
  getCapped,
  useIfUnused,
  fillLiver,
  fillSomeSpleen,
  fillStomach,
  MPA,
  clamp,
} from './daily-lib';

fillSomeSpleen();
fillStomach();
fillLiver();

if (!getPropertyBoolean('_distentionPillUsed') && Lib.myFullness() <= Lib.fullnessLimit()) {
  if (!Lib.use(1, Item.get('distention pill'))) {
    Lib.print('WARNING: Out of distention pills.');
  }
}

if (
  !getPropertyBoolean('_syntheticDogHairPillUsed') &&
  1 <= Lib.myInebriety() &&
  Lib.myInebriety() <= Lib.inebrietyLimit()
) {
  if (!Lib.use(1, Item.get('synthetic dog hair pill'))) {
    Lib.print('WARNING: Out of synthetic dog hair pills.');
  }
}

if (
  3 <= Lib.myFullness() &&
  Lib.myFullness() <= Lib.fullnessLimit() + 1 &&
  3 <= Lib.myInebriety() &&
  Lib.myInebriety() <= Lib.inebrietyLimit() + 1
) {
  useIfUnused(Item.get('spice melange'), 'spiceMelangeUsed', 500000);
}
if (Lib.myFullness() + 4 === Lib.fullnessLimit()) {
  useIfUnused(Item.get('cuppa Voraci tea'), '_voraciTeaUsed', 110000);
}
if (Lib.myInebriety() + 4 === Lib.inebrietyLimit()) {
  useIfUnused(Item.get('cuppa Sobrie tea'), '_sobrieTeaUsed', 110000);
}

fillSomeSpleen();
fillStomach();
fillLiver();

const mojoFilterCount = 3 - getPropertyInt('currentMojoFilters');
getCapped(mojoFilterCount, Item.get('mojo filter'), 10000);
Lib.use(mojoFilterCount, Item.get('mojo filter'));
fillSomeSpleen();

useIfUnused(Item.get('fancy chocolate car'), getPropertyInt('_chocolatesUsed') === 0, 2 * MPA);

const loveChocolateCount = Math.max(3 - Math.floor(20000 / MPA) - getPropertyInt('_loveChocolatesUsed'), 0);
const loveChocolateEat = Math.min(loveChocolateCount, Lib.itemAmount(Item.get('LOV Extraterrestrial Chocolate')));
Lib.use(loveChocolateEat, Item.get('LOV Extraterrestrial Chocolate'));

const choco = new Map([
  [Lib.toInt(Class.get('Seal Clubber')), Item.get('chocolate seal-clubbing club')],
  [Lib.toInt(Class.get('Turtle Tamer')), Item.get('chocolate turtle totem')],
  [Lib.toInt(Class.get('Pastamancer')), Item.get('chocolate pasta spoon')],
  [Lib.toInt(Class.get('Sauceror')), Item.get('chocolate saucepan')],
  [Lib.toInt(Class.get('Accordion Thief')), Item.get('chocolate stolen accordion')],
  [Lib.toInt(Class.get('Disco Bandit')), Item.get('chocolate disco ball')],
]);
if (choco.has(Lib.toInt(Lib.myClass())) && getPropertyInt('_chocolatesUsed') < 3) {
  const used = getPropertyInt('_chocolatesUsed');
  const item = choco.get(Lib.toInt(Lib.myClass())) || Item.get('none');
  const count = clamp(3 - used, 0, 3);
  Lib.use(count, item);
}

useIfUnused(Item.get('fancy chocolate sculpture'), getPropertyInt('_chocolateSculpturesUsed') < 1, 5 * MPA);
useIfUnused(Item.get('essential tofu'), '_essentialTofuUsed', 5 * MPA);

if (Lib.getProperty('_timesArrowUsed') !== 'true' && Lib.mallPrice(Item.get("time's arrow")) < 5 * MPA) {
  getCapped(1, Item.get("time's arrow"), 5 * MPA);
  Lib.cliExecute("csend 1 time's arrow to botticelli");
  Lib.setProperty('_timesArrowUsed', 'true');
}

if (Lib.mallPrice(Item.get('blue mana')) < 3 * MPA) {
  const casts = Math.max(10 - getPropertyInt('_ancestralRecallCasts'), 0);
  getCapped(casts, Item.get('blue mana'), 3 * MPA);
  Lib.useSkill(casts, Skill.get('Ancestral Recall'));
}
