import {
  getProperty,
  haveEffect,
  cliExecute,
  useFamiliar,
  changeMcd,
  visitUrl,
  handlingChoice,
  runChoice,
  myFamiliar,
  retrieveItem,
  use,
  myPrimestat,
  equip,
  setProperty,
  runCombat,
  maximize,
  itemAmount,
  myLevel,
  myClass,
  availableAmount,
  print,
} from 'kolmafia';
import { $familiar, $effect, $item, $classes, $location, $class, $skill, $slot, $monster, $items } from 'libram/src';
import { adventureMacro, Macro, withMacro } from './combat';
import {
  ensureEffect,
  getPropertyBoolean,
  getPropertyInt,
  setChoice,
  setClan,
  setPropertyInt,
  withFamiliar,
  withStash,
} from './daily-lib';

function levelingMood() {
  if (haveEffect($effect`Video... Games?`) === 0 && !getPropertyBoolean('_defectiveTokenUsed')) {
    withStash($items`defective game grid token`, () => {
      use($item`defective game grid token`);
    });
  }

  if (haveEffect($effect`That's Just Cloud-Talk, Man`) === 0) {
    visitUrl('place.php?whichplace=campaway&action=campaway_sky');
  }

  if (!getPropertyBoolean('_aprilShower')) cliExecute('shower warm');
  ensureEffect($effect`Triple-Sized`);
  if (!getPropertyBoolean('_ballpit')) ensureEffect($effect`Having a Ball!`);
  ensureEffect($effect`Tomato Power`);
  ensureEffect($effect`Gr8ness`);
  if ($classes`Pastamancer,Sauceror`.includes(myClass())) {
    ensureEffect($effect`On The Shoulders Of Giants`);
    ensureEffect($effect`Mystically Oiled`);
    ensureEffect($effect`Uncucumbered`);
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
}

function familiarXpMood() {
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

setClan('Ferengi Commerce Authority');
cliExecute('ccs bean-daily');
cliExecute('mood apathetic');
changeMcd(10);

visitUrl('main.php?action=may4');
if (handlingChoice()) {
  runChoice(4);
}

if (availableAmount($item`pantogram pants`) === 0) {
  retrieveItem(1, $item`ten-leaf clover`);
  cliExecute('pantogram mysticality|hot|max hp|hilarity|weapon dmg|silent');
}

if (myLevel() < 20) levelingMood();

if (getPropertyInt('_godLobsterFights') < 3) {
  withFamiliar($familiar`God Lobster`, () => {
    while (getPropertyInt('_godLobsterFights') < 3) {
      setProperty('choiceAdventure1310', '3');
      visitUrl('main.php?fightgodlobster=1');
      withMacro(Macro.kill(), runCombat);
      visitUrl('choice.php');
      if (handlingChoice()) runChoice(3);
    }
  });
}

if (!getPropertyBoolean('_photocopyUsed')) {
  cliExecute('terminal educate digitize');
  familiarXpMood();
  withFamiliar($familiar`Pocket Professor`, () => {
    if (getPropertyInt('_feastUsed') === 0) {
      print('Time to feast!', 'blue');
      withStash($items`moveable feast`, () => {
        use($item`moveable feast`); // on Professor itself.
        withFamiliar($familiar`Stocking Mimic`, () => use($item`moveable feast`));
        withFamiliar($familiar`Hovering Sombrero`, () => use($item`moveable feast`));
        withFamiliar($familiar`Frumious Bandersnatch`, () => use($item`moveable feast`));
      });
    }

    ensureEffect($effect`Do I Know You From Somewhere?`);
    maximize('familiar weight, equip Pocket Professor memory chip', false);
    if (itemAmount($item`photocopied monster`) === 0) {
      cliExecute('faxbot witchess bishop');
    }
    withMacro(
      Macro.mIf('!hasskill lecture on relativity', Macro.skill($skill`Digitize`))
        .trySkill($skill`Lecture on Relativity`)
        .kill(),
      () => use($item`photocopied monster`)
    );
  });
}

if (getPropertyInt('_neverendingPartyFreeTurns') < 10) {
  setProperty('choiceAdventure1322', '2'); // Reject quest (TODO: Accept food/booze)
  setProperty('choiceAdventure1324', '5'); // Pick a fight
  if (myLevel() < 20) {
    maximize(
      `${myPrimestat()}, 100 ${myPrimestat()} experience percent, equip makeshift garbage shirt, equip Kramco`,
      false
    );
  }
  while (getPropertyInt('_neverendingPartyFreeTurns') < 10) {
    const familiar = getPropertyBoolean('_thesisDelivered')
      ? $familiar`Hovering Sombrero`
      : $familiar`Pocket Professor`;
    withFamiliar(familiar, () => {
      adventureMacro(
        $location`The Neverending Party`,
        Macro.mIf('!monstername "time-spinner prank"', Macro.trySkill($skill`Deliver your thesis!`)).kill()
      );
    });
  }
}

/* function saberTriple(m: Monster) {
  if (lastChoice() === 1387 && availableChoiceOptions().length > 0) {
    runChoice(2);
    setProperty('_saberForceMonster', m);
  }
} */

/* if (
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
} */

if (myClass() === $class`Seal Clubber` && getPropertyInt('_sealFigurineUses') < 10) {
  withFamiliar($familiar`Red-Nosed Snapper`, () => {
    visitUrl('familiar.php?action=guideme');
    visitUrl('choice.php?whichchoice=1396&option=1&cat=horror');
    while (getPropertyInt('_sealFigurineUses') < 10) {
      equip($item`porcelain police baton`);
      retrieveItem(1, $item`figurine of a wretched-looking seal`);
      retrieveItem(1, $item`seal-blubber candle`);
      withMacro(Macro.kill(), () => {
        if (!use(1, $item`figurine of a wretched-looking seal`)) {
          setPropertyInt('_sealFigurineUses', 10);
        }
      });
    }
  });
}

if (getProperty('questL02Larva') !== 'unstarted' && !getPropertyBoolean('_eldritchTentacleFought')) {
  visitUrl('place.php?whichplace=forestvillage&action=fv_scientist', false);
  if (!handlingChoice()) throw 'No choice?';
  withMacro(Macro.kill(), () => runChoice(1));
}

if (!getPropertyBoolean('_chateauMonsterFought')) {
  const chateauText = visitUrl('place.php?whichplace=chateau', false);
  const match = chateauText.match(/alt="Painting of a ([^(]*) .1.""/);
  if (match && Monster.get(match[1]).attributes.includes('FREE')) {
    visitUrl('place.php?whichplace=chateau&action=chateau_painting', false);
    withMacro(Macro.kill(), runCombat);
  }
}

// LOV Tunnel
if (!getPropertyBoolean('_loveTunnelUsed')) {
  const macro = Macro.mIf(
    Macro.monster($monster`LOV Enforcer`),
    Macro.mWhile('!pastround 20', Macro.attack().repeat()).kill()
  )
    .mIf(Macro.monster($monster`LOV Engineer`), Macro.skillRepeat($skill`Saucegeyser`))
    .mIf(Macro.monster($monster`LOV Equivocator`), Macro.pickpocket().kill());
  setChoice(1222, 1); // Entrance
  setChoice(1223, 1); // Fight LOV Enforcer
  setChoice(1224, 2); // LOV Epaulettes
  setChoice(1225, 1); // Fight LOV Engineer
  setChoice(1226, 2); // Open Heart Surgery
  setChoice(1227, 1); // Fight LOV Equivocator
  setChoice(1228, 3); // Take chocolate

  adventureMacro($location`The Tunnel of L.O.V.E.`, macro);
  if (handlingChoice()) throw 'Did not get all the way through LOV.';
  visitUrl('choice.php');
  if (handlingChoice()) throw 'Did not get all the way through LOV.';
}

if (getPropertyInt('_saberForceUses') < 5 || haveEffect($effect`Everything Looks Yellow`) === 0) {
  useFamiliar($familiar`Red-Nosed Snapper`);
  visitUrl('familiar.php?action=guideme&pwd');
  visitUrl('choice.php?pwd&whichchoice=1396&option=1&cat=dude');
  equip($item`Fourth of May Cosplay Saber`);
  equip($slot`acc3`, $item`mafia middle finger ring`);
  equip($slot`acc3`, $item`Lil' Doctor™ bag`);
  setProperty('choiceAdventure1387', '3');
  cliExecute('terminal educate duplicate');
  while (getPropertyInt('_saberForceUses') < 5 || haveEffect($effect`Everything Looks Yellow`) === 0) {
    ensureEffect($effect`Transpondent`);
    adventureMacro(
      $location`Domed City of Grimacia`,
      Macro.mIf('monstername "alielf"', Macro.skill($skill`Snokebomb`))
        .mIf('monstername "dog-alien"', Macro.skill($skill`Reflex Hammer`))
        .mIf('monstername "cat-alien"', Macro.skill($skill`Show them your ring`))
        .mIf(
          'monstername "survivor"',
          Macro.trySkill($skill`Use the Force`)
            .skill($skill`Duplicate`)
            .trySkill($skill`Asdon Martin: Missile Launcher`)
            .skill($skill`Disintegrate`)
        )
        .mIf('monstername "sausage goblin" || monstername "witchess"', Macro.kill())
        .abort()
    );
    runChoice(3);
  }
  cliExecute('terminal educate extract');
  cliExecute('terminal educate digitize');
}

if (
  myFamiliar() !== $familiar`Unspeakachu` &&
  itemAmount($item`Map to Safety Shelter Grimace Prime`) > 0 &&
  haveEffect($effect`Transpondent`) > 0
) {
  while (
    itemAmount($item`distention pill`) <
    itemAmount($item`synthetic dog hair pill`) + itemAmount($item`Map to Safety Shelter Grimace Prime`)
  ) {
    setProperty('choiceAdventure536', '1');
    use(1, $item`Map to Safety Shelter Grimace Prime`);
  }
  while (itemAmount($item`Map to Safety Shelter Grimace Prime`) > 0) {
    setProperty('choiceAdventure536', '2');
    use(1, $item`Map to Safety Shelter Grimace Prime`);
  }
}
