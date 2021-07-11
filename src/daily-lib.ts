import {
  print,
  getProperty,
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
  cliExecute,
  myMeat,
  myClosetMeat,
  myFamiliar,
  useFamiliar,
  setProperty,
  getClanName,
  visitUrl,
  xpath,
  retrieveItem,
  myMp,
  myMaxmp,
  availableAmount,
  putStash,
  takeStash,
  drinksilent,
} from "kolmafia";
import { $effect, $item, $items, $skill } from "libram";

export const MPA = getPropertyInt("valueOfAdventure");

const fullnessReserve = 0;
const inebrietyReserve = 0;

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(n, max));
}

export function getPropertyString(propertyName: string, defaultValue: string | null = null) {
  return getProperty(propertyName) ?? defaultValue;
}

export function getPropertyInt(name: string): number {
  const str = getProperty(name);
  if (str === "") {
    throw `Unknown property ${name}.`;
  }
  return parseInt(str, 10);
}

export function setPropertyInt(name: string, value: number) {
  setProperty(name, `${value}`);
}

export function getPropertyBoolean(name: string) {
  const str = getProperty(name);
  if (str === "") {
    throw `Unknown property ${name}.`;
  }
  return str === "true";
}

export function setChoice(choice: number, value: number | string) {
  setProperty(`choiceAdventure${choice}`, value.toString());
}

export function itemPriority(...items: Item[]): Item {
  if (items.length === 1) return items[0];
  else return itemAmount(items[0]) > 0 ? items[0] : itemPriority(...items.slice(1));
}

export function cheaper(...items: Item[]) {
  if (items.length === 1) return items[0];
  else return itemAmount(items[0]) > 0 ? items[0] : itemPriority(...items.slice(1));
}

const priceCaps: { [index: string]: number } = {
  "jar of fermented pickle juice": 75000,
  "Frosty's frosty mug": 45000,
  "extra-greasy slider": 45000,
  "Ol' Scratch's salad fork": 50000,
  "transdermal smoke patch": 7000,
  "voodoo snuff": 36000,
  "antimatter wad": 24000,
  "blood-drive sticker": 210000,
  "spice melange": 500000,
  "splendid martini": 10000,
  "Eye and a Twist": 10000,
};

export function getCapped(qty: number, item: Item, maxPrice: number) {
  if (qty * mallPrice(item) > 1000000) throw "bad get!";

  let remaining = qty - itemAmount(item);
  if (remaining <= 0) return;

  const getCloset = Math.min(remaining, closetAmount(item));
  if (!takeCloset(getCloset, item)) throw "failed to remove from closet";
  remaining -= getCloset;
  if (remaining <= 0) return;

  let getMall = Math.min(remaining, shopAmount(item));
  if (!takeShop(getMall, item)) {
    cliExecute("refresh shop");
    cliExecute("refresh inventory");
    remaining = qty - itemAmount(item);
    getMall = Math.min(remaining, shopAmount(item));
    if (!takeShop(getMall, item)) throw "failed to remove from shop";
  }
  remaining -= getMall;
  if (remaining <= 0) return;

  buy(remaining, item, maxPrice);
  if (itemAmount(item) < qty) throw `Mall price too high for ${item.name}.`;
}

export function get(qty: number, item: Item) {
  getCapped(qty, item, priceCaps[item.name]);
}

export function eatSafe(qty: number, item: Item) {
  get(1, item);
  if (!eat(qty, item)) throw "Failed to eat safely";
}

export function drinkSafe(qty: number, item: Item) {
  get(qty, item);
  drinksilent(qty, item);
}

export function chewSafe(qty: number, item: Item) {
  get(qty, item);
  if (!chew(qty, item)) throw "Failed to chew safely";
}

export function eatSpleen(qty: number, item: Item) {
  if (mySpleenUse() < 5) throw "No spleen to clear with this.";
  eatSafe(qty, item);
}

export function drinkSpleen(qty: number, item: Item) {
  if (mySpleenUse() < 5) throw "No spleen to clear with this.";
  drinkSafe(qty, item);
}

export function adventureGain(item: Item) {
  if (item.adventures.includes("-")) {
    const [min, max] = item.adventures.split("-").map((s) => parseInt(s, 10));
    return (min + max) / 2.0;
  } else {
    return parseInt(item.adventures, 10);
  }
}

