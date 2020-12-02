import { canAdv } from 'canadv.ash';
import {
  getProperty,
  haveEffect,
  cliExecute,
  useFamiliar,
  outfit,
  changeMcd,
  visitUrl,
  handlingChoice,
  runChoice,
  myFamiliar,
  retrieveItem,
  use,
  myPrimestat,
  myBuffedstat,
  equip,
  adv1,
  myHp,
  setProperty,
  runCombat,
  maximize,
  itemAmount,
  myLevel,
  myClass,
  lastChoice,
  availableChoiceOptions,
  containsText,
  putCloset,
} from 'kolmafia';
import { $familiar, $effect, $item, $stat, $classes, $location, $monster, $class } from 'libram/src';
import { getPropertyBoolean, getPropertyInt } from './daily-lib';

function ensureEffect(effect: Effect) {}

useFamiliar($familiar`Pocket Professor`);
cliExecute('/whitelist Ferengi');
cliExecute('ccs FreeFights');
cliExecute('mood freefights');
outfit('Free Fights');
changeMcd(0);

visitUrl('main.php?action=may4');
if (handlingChoice()) {
  runChoice(4);
}

if (!getPropertyBoolean('_aprilShowerUsed')) cliExecute('shower hot');

function checkEffects() {
  if (myFamiliar() === $familiar`Pocket Professor`) {
    if (haveEffect($effect`Three Days Slow`) === 0 && !getPropertyBoolean('_madTeaParty')) {
      retrieveItem(1, $item`oil cap`);
      cliExecute('hatter oil cap');
    }
    if (haveEffect($effect`Blue Swayed`) < 50) {
      use((59 - haveEffect($effect`Blue Swayed`)) / 10, $item`pulled blue taffy`);
    }
    if (haveEffect($effect`Heart of White`) < 9) {
      use(1, $item`white candy heart`);
    }
    if (
      getProperty('questL06Friar') === 'finished' &&
      haveEffect($effect`Brother Corsican's Blessing`) === 0 &&
      !getPropertyBoolean('friarsBlessingReceived')
    ) {
      cliExecute('friars familiar');
    }
  }
}

function goAdventure(loc: Location) {
  checkEffects();
  if (
    myFamiliar() !== $familiar`Unspeakachu` &&
    $familiar`Pocket Professor`.experience >= 400 &&
    !getPropertyBoolean('_thesisDelivered') &&
    (getPropertyInt('_sausageFights') === 0 || getPropertyInt('_neverendingPartyFreeTurns') < 10)
  ) {
    const muscleIncreasers = [
      $effect`Having a Ball!`,
      $effect`Triple-Sized`,
      $effect`Tomato Power`,
      $effect`Trivia Master`,
      $effect`Phorcefullness`,
    ];
    if (myPrimestat() === $stat`mysticality`) {
      muscleIncreasers.push($effect`Expert Oiliness`);
    } else if (myPrimestat() === $stat`moxie`) {
      muscleIncreasers.push($effect`Slippery Oiliness`);
    }
    muscleIncreasers.push($effect`Incredibly Hulking`);
    for (const effect of muscleIncreasers) {
      if (myBuffedstat($stat`muscle`) > 1728) {
        break;
      }
      ensureEffect(effect);
    }

    useFamiliar($familiar`Pocket Professor`);
    equip($item`Pocket Professor memory chip`);
  }
  adv1(loc, -1, '');
  if (myHp() < 50) {
    throw 'We just got beaten up. Aborting.';
  }
}

checkEffects();

if (haveEffect($effect`That's Just Cloud-Talk, Man`) === 0) {
  visitUrl('place.php?whichplace=campaway&action=campaway_sky');
}

while (getPropertyInt('_godLobsterFights') < 3) {
  useFamiliar($familiar`God Lobster`);
  setProperty('choiceAdventure1310', '3');
  visitUrl('main.php?fightgodlobster=1');
  runCombat();
  visitUrl('choice.php');
  if (handlingChoice()) runChoice(3);
  useFamiliar($familiar`Pocket Professor`);
}

if (!getPropertyBoolean('_photocopyUsed')) {
  maximize('familiar weight, equip Pocket Professor memory chip', false);
  if (itemAmount($item`photocopied monster`) === 0) {
    cliExecute('faxbot witchess bishop');
  }
  use(1, $item`photocopied monster`);
  outfit('Free Fights');
}

