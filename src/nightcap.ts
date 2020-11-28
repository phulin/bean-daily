import {
  inebrietyLimit,
  myFamiliar,
  myInebriety,
  myFullness,
  fullnessLimit,
  abort,
  getProperty,
  retrieveItem,
  reverseNumberology,
  cliExecute,
  eat,
  use,
  print,
  useFamiliar,
  equip,
  maximize,
  buy,
  getCampground,
  create,
} from 'kolmafia';
import {$familiar, $item} from 'libram/src';
import {drinkSafe, drinkSpleen, ensureOde, fillAllSpleen, getPropertyInt} from './daily-lib';

function normalLimit(): number {
  return inebrietyLimit() - (myFamiliar() === $familiar`Stooper` ? 1 : 0);
}

export function main(args = '') {
  if (myInebriety() < normalLimit() || myFullness() < fullnessLimit()) {
    abort('Make sure organs are full first.');
  }

  let sausagesEaten = getPropertyInt('_sausagesEaten');
  const borrowTime = getProperty('_borrowedTimeUsed') !== 'true' && args.includes('ascend');
  if (sausagesEaten < 23 || borrowTime) {
    let count = Math.max(23 - sausagesEaten, 0);
    retrieveItem(count, $item`magical sausage`);
    for (let i = 0; i < count; i++) {
      while (
        reverseNumberology()['69'] !== undefined &&
        getPropertyInt('_universeCalculated') < getPropertyInt('skillLevel144')
      ) {
        cliExecute('numberology 69');
      }
      if (getPropertyInt('_universeCalculated') >= getPropertyInt('skillLevel144')) break;
      eat(1, $item`magical sausage`);
    }
    sausagesEaten = getPropertyInt('_sausagesEaten');
    count = Math.max(23 - sausagesEaten, 0);
    eat(count, $item`magical sausage`);
    if (borrowTime) use(1, $item`borrowed time`);

    print('Generated more adventures. Use these first.', 'red');
  } else {
    useFamiliar($familiar`Stooper`);
    if (myInebriety() + 1 === inebrietyLimit()) {
      ensureOde(1);
      equip($item`tuxedo shirt`);
      drinkSafe(1, $item`splendid martini`);
    }

    if (myInebriety() === inebrietyLimit()) {
      ensureOde(5);
      drinkSafe(1, $item`Frosty's frosty mug`);
      drinkSpleen(1, $item`jar of fermented pickle juice`);
    }

    if (myInebriety() > inebrietyLimit()) {
      fillAllSpleen();
    }

    if (!args.includes('ascend')) {
      use(5, $item`resolution: be more adventurous`);
      equip($item`burning cape`);
      useFamiliar($familiar`Left-Hand Man`);
      maximize('adventures', false);
      cliExecute('/whitelist ferengi');

      buy(1, $item`artificial skylight`);

      if (!getCampground()['clockwork maid']) {
        use(1, $item`clockwork maid`);
      }
    }

    cliExecute('beachcomber free');

    create(3 - getPropertyInt('_clipartSummons'), $item`box of Familiar Jacks`);
    create(3 - getPropertyInt('_sourceTerminalExtrudes'), $item`hacked gibson`);
  }
}