function propTrue(prop: string | boolean) {
  if (typeof prop === "boolean") {
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
  if (haveEffect(effect) < turns) throw "Could not get Ode for some reason.";
}

const snuff = $item`voodoo snuff`;
const valuePerSpleen = (item: Item) => -(adventureGain(item) * MPA - mallPrice(item)) / item.spleen;
let savedBestSpleenItem: Item | null = null;
let savedPotentialSpleenItems: Item[] | null = null;
function getBestSpleenItems() {
  if (savedBestSpleenItem !== null && savedPotentialSpleenItems !== null) {
    return { bestSpleenItem: savedBestSpleenItem, potentialSpleenItems: savedPotentialSpleenItems };
  }

  savedPotentialSpleenItems = $items`transdermal smoke patch, antimatter wad, voodoo snuff, blood-drive sticker`;
  savedPotentialSpleenItems.sort((x, y) => valuePerSpleen(x) - valuePerSpleen(y));
  for (const spleenItem of savedPotentialSpleenItems) {
    print(`${spleenItem} value/spleen: ${-valuePerSpleen(spleenItem)}`);
  }
  savedBestSpleenItem = savedPotentialSpleenItems[0];
  if (
    savedBestSpleenItem.name === "blood-drive sticker" &&
    totalAmount(snuff) > 50 &&
    totalAmount($item`blood-drive sticker`) < 6
  ) {
    // Override if we have too many to sell.
    savedBestSpleenItem = $item`voodoo snuff`;
  } else if (
    savedBestSpleenItem.name === "blood-drive sticker" &&
    myMeat() + myClosetMeat() < 20000000
  ) {
    savedBestSpleenItem = savedPotentialSpleenItems[1];
  } else if (
    valuePerSpleen(savedBestSpleenItem) - valuePerSpleen(snuff) < 300 &&
    totalAmount(snuff) > 50
  ) {
    savedBestSpleenItem = $item`voodoo snuff`;
  }
  savedPotentialSpleenItems.splice(savedPotentialSpleenItems.indexOf(savedBestSpleenItem), 1);
  savedPotentialSpleenItems.splice(0, 0, savedBestSpleenItem);
  return { bestSpleenItem: savedBestSpleenItem, potentialSpleenItems: savedPotentialSpleenItems };
}

export function fillSomeSpleen() {
  const { bestSpleenItem } = getBestSpleenItems();
  print(`Spleen item: ${bestSpleenItem}`);
  fillSpleenWith(bestSpleenItem);
}

export function fillAllSpleen(): void {
  const { potentialSpleenItems } = getBestSpleenItems();
  for (const spleenItem of potentialSpleenItems) {
    print(`Filling spleen with ${spleenItem}.`);
    fillSpleenWith(spleenItem);
  }
}

export function fillSpleenWith(spleenItem: Item) {
  if (mySpleenUse() + spleenItem.spleen <= spleenLimit()) {
    const count = Math.floor((spleenLimit() - mySpleenUse()) / spleenItem.spleen);
    get(count, spleenItem);
    chewSafe(count, spleenItem);
  }
}

export function fillStomach() {
  if (
    myLevel() >= 15 &&
    !getPropertyBoolean("_hungerSauceUsed") &&
    mallPrice($item`Hunger&trade; sauce`) < 3 * MPA
  ) {
    getCapped(1, $item`Hunger&trade; sauce`, 3 * MPA);
    use(1, $item`Hunger&trade; sauce`);
  }
  if (!getPropertyBoolean("_milkOfMagnesiumUsed")) {
    use(1, $item`milk of magnesium`);
  }
  // Save space for marketplace food.
  const limit = fullnessLimit() - fullnessReserve;
  while (myFullness() + 5 <= limit) {
    if (myMaxhp() < 1000) {
      maximize("hot res", false);
    }
    const count = Math.floor(Math.min((limit - myFullness()) / 5, mySpleenUse() / 5));
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
  if (!getPropertyBoolean("_mimeArmyShotglassUsed") && itemAmount($item`mime army shotglass`) > 0) {
    equip($item`tuxedo shirt`);
    drink(
      1,
      itemPriority($item`astral pilsner`, cheaper($item`Eye and a Twist`, $item`splendid martini`))
    );
  }
  const limit = inebrietyLimit() - inebrietyReserve;
  while (myInebriety() + 1 <= limit && itemAmount($item`astral pilsner`) > 0) {
    ensureOde(1);
    drink(1, $item`astral pilsner`);
  }
  while (myInebriety() + 5 <= limit) {
    if (myMaxhp() < 1000) {
      maximize("0.05hp, cold res", false);
    }
    const count = Math.floor(Math.min((limit - myInebriety()) / 5, mySpleenUse() / 5));
    restoreHp(myMaxhp());
    ensureOde(count * 5);
    get(count, $item`jar of fermented pickle juice`);
    get(count, $item`Frosty's frosty mug`);
    drinkSpleen(count, $item`Frosty's frosty mug`);
    drinkSpleen(count, $item`jar of fermented pickle juice`);
    fillSomeSpleen();
  }
}

const familiarStack: Familiar[] = [];

export function pushFamiliar(newFamiliar: Familiar) {
  familiarStack.push(myFamiliar());
  useFamiliar(newFamiliar);
}

export function popFamiliar() {
  const currentFamiliar = myFamiliar();
  const lastFamiliar = familiarStack.pop();
  if (lastFamiliar !== undefined) useFamiliar(lastFamiliar);
  return currentFamiliar;
}

export function withFamiliar<T>(familiar: Familiar, action: () => T) {
  pushFamiliar(familiar);
  try {
    return action();
  } finally {
    popFamiliar();
  }
}

function getClanCache(targetClanName: string | null = null) {
  let clanCache = new Map<string, number>(
    JSON.parse(getPropertyString("minehobo_clanCache", "[]"))
  );
  if (
    Object.keys(clanCache).length === 0 ||
    (targetClanName !== null && !clanCache.has(targetClanName))
  ) {
    const recruiter = visitUrl("clan_signup.php");
    const clanIds: number[] = xpath(
      recruiter,
      '//select[@name="whichclan"]/option/@value'
    ).map((s: string) => parseInt(s, 10));
    const clanNames: string[] = xpath(recruiter, '//select[@name="whichclan"]/option/text()');
    const clanNamesAndIds = clanIds.reduce(
      (list, clanId, index) => [...list, [clanNames[index], clanId] as [string, number]],
      [] as [string, number][]
    );
    clanCache = new Map<string, number>(clanNamesAndIds);
  }
  setProperty("bdaily_clanCache", JSON.stringify([...clanCache.entries()]));
  return clanCache;
}

function getTargetClanName(target: string) {
  const clanCache = getClanCache();
  const targetClanNames = [...clanCache.keys()].filter((name: string) =>
    name.toLowerCase().includes(target.toLowerCase())
  );
  if (targetClanNames.length === 0) {
    throw `You're not in any clan named like ${target}.`;
  } else if (targetClanNames.length >= 2) {
    throw `You're in multiple clans named like ${target}: ${targetClanNames}`;
  }
  return targetClanNames[0];
}

export function setClan(target: string, verbose = true) {
  const targetClanName = getTargetClanName(target);
  if (getClanName() !== targetClanName) {
    if (verbose) print(`Switching to clan: ${targetClanName}.`);
    visitUrl(
      `showclan.php?whichclan=${getClanCache(targetClanName).get(
        targetClanName
      )}&action=joinclan&confirm=on&pwd`
    );
    if (getClanName() !== targetClanName) {
      throw `Failed to switch clans to ${target}. Did you spell it correctly? Are you whitelisted?`;
    }
    if (verbose) print("Successfully switched clans.", "green");
  } else {
    if (verbose) print(`Already in clan ${targetClanName}.`, "blue");
  }
  return true;
}

export function withStash<T>(itemsToTake: Item[], action: () => T) {
  const stashClanName = getProperty("stashClan");
  if (stashClanName === "") return null;
  if (itemsToTake.every((item) => availableAmount(item) > 0)) return action();

  const startingClanName = getClanName();
  setClan(stashClanName);
  if (getClanName() !== stashClanName) throw "Wrong clan! Don't take stuff out of the stash here!";
  const quantitiesTaken = new Map<Item, number>();
  try {
    for (const item of itemsToTake) {
      const succeeded = takeStash(1, item);
      if (succeeded) {
        print(`Took ${item.plural} from stash.`, "blue");
        quantitiesTaken.set(item, (quantitiesTaken.get(item) ?? 0) + (succeeded ? 1 : 0));
      }
    }
    return action();
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    if (getClanName() !== stashClanName)
      throw "Wrong clan! Don't put stuff back in the stash here!";
    for (const [item, quantityTaken] of quantitiesTaken.entries()) {
      retrieveItem(quantityTaken, item);
      putStash(quantityTaken, item);
      print(`Returned ${quantityTaken} ${item.plural} to stash.`, "blue");
    }
    setClan(startingClanName);
  }
}

export function ensureMpSausage(mp: number) {
  while (myMp() < Math.min(mp, myMaxmp())) {
    retrieveItem(1, $item`magical sausage`);
    eat(1, $item`magical sausage`);
  }
}

export function ensureEffect(effect: Effect) {
  if (haveEffect(effect) === 0) {
    try {
      cliExecute(effect.default);
      // eslint-disable-next-line no-empty
    } catch {}
  }
}
