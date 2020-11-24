import 'libram/kolmafia';

const MPA = 8500;

function getPropertyInt(name: string): number {
    const str = Lib.getProperty(name);
    if (str == '') {
        Lib.abort(`Unknown property ${name}.`);
    }
    return parseInt(str, 10);
}

function getPropertyBoolean(name: string) {
    const str = Lib.getProperty(name);
    if (str == '') {
        Lib.abort(`Unknown property ${name}.`);
    }
    return str == 'true';
}

function itemPriority(...items: Item[]): Item {
    if (items.length == 1) return items[0];
    else return Lib.itemAmount(items[0]) > 0 ? items[0] : itemPriority(...items.slice(1));
}

function cheaper(...items: Item[]) {
    if (items.length == 1) return items[0];
    else return Lib.itemAmount(items[0]) > 0 ? items[0] : itemPriority(...items.slice(1));
}

function get(qty: number, item: Item, max_price: number) {
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
        if (Lib.buy(remaining, item, max_price) < remaining) Lib.abort(`Mall price too high for {it.name}.`);
    }
}

function eatSafe(qty: number, item: Item) {
    if (!Lib.eat(qty, item)) Lib.abort('Failed to eat safely');
}

function drinkSafe(qty: number, item: Item) {
    if (!Lib.drink(qty, item)) Lib.abort('Failed to drink safely');
}

function chewSafe(qty: number, item: Item) {
    if (!Lib.chew(qty, item)) Lib.abort('Failed to chew safely');
}

function eatSpleen(qty: number, item: Item) {
    if (Lib.mySpleenUse() < 5) Lib.abort('No spleen to clear with this.');
    eatSafe(qty, item);
}

function drinkSpleen(qty: number, item: Item) {
    if (Lib.mySpleenUse() < 5) Lib.abort('No spleen to clear with this.');
    drinkSafe(qty, item);
}

function adventureGain(item: Item) {
    if (item.adventures.includes('-')) {
        const [min, max] = item.adventures.split('-').map(s => parseInt(s, 10));
        return (min + max) / 2.0;
    } else {
        return parseInt(item.adventures, 10);
    }
}

function useIfUnused(item: Item, prop: string, maxPrice: number) {
    if (!getPropertyBoolean(prop)) {
        if (Lib.mallPrice(item) <= maxPrice) {
            get(1, item, maxPrice);
            Lib.use(1, item);
        } else {
            Lib.print(`Skipping ${item.name}; too expensive (${Lib.mallPrice(item)} > ${maxPrice}).`);
        }
    }
}

function totalAmount(item: Item): number {
    return Lib.shopAmount(item) + Lib.itemAmount(item);
}

const potentialSpleenItems: Item[] = Item.get(['transdermal smoke patch', 'voodoo snuff', 'blood-drive sticker']);
const keyF = (item: Item) => -(adventureGain(item) * MPA - Lib.mallPrice(item)) / item.spleen;
potentialSpleenItems.sort((x, y) => keyF(x) - keyF(y));
let spleenItem = potentialSpleenItems[0];
if (spleenItem.name == 'blood-drive sticker' && totalAmount(Item.get('voodoo snuff')) > 100 && totalAmount(Item.get('blood-drive sticker')) < 6) {
    // Override if we have too many to sell.
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
    if (Lib.myLevel() >= 15 && !getPropertyBoolean('_hungerSauceUsed') && Lib.mallPrice(Item.get('Hunger&trade; sauce')) < 3 * MPA) {
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
        get(count, Item.get('Ol\' Scratch\'s salad fork'), 50000);
        get(count, Item.get('special seasoning'), 5000);
        eatSpleen(count, Item.get('Ol\' Scratch\'s salad fork'));
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
        get(count, Item.get('Frosty\'s frosty mug'), 45000);
        drinkSpleen(count, Item.get('Frosty\'s frosty mug'));
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

if (!getPropertyBoolean('_syntheticDogHairPillUsed') && 1 <= Lib.myInebriety() && Lib.myInebriety() <= Lib.inebrietyLimit()) {
    if (!Lib.use(1, Item.get('synthetic dog hair pill'))) {
        Lib.print('WARNING: Out of synthetic dog hair pills.');
    }
}

if (3 <= Lib.myFullness() && Lib.myFullness() <= Lib.fullnessLimit() + 1 && 3 <= Lib.myInebriety() && Lib.myInebriety() <= Lib.inebrietyLimit() + 1) {
    useIfUnused(Item.get('spice melange'), 'spiceMelangeUsed', 500000);
}
if (Lib.myFullness() + 4 == Lib.fullnessLimit()) {
    useIfUnused(Item.get('cuppa Voraci tea'), '_voraciTeaUsed', 110000);
}
if (Lib.myInebriety() + 4 == Lib.inebrietyLimit()) {
    useIfUnused(Item.get('cuppa Sobrie tea'), '_sobrieTeaUsed', 110000);
}

fillSpleen();
fillStomach();
fillLiver();

const mojoFilterCount = 3 - getPropertyInt('currentMojoFilters');
get(mojoFilterCount, Item.get('mojo filter'), 10000);
Lib.use(mojoFilterCount, Item.get('mojo filter'));
fillSpleen();

if (getPropertyInt('_chocolatesUsed') == 0 && Lib.mallPrice(Item.get('fancy chocolate car')) < 2 * MPA) {
    const item: Item = Item.get('fancy chocolate car');
    get(1, item, 2 * MPA);
    Lib.use(1, item);
}

const loveChocolateCount = Math.max(3 - Math.floor(20000 / MPA), 0);
if (getPropertyInt('_loveChocolatesUsed') < loveChocolateCount) {
    const count = Math.min(
        Lib.itemAmount(Item.get('LOV Extraterrestrial Chocolate')),
        Math.max(loveChocolateCount - getPropertyInt('_loveChocolatesUsed'), 0),
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
    let used = getPropertyInt('_chocolatesUsed');
    const item = choco.get(Lib.toInt(Lib.myClass())) || Item.get("none");
    const count = Math.min(3 - used, 3);
    Lib.use(count, item);
}

if (getPropertyInt('_chocolateSculpturesUsed') < 1 && Lib.mallPrice(Item.get('fancy chocolate sculpture')) < 5 * MPA) {
    get(1, Item.get('fancy chocolate sculpture'), 5 * MPA);
    Lib.use(1, Item.get('fancy chocolate sculpture'));
}

useIfUnused(Item.get('essential tofu'), '_essentialTofuUsed', 5 * MPA);

if (Lib.getProperty('_timesArrowUsed') != 'true' && Lib.mallPrice(Item.get('time\'s arrow')) < 5 * MPA) {
    get(1, Item.get('time\'s arrow'), 5 * MPA);
    Lib.cliExecute('csend 1 time\'s arrow to botticelli');
    Lib.setProperty('_timesArrowUsed', 'true');
}

if (Lib.mallPrice(Item.get('blue mana')) < 3 * MPA) {
    const casts = Math.max(10 - getPropertyInt('_ancestralRecallCasts'), 0);
    get(casts, Item.get('blue mana'), 3 * MPA);
    Lib.useSkill(casts, Skill.get('Ancestral Recall'));
}
