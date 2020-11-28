import {
  print,
  getProperty,
  abort,
  itemAmount,
  closetAmount,
  takeCloset,
  shopAmount,
  takeShop,
  buy,
  eat,
  drink,
  chew,
  mySpleenUse,
  mallPrice,
  use,
  toEffect,
  haveSkill,
  haveEffect,
  turnsPerCast,
  useSkill,
  spleenLimit,
  myLevel,
  myFullness,
  fullnessLimit,
  myMaxhp,
  maximize,
  restoreHp,
  equip,
  myInebriety,
  inebrietyLimit,
} from 'kolmafia';
import {$effect, $item, $items, $skill} from 'libram/src';

export const MPA = getPropertyInt('valueOfAdventure');
print(`Using adventure value ${MPA}.`, 'blue');

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(n, max));
}

export function getPropertyInt(name: string): number {
  const str = getProperty(name);
  if (str === '') {
    abort(`Unknown property ${name}.`);
  }
  return parseInt(str, 10);
}

export function getPropertyBoolean(name: string) {
  const str = getProperty(name);
  if (str === '') {
    abort(`Unknown property ${name}.`);
  }
  return str === 'true';
}

export function itemPriority(...items: Item[]): Item {
  if (items.length === 1) return items[0];
  else return itemAmount(items[0]) > 0 ? items[0] : itemPriority(...items.slice(1));
}

export function cheaper(...items: Item[]) {
  if (items.length === 1) return items[0];
  else return itemAmount(items[0]) > 0 ? items[0] : itemPriority(...items.slice(1));
}

const priceCaps: {[index: string]: number} = {
  'jar of fermented pickle juice': 75000,
  "Frosty's frosty mug": 45000,
  'extra-greasy slider': 45000,
  "Ol' Scratch's salad fork": 45000,
  'transdermal smoke patch': 7000,
  'voodoo snuff': 36000,
  'blood-drive sticker': 210000,
  'spice melange': 500000,
  'splendid martini': 10000,
};

export function getCapped(qty: number, item: Item, maxPrice: number) {
  if (qty > 15) abort('bad get!');

  let remaining = qty - itemAmount(item);
  if (remaining <= 0) return;

  const getCloset = Math.min(remaining, closetAmount(item));
  if (!takeCloset(getCloset, item)) abort('failed to remove from closet');
  remaining -= getCloset;
  if (remaining <= 0) return;

  const getMall = Math.min(remaining, shopAmount(item));
  if (!takeShop(getMall, item)) abort('failed to remove from shop');
  remaining -= getMall;
  if (remaining <= 0) return;

  if (buy(remaining, item, maxPrice) < remaining) abort('Mall price too high for {it.name}.');
}

export function get(qty: number, item: Item) {
  getCapped(qty, item, priceCaps[item.name]);
}

export function eatSafe(qty: number, item: Item) {
  get(1, item);
  if (!eat(qty, item)) abort('Failed to eat safely');
}

export function drinkSafe(qty: number, item: Item) {
  get(1, item);
  if (!drink(qty, item)) abort('Failed to drink safely');
}

export function chewSafe(qty: number, item: Item) {
  get(1, item);
  if (!chew(qty, item)) abort('Failed to chew safely');
}

export function eatSpleen(qty: number, item: Item) {
  if (mySpleenUse() < 5) abort('No spleen to clear with this.');
  eatSafe(qty, item);
}

export function drinkSpleen(qty: number, item: Item) {
  if (mySpleenUse() < 5) abort('No spleen to clear with this.');
  drinkSafe(qty, item);
}

export function adventureGain(item: Item) {
  if (item.adventures.includes('-')) {
    const [min, max] = item.adventures.split('-').map(s => parseInt(s, 10));
    return (min + max) / 2.0;
  } else {
    return parseInt(item.adventures, 10);
  }
}

function propTrue(prop: string | boolean) {
  if (typeof prop === 'boolean') {
    return prop as boolean;
  } else {
    return getPropertyBoolean(prop as string);
  }
}

export function useIfUnused(item: Item, prop: string | boolean, maxPrice: number) {
  if (!propTrue(prop)) {
    if (mallPrice(item) <= maxPrice) {
      getCapped(1, item, maxPrice);
      use(1, item);
    } else {
      print(`Skipping ${item.name}; too expensive (${mallPrice(item)} > ${maxPrice}).`);
    }
  }
}

export function totalAmount(item: Item): number {
  return shopAmount(item) + itemAmount(item);
}

