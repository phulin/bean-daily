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

export function get(qty: number, item: Item, max_price: number) {
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
    if (Lib.buy(remaining, item, max_price) < remaining) Lib.abort('Mall price too high for {it.name}.');
  }
}

export function eatSafe(qty: number, item: Item) {
  if (!Lib.eat(qty, item)) Lib.abort('Failed to eat safely');
}

export function drinkSafe(qty: number, item: Item) {
  if (!Lib.drink(qty, item)) Lib.abort('Failed to drink safely');
}

export function chewSafe(qty: number, item: Item) {
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

export function useIfUnused(item: Item, prop: string, maxPrice: number) {
  if (!getPropertyBoolean(prop)) {
    if (Lib.mallPrice(item) <= maxPrice) {
      get(1, item, maxPrice);
      Lib.use(1, item);
    } else {
      Lib.print(`Skipping ${item.name}; too expensive (${Lib.mallPrice(item)} > ${maxPrice}).`);
    }
  }
}

export function totalAmount(item: Item): number {
  return Lib.shopAmount(item) + Lib.itemAmount(item);
}
