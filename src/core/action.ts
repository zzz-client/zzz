/*
Module:
  - flags (execute, format, full)
  - Models
  - Fields
  - Modify
  - Render?
*/

import { StringToStringMap } from "./yeet.ts";

type FlagValue = string | boolean | number;
export type FeatureFlags = { [key: string]: FlagValue };

export default class Action {
  feature: FeatureFlags;
  env: StringToStringMap;
  constructor(feature: FeatureFlags, env: StringToStringMap) {
    this.feature = feature;
    this.env = env;
  }
}
