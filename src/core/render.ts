import { parse as yamlParse, stringify as yamlStringify } from "https://deno.land/std/yaml/mod.ts";
import { parse as xmlParse } from "https://deno.land/x/xml/mod.ts";
const xmlStringify = (x: any) => Deno.exit(1); // TODO: xmlStringify

export type Parser = {
  parse: (input: string) => any;
  stringify: (input: any) => string;
};
export const Parsers = {
  YAML: { parse: yamlParse, stringify: yamlStringify },
  YML: { parse: yamlParse, stringify: yamlStringify },
  XML: { parse: xmlParse, stringify: xmlStringify },
  JSON: { parse: JSON.parse, stringify: (s: any) => JSON.stringify(s, null, 2) },
  TEXT: {
    parse: (input: string) => input + "",
    stringify: (input: any) => input + "",
  },
} as { [key: string]: Parser };
