import type { Location } from "kolmafia";

declare module "canadv.ash" {
  export function canAdv(loc: Location, x?: boolean): boolean;
}
