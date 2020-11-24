// eslint-disable-next-line node/no-unpublished-import
import 'libram/kolmafia';

import {
  getPropertyInt,
  getPropertyBoolean,
  get,
  adventureGain,
  totalAmount,
  chewSafe,
  itemPriority,
  drinkSpleen,
  eatSpleen,
  useIfUnused,
} from './daily-lib';

const MPA = 8500;

const potentialSpleenItems: Item[] = Item.get(['transdermal smoke patch', 'voodoo snuff', 'blood-drive sticker']);
const keyF = (item: Item) => -(adventureGain(item) * MPA - Lib.mallPrice(item)) / item.spleen;
potentialSpleenItems.sort((x, y) => keyF(x) - keyF(y));
let spleenItem = potentialSpleenItems[0];
if (
  spleenItem.name === 'blood-drive sticker' &&
  totalAmount(Item.get('voodoo snuff')) > 100 &&
  totalAmount(Item.get('blood-drive sticker')) < 6
) {
  // Override if we hagve too many to sell.
  spleenItem = Item.get('voodoo snuff');
}
Lib.print(`Spleen item: ${spleenItem}`);

function fillSpleen() {
  if (Lib.mySpleenUse() + spleenItem.spleen <= Lib.spleenLimit()) {
    const count = (Lib.spleenLimit() - Lib.mySpleenUse()) / spleenItem.spleen;
    get(count, spleenItem, adventureGain(spleenItem) * MPA);
    chewSafe(count, spleenItem);
  }
}

function fillStomach() {
  if (
    Lib.myLevel() >= 15 &&
    !getPropertyBoolean('_hungerSauceUsed') &&
    Lib.mallPrice(Item.get('Hunger&trade; sauce')) < 3 * MPA
  ) {
    get(1, Item.get('Hunger&trade; sauce'), 3 * MPA);
    Lib.use(1, Item.get('Hunger&trade; sauce'));
  }
  if (!getPropertyBoolean('_milkOfMagnesiumUsed')) {
    Lib.use(1, Item.get('milk of magnesium'));
  }
  // Save space for marketplace food.
  while (Lib.myFullness() + 5 <= Lib.fullnessLimit()) {
    if (Lib.myMaxhp() < 1000) {
      Lib.maximize('hot res', false);
    }
    const count = Math.min((Lib.fullnessLimit() - Lib.myFullness()) / 5, Lib.mySpleenUse() / 5);
    Lib.restoreHp(Lib.myMaxhp());
    get(count, Item.get('extra-greasy slider'), 50000);
    get(count, Item.get("Ol' Scratch's salad fork"), 50000);
    get(count, Item.get('special seasoning'), 5000);
    eatSpleen(count, Item.get("Ol' Scratch's salad fork"));
    eatSpleen(count, Item.get('extra-greasy slider'));
    fillSpleen();
  }
}

function fillLiver() {
  if (!getPropertyBoolean('_mimeArmyShotglassUsed') && Lib.itemAmount(Item.get('mime army shotglass')) > 0) {
    Lib.equip(Item.get('tuxedo shirt'));
    Lib.drink(1, itemPriority(Item.get('astral pilsner'), Item.get('splendid martini')));
  }
  while (Lib.myInebriety() + 1 <= Lib.inebrietyLimit() && Lib.itemAmount(Item.get('astral pilsner')) > 0) {
    // while (have_effect($effect[Ode to Booze]) < 1) use_skill(1, $skill[The Ode to Booze]);
    Lib.drink(1, Item.get('astral pilsner'));
  }
  while (Lib.myInebriety() + 5 <= Lib.inebrietyLimit()) {
    if (Lib.myMaxhp() < 1000) {
      Lib.maximize('0.05hp, cold res', false);
    }
    const count = Math.min((Lib.inebrietyLimit() - Lib.myInebriety()) / 5, Lib.mySpleenUse() / 5);
    Lib.restoreHp(Lib.myMaxhp());
    /* while (have_effect($effect[Ode to Booze]) < count * 5) {
            use_skill(1, $skill[The Ode to Booze]);
        } */
    get(count, Item.get('jar of fermented pickle juice'), 70000);
    get(count, Item.get("Frosty's frosty mug"), 45000);
    drinkSpleen(count, Item.get("Frosty's frosty mug"));
    drinkSpleen(count, Item.get('jar of fermented pickle juice'));
    fillSpleen();
  }
}

fillSpleen();
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

fillSpleen();
fillStomach();
fillLiver();

const mojoFilterCount = 3 - getPropertyInt('currentMojoFilters');
get(mojoFilterCount, Item.get('mojo filter'), 10000);
Lib.use(mojoFilterCount, Item.get('mojo filter'));
fillSpleen();

if (getPropertyInt('_chocolatesUsed') === 0 && Lib.mallPrice(Item.get('fancy chocolate car')) < 2 * MPA) {
  const item: Item = Item.get('fancy chocolate car');
  get(1, item, 2 * MPA);
  Lib.use(1, item);
}

const loveChocolateCount = Math.max(3 - Math.floor(20000 / MPA), 0);
if (getPropertyInt('_loveChocolatesUsed') < loveChocolateCount) {
  const count = Math.min(
    Lib.itemAmount(Item.get('LOV Extraterrestrial Chocolate')),
    Math.max(loveChocolateCount - getPropertyInt('_loveChocolatesUsed'), 0)
  );
  Lib.use(count, Item.get('LOV Extraterrestrial Chocolate'));
}

const choco = new Map<number, Item>([
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
  const count = Math.min(3 - used, 3);
  Lib.use(count, item);
}

if (getPropertyInt('_chocolateSculpturesUsed') < 1 && Lib.mallPrice(Item.get('fancy chocolate sculpture')) < 5 * MPA) {
  get(1, Item.get('fancy chocolate sculpture'), 5 * MPA);
  Lib.use(1, Item.get('fancy chocolate sculpture'));
}

useIfUnused(Item.get('essential tofu'), '_essentialTofuUsed', 5 * MPA);

if (Lib.getProperty('_timesArrowUsed') !== 'true' && Lib.mallPrice(Item.get("time's arrow")) < 5 * MPA) {
  get(1, Item.get("time's arrow"), 5 * MPA);
  Lib.cliExecute("csend 1 time's arrow to botticelli");
  Lib.setProperty('_timesArrowUsed', 'true');
}

if (Lib.mallPrice(Item.get('blue mana')) < 3 * MPA) {
  const casts = Math.max(10 - getPropertyInt('_ancestralRecallCasts'), 0);
  get(casts, Item.get('blue mana'), 3 * MPA);
  Lib.useSkill(casts, Skill.get('Ancestral Recall'));
}
