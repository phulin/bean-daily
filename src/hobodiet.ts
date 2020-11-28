import {
  myFullness,
  fullnessLimit,
  use,
  print,
  myInebriety,
  inebrietyLimit,
  itemAmount,
  toInt,
  myClass,
  getProperty,
  mallPrice,
  cliExecute,
  setProperty,
  useSkill,
} from 'kolmafia';
import {$class, $item, $skill} from 'libram/src';
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

if (!getPropertyBoolean('_distentionPillUsed') && myFullness() <= fullnessLimit()) {
  if (!use(1, $item`distention pill`)) {
    print('WARNING: Out of distention pills.');
  }
}

if (!getPropertyBoolean('_syntheticDogHairPillUsed') && 1 <= myInebriety() && myInebriety() <= inebrietyLimit()) {
  if (!use(1, $item`synthetic dog hair pill`)) {
    print('WARNING: Out of synthetic dog hair pills.');
  }
}

if (
  3 <= myFullness() &&
  myFullness() <= fullnessLimit() + 1 &&
  3 <= myInebriety() &&
  myInebriety() <= inebrietyLimit() + 1
) {
  useIfUnused($item`spice melange`, 'spiceMelangeUsed', 500000);
}
if (myFullness() + 4 === fullnessLimit()) {
  useIfUnused($item`cuppa Voraci tea`, '_voraciTeaUsed', 110000);
}
if (myInebriety() + 4 === inebrietyLimit()) {
  useIfUnused($item`cuppa Sobrie tea`, '_sobrieTeaUsed', 110000);
}

fillSomeSpleen();
fillStomach();
fillLiver();

const mojoFilterCount = 3 - getPropertyInt('currentMojoFilters');
getCapped(mojoFilterCount, $item`mojo filter`, 10000);
use(mojoFilterCount, $item`mojo filter`);
fillSomeSpleen();

useIfUnused($item`fancy chocolate car`, getPropertyInt('_chocolatesUsed') === 0, 2 * MPA);

const loveChocolateCount = Math.max(3 - Math.floor(20000 / MPA) - getPropertyInt('_loveChocolatesUsed'), 0);
const loveChocolateEat = Math.min(loveChocolateCount, itemAmount($item`LOV Extraterrestrial Chocolate`));
use(loveChocolateEat, $item`LOV Extraterrestrial Chocolate`);

const choco = new Map([
  [toInt($class`Seal Clubber`), $item`chocolate seal-clubbing club`],
  [toInt($class`Turtle Tamer`), $item`chocolate turtle totem`],
  [toInt($class`Pastamancer`), $item`chocolate pasta spoon`],
  [toInt($class`Sauceror`), $item`chocolate saucepan`],
  [toInt($class`Accordion Thief`), $item`chocolate stolen accordion`],
  [toInt($class`Disco Bandit`), $item`chocolate disco ball`],
]);
if (choco.has(toInt(myClass())) && getPropertyInt('_chocolatesUsed') < 3) {
  const used = getPropertyInt('_chocolatesUsed');
  const item = choco.get(toInt(myClass())) || $item`none`;
  const count = clamp(3 - used, 0, 3);
  use(count, item);
}

useIfUnused($item`fancy chocolate sculpture`, getPropertyInt('_chocolateSculpturesUsed') < 1, 5 * MPA);
useIfUnused($item`essential tofu`, '_essentialTofuUsed', 5 * MPA);

if (getProperty('_timesArrowUsed') !== 'true' && mallPrice($item`time's arrow`) < 5 * MPA) {
  getCapped(1, $item`time's arrow`, 5 * MPA);
  cliExecute("csend 1 time's arrow to botticelli");
  setProperty('_timesArrowUsed', 'true');
}

if (mallPrice($item`blue mana`) < 3 * MPA) {
  const casts = Math.max(10 - getPropertyInt('_ancestralRecallCasts'), 0);
  getCapped(casts, $item`blue mana`, 3 * MPA);
  useSkill(casts, $skill`Ancestral Recall`);
}
