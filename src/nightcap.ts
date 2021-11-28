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
  mySpleenUse,
  spleenLimit,
  haveEffect,
  sweetSynthesis,
  myAscensions,
  toInt,
  mallPrice,
  outfit,
  getChateau,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $slot,
  get,
  have,
  maximizeCached,
} from "libram";
import { adventureMacro, Macro } from "./combat";
import {
  drinkSafe,
  drinkSpleen,
  ensureEffect,
  ensureOde,
  fillAllSpleen,
  getCapped,
  getPropertyBoolean,
  getPropertyInt,
  MPA,
  setChoice,
  withFamiliar,
} from "./daily-lib";

const frostyMug = $item`Frosty's frosty mug`;

function normalLimit(): number {
  return inebrietyLimit() - (myFamiliar() === $familiar`Stooper` ? 1 : 0);
}

export function main(args = "") {
  if (myInebriety() < normalLimit() || myFullness() < fullnessLimit()) {
    throw "Make sure organs are full first.";
  }

  if (
    availableAmount($item`Spooky Putty sheet`) + availableAmount($item`Spooky Putty monster`) >
    0
  ) {
    throw "For some reason you have spooky putty in your inventory. Go fix that.";
  }

  const normalFinished = getProperty("questL13Final") === "finished";
  const csFinished =
    (getProperty("csServicesPerformed").match(/,/g) || []).length === 10 && canInteract();
  if (args.includes("ascend") && !normalFinished && !csFinished) {
    throw "We have not finished the main questline yet!";
  }

  print(`Using adventure value ${MPA}.`, "blue");

  let sausagesEaten = getPropertyInt("_sausagesEaten");
  let done = false;
  const borrowTime = !get("_borrowedTimeUsed") && args.includes("ascend");
  if (sausagesEaten < 23 || borrowTime) {
    let count = Math.max(23 - sausagesEaten, 0);
    retrieveItem(count, $item`magical sausage`);
    for (let i = 0; i < count; i++) {
      while (
        myAdventures() > 0 &&
        reverseNumberology()[69] !== undefined &&
        getPropertyInt("_universeCalculated") < getPropertyInt("skillLevel144")
      ) {
        cliExecute("numberology 69");
      }
      if (getPropertyInt("_universeCalculated") >= getPropertyInt("skillLevel144")) break;
      eat(1, $item`magical sausage`);
    }
    sausagesEaten = getPropertyInt("_sausagesEaten");
    count = Math.max(23 - sausagesEaten, 0);
    eat(count, $item`magical sausage`);
    if (borrowTime) use(1, $item`borrowed time`);

    if (myAdventures() >= 10) {
      print("Generated more adventures. Use these first.", "red");
      done = true;
    }
  }

  if (myAdventures() > 0 || !get("_borrowedTimeUsed")) {
    if (
      (get("gingerbreadCityAvailable") || get("_gingerbreadCityToday")) &&
      get("_gingerbreadCityTurns") < 15 &&
      get("gingerAdvanceClockUnlocked") &&
      get("_banderRunaways") < 11 + get("_gingerbreadCityTurns")
    ) {
      if (myAdventures() === 0) use($item`borrowed time`);
      ensureOde(5);
      maximizeCached(["familiar weight"], {
        forceEquip: [
          ...(availableAmount($item`sprinkles`) < 5
            ? $items`gingerbread moneybag, gingerbread mask, gingerbread pistol`
            : []),
          ...(myInebriety() > inebrietyLimit() ? $items`Drunkula's wineglass` : []),
        ],
      });
      useFamiliar($familiar`Frumious Bandersnatch`);

      setChoice(1215, 1); // Advance clock.
      setChoice(1204, 1); // Train Station noon: candy
      setChoice(1206, 5); // Industrial noon: Stick 'em up!
      setChoice(1203, 4); // Civic Center midnight: cigarettes.
      if (!get("_gingerbreadClockVisited")) {
        adventureMacro($location`Gingerbread Civic Center`, Macro.abort());
      }

      while (get("_gingerbreadCityTurns") < 5) {
        const zone =
          availableAmount($item`sprinkles`) >= 5
            ? $location`Gingerbread Train Station`
            : $location`Gingerbread Industrial Zone`;
        if (zone === $location`Gingerbread Industrial Zone` && get("_gingerbreadCityTurns") === 5) {
          maximizeCached(["familiar weight"], {
            forceEquip: myInebriety() > inebrietyLimit() ? $items`Drunkula's wineglass` : [],
          });
        }
        adventureMacro(zone, Macro.step("runaway"));
      }

      maximizeCached(["familiar weight"], {
        forceEquip: myInebriety() > inebrietyLimit() ? $items`Drunkula's wineglass` : [],
      });
      while (get("_gingerbreadCityTurns") < 15) {
        adventureMacro($location`Gingerbread Civic Center`, Macro.step("runaway"));
      }
    }

    if ($familiar`Pocket Professor`.experience >= 400 && !get("_thesisDelivered")) {
      if (!have($effect`Triple-Sized`) && get("_powerfulGloveBatteryPowerUsed") <= 95) {
        cliExecute("checkpoint");
        equip($slot`acc1`, $item`Powerful Glove`);
        ensureEffect($effect`Triple-Sized`);
        outfit("checkpoint");
      }
      cliExecute("gain 1800 muscle");
      useFamiliar($familiar`Pocket Professor`);
      adventureMacro($location`The Neverending Party`, Macro.skill("Deliver your Thesis"));
    }

    while (
      (get("_macrometeoriteUses") < 10 || get("_powerfulGloveBatteryPowerUsed") <= 90) &&
      get("_stenchAirportToday") &&
      myAdventures() > 0
    ) {
      useFamiliar($familiar`Space Jellyfish`);
      maximizeCached([], {
        forceEquip: $items`Powerful Glove`,
      });
      adventureMacro(
        $location`Barf Mountain`,
        Macro.trySkill("Extract Jelly")
          .if_("hasskill Macrometeorite", Macro.skill("Macrometeorite"))
          .trySkill("Extract Jelly")
          .if_("hasskill CHEAT CODE: Replace Enemy", Macro.skill("CHEAT CODE: Replace Enemy"))
          .trySkill("Extract Jelly")
          .if_(
            "(!hasskill CHEAT CODE: Replace Enemy && !hasskill Macrometeorite) || pastround 25",
            Macro.trySkill("Feel Hatred").skill("Snokebomb")
          )
      );
    }

    if (
      $location`The Deep Machine Tunnels`.turnsSpent % 50 === 5 &&
      get("lastDMTDuplication") !== myAscensions() &&
      myAdventures() > 0
    ) {
      getCapped(1, $item`warbear gyro`, 200000);
      setChoice(1119, 4);
      setChoice(1125, `1&iid=${toInt($item`warbear gyro`)}`);
      useFamiliar($familiar`Machine Elf`);
      adventureMacro($location`The Deep Machine Tunnels`, Macro.abort());
    }
  }

  if (!done) {
    useFamiliar($familiar`Stooper`);
    if (myInebriety() + 1 === inebrietyLimit()) {
      ensureOde(1);
      equip($item`tuxedo shirt`);
      drinkSafe(1, $item`splendid martini`);
    }

    if (myInebriety() === inebrietyLimit()) {
      ensureOde(5);
      if (mallPrice(frostyMug) < 12 * MPA) {
        getCapped(1, frostyMug, 12 * MPA);
        drinkSafe(Math.min(1, availableAmount(frostyMug)), frostyMug);
      }
      drinkSafe(1, $item`vintage smart drink`);
    }

    if (args.includes("ascend")) {
      while (mySpleenUse() < spleenLimit() && haveEffect($effect`Synthesis: Greed`) < 75) {
        sweetSynthesis($effect`Synthesis: Greed`);
      }

      if (availableAmount($item`Map to Safety Shelter Grimace Prime`) > 0) {
        while (
          availableAmount($item`distention pill`) <
          availableAmount($item`synthetic dog hair pill`) +
            availableAmount($item`Map to Safety Shelter Grimace Prime`)
        ) {
          setChoice(536, 1);
          ensureEffect($effect`Transpondent`);
          use(1, $item`Map to Safety Shelter Grimace Prime`);
        }
        while (availableAmount($item`Map to Safety Shelter Grimace Prime`) > 0) {
          setChoice(536, 2);
          ensureEffect($effect`Transpondent`);
          use(1, $item`Map to Safety Shelter Grimace Prime`);
        }
      }
    }

    if (myInebriety() > inebrietyLimit()) {
      fillAllSpleen();
    }

    if (!args.includes("ascend")) {
      if (mallPrice($item`resolution: be more adventurous`) < 2 * MPA) {
        use(5, $item`resolution: be more adventurous`);
      }
      if (mallPrice($item`burning newspaper`) < MPA) {
        equip($item`burning cape`);
      }
      useFamiliar($familiar`Left-Hand Man`);
      maximize("adventures, equip Spacegate military insignia", false);
      cliExecute("/whitelist ferengi");

      if (!getChateau()["artificial skylight"]) {
        buy(1, $item`artificial skylight`);
      }

      if (!getCampground()["clockwork maid"]) {
        use(1, $item`clockwork maid`);
      }
    }

    cliExecute("beachcomber free");
    // cliExecute('briefcase drink');

    visitUrl("place.php?whichplace=chateau&action=chateau_desk2");

    if (!getPropertyBoolean("_cargoPocketEmptied")) {
      for (const pocket of [653, 533, 590, 517, 587]) {
        if (!getProperty("cargoPocketsEmptied").split(",").includes(pocket.toString())) {
          cliExecute(`cargo pick ${pocket}`);
          break;
        }
      }
    }

    if (!get("_timeSpinnerReplicatorUsed")) cliExecute("farfuture mall");

    create(3 - getPropertyInt("_clipartSummons"), $item`box of Familiar Jacks`);
    if (availableAmount($item`Source essence`) >= 30) {
      create(3 - getPropertyInt("_sourceTerminalExtrudes"), $item`hacked gibson`);
    }

    if (!getPropertyBoolean("_internetPrintScreenButtonBought")) {
      create(1, $item`print screen button`);
    }

    if (get("_deckCardsDrawn") <= 10) cliExecute("play Island");
    if (get("_deckCardsDrawn") <= 10) cliExecute("play Ancestral Recall");
    if (get("_deckCardsDrawn") <= 10) cliExecute("play 1952");

    if (!getPropertyBoolean("_seaJellyHarvested")) {
      visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman");
      withFamiliar($familiar`Space Jellyfish`, () => {
        visitUrl("place.php?whichplace=thesea&action=thesea_left2");
        runChoice(1);
      });
    }
  }
}
