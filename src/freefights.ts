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
  restoreHp,
  myMaxhp,
  useSkill,
  myThrall,
  myBuffedstat,
  myMp,
  eat,
  outfit,
} from "kolmafia";
import {
  $familiar,
  $effect,
  $item,
  $classes,
  $location,
  $class,
  $skill,
  $monster,
  $items,
  $thrall,
  $stat,
  $effects,
  get,
  have,
  Witchess,
  Mood,
} from "libram";
import { adventureMacro, Macro, withMacro } from "./combat";
import {
  ensureEffect,
  ensureMpSausage,
  setChoice,
  setClan,
  setPropertyInt,
  withFamiliar,
  withStash,
} from "./daily-lib";

function levelingMood() {
  const mood = new Mood();

  mood.effect($effect`Video... Games?`, () => {
    if (get("_defectiveTokenUsed")) return;
    withStash($items`defective game grid token`, () => {
      use($item`defective game grid token`);
    });
  });

  mood.effect($effect`That's Just Cloud-Talk, Man`, () =>
    visitUrl("place.php?whichplace=campaway&action=campaway_sky")
  );

  mood.effect($effect`Having a Ball!`, () => {
    if (!get("_ballpit")) ensureEffect($effect`Having a Ball!`);
  });
  mood.effect($effect`Triple-Sized`);
  mood.effect($effect`Tomato Power`);
  mood.effect($effect`Gr8ness`);
  if ($classes`Pastamancer,Sauceror`.includes(myClass())) {
    mood.effect($effect`Thaumodynamic`, () => {
      if (!get("_aprilShower")) cliExecute("shower warm");
    });
    mood.effect($effect`On The Shoulders Of Giants`);
    mood.effect($effect`Mystically Oiled`);
    mood.effect($effect`Uncucumbered`);
    mood.effect($effect`We're All Made Of Starfish`);
    mood.effect($effect`Glittering Eyelashes`);
    mood.effect($effect`Baconstoned`);
    mood.effect($effect`Inscrutable Gaze`);
    mood.effect($effect`Blessing of your favorite Bird`);
  }
  mood.effect($effect`Starry-Eyed`);
  mood.effect($effect`Merry Smithsness`);
  mood.effect($effect`Song of Bravado`);
  mood.effect($effect`Trivia Master`);
  mood.effect($effect`Favored by Lyle`);

  return mood;
}

function familiarXpMood() {
  const mood = new Mood();

  if ($familiar`Pocket Professor`.experience >= 400 || get("_thesisDelivered")) {
    return mood;
  }

  mood.effect($effect`Three Days Slow`, () => {
    if (!get("_madTeaParty")) {
      retrieveItem(1, $item`oil cap`);
      cliExecute("hatter oil cap");
    }
  });

  mood.effect($effect`Heart of White`);
  if (getProperty("questL06Friar") === "finished" && !get("friarsBlessingReceived")) {
    mood.effect($effect`Brother Corsican's Blessing`, () => cliExecute("friars familiar"));
  }

  return mood;
}

function thesisMood() {
  if (myClass() === $class`Pastamancer`) {
    if (myThrall() !== $thrall`Elbow Macaroni`) useSkill(1, $skill`Bind Undead Elbow Macaroni`);
  } else if (myPrimestat() === $stat`Mysticality`) {
    ensureEffect($effect`Expert Oiliness`);
  } else if (myPrimestat() === $stat`Moxie`) {
    ensureEffect($effect`Slippery Oiliness`);
  }

  for (const increaser of $effects`On The Shoulders of Giants, Phorcefullness, Trivia Master`) {
    if (myBuffedstat($stat`Muscle`) > 1740) break;
    ensureEffect(increaser);
  }
}

setClan("Ferengi Commerce Authority");
cliExecute("ccs bean-daily");
cliExecute("mood apathetic");
changeMcd(10);

if (myMp() < 400) eat(1, $item`magical sausage`);

visitUrl("main.php?action=may4");
if (handlingChoice()) {
  runChoice(4);
}

if (availableAmount($item`pantogram pants`) === 0) {
  retrieveItem(1, $item`ten-leaf clover`);
  cliExecute("pantogram mysticality|hot|max hp|hilarity|weapon dmg|silent");
}

if (myLevel() < 20) levelingMood();
familiarXpMood().execute();
if (haveEffect($effect`Blue Swayed`) < 50) {
  use((59 - haveEffect($effect`Blue Swayed`)) / 10, $item`pulled blue taffy`);
}

if (get("_godLobsterFights") < 3) {
  withFamiliar($familiar`God Lobster`, () => {
    while (get("_godLobsterFights") < 3) {
      setProperty("choiceAdventure1310", "3");
      visitUrl("main.php?fightgodlobster=1");
      withMacro(Macro.kill(), runCombat);
      visitUrl("choice.php");
      if (handlingChoice()) runChoice(3);
    }
  });
}

