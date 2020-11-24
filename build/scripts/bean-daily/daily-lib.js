"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clamp = clamp;
exports.getPropertyInt = getPropertyInt;
exports.getPropertyBoolean = getPropertyBoolean;
exports.itemPriority = itemPriority;
exports.cheaper = cheaper;
exports.getCapped = getCapped;
exports.get = get;
exports.eatSafe = eatSafe;
exports.drinkSafe = drinkSafe;
exports.chewSafe = chewSafe;
exports.eatSpleen = eatSpleen;
exports.drinkSpleen = drinkSpleen;
exports.adventureGain = adventureGain;
exports.useIfUnused = useIfUnused;
exports.totalAmount = totalAmount;
exports.ensureOde = ensureOde;
exports.fillSomeSpleen = fillSomeSpleen;
exports.fillAllSpleen = fillAllSpleen;
exports.fillSpleenWith = fillSpleenWith;
exports.fillStomach = fillStomach;
exports.fillLiver = fillLiver;
exports.MPA = void 0;

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var MPA = getPropertyInt('valueOfAdventure');
exports.MPA = MPA;

function clamp(n, min, max) {
  return Math.max(min, Math.min(n, max));
}

function getPropertyInt(name) {
  var str = Lib.getProperty(name);

  if (str === '') {
    Lib.abort("Unknown property ".concat(name, "."));
  }

  return parseInt(str, 10);
}

function getPropertyBoolean(name) {
  var str = Lib.getProperty(name);

  if (str === '') {
    Lib.abort("Unknown property ".concat(name, "."));
  }

  return str === 'true';
}

function itemPriority() {
  for (var _len = arguments.length, items = new Array(_len), _key = 0; _key < _len; _key++) {
    items[_key] = arguments[_key];
  }

  if (items.length === 1) return items[0];else return Lib.itemAmount(items[0]) > 0 ? items[0] : itemPriority.apply(void 0, _toConsumableArray(items.slice(1)));
}

function cheaper() {
  for (var _len2 = arguments.length, items = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    items[_key2] = arguments[_key2];
  }

  if (items.length === 1) return items[0];else return Lib.itemAmount(items[0]) > 0 ? items[0] : itemPriority.apply(void 0, _toConsumableArray(items.slice(1)));
}

var priceCaps = {
  'jar of fermented pickle juice': 75000,
  "Frosty's frosty mug": 45000,
  'extra-greasy slider': 45000,
  "Ol' Scratch's salad fork": 45000,
  'transdermal smoke patch': 7000,
  'voodoo snuff': 36000,
  'blood-drive sticker': 210000
};

function getCapped(qty, item, maxPrice) {
  if (qty > 15) Lib.abort('bad get!');
  var remaining = qty - Lib.itemAmount(item);
  if (remaining <= 0) return;
  var getCloset = Math.min(remaining, Lib.closetAmount(item));
  if (!Lib.takeCloset(getCloset, item)) Lib.abort('failed to remove from closet');
  remaining -= getCloset;
  if (remaining <= 0) return;
  var getMall = Math.min(remaining, Lib.shopAmount(item));
  if (!Lib.takeShop(getMall, item)) Lib.abort('failed to remove from shop');
  remaining -= getMall;
  if (remaining <= 0) return;

  if (!Lib.retrieveItem(remaining, item)) {
    if (Lib.buy(remaining, item, maxPrice) < remaining) Lib.abort('Mall price too high for {it.name}.');
  }
}

function get(qty, item) {
  getCapped(qty, item, priceCaps[item.name]);
}

function eatSafe(qty, item) {
  get(1, item);
  if (!Lib.eat(qty, item)) Lib.abort('Failed to eat safely');
}

function drinkSafe(qty, item) {
  get(1, item);
  if (!Lib.drink(qty, item)) Lib.abort('Failed to drink safely');
}

function chewSafe(qty, item) {
  get(1, item);
  if (!Lib.chew(qty, item)) Lib.abort('Failed to chew safely');
}

function eatSpleen(qty, item) {
  if (Lib.mySpleenUse() < 5) Lib.abort('No spleen to clear with this.');
  eatSafe(qty, item);
}

function drinkSpleen(qty, item) {
  if (Lib.mySpleenUse() < 5) Lib.abort('No spleen to clear with this.');
  drinkSafe(qty, item);
}

function adventureGain(item) {
  if (item.adventures.includes('-')) {
    var _item$adventures$spli = item.adventures.split('-').map(function (s) {
      return parseInt(s, 10);
    }),
        _item$adventures$spli2 = _slicedToArray(_item$adventures$spli, 2),
        min = _item$adventures$spli2[0],
        max = _item$adventures$spli2[1];

    return (min + max) / 2.0;
  } else {
    return parseInt(item.adventures, 10);
  }
}

function propTrue(prop) {
  if (typeof prop === 'boolean') {
    return prop;
  } else {
    return getPropertyBoolean(prop);
  }
}

