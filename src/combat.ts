import {
  inMultiFight,
  choiceFollowsFight,
  print,
  visitUrl,
  availableAmount,
  setProperty,
  getProperty,
  getLocationMonsters,
  myLocation,
  toMonster,
  myMp,
  haveSkill,
  useSkill,
  myFamiliar,
  haveEffect,
  handlingChoice,
  lastChoice,
  runChoice,
  adv1,
  availableChoiceOptions,
  runCombat,
  urlEncode,
  xpath,
  getAutoAttack,
  haveFamiliar,
  myInebriety,
  inebrietyLimit,
} from 'kolmafia';
import { $effect, $familiar, $item, $items, $skill, $skills } from 'libram/src';
import { getPropertyInt } from './daily-lib';

// multiFight() stolen from Aenimus: https://github.com/Aenimus/aen_cocoabo_farm/blob/master/scripts/aen_combat.ash.
// Thanks! Licensed under MIT license.
function multiFight() {
  while (inMultiFight()) runCombat();
  if (choiceFollowsFight()) visitUrl('choice.php');
}

const MACRO_NAME = 'Bean Scripts Macro';
export function getMacroId() {
  const macroMatches = xpath(
    visitUrl('account_combatmacros.php'),
    `//select[@name="macroid"]/option[text()="${MACRO_NAME}"]/@value`
  );
  if (macroMatches.length === 0) {
    visitUrl('account_combatmacros.php?action=new');
    const newMacroText = visitUrl(`account_combatmacros.php?macroid=0&name=${MACRO_NAME}&macrotext=abort&action=save`);
    return parseInt(xpath(newMacroText, '//input[@name=macroid]/@value')[0], 10);
  } else {
    return parseInt(macroMatches[0], 10);
  }
}

export class Macro {
  static cachedMacroId: number | null = null;
  static cachedAutoAttack: string | null = null;

  components: string[] = [];

  toString() {
    return this.components.join(';');
  }

  step(...nextSteps: string[]) {
    this.components = [...this.components, ...nextSteps.filter(s => s.length > 0)];
    return this;
  }

  static step(...nextSteps: string[]) {
    return new Macro().step(...nextSteps);
  }

  submit() {
    const final = this.toString();
    print(`Submitting macro: ${final}`);
    return visitUrl(`fight.php?action=macro&macrotext=${urlEncode(final)}`, true, true);
  }

  setAutoAttack() {
    if (Macro.cachedMacroId === null) Macro.cachedMacroId = getMacroId();
    if (getAutoAttack() === 99000000 + Macro.cachedMacroId && this.toString() === Macro.cachedAutoAttack) {
      // This macro is already set. Don't make the server request.
      return;
    }

    print(`Setting autoattack to: ${this.toString()}`);
    visitUrl(
      `account_combatmacros.php?macroid=${Macro.cachedMacroId}&name=${urlEncode(MACRO_NAME)}&macrotext=${urlEncode(
        this.toString()
      )}&action=save`,
      true,
      true
    );
    visitUrl(`account.php?am=1&action=autoattack&value=${99000000 + Macro.cachedMacroId}&ajax=1`);
    print(`New autoattack is ${getAutoAttack()}`);
    Macro.cachedAutoAttack = this.toString();
  }

  abort() {
    return this.step('abort');
  }

  static abort() {
    return new Macro().abort();
  }

  static hpbelow(threshold: number) {
    return `hpbelow ${threshold}`;
  }

  static monster(foe: Monster) {
    return `monstername "${foe}"`;
  }

  static and(left: string, right: string) {
    return `(${left}) && (${right})`;
  }

  static not(condition: string) {
    return `!${condition}`;
  }

  mIf(condition: string, ifTrue: Macro) {
    return this.step(`if ${condition}`)
      .step(...ifTrue.components)
      .step('endif');
  }

  static mIf(condition: string, ifTrue: Macro) {
    return new Macro().mIf(condition, ifTrue);
  }

  mWhile(condition: string, contents: Macro) {
    return this.step(`while ${condition}`)
      .step(...contents.components)
      .step('endwhile');
  }

  static mWhile(condition: string, contents: Macro) {
    return new Macro().mWhile(condition, contents);
  }

  externalIf(condition: boolean, ...next: string[]) {
    return condition ? this.step(...next) : this;
  }

  static externalIf(condition: boolean, ...next: string[]) {
    return new Macro().externalIf(condition, ...next);
  }

  repeat() {
    return this.step('repeat');
  }

  repeatSubmit() {
    return this.step('repeat').submit();
  }