// LOV Tunnel
if (!get("_loveTunnelUsed")) {
  useFamiliar($familiar`Pocket Professor`);
  const macro = Macro.if_(
    "monstername LOV Enforcer",
    Macro.while_("!pastround 20", Macro.attack().repeat())
  )
    .if_("monstername LOV Engineer", Macro.skill("Saucegeyser").repeat())
    .if_("monstername LOV Equivocator", Macro.kill());
  setChoice(1222, 1); // Entrance
  setChoice(1223, 1); // Fight LOV Enforcer
  setChoice(1224, 2); // LOV Epaulettes
  setChoice(1225, 1); // Fight LOV Engineer
  setChoice(1226, 2); // Open Heart Surgery
  setChoice(1227, 1); // Fight LOV Equivocator
  setChoice(1228, 3); // Take chocolate

  adventureMacro($location`The Tunnel of L.O.V.E.`, macro);
  if (handlingChoice()) throw "Did not get all the way through LOV.";
  visitUrl("choice.php");
  if (handlingChoice()) throw "Did not get all the way through LOV.";
}

if (Witchess.fightsDone() === 0) {
  cliExecute("terminal educate digitize");
  useFamiliar($familiar`Pocket Professor`);
  familiarXpMood().execute();
  if (haveEffect($effect`Blue Swayed`) < 50) {
    use((59 - haveEffect($effect`Blue Swayed`)) / 10, $item`pulled blue taffy`);
  }

  thesisMood(); // might as well turn it on now
  if (get("_feastUsed") === 0) {
    print("Time to feast!", "blue");
    withStash($items`moveable feast`, () => {
      use($item`moveable feast`); // on Professor itself.
      withFamiliar($familiar`Stocking Mimic`, () => use($item`moveable feast`));
      withFamiliar($familiar`Hovering Sombrero`, () => use($item`moveable feast`));
      withFamiliar($familiar`Frumious Bandersnatch`, () => use($item`moveable feast`));
      withFamiliar($familiar`Robortender`, () => use($item`moveable feast`));
    });
  }

  ensureEffect($effect`Do I Know You From Somewhere?`);
  ensureEffect($effect`Billiards Belligerence`);
  maximize("familiar weight, equip Pocket Professor memory chip", false);
  ensureMpSausage(400);
  restoreHp(myMaxhp());
  withMacro(
    Macro // .if_('!hasskill lecture on relativity', Macro.step('twiddle')) // Macro.skill('Digitize'))
      // .trySkill('Lecture on Relativity')
      .kill(),
    () => Witchess.fightPiece($monster`Witchess Bishop`)
  );
}

if (get("_neverendingPartyFreeTurns") < 10) {
  setProperty("choiceAdventure1322", "2"); // Reject quest (TODO: Accept food/booze)
  setProperty("choiceAdventure1324", "5"); // Pick a fight
  const familiar = get("_thesisDelivered")
    ? $familiar`Hovering Sombrero`
    : $familiar`Pocket Professor`;
  useFamiliar(familiar);
  while (get("_neverendingPartyFreeTurns") < 10) {
    if (!get("_thesisDelivered") && $familiar`Pocket Professor`.experience > 400) {
      maximize("muscle, equip makeshift garbage shirt, equip Kramco", false);
      thesisMood();
    } else {
      maximize(
        `${myPrimestat()}, 100 ${myPrimestat()} experience percent, equip makeshift garbage shirt, equip Kramco`,
        false
      );
      levelingMood();
    }
    adventureMacro(
      $location`The Neverending Party`,
      Macro.if_('!monstername "time-spinner prank"', Macro.trySkill("Deliver your thesis!")).kill()
    );
    if (get("_thesisDelivered")) useFamiliar($familiar`Hovering Sombrero`);
  }
}

if (Witchess.fightsDone() < 5 && !have($item`very pointy crown`)) {
  cliExecute("checkpoint");
  equip($item`Fourth of May Cosplay Saber`);
  const useDeleveler = myBuffedstat(myPrimestat()) <= 1.2 * myBuffedstat($stat`muscle`);
  if (useDeleveler) retrieveItem(1, $item`jam band bootleg`);
  withMacro(
    Macro.externalIf(useDeleveler, Macro.item($item`jam band bootleg`).toString())
      .attack()
      .repeat(),
    () => Witchess.fightPiece($monster`Witchess Queen`)
  );
  outfit("checkpoint");
}

while (Witchess.fightsDone() < 5) {
  withMacro(Macro.kill(), () => Witchess.fightPiece($monster`Witchess Bishop`));
}

