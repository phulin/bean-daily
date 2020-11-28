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

var _kolmafia = require("kolmafia");

var _src = require("libram/src");

function _templateObject3() {
  var data = _taggedTemplateLiteral(["voodoo snuff"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = _taggedTemplateLiteral(["voodoo snuff"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteral(["voodoo snuff"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

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
(0, _kolmafia.print)("Using adventure value ".concat(MPA, "."), 'blue');

function clamp(n, min, max) {
  return Math.max(min, Math.min(n, max));
}

function getPropertyInt(name) {
  var str = (0, _kolmafia.getProperty)(name);

  if (str === '') {
    (0, _kolmafia.abort)("Unknown property ".concat(name, "."));
  }

  return parseInt(str, 10);
}

function getPropertyBoolean(name) {
  var str = (0, _kolmafia.getProperty)(name);

  if (str === '') {
    (0, _kolmafia.abort)("Unknown property ".concat(name, "."));
  }

  return str === 'true';
}

function itemPriority() {
  for (var _len = arguments.length, items = new Array(_len), _key = 0; _key < _len; _key++) {
    items[_key] = arguments[_key];
  }

  if (items.length === 1) return items[0];else return (0, _kolmafia.itemAmount)(items[0]) > 0 ? items[0] : itemPriority.apply(void 0, _toConsumableArray(items.slice(1)));
}

function cheaper() {
  for (var _len2 = arguments.length, items = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    items[_key2] = arguments[_key2];
  }

  if (items.length === 1) return items[0];else return (0, _kolmafia.itemAmount)(items[0]) > 0 ? items[0] : itemPriority.apply(void 0, _toConsumableArray(items.slice(1)));
}

var priceCaps = {
  'jar of fermented pickle juice': 75000,
  "Frosty's frosty mug": 45000,
  'extra-greasy slider': 45000,
  "Ol' Scratch's salad fork": 45000,
  'transdermal smoke patch': 7000,
  'voodoo snuff': 36000,
  'blood-drive sticker': 210000,
  'spice melange': 500000,
  'splendid martini': 10000
};

function getCapped(qty, item, maxPrice) {
  if (qty > 15) (0, _kolmafia.abort)('bad get!');
  var remaining = qty - (0, _kolmafia.itemAmount)(item);
  if (remaining <= 0) return;
  var getCloset = Math.min(remaining, (0, _kolmafia.closetAmount)(item));
  if (!(0, _kolmafia.takeCloset)(getCloset, item)) (0, _kolmafia.abort)('failed to remove from closet');
  remaining -= getCloset;
  if (remaining <= 0) return;
  var getMall = Math.min(remaining, (0, _kolmafia.shopAmount)(item));
  if (!(0, _kolmafia.takeShop)(getMall, item)) (0, _kolmafia.abort)('failed to remove from shop');
  remaining -= getMall;
  if (remaining <= 0) return;
  if ((0, _kolmafia.buy)(remaining, item, maxPrice) < remaining) (0, _kolmafia.abort)('Mall price too high for {it.name}.');
}

function get(qty, item) {
  getCapped(qty, item, priceCaps[item.name]);
}

function eatSafe(qty, item) {
  get(1, item);
  if (!(0, _kolmafia.eat)(qty, item)) (0, _kolmafia.abort)('Failed to eat safely');
}

function drinkSafe(qty, item) {
  get(1, item);
  if (!(0, _kolmafia.drink)(qty, item)) (0, _kolmafia.abort)('Failed to drink safely');
}

function chewSafe(qty, item) {
  get(1, item);
  if (!(0, _kolmafia.chew)(qty, item)) (0, _kolmafia.abort)('Failed to chew safely');
}

function eatSpleen(qty, item) {
  if ((0, _kolmafia.mySpleenUse)() < 5) (0, _kolmafia.abort)('No spleen to clear with this.');
  eatSafe(qty, item);
}

function drinkSpleen(qty, item) {
  if ((0, _kolmafia.mySpleenUse)() < 5) (0, _kolmafia.abort)('No spleen to clear with this.');
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
    if ((0, _kolmafia.mallPrice)(item) <= maxPrice) {
      getCapped(1, item, maxPrice);
      (0, _kolmafia.use)(1, item);
    } else {
      (0, _kolmafia.print)("Skipping ".concat(item.name, "; too expensive (").concat((0, _kolmafia.mallPrice)(item), " > ").concat(maxPrice, ")."));
    }
  }
}

function totalAmount(item) {
  return (0, _kolmafia.shopAmount)(item) + (0, _kolmafia.itemAmount)(item);
}

function ensureOde() {
  var turns = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var skill = Skill.get('The Ode to Booze');
  var effect = (0, _kolmafia.toEffect)(skill);

  if ((0, _kolmafia.haveSkill)(skill) && effect !== Effect.get('none') && (0, _kolmafia.haveEffect)(effect) < turns) {
    var casts = Math.ceil((turns - (0, _kolmafia.haveEffect)(effect)) / (0, _kolmafia.turnsPerCast)(skill));
    (0, _kolmafia.useSkill)(clamp(casts, 1, 100), skill);
  }

  if ((0, _kolmafia.haveEffect)(effect) < turns) throw 'Could not get Ode for some reason.';
}

var potentialSpleenItems = Item.get(['transdermal smoke patch', 'voodoo snuff', 'blood-drive sticker']);

var keyF = function keyF(item) {
  return -(adventureGain(item) * MPA - (0, _kolmafia.mallPrice)(item)) / item.spleen;
};

potentialSpleenItems.sort(function (x, y) {
  return keyF(x) - keyF(y);
});
var bestSpleenItem = potentialSpleenItems[0];

var _iterator = _createForOfIteratorHelper(potentialSpleenItems),
    _step;

try {
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    var spleenItem = _step.value;
    (0, _kolmafia.print)("".concat(spleenItem, " value/spleen: ").concat(-keyF(spleenItem)));
  }
} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}

if (bestSpleenItem.name === 'blood-drive sticker' && totalAmount(Item.get('voodoo snuff')) > 50 && totalAmount(Item.get('blood-drive sticker')) < 6) {
  // Override if we have too many to sell.
  bestSpleenItem = Item.get('voodoo snuff');
} else if (keyF(bestSpleenItem) - keyF((0, _src.$item)(_templateObject())) < 300 && totalAmount((0, _src.$item)(_templateObject2())) > 50) {
  bestSpleenItem = (0, _src.$item)(_templateObject3());
}

function fillSomeSpleen() {
  (0, _kolmafia.print)("Spleen item: ".concat(bestSpleenItem));
  fillSpleenWith(bestSpleenItem);
}

function fillAllSpleen() {
  var _iterator2 = _createForOfIteratorHelper(potentialSpleenItems),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var spleenItem = _step2.value;
      (0, _kolmafia.print)("Filling spleen with ".concat(spleenItem, "."));
      fillSpleenWith(spleenItem);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
}

function fillSpleenWith(spleenItem) {
  if ((0, _kolmafia.mySpleenUse)() + spleenItem.spleen <= (0, _kolmafia.spleenLimit)()) {
    var count = ((0, _kolmafia.spleenLimit)() - (0, _kolmafia.mySpleenUse)()) / spleenItem.spleen;
    chewSafe(count, spleenItem);
  }
}

function fillStomach() {
  if ((0, _kolmafia.myLevel)() >= 15 && !getPropertyBoolean('_hungerSauceUsed') && (0, _kolmafia.mallPrice)(Item.get('Hunger&trade; sauce')) < 3 * MPA) {
    getCapped(1, Item.get('Hunger&trade; sauce'), 3 * MPA);
    (0, _kolmafia.use)(1, Item.get('Hunger&trade; sauce'));
  }

  if (!getPropertyBoolean('_milkOfMagnesiumUsed')) {
    (0, _kolmafia.use)(1, Item.get('milk of magnesium'));
  } // Save space for marketplace food.


  while ((0, _kolmafia.myFullness)() + 5 <= (0, _kolmafia.fullnessLimit)()) {
    if ((0, _kolmafia.myMaxhp)() < 1000) {
      (0, _kolmafia.maximize)('hot res', false);
    }

    var count = Math.min(((0, _kolmafia.fullnessLimit)() - (0, _kolmafia.myFullness)()) / 5, (0, _kolmafia.mySpleenUse)() / 5);
    (0, _kolmafia.restoreHp)((0, _kolmafia.myMaxhp)());
    get(count, Item.get('extra-greasy slider'));
    get(count, Item.get("Ol' Scratch's salad fork"));
    getCapped(count, Item.get('special seasoning'), 5000);
    eatSpleen(count, Item.get("Ol' Scratch's salad fork"));
    eatSpleen(count, Item.get('extra-greasy slider'));
    fillSomeSpleen();
  }
}

function fillLiver() {
  if (!getPropertyBoolean('_mimeArmyShotglassUsed') && (0, _kolmafia.itemAmount)(Item.get('mime army shotglass')) > 0) {
    (0, _kolmafia.equip)(Item.get('tuxedo shirt'));
    (0, _kolmafia.drink)(1, itemPriority(Item.get('astral pilsner'), Item.get('splendid martini')));
  }

  while ((0, _kolmafia.myInebriety)() + 1 <= (0, _kolmafia.inebrietyLimit)() && (0, _kolmafia.itemAmount)(Item.get('astral pilsner')) > 0) {
    while ((0, _kolmafia.haveEffect)(Effect.get('Ode to Booze')) < 1) {
      (0, _kolmafia.useSkill)(Skill.get('The Ode to Booze'));
    }

    (0, _kolmafia.drink)(1, Item.get('astral pilsner'));
  }

  while ((0, _kolmafia.myInebriety)() + 5 <= (0, _kolmafia.inebrietyLimit)()) {
    if ((0, _kolmafia.myMaxhp)() < 1000) {
      (0, _kolmafia.maximize)('0.05hp, cold res', false);
    }

    var count = Math.min(((0, _kolmafia.inebrietyLimit)() - (0, _kolmafia.myInebriety)()) / 5, (0, _kolmafia.mySpleenUse)() / 5);
    (0, _kolmafia.restoreHp)((0, _kolmafia.myMaxhp)());

    while ((0, _kolmafia.haveEffect)(Effect.get('Ode to Booze')) < count * 5) {
      (0, _kolmafia.useSkill)(Skill.get('The Ode to Booze'));
    }

    get(count, Item.get('jar of fermented pickle juice'));
    get(count, Item.get("Frosty's frosty mug"));
    drinkSpleen(count, Item.get("Frosty's frosty mug"));
    drinkSpleen(count, Item.get('jar of fermented pickle juice'));
    fillSomeSpleen();
  }
}