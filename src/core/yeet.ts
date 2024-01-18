import { ModuleFields } from "../modules/module.ts";

export class Model {
  Id: string;
  Name: string;
  constructor(id: string, name: string) {
    this.Id = id;
    this.Name = name;
  }
}

export interface StringToStringMap {
  [key: string]: string;
}

// ModelTypes.push(HttpRequest);

export default function Meld(destination: any, source: any): void {
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
