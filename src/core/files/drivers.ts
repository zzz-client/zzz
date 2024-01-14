import * as YAML from "https://deno.land/std/yaml/mod.ts";
import { parse as xmlParse } from "https://deno.land/x/xml/mod.ts";
import { extname } from "https://deno.land/std/path/mod.ts";
import BRU from "./bru.ts";
const xmlStringify = (x: any) => Deno.exit(1);

const PrettyJSON = {
  parse: JSON.parse,
  stringify: (s: any) => JSON.stringify(s, null, 2),
} as Driver;

const Text = {
  parse: (input: string) => input + "",
  stringify: (input: any) => input + "",
} as Driver;

type Driver = {
  parse: (input: string) => any;
  stringify: (input: any) => string;
};
const Drivers = {
  BRU: BRU,
  YAML: YAML,
  YML: YAML,
  XML: { parse: xmlParse, stringify: xmlStringify },
  JSON: PrettyJSON,
  TEXT: Text,
} as { [key: string]: Driver };

function getContentType(resourcePath: string): string {
  const ext = extname(resourcePath).substring(1).toLowerCase();
  switch (ext) {
    case "json":
    case "":
      return "application/json";
    case "yml":
    case "yaml":
    case "txt":
    case "curl":
    case "bru":
      return "text/plain";
    case "xml":
      return "text/xml";
    default:
      throw new Error('No known content type for extension "' + ext + '"');
  }
}
function getDriver(resourcePath: string): Driver {
  let ext = extname(resourcePath).substring(1).toLowerCase();
  if (resourcePath.startsWith(".") && !ext) {
    ext = resourcePath.slice(1);
  }
  switch (ext) {
    case "json":
      // throw new Error("No known parser for: " + ext);
      return Drivers.JSON;
    case "yml":
    case "yaml":
      return Drivers.YAML;
    case "xml":
      return Drivers.XML;
    case "txt":
    case "curl":
      return Drivers.TEXT;
    case "bru":
      return Drivers.BRU;
    default:
      throw new Error('No known parser for extension "' + ext + '"');
  }
}

export { getContentType, getDriver };
export type { Driver };
