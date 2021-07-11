import {
  myFullness,
  fullnessLimit,
  use,
  print,
  myInebriety,
  inebrietyLimit,
  itemAmount,
  toInt,
  myClass,
  getProperty,
  mallPrice,
  cliExecute,
  setProperty,
  useSkill,
  mySpleenUse,
  spleenLimit,
  chew,
  visitUrl,
  equip,
  availableAmount,
  adv1,
  myBasestat,
  takeCloset,
  closetAmount,
} from "kolmafia";
import { $class, $item, $location, $skill, $stat } from "libram";
import { Macro, withMacro } from "./combat";
import {
  getPropertyInt,
  getPropertyBoolean,
  getCapped,
  useIfUnused,
  fillLiver,
  fillSomeSpleen,
  fillStomach,
  MPA,
  clamp,
  setChoice,
} from "./daily-lib";

print(`Using adventure value ${MPA}.`, "blue");

if (
  !visitUrl("clan_raidlogs.php").includes("went shopping in the Marketplace") &&
  visitUrl("clan_hobopolis.php").includes("clan_hobopolis.php?place=2") &&
  availableAmount($item`hobo nickel`) >= 20 &&
  !getPropertyBoolean("_claraBellUsed")
) {
  use($item`Clara's bell`);
  equip($item`hobo code binder`);
  takeCloset(closetAmount($item`hobo nickel`), $item`hobo nickel`);
  setChoice(272, 1);
  setChoice(231, 1);
  setChoice(232, 1);
  setChoice(233, 1);
  setChoice(234, 1);
  const statChoice = myBasestat($stat`Muscle`) > myBasestat($stat`Moxie`) ? 3 : 1;
  setChoice(235, statChoice);
  setChoice(236, statChoice);
  setChoice(237, 1);
  setChoice(239, 1);
  cliExecute("mood apathetic");
  withMacro(Macro.kill(), () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const i of [0, 1]) {
      if (!visitUrl("clan_raidlogs.php").includes("went shopping in the Marketplace")) {
        adv1($location`Hobopolis Town Square`, -1, "");
      }
    }
  });
}

fillSomeSpleen();
fillStomach();
fillLiver();

if (!getPropertyBoolean("_distentionPillUsed") && myFullness() <= fullnessLimit()) {
  if (!use(1, $item`distention pill`)) {
    print("WARNING: Out of distention pills.");
  }
}

if (
  !getPropertyBoolean("_syntheticDogHairPillUsed") &&
  1 <= myInebriety() &&
  myInebriety() <= inebrietyLimit()
) {
  if (!use(1, $item`synthetic dog hair pill`)) {
    print("WARNING: Out of synthetic dog hair pills.");
  }
}

if (
  3 <= myFullness() &&
  myFullness() <= fullnessLimit() + 1 &&
  3 <= myInebriety() &&
  myInebriety() <= inebrietyLimit() + 1
) {
  useIfUnused($item`spice melange`, "spiceMelangeUsed", 50 * MPA);
}
if (myFullness() + 4 === fullnessLimit()) {
  useIfUnused($item`cuppa Voraci tea`, "_voraciTeaUsed", 110000);
}
if (myInebriety() + 4 === inebrietyLimit()) {
  useIfUnused($item`cuppa Sobrie tea`, "_sobrieTeaUsed", 110000);
}

fillSomeSpleen();
fillStomach();
fillLiver();

const mojoFilterCount = 3 - getPropertyInt("currentMojoFilters");
getCapped(mojoFilterCount, $item`mojo filter`, 10000);
use(mojoFilterCount, $item`mojo filter`);
fillSomeSpleen();

if (spleenLimit() - mySpleenUse() === 2) chew($item`transdermal smoke patch`);

useIfUnused($item`fancy chocolate car`, getPropertyInt("_chocolatesUsed") === 0, 2 * MPA);

const loveChocolateCount = Math.max(
  3 - Math.floor(20000 / MPA) - getPropertyInt("_loveChocolatesUsed"),
  0
);
const loveChocolateEat = Math.min(
  loveChocolateCount,
  itemAmount($item`LOV Extraterrestrial Chocolate`)
);
use(loveChocolateEat, $item`LOV Extraterrestrial Chocolate`);

const choco = new Map([
  [toInt($class`Seal Clubber`), $item`chocolate seal-clubbing club`],
  [toInt($class`Turtle Tamer`), $item`chocolate turtle totem`],
  [toInt($class`Pastamancer`), $item`chocolate pasta spoon`],
  [toInt($class`Sauceror`), $item`chocolate saucepan`],
  [toInt($class`Accordion Thief`), $item`chocolate stolen accordion`],
  [toInt($class`Disco Bandit`), $item`chocolate disco ball`],
]);
if (choco.has(toInt(myClass())) && getPropertyInt("_chocolatesUsed") < 3) {
  const used = getPropertyInt("_chocolatesUsed");
  const item = choco.get(toInt(myClass())) || $item`none`;
  const count = clamp(3 - used, 0, 3);
  use(count, item);
}

useIfUnused(
  $item`fancy chocolate sculpture`,
  getPropertyInt("_chocolateSculpturesUsed") < 1,
  5 * MPA + 5000
);
useIfUnused($item`essential tofu`, "_essentialTofuUsed", 5 * MPA + 5000);

if (getProperty("_timesArrowUsed") !== "true" && mallPrice($item`time's arrow`) < 5 * MPA + 5000) {
  getCapped(1, $item`time's arrow`, 5 * MPA + 5000);
  cliExecute("csend 1 time's arrow to botticelli");
  setProperty("_timesArrowUsed", "true");
}

if (mallPrice($item`blue mana`) < 3 * MPA) {
  const casts = Math.max(10 - getPropertyInt("_ancestralRecallCasts"), 0);
  getCapped(casts, $item`blue mana`, 3 * MPA);
  useSkill(casts, $skill`Ancestral Recall`);
}

useIfUnused($item`borrowed time`, "_borrowedTimeUsed", 5 * MPA);