/* function saberTriple(m: Monster) {
  if (lastChoice() === 1387 && availableChoiceOptions().length > 0) {
    runChoice(2);
    setProperty('_saberForceMonster', m);
  }
} */

/* if (
  canAdv($location`The Hidden Bowling Alley`, false) &&
  get('_drunkPygmyBanishes') < 11 &&
  containsText(visitUrl('museum.php?action=icehouse'), 'pygmy orderlies')
) {
  putCloset(itemAmount($item`Bowl of Scorpions`), $item`Bowl of Scorpions`);
  putCloset(itemAmount($item`bowling ball`), $item`bowling ball`);
  retrieveItem(1, $item`Louder than Bomb`);
  while (get('_drunkPygmyBanishes') < 10) {
    retrieveItem(1, $item`Bowl of Scorpions`);
    if (itemAmount($item`bowling ball`) > 0) throw 'bowling ball';
    goAdventure($location`The Hidden Bowling Alley`);
  }
  if (get('_drunkPygmyBanishes') === 10) {
    goAdventure($location`The Hidden Bowling Alley`);
    saberTriple($monster`drunk pygmy`);
    while (get('_saberForceUses') < 5) {
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

if (myClass() === $class`Seal Clubber` && get("_sealsSummoned") < 10) {
  withFamiliar($familiar`Red-Nosed Snapper`, () => {
    visitUrl("familiar.php?action=guideme");
    visitUrl("choice.php?whichchoice=1396&option=1&cat=horror");
    while (get("_sealsSummoned") < 10) {
      equip($item`porcelain police baton`);
      retrieveItem(1, $item`figurine of a wretched-looking seal`);
      retrieveItem(1, $item`seal-blubber candle`);
      withMacro(Macro.kill(), () => {
        if (!use(1, $item`figurine of a wretched-looking seal`)) {
          setPropertyInt("_sealsSummoned", 10);
        }
      });
    }
  });
}

if (getProperty("questL02Larva") !== "unstarted" && !get("_eldritchTentacleFought")) {
  visitUrl("place.php?whichplace=forestvillage&action=fv_scientist", false);
  if (!handlingChoice()) throw "No choice?";
  withMacro(Macro.kill(), () => runChoice(1));
}

if (!get("_chateauMonsterFought")) {
  const chateauText = visitUrl("place.php?whichplace=chateau", false);
  const match = chateauText.match(/alt="Painting of a ([^(]*) .1.""/);
  if (match && Monster.get(match[1]).attributes.includes("FREE")) {
    visitUrl("place.php?whichplace=chateau&action=chateau_painting", false);
    withMacro(Macro.kill(), runCombat);
  }
}

/* if (
  get('_saberForceUses') < 5 ||
  (haveEffect($effect`Everything Looks Yellow`) === 0 && get('_sourceTerminalDuplicateUses') === 0)
) {
  useFamiliar($familiar`Red-Nosed Snapper`);
  visitUrl('familiar.php?action=guideme&pwd');
  visitUrl('choice.php?pwd&whichchoice=1396&option=1&cat=dude');
  setProperty('choiceAdventure1387', '3');
  cliExecute('terminal educate duplicate');
  maximize(
    "equip Fourth of May Cosplay Saber, equip mafia middle finger ring, equip Lil' Doctor™ bag",
    false
  );
  while (
    get('_saberForceUses') < 5 ||
    (!have($effect`Everything Looks Yellow`) && get('_sourceTerminalDuplicateUses') === 0)
  ) {
    ensureEffect($effect`Transpondent`);
    adventureMacro(
      $location`Domed City of Grimacia`,
      Macro.if_('monstername "alielf"', Macro.skill('Snokebomb'))
        .if_('monstername "dog-alien"', Macro.skill('Reflex Hammer'))
        .if_('monstername "cat-alien"', Macro.skill('Show them your ring'))
        .if_(
          'monstername "survivor"',
          Macro.trySkill('Use the Force')
            .externalIf(get<number>('_feelNostalgicUsed') < 2, Macro.skill('Feel Nostalgic'))
            .skill('Duplicate')
            .trySkill('Feel Nostalgic')
            .trySkill('Asdon Martin: Missile Launcher')
            .skill('Disintegrate')
        )
        .if_('monstername "sausage goblin" || monstername "witchess"', Macro.kill())
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
    itemAmount($item`synthetic dog hair pill`) +
      itemAmount($item`Map to Safety Shelter Grimace Prime`)
  ) {
    setProperty('choiceAdventure536', '1');
    use(1, $item`Map to Safety Shelter Grimace Prime`);
  }
  while (itemAmount($item`Map to Safety Shelter Grimace Prime`) > 0) {
    setProperty('choiceAdventure536', '2');
    use(1, $item`Map to Safety Shelter Grimace Prime`);
  }
} */
