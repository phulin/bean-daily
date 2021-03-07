import {
  inebrietyLimit,
  myFamiliar,
  myInebriety,
  myFullness,
  fullnessLimit,
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
  visitUrl,
  runChoice,
  canInteract,
  availableAmount,
  myAdventures,
} from 'kolmafia';
import { $familiar, $item, get } from 'libram';
import {
  cheaper,
  drinkSafe,
  drinkSpleen,
  ensureOde,
  fillAllSpleen,
  getPropertyBoolean,
  getPropertyInt,
  MPA,
  withFamiliar,
} from './daily-lib';

function normalLimit(): number {
  return inebrietyLimit() - (myFamiliar() === $familiar`Stooper` ? 1 : 0);
}

export function main(args = '') {
  if (myInebriety() < normalLimit() || myFullness() < fullnessLimit()) {
    throw 'Make sure organs are full first.';
  }

  if (
    availableAmount($item`Spooky Putty sheet`) + availableAmount($item`Spooky Putty monster`) >
    0
  ) {
    throw 'For some reason you have spooky putty in your inventory. Go fix that.';
  }

  const normalFinished = getProperty('questL13Final') === 'finished';
  const csFinished =
    (getProperty('csServicesPerformed').match(/,/g) || []).length === 10 && canInteract();
  if (args.includes('ascend') && !normalFinished && !csFinished) {
    throw 'We have not finished the main questline yet!';
  }

  print(`Using adventure value ${MPA}.`, 'blue');

  let sausagesEaten = getPropertyInt('_sausagesEaten');
  let done = false;
  const borrowTime = getProperty('_borrowedTimeUsed') !== 'true' && args.includes('ascend');
  if (sausagesEaten < 23 || borrowTime) {
    let count = Math.max(23 - sausagesEaten, 0);
    retrieveItem(count, $item`magical sausage`);
    for (let i = 0; i < count; i++) {
      while (
        reverseNumberology()[69] !== undefined &&
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

    if (myAdventures() >= 10) {
      print('Generated more adventures. Use these first.', 'red');
      done = true;
    }
  }

  if (!done) {
    useFamiliar($familiar`Stooper`);
    if (myInebriety() + 1 === inebrietyLimit()) {
      ensureOde(1);
      equip($item`tuxedo shirt`);
      drinkSafe(1, cheaper($item`splendid martini`, $item`Eye and a Twist`));
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
    cliExecute('briefcase drink');

    visitUrl('place.php?whichplace=chateau&action=chateau_desk2');

    if (!getPropertyBoolean('_cargoPocketEmptied')) {
      for (const pocket of [653, 533, 590, 517, 587]) {
        if (!getProperty('cargoPocketsEmptied').split(',').includes(pocket.toString())) {
          cliExecute(`cargo pick ${pocket}`);
          break;
        }
      }
    }

    if (!get('_timeSpinnerReplicatorUsed')) cliExecute('farfuture mall');

    create(3 - getPropertyInt('_clipartSummons'), $item`box of Familiar Jacks`);
    create(3 - getPropertyInt('_sourceTerminalExtrudes'), $item`hacked gibson`);

    if (!getPropertyBoolean('_internetPrintScreenButtonBought'))
      create(1, $item`print screen button`);

    if (get('_deckCardsDrawn') <= 10) cliExecute('play Island');
    if (get('_deckCardsDrawn') <= 10) cliExecute('play Ancestral Recall');
    if (get('_deckCardsDrawn') <= 10) cliExecute('play 1952');

    if (!getPropertyBoolean('_seaJellyHarvested')) {
      visitUrl('place.php?whichplace=sea_oldman&action=oldman_oldman');
      withFamiliar($familiar`Space Jellyfish`, () => {
        visitUrl('place.php?whichplace=thesea&action=thesea_left2');
        runChoice(1);
      });
    }
  }
}
