// Type definitions for the KoLmafia JavaScript standard library

declare namespace Lib {
    function print(message: string): void;
    function getProperty(name: string): string;
    function setProperty(name: string, value: string): void;
    function abort(message: string): void;
    function itemAmount(item: Item): number;
    function closetAmount(item: Item): number;
    function shopAmount(item: Item): number;
    function takeCloset(qty: number, item: Item): boolean;
    function takeShop(qty: number, item: Item): boolean;
    function retrieveItem(qty: number, item: Item): boolean;
    function buy(qty: number, item: Item, maxPrice: number): number;
    function mallPrice(item: Item): number;
    function use(qty: number, item: Item): number;
    function eat(qty: number, item: Item): number;
    function drink(qty: number, item: Item): number;
    function chew(qty: number, item: Item): number;
    function mySpleenUse(): number;
    function spleenLimit(): number;
    function myInebriety(): number;
    function inebrietyLimit(): number;
    function myFullness(): number;
    function fullnessLimit(): number;
    function myLevel(): number;
    function myMaxhp(): number;
    function restoreHp(target: number): void;
    function maximize(maximizeString: string, simulate: false): boolean;
    function equip(item: Item): void;
    function toInt(arg: any): number;
    function myClass(): Class;
    function useSkill(qty: number, skill: Skill): void;
    function cliExecute(command: String): void;
}

declare class Item {
    static get(name: string): Item;
    static get(names: string[]): Item[];

    readonly id: number;
    readonly name: string;
    readonly plural: string;
    readonly adventures: string;
    readonly spleen: number;
}

declare class Class {
    static get(name: string): Class;
    static get(names: string[]): Class[];

    readonly id: number;
}

declare class Skill {
    static get(name: string): Skill;
    static get(names: string[]): Skill[];

    readonly id: number;
}