function useIfUnused(item, prop, maxPrice) {
  if (!propTrue(prop)) {
    if (Lib.mallPrice(item) <= maxPrice) {
      getCapped(1, item, maxPrice);
      Lib.use(1, item);
    } else {
      Lib.print("Skipping ".concat(item.name, "; too expensive (").concat(Lib.mallPrice(item), " > ").concat(maxPrice, ")."));
    }
  }
}

function totalAmount(item) {
  return Lib.shopAmount(item) + Lib.itemAmount(item);
}

function ensureOde(turns) {
  while (Lib.haveEffect(Effect.get('Ode to Booze')) < turns) {
    if (!Lib.useSkill(Skill.get('The Ode to Booze'))) Lib.abort('Could not get Ode for some reason.');
  }
}

var potentialSpleenItems = Item.get(['transdermal smoke patch', 'voodoo snuff', 'blood-drive sticker']);

var keyF = function keyF(item) {
  return -(adventureGain(item) * MPA - Lib.mallPrice(item)) / item.spleen;
};

potentialSpleenItems.sort(function (x, y) {
  return keyF(x) - keyF(y);
});
var bestSpleenItem = potentialSpleenItems[0];

if (bestSpleenItem.name === 'blood-drive sticker' && totalAmount(Item.get('voodoo snuff')) > 100 && totalAmount(Item.get('blood-drive sticker')) < 6) {
  // Override if we have too many to sell.
  bestSpleenItem = Item.get('voodoo snuff');
}

function fillSomeSpleen() {
  fillSpleenWith(bestSpleenItem);
}

function fillAllSpleen() {
  var _iterator = _createForOfIteratorHelper(potentialSpleenItems),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var spleenItem = _step.value;
      fillSpleenWith(spleenItem);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}

function fillSpleenWith(spleenItem) {
  Lib.print("Spleen item: ".concat(spleenItem));

  if (Lib.mySpleenUse() + spleenItem.spleen <= Lib.spleenLimit()) {
    var count = (Lib.spleenLimit() - Lib.mySpleenUse()) / spleenItem.spleen;
    chewSafe(count, spleenItem);
  }
}

function fillStomach() {
  if (Lib.myLevel() >= 15 && !getPropertyBoolean('_hungerSauceUsed') && Lib.mallPrice(Item.get('Hunger&trade; sauce')) < 3 * MPA) {
    getCapped(1, Item.get('Hunger&trade; sauce'), 3 * MPA);
    Lib.use(1, Item.get('Hunger&trade; sauce'));
  }

  if (!getPropertyBoolean('_milkOfMagnesiumUsed')) {
    Lib.use(1, Item.get('milk of magnesium'));
  } // Save space for marketplace food.


  while (Lib.myFullness() + 5 <= Lib.fullnessLimit()) {
    if (Lib.myMaxhp() < 1000) {
      Lib.maximize('hot res', false);
    }

    var count = Math.min((Lib.fullnessLimit() - Lib.myFullness()) / 5, Lib.mySpleenUse() / 5);
    Lib.restoreHp(Lib.myMaxhp());
    get(count, Item.get('extra-greasy slider'));
    get(count, Item.get("Ol' Scratch's salad fork"));
    getCapped(count, Item.get('special seasoning'), 5000);
    eatSpleen(count, Item.get("Ol' Scratch's salad fork"));
    eatSpleen(count, Item.get('extra-greasy slider'));
    fillSomeSpleen();
  }
}

function fillLiver() {
  if (!getPropertyBoolean('_mimeArmyShotglassUsed') && Lib.itemAmount(Item.get('mime army shotglass')) > 0) {
    Lib.equip(Item.get('tuxedo shirt'));
    Lib.drink(1, itemPriority(Item.get('astral pilsner'), Item.get('splendid martini')));
  }

  while (Lib.myInebriety() + 1 <= Lib.inebrietyLimit() && Lib.itemAmount(Item.get('astral pilsner')) > 0) {
    while (Lib.haveEffect(Effect.get('Ode to Booze')) < 1) {
      Lib.useSkill(Skill.get('The Ode to Booze'));
    }

    Lib.drink(1, Item.get('astral pilsner'));
  }

  while (Lib.myInebriety() + 5 <= Lib.inebrietyLimit()) {
    if (Lib.myMaxhp() < 1000) {
      Lib.maximize('0.05hp, cold res', false);
    }

    var count = Math.min((Lib.inebrietyLimit() - Lib.myInebriety()) / 5, Lib.mySpleenUse() / 5);
    Lib.restoreHp(Lib.myMaxhp());

    while (Lib.haveEffect(Effect.get('Ode to Booze')) < count * 5) {
      Lib.useSkill(Skill.get('The Ode to Booze'));
    }

    get(count, Item.get('jar of fermented pickle juice'));
    get(count, Item.get("Frosty's frosty mug"));
    drinkSpleen(count, Item.get("Frosty's frosty mug"));
    drinkSpleen(count, Item.get('jar of fermented pickle juice'));
    fillSomeSpleen();
  }
}