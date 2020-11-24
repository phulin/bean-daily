export const MPA = getPropertyInt('valueOfAdventure');

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(n, max));
}

export function getPropertyInt(name: string): number {
  const str = Lib.getProperty(name);
  if (str === '') {
    Lib.abort(`Unknown property ${name}.`);
  }
  return parseInt(str, 10);
}

export function getPropertyBoolean(name: string) {
  const str = Lib.getProperty(name);
  if (str === '') {
    Lib.abort(`Unknown property ${name}.`);
  }
  return str === 'true';
}

export function itemPriority(...items: Item[]): Item {
  if (items.length === 1) return items[0];
  else return Lib.itemAmount(items[0]) > 0 ? items[0] : itemPriority(...items.slice(1));
}

export function cheaper(...items: Item[]) {
  if (items.length === 1) return items[0];
  else return Lib.itemAmount(items[0]) > 0 ? items[0] : itemPriority(...items.slice(1));
}

const priceCaps: {[index: string]: number} = {
  'jar of fermented pickle juice': 75000,
  "Frosty's frosty mug": 45000,
  'extra-greasy slider': 45000,
  "Ol' Scratch's salad fork": 45000,
  'transdermal smoke patch': 7000,
  'voodoo snuff': 36000,
  'blood-drive sticker': 210000,
};

export function getCapped(qty: number, item: Item, maxPrice: number) {
  if (qty > 15) Lib.abort('bad get!');

  let remaining = qty - Lib.itemAmount(item);
  if (remaining <= 0) return;

  const getCloset = Math.min(remaining, Lib.closetAmount(item));
  if (!Lib.takeCloset(getCloset, item)) Lib.abort('failed to remove from closet');
  remaining -= getCloset;
  if (remaining <= 0) return;

  const getMall = Math.min(remaining, Lib.shopAmount(item));
  if (!Lib.takeShop(getMall, item)) Lib.abort('failed to remove from shop');
  remaining -= getMall;
  if (remaining <= 0) return;

  if (!Lib.retrieveItem(remaining, item)) {
    if (Lib.buy(remaining, item, maxPrice) < remaining) Lib.abort('Mall price too high for {it.name}.');
  }
}

export function get(qty: number, item: Item) {
  getCapped(qty, item, priceCaps[item.name]);
}

export function eatSafe(qty: number, item: Item) {
  get(1, item);
  if (!Lib.eat(qty, item)) Lib.abort('Failed to eat safely');
}

export function drinkSafe(qty: number, item: Item) {
  get(1, item);
  if (!Lib.drink(qty, item)) Lib.abort('Failed to drink safely');
}

export function chewSafe(qty: number, item: Item) {
  get(1, item);
  if (!Lib.chew(qty, item)) Lib.abort('Failed to chew safely');
}

export function eatSpleen(qty: number, item: Item) {
  if (Lib.mySpleenUse() < 5) Lib.abort('No spleen to clear with this.');
  eatSafe(qty, item);
}

export function drinkSpleen(qty: number, item: Item) {
  if (Lib.mySpleenUse() < 5) Lib.abort('No spleen to clear with this.');
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
    if (Lib.mallPrice(item) <= maxPrice) {
      getCapped(1, item, maxPrice);
      Lib.use(1, item);
    } else {
      Lib.print(`Skipping ${item.name}; too expensive (${Lib.mallPrice(item)} > ${maxPrice}).`);
    }
  }
}

export function totalAmount(item: Item): number {
  return Lib.shopAmount(item) + Lib.itemAmount(item);
}

export function ensureOde(turns: Number): void {
  while (Lib.haveEffect(Effect.get('Ode to Booze')) < turns) {
    if (!Lib.useSkill(Skill.get('The Ode to Booze'))) Lib.abort('Could not get Ode for some reason.');
  }
}

const potentialSpleenItems: Item[] = Item.get(['transdermal smoke patch', 'voodoo snuff', 'blood-drive sticker']);
const keyF = (item: Item) => -(adventureGain(item) * MPA - Lib.mallPrice(item)) / item.spleen;
potentialSpleenItems.sort((x, y) => keyF(x) - keyF(y));
let bestSpleenItem = potentialSpleenItems[0];
if (
  bestSpleenItem.name === 'blood-drive sticker' &&
  totalAmount(Item.get('voodoo snuff')) > 100 &&
  totalAmount(Item.get('blood-drive sticker')) < 6
) {
  // Override if we have too many to sell.
  bestSpleenItem = Item.get('voodoo snuff');
}

export function fillSomeSpleen() {
  fillSpleenWith(bestSpleenItem);
}

export function fillAllSpleen(): void {
  for (const spleenItem of potentialSpleenItems) {
    fillSpleenWith(spleenItem);
  }
}

export function fillSpleenWith(spleenItem: Item) {
  Lib.print(`Spleen item: ${spleenItem}`);
  if (Lib.mySpleenUse() + spleenItem.spleen <= Lib.spleenLimit()) {
    const count = (Lib.spleenLimit() - Lib.mySpleenUse()) / spleenItem.spleen;
    chewSafe(count, spleenItem);
  }
}

export function fillStomach() {
  if (
    Lib.myLevel() >= 15 &&
    !getPropertyBoolean('_hungerSauceUsed') &&
    Lib.mallPrice(Item.get('Hunger&trade; sauce')) < 3 * MPA
  ) {
    getCapped(1, Item.get('Hunger&trade; sauce'), 3 * MPA);
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
    get(count, Item.get('extra-greasy slider'));
    get(count, Item.get("Ol' Scratch's salad fork"));
    getCapped(count, Item.get('special seasoning'), 5000);
    eatSpleen(count, Item.get("Ol' Scratch's salad fork"));
    eatSpleen(count, Item.get('extra-greasy slider'));
    fillSomeSpleen();
  }
}

export function fillLiver() {
  if (!getPropertyBoolean('_mimeArmyShotglassUsed') && Lib.itemAmount(Item.get('mime army shotglass')) > 0) {
    Lib.equip(Item.get('tuxedo shirt'));
    Lib.drink(1, itemPriority(Item.get('astral pilsner'), Item.get('splendid martini')));
  }
  while (Lib.myInebriety() + 1 <= Lib.inebrietyLimit() && Lib.itemAmount(Item.get('astral pilsner')) > 0) {
    while (Lib.haveEffect(Effect.get('Ode to Booze')) < 1) Lib.useSkill(Skill.get('The Ode to Booze'));
    Lib.drink(1, Item.get('astral pilsner'));
  }
  while (Lib.myInebriety() + 5 <= Lib.inebrietyLimit()) {
    if (Lib.myMaxhp() < 1000) {
      Lib.maximize('0.05hp, cold res', false);
    }
    const count = Math.min((Lib.inebrietyLimit() - Lib.myInebriety()) / 5, Lib.mySpleenUse() / 5);
    Lib.restoreHp(Lib.myMaxhp());
    while (Lib.haveEffect(Effect.get('Ode to Booze')) < count * 5) Lib.useSkill(Skill.get('The Ode to Booze'));
    get(count, Item.get('jar of fermented pickle juice'));
    get(count, Item.get("Frosty's frosty mug"));
    drinkSpleen(count, Item.get("Frosty's frosty mug"));
    drinkSpleen(count, Item.get('jar of fermented pickle juice'));
    fillSomeSpleen();
  }
}