if (getPropertyInt('_neverendingPartyFreeTurns') < 10) {
  setProperty('choiceAdventure1322', '2');

  setProperty('choiceAdventure1324', '5');
  if (myLevel() < 20) {
    ensureEffect($effect`Triple-Sized`);
    if (!getPropertyBoolean('_ballpit')) ensureEffect($effect`Having a Ball!`);
    ensureEffect($effect`Tomato Power`);
    ensureEffect($effect`Gr8ness`);
    if ($classes`Pastamancer, Sauceror`.includes(myClass())) {
      ensureEffect($effect`On The Shoulders Of Giants`);
      ensureEffect($effect`Mystically Oiled`);
      ensureEffect($effect`Uncucumbered`);
      ensureEffect($effect`Everybody Calls Him Gorgon`);
      ensureEffect($effect`We're All Made Of Starfish`);
      ensureEffect($effect`Glittering Eyelashes`);
      ensureEffect($effect`Baconstoned`);
      ensureEffect($effect`Inscrutable Gaze`);
      ensureEffect($effect`Blessing of your favorite Bird`);
    }
    ensureEffect($effect`Starry-Eyed`);
    ensureEffect($effect`Merry Smithsness`);
    ensureEffect($effect`Song of Bravado`);
    ensureEffect($effect`Trivia Master`);
    ensureEffect($effect`Favored by Lyle`);
    maximize(`${myPrimestat()}, 100 ${myPrimestat()} experience percent, equip makeshift garbage shirt`, false);
  }
  while (getPropertyInt('_neverendingPartyFreeTurns') < 10) {
    goAdventure($location`The Neverending Party`);
  }
}

function saberTriple(m: Monster) {
  if (lastChoice() === 1387 && availableChoiceOptions().length > 0) {
    runChoice(2);
    setProperty('_saberForceMonster', m);
  }
}

if (
  canAdv($location`The Hidden Bowling Alley`, false) &&
  getPropertyInt('_drunkPygmyBanishes') < 11 &&
  containsText(visitUrl('museum.php?action=icehouse'), 'pygmy orderlies')
) {
  putCloset(itemAmount($item`Bowl of Scorpions`), $item`Bowl of Scorpions`);
  putCloset(itemAmount($item`bowling ball`), $item`bowling ball`);
  retrieveItem(1, $item`Louder than Bomb`);
  while (getPropertyInt('_drunkPygmyBanishes') < 10) {
    retrieveItem(1, $item`Bowl of Scorpions`);
    if (itemAmount($item`bowling ball`) > 0) throw 'bowling ball';
    goAdventure($location`The Hidden Bowling Alley`);
  }
  if (getPropertyInt('_drunkPygmyBanishes') === 10) {
    goAdventure($location`The Hidden Bowling Alley`);
    saberTriple($monster`drunk pygmy`);
    while (getPropertyInt('_saberForceUses') < 5) {
      retrieveItem(2, $item`Bowl of Scorpions`);
      goAdventure($location`The Hidden Bowling Alley`);
      goAdventure($location`The Hidden Bowling Alley`);
      goAdventure($location`The Hidden Bowling Alley`);
      saberTriple($monster`drunk pygmy`);
    }
    retrieveItem(3, $item`Bowl of Scorpions`);
    goAdventure($location`The Hidden Bowling Alley`);
    goAdventure($location`The Hidden Bowling Alley`);
    goAdventure($location`The Hidden Bowling Alley`);
  }
}

if (myClass() === $class`Seal Clubber`) {
  while (getPropertyInt('_sealFigurineUses') < 10) {
    if (myFamiliar() !== $familiar`Red-Nosed Snapper`) {
      useFamiliar($familiar`Red-Nosed Snapper`);
      visitUrl('familiar.php?action=guideme');
      visitUrl('choice.php?whichchoice=1396&option=1&cat=horror');
    }
    equip($item`porcelain police baton`);
    retrieveItem(1, $item`figurine of a wretched-looking seal`);
    retrieveItem(1, $item`seal-blubber candle`);
    if (!use(1, $item`figurine of a wretched-looking seal`)) break;
    outfit('Free Fights');
  }
}

if (canAdv($location`The Spooky Forest`, false) && !getPropertyBoolean('_eldritchTentacleFought')) {
  visitUrl('place.php?whichplace=forestvillage&action=fv_scientist', false);
  if (!handlingChoice()) throw 'No choice?';
  runChoice(1);
}

if (!getPropertyBoolean('_chateauMonsterFought')) {
  const chateauText = visitUrl('place.php?whichplace=chateau', false);
  const match = chateauText.match(/alt="Painting of a ([^(]*) .1.""/);
  if (match && Monster.get(match[1]).attributes.includes('FREE')) {
    visitUrl('place.php?whichplace=chateau&action=chateau_painting', false);
    runCombat();
  }
}