  skill(sk: Skill) {
    const name = sk.name.replace('%fn, ', '');
    return this.step(`skill ${name}`); // this.mIf(`hasskill ${name}`, Macro.step(`skill ${name}`));
  }

  static skill(sk: Skill) {
    return new Macro().skill(sk);
  }

  trySkill(sk: Skill) {
    const name = sk.name.replace('%fn, ', '');
    return this.mIf(`hasskill ${name}`, Macro.skill(sk));
  }

  static trySkill(sk: Skill) {
    return new Macro().trySkill(sk);
  }

  skills(skills: Skill[]) {
    for (const skill of skills) {
      this.skill(skill);
    }
    return this;
  }

  static skills(skills: Skill[]) {
    return new Macro().skills(skills);
  }

  skillRepeat(sk: Skill) {
    const name = sk.name.replace('%fn, ', '');
    return this.mIf(`hasskill ${name}`, Macro.step(`skill ${name}`, 'repeat'));
  }

  static skillRepeat(sk: Skill) {
    return new Macro().skillRepeat(sk);
  }

  item(it: Item) {
    if (availableAmount(it) > 0) {
      return this.step(`use ${it.name}`);
    } else return this;
  }

  static item(it: Item) {
    return new Macro().item(it);
  }

  items(items: Item[]) {
    for (const item of items) {
      this.item(item);
    }
    return this;
  }

  static items(items: Item[]) {
    return new Macro().items(items);
  }

  attack() {
    return this.step('attack');
  }

  static attack() {
    return new Macro().attack();
  }

  pickpocket() {
    return this.step('pickpocket');
  }

  static pickpocket() {
    return new Macro().pickpocket();
  }

  stasis() {
    return this.externalIf(myInebriety() > inebrietyLimit(), 'attack')
      .externalIf(
        myFamiliar() === $familiar`Stocking Mimic`,
        Macro.mIf('!hpbelow 500', Macro.skill($skill`Curse of Weaksauce`).skill($skill`Micrometeorite`)).toString()
      )
      .skill($skill`Entangling Noodles`)
      .mIf('!hpbelow 500', Macro.skill($skill`Extract`))
      .externalIf(
        myFamiliar() === $familiar`Space Jellyfish`,
        Macro.mIf('!hpbelow 500', Macro.skill($skill`Extract Jelly`)).toString()
      )
      .externalIf(
        myFamiliar() === $familiar`Stocking Mimic`,
        Macro.mWhile('!pastround 8', Macro.item($item`seal tooth`))
          .skill($skill`Shell Up`)
          .toString()
      );
  }

  static stasis() {
    return new Macro().stasis();
  }

  kill() {
    return this.externalIf(myInebriety() > inebrietyLimit(), 'attack')
      .skill($skill`Candyblast`)
      .skill($skill`Candyblast`)
      .skill($skill`Candyblast`)
      .skill($skill`Candyblast`)
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
        (haveFamiliar($familiar`Frumious Bandersnatch`) && haveEffect($effect`The Ode to Booze`) > 0) ||
          haveFamiliar($familiar`Pair of Stomping Boots`),
        'runaway'
      )
      .skills(
        $skills`Spring-Loaded Front Bumper, Reflex Hammer, KGB tranquilizer dart, Throw Latte on Opponent, Snokebomb`
      )
      .items($items`Louder Than Bomb, tattered scrap of paper, GOTO, green smoke bomb`)
      .abort();
  }
}

export const MODE_NULL = '';
export const MODE_MACRO = 'macro';
export const MODE_FIND_MONSTER_THEN = 'findthen';
export const MODE_RUN_UNLESS_FREE = 'rununlessfree';

export function setMode(mode: string, arg1: string | null = null, arg2: string | null = null) {
  setProperty('bdaily_combatMode', mode);
  if (arg1 !== null) setProperty('bdaily_combatArg1', arg1);
  if (arg2 !== null) setProperty('bdaily_combatArg2', arg2);
}

export function getMode() {
  return getProperty('bdaily_combatMode');
}

export function getArg1() {
  return getProperty('bdaily_combatArg1');
}

export function getArg2() {
  return getProperty('bdaily_combatArg2');
}

function banishedMonsters() {
  const banishedstring = getProperty('banishedMonsters');
  const banishedComponents = banishedstring.split(':');
  const result: { [index: string]: Monster } = {};
  if (banishedComponents.length < 3) return result;
  for (let idx = 0; idx < banishedComponents.length / 3 - 1; idx++) {
    const foe = Monster.get(banishedComponents[idx * 3]);
    const banisher = banishedComponents[idx * 3 + 1];
    print(`Banished ${foe.name} using ${banisher}`);
    result[banisher] = foe;
  }
  return result;
}