export function ensureOde(turns = 1) {
  const skill = $skill`The Ode to Booze`;
  const effect = toEffect(skill);

  if (haveSkill(skill) && effect !== $effect`none` && haveEffect(effect) < turns) {
    const casts = Math.ceil((turns - haveEffect(effect)) / turnsPerCast(skill));
    useSkill(clamp(casts, 1, 100), skill);
  }
  if (haveEffect(effect) < turns) throw 'Could not get Ode for some reason.';
}

const potentialSpleenItems = $items`transdermal smoke patch, voodoo snuff, blood-drive sticker`;
const keyF = (item: Item) => -(adventureGain(item) * MPA - mallPrice(item)) / item.spleen;
potentialSpleenItems.sort((x, y) => keyF(x) - keyF(y));
let bestSpleenItem = potentialSpleenItems[0];
for (const spleenItem of potentialSpleenItems) {
  print(`${spleenItem} value/spleen: ${-keyF(spleenItem)}`);
}
if (
  bestSpleenItem.name === 'blood-drive sticker' &&
  totalAmount($item`voodoo snuff`) > 50 &&
  totalAmount($item`blood-drive sticker`) < 6
) {
  // Override if we have too many to sell.
  bestSpleenItem = $item`voodoo snuff`;
} else if (keyF(bestSpleenItem) - keyF($item`voodoo snuff`) < 300 && totalAmount($item`voodoo snuff`) > 50) {
  bestSpleenItem = $item`voodoo snuff`;
}

export function fillSomeSpleen() {
  print(`Spleen item: ${bestSpleenItem}`);
  fillSpleenWith(bestSpleenItem);
}

export function fillAllSpleen(): void {
  for (const spleenItem of potentialSpleenItems) {
    print(`Filling spleen with ${spleenItem}.`);
    fillSpleenWith(spleenItem);
  }
}

export function fillSpleenWith(spleenItem: Item) {
  if (mySpleenUse() + spleenItem.spleen <= spleenLimit()) {
    const count = (spleenLimit() - mySpleenUse()) / spleenItem.spleen;
    get(count, spleenItem);
    chewSafe(count, spleenItem);
  }
}

export function fillStomach() {
  if (myLevel() >= 15 && !getPropertyBoolean('_hungerSauceUsed') && mallPrice($item`Hunger&trade; sauce`) < 3 * MPA) {
    getCapped(1, $item`Hunger&trade; sauce`, 3 * MPA);
    use(1, $item`Hunger&trade; sauce`);
  }
  if (!getPropertyBoolean('_milkOfMagnesiumUsed')) {
    use(1, $item`milk of magnesium`);
  }
  // Save space for marketplace food.
  while (myFullness() + 5 <= fullnessLimit()) {
    if (myMaxhp() < 1000) {
      maximize('hot res', false);
    }
    const count = Math.min((fullnessLimit() - myFullness()) / 5, mySpleenUse() / 5);
    restoreHp(myMaxhp());
    get(count, $item`extra-greasy slider`);
    get(count, $item`Ol' Scratch's salad fork`);
    getCapped(count, $item`special seasoning`, 5000);
    eatSpleen(count, $item`Ol' Scratch's salad fork`);
    eatSpleen(count, $item`extra-greasy slider`);
    fillSomeSpleen();
  }
}

export function fillLiver() {
  if (!getPropertyBoolean('_mimeArmyShotglassUsed') && itemAmount($item`mime army shotglass`) > 0) {
    equip($item`tuxedo shirt`);
    drink(1, itemPriority($item`astral pilsner`, $item`splendid martini`));
  }
  while (myInebriety() + 1 <= inebrietyLimit() && itemAmount($item`astral pilsner`) > 0) {
    ensureOde(1);
    drink(1, $item`astral pilsner`);
  }
  while (myInebriety() + 5 <= inebrietyLimit()) {
    if (myMaxhp() < 1000) {
      maximize('0.05hp, cold res', false);
    }
    const count = Math.min((inebrietyLimit() - myInebriety()) / 5, mySpleenUse() / 5);
    restoreHp(myMaxhp());
    ensureOde(count * 5);
    get(count, $item`jar of fermented pickle juice`);
    get(count, $item`Frosty's frosty mug`);
    drinkSpleen(count, $item`Frosty's frosty mug`);
    drinkSpleen(count, $item`jar of fermented pickle juice`);
    fillSomeSpleen();
  }
}
