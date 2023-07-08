import {
  Location,
  adv1,
  choiceFollowsFight,
  haveEffect,
  haveFamiliar,
  inMultiFight,
  inebrietyLimit,
  myFamiliar,
  myInebriety,
  runCombat,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $skill,
  $skills,
  Macro as LibramMacro,
  get,
} from "libram";

// multiFight() stolen from Aenimus: https://github.com/Aenimus/aen_cocoabo_farm/blob/master/scripts/aen_combat.ash.
// Thanks! Licensed under MIT license.
function multiFight() {
  while (inMultiFight()) runCombat();
  if (choiceFollowsFight()) visitUrl("choice.php");
}

export class Macro extends LibramMacro {
  stasis() {
    return this.externalIf(myInebriety() > inebrietyLimit(), "attack")
      .externalIf(get("boomboxSong") === "Total Eclipse of Your Meat", Macro.skill("Sing Along"))
      .externalIf(
        myFamiliar() === $familiar`Stocking Mimic`,
        Macro.if_(
          "!hpbelow 500",
          Macro.skill($skill`Curse of Weaksauce`).skill($skill`Micrometeorite`)
        ).toString()
      )
      .skill($skill`Entangling Noodles`)
      .if_("!hpbelow 500", Macro.skill($skill`Extract`))
      .externalIf(
        myFamiliar() === $familiar`Space Jellyfish`,
        Macro.if_("!hpbelow 500", Macro.skill($skill`Extract Jelly`)).toString()
      )
      .externalIf(
        myFamiliar() === $familiar`Stocking Mimic`,
        Macro.while_("!pastround 8", Macro.item($item`seal tooth`))
          .skill($skill`Shell Up`)
          .toString()
      );
  }

  static stasis() {
    return new Macro().stasis();
  }

  kill() {
    return this.externalIf(myInebriety() > inebrietyLimit(), "attack")
      .externalIf(get("boomBoxSong") === "Total Eclipse of Your Meat", Macro.skill("Sing Along"))
      .while_('!hpbelow 200 && !match "some of it is even intact"', Macro.skill($skill`Candyblast`))
      .skill($skill`Stuffed Mortar Shell`)
      .skill($skill`Saucestorm`)
      .skill($skill`Saucegeyser`)
      .attack();
  }

  static kill() {
    return new Macro().kill();
  }

  static freeRun() {
    return new Macro()
      .skill($skill`Extract`)
      .skill($skill`Extract Jelly`)
      .externalIf(
        (haveFamiliar($familiar`Frumious Bandersnatch`) && haveEffect($effect`Ode to Booze`) > 0) ||
          haveFamiliar($familiar`Pair of Stomping Boots`),
        "runaway"
      )
      .skill(
        ...$skills`Asdon Martin: Spring-Loaded Front Bumper, Reflex Hammer, KGB tranquilizer dart, Throw Latte on Opponent, Snokebomb`
      )
      .item(...$items`Louder Than Bomb, tattered scrap of paper, GOTO, green smoke bomb`)
      .abort();
  }
}

export function main() {
  let response = Macro.load().submit();
  while (response.includes("action=fight.php")) response = Macro.load().submit();
  multiFight();
}

export function withMacro<T>(macro: Macro, action: () => T) {
  macro.save();
  try {
    return action();
  } finally {
    Macro.clearSaved();
  }
}

export function adventureMacro(loc: Location, macro: Macro) {
  withMacro(macro, () => adv1(loc, -1, ""));
}

export function adventureMacroAuto(loc: Location, macro: Macro) {
  macro.setAutoAttack();
  adventureMacro(loc, Macro.abort());
}

export function adventureKill(loc: Location) {
  adventureMacro(loc, Macro.kill());
}
