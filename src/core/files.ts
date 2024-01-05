import { parse as yamlParse, stringify as yamlStringify } from "https://deno.land/std/yaml/mod.ts";
import { parse as xmlParse } from "https://deno.land/x/xml/mod.ts";
import { extname } from "https://deno.land/std/path/mod.ts";
const xmlStringify = (x: any) => Deno.exit(1);

export function getContentType(resourcePath: string): string {
  const ext = extname(resourcePath).substring(1).toLowerCase();
  switch (ext) {
    case "json":
    case "":
      return "application/json";
    case "yml":
    case "yaml":
    case "txt":
    case "curl":
      return "text/plain";
    case "xml":
      return "text/xml";
    default:
      throw new Error('No known content type for extension "' + ext + '"');
  }
}
export function getParser(resourcePath: string): Parser {
  const ext = extname(resourcePath).substring(1).toLowerCase();
  switch (ext) {
    case "json":
    default:
      // throw new Error("No known parser for: " + ext);
      return Parsers.JSON;
    case "yml":
    case "yaml":
      return Parsers.YAML;
    case "xml":
      return Parsers.XML;
    case "txt":
    case "curl":
      return Parsers.TEXT;
  }
}

export type Parser = {
  parse: (input: string) => any;
  stringify: (input: any) => string;
};
const Parsers = {
  YAML: { parse: yamlParse, stringify: yamlStringify },
  YML: { parse: yamlParse, stringify: yamlStringify },
  XML: { parse: xmlParse, stringify: xmlStringify },
  JSON: { parse: JSON.parse, stringify: (s: any) => JSON.stringify(s, null, 2) },
  TEXT: {
    parse: (input: string) => input + "",
    stringify: (input: any) => input + "",
  },
} as { [key: string]: Parser };
