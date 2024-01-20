/*
Module:
  - flags (execute, format, full)
  - Models
  - Fields
  - Modify
  - Render?
*/

import { StringToStringMap } from "./yeet.ts";

type FeatureFlags = { [key: string]: any };

export default class Action {
  features: FeatureFlags;
  env: StringToStringMap;
  constructor(features: FeatureFlags, env: StringToStringMap) {
    this.features = features;
    this.env = env;
  }
}
