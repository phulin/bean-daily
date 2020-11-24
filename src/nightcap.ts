import {drinkSafe, drinkSpleen, ensureOde, fillAllSpleen, getPropertyInt} from './daily-lib';

function normalLimit(): number {
  return Lib.inebrietyLimit() - (Lib.myFamiliar() === Familiar.get('Stooper') ? 1 : 0);
}

export function main(args: string) {
  if (args === undefined) args = '';

  if (Lib.myInebriety() < normalLimit() || Lib.myFullness() < Lib.fullnessLimit()) {
    Lib.abort('Make sure organs are full first.');
  }

  let sausagesEaten = getPropertyInt('_sausagesEaten');
  const borrowTime = Lib.getProperty('_borrowedTimeUsed') !== 'true' && args.includes('ascend');
  if (sausagesEaten < 23 || borrowTime) {
    let count = Math.max(23 - sausagesEaten, 0);
    Lib.retrieveItem(count, Item.get('magical sausage'));
    for (let i = 0; i < count; i++) {
      while (
        Lib.reverseNumberology()['69'] !== undefined &&
        getPropertyInt('_universeCalculated') < getPropertyInt('skillLevel144')
      ) {
        Lib.cliExecute('numberology 69');
      }
      if (getPropertyInt('_universeCalculated') >= getPropertyInt('skillLevel144')) break;
      Lib.eat(1, Item.get('magical sausage'));
    }
    sausagesEaten = getPropertyInt('_sausagesEaten');
    count = Math.max(23 - sausagesEaten, 0);
    Lib.eat(count, Item.get('magical sausage'));
    if (borrowTime) Lib.use(1, Item.get('borrowed time'));

    Lib.print('Generated more adventures. Use these first.', 'red');
  } else {
    Lib.useFamiliar(Familiar.get('Stooper'));
    if (Lib.myInebriety() + 1 === Lib.inebrietyLimit()) {
      ensureOde(1);
      Lib.equip(Item.get('tuxedo shirt'));
      drinkSafe(1, Item.get('splendid martini'));
    }

    if (Lib.myInebriety() === Lib.inebrietyLimit()) {
      ensureOde(5);
      drinkSafe(1, Item.get("Frosty's frosty mug"));
      drinkSpleen(1, Item.get('jar of fermented pickle juice'));
    }

    if (Lib.myInebriety() > Lib.inebrietyLimit()) {
      fillAllSpleen();
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
    }

    Lib.cliExecute('beachcomber free');

    Lib.create(3 - getPropertyInt('_clipartSummons'), Item.get('box of Familiar Jacks'));
    Lib.create(3 - getPropertyInt('_sourceTerminalExtrudes'), Item.get('hacked gibson'));
  }
}