function usedBanisherInZone(banished: { [index: string]: Monster }, banisher: string, loc: Location) {
  print(`Checking to see if we've used ${banisher} in ${loc}.`);
  if (banished[banisher] === undefined) return false;
  print(`Used it to banish ${banished[banisher].name}`);
  return getLocationMonsters(loc)[banished[banisher].name] === undefined;
}

export function main(initround: number, foe: Monster) {
  const mode = getMode();
  const loc = myLocation();
  if (mode === MODE_MACRO) {
    Macro.step(getArg1()).repeatSubmit();
  } else if (mode === MODE_FIND_MONSTER_THEN) {
    const monsterId = parseInt(getArg1(), 10);
    const desired = toMonster(monsterId);
    const banished = banishedMonsters();
    if (foe === desired) {
      setProperty('bdaily_combatFound', 'true');
      new Macro().step(getArg2()).repeatSubmit();
    } else if (
      myMp() >= 50 &&
      haveSkill(Skill.get('Snokebomb')) &&
      getPropertyInt('_snokebombUsed') < 3 &&
      !usedBanisherInZone(banished, 'snokebomb', loc)
    ) {
      useSkill(1, Skill.get('Snokebomb'));
    } else if (
      haveSkill(Skill.get('Reflex Hammer')) &&
      getPropertyInt('ReflexHammerUsed') < 3 &&
      !usedBanisherInZone(banished, 'Reflex Hammer', loc)
    ) {
      useSkill(1, Skill.get('Reflex Hammer'));
    } else if (haveSkill(Skill.get('Macrometeorite')) && getPropertyInt('_macrometeoriteUses') < 10) {
      useSkill(1, Skill.get('Macrometeorite'));
    } else if (
      haveSkill(Skill.get('CHEAT CODE: Replace Enemy')) &&
      getPropertyInt('_powerfulGloveBatteryPowerUsed') <= 80
    ) {
      const originalBattery = getPropertyInt('_powerfulGloveBatteryPowerUsed');
      useSkill(1, Skill.get('CHEAT CODE: Replace Enemy'));
      const newBattery = getPropertyInt('_powerfulGloveBatteryPowerUsed');
      if (newBattery === originalBattery) {
        print('WARNING: Mafia is not updating PG battery charge.');
        setProperty('_powerfulGloveBatteryPowerUsed', `${newBattery + 10}`);
      }
      // Hopefully at this point it comes back to the consult script.
    }
  } else {
    throw 'Unrecognized mode.';
  }

  multiFight();
}

export function saberYr() {
  if (!handlingChoice()) throw 'No saber choice?';
  if (lastChoice() === 1387 && Object.keys(availableChoiceOptions()).length > 0) {
    runChoice(3);
  }
}

export function withMode<T>(action: () => T, mode: string, arg1: string | null = null, arg2: string | null = null) {
  setMode(mode, arg1, arg2);
  try {
    return action();
  } finally {
    setMode(MODE_NULL, '', '');
  }
}

export function withMacro<T>(macro: Macro, action: () => T) {
  return withMode(action, MODE_MACRO, macro.toString());
}

export function adventureMode(loc: Location, mode: string, arg1: string | null = null, arg2: string | null = null) {
  return withMode(() => adv1(loc, -1, ''), mode, arg1, arg2);
}

export function adventureMacro(loc: Location, macro: Macro) {
  adventureMode(loc, MODE_MACRO, macro.toString());
}

export function adventureMacroAuto(loc: Location, macro: Macro) {
  macro.setAutoAttack();
  adventureMode(loc, MODE_MACRO, Macro.abort().toString());
}

export function adventureKill(loc: Location) {
  adventureMacro(loc, Macro.kill());
}

function findMonsterThen(loc: Location, foe: Monster, macro: Macro) {
  setMode(MODE_FIND_MONSTER_THEN, foe.id.toString(), macro.toString());
  setProperty('bdaily_combatFound', 'false');
  try {
    while (getProperty('bdaily_combatFound') !== 'true') {
      adv1(loc, -1, '');
    }
  } finally {
    setMode(MODE_NULL, '');
  }
}

export function findMonsterSaberYr(loc: Location, foe: Monster) {
  setProperty('choiceAdventure1387', '3');
  findMonsterThen(loc, foe, Macro.skill(Skill.get('Use the Force')));
}

export function adventureCopy(loc: Location, foe: Monster) {
  adventureMacro(
    loc,
    Macro.mIf(`!monstername "${foe.name}"`, new Macro().step('abort')).skill(Skill.get('Lecture on Relativity')).kill()
  );
}
