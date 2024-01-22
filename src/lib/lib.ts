import { FeatureFlags } from "../apps/mod.ts";

export interface StringToStringMap {
  [key: string]: string;
}
export class Action {
  features: FeatureFlags;
  env: StringToStringMap;
  constructor(features: FeatureFlags, env: StringToStringMap) {
    this.features = features;
    this.env = env;
  }
}
export function Meld(destination: any, source: any): void {
  if (!source) {
    return;
  }
  for (const key of Object.keys(source)) {
    if (key !== "Type" && key !== "Id") {
      if (destination[key] !== undefined && typeof destination[key] === "object") {
        Meld(destination[key], source[key]);
      } else {
        destination[key] = source[key];
      }
    }
  }
}
export function Log(...args: any[]): void {
  console.log.apply(null, args);
}
