"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.main = main;

var _dailyLib = require("./daily-lib");

function normalLimit() {
  return Lib.inebrietyLimit() - (Lib.myFamiliar().name === 'Stooper' ? 1 : 0);
}

function main(args) {
  if (Lib.myInebriety() < normalLimit() || Lib.myFullness() < Lib.fullnessLimit()) {
    Lib.abort('Make sure organs are full first.');
  }

  var sausagesEaten = (0, _dailyLib.getPropertyInt)('_sausagesEaten');
  var borrowTime = Lib.getProperty('_borrowedTimeUsed') !== 'true' && args.includes('ascend');

  if (sausagesEaten < 23 || borrowTime) {
    var count = Math.max(23 - sausagesEaten, 0);
    Lib.retrieveItem(count, Item.get('magical sausage'));

    for (var i = 0; i < count; i++) {
      while (Lib.reverseNumberology().includes(69) && (0, _dailyLib.getPropertyInt)('_universeCalculated') < (0, _dailyLib.getPropertyInt)('skillLevel144')) {
        if (Lib.myAdventures() === 0) Lib.eat(1, Item.get('magical sausage'));
        Lib.cliExecute('numberology 69');
      }

      if ((0, _dailyLib.getPropertyInt)('_universeCalculated') >= (0, _dailyLib.getPropertyInt)('skillLevel144')) break;
      Lib.eat(1, Item.get('magical sausage'));
    }

    sausagesEaten = (0, _dailyLib.getPropertyInt)('_sausagesEaten');
    count = Math.max(23 - sausagesEaten, 0);
    Lib.eat(count, Item.get('magical sausage'));
    if (borrowTime) Lib.use(1, Item.get('borrowed time'));
    Lib.print('Generated more adventures. Use these first.', 'red');
  } else {
    Lib.useFamiliar(Familiar.get('Stooper'));

    if (Lib.myInebriety() + 1 === Lib.inebrietyLimit()) {
      (0, _dailyLib.ensureOde)(1);
      Lib.equip(Item.get('tuxedo shirt'));
      (0, _dailyLib.drinkSafe)(1, Item.get('splendid martini'));
    }

    if (Lib.myInebriety() === Lib.inebrietyLimit()) {
      (0, _dailyLib.ensureOde)(5);
      (0, _dailyLib.drinkSafe)(1, Item.get("Frosty's frosty mug"));
      (0, _dailyLib.drinkSpleen)(1, Item.get('jar of fermented pickle juice'));
    }

    if (!args.includes('ascend')) {
      Lib.use(5, Item.get('resolution: be more adventurous'));
      Lib.cliExecute('equip burning cape');
      Lib.useFamiliar(Familiar.get('Left-Hand Man'));
      Lib.maximize('adventures', false);
      Lib.cliExecute('/whitelist ferengi');
      Lib.buy(1, Item.get('artificial skylight'));

      if (!Lib.getCampground()['clockwork maid']) {
        Lib.use(1, Item.get('clockwork maid'));
      }

      (0, _dailyLib.fillAllSpleen)();
    }

    Lib.cliExecute('beachcomber free');
    Lib.create(3 - (0, _dailyLib.getPropertyInt)('_clipartSummons'), Item.get('box of Familiar Jacks'));
    Lib.create(3 - (0, _dailyLib.getPropertyInt)('_sourceTerminalExtrudes'), Item.get('hacked gibson'));
  }
}