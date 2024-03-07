// deno-lint-ignore-file no-explicit-any
import { extname, xmlParse, YAML } from "../../deps.ts";
import BRU from "./formats/bru.ts";
const xmlStringify = (_x: any) => Deno.exit(1);

const PrettyJSON = {
  parse: JSON.parse,
  stringify: (s: any) => JSON.stringify(s, null, 2),
} as FileFormat;

const XML = {
  parse: xmlParse,
  stringify: xmlStringify,
} as FileFormat;

const TEXT = {
  parse: (input: string) => input + "",
  stringify: (input: any) => input + "",
} as FileFormat;

type FileFormat = {
  parse: (input: string) => any;
  stringify: (input: any) => string;
};
export type { FileFormat };

// TODO: search deno land for better
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
    case "bru":
      return "text/plain";
    case "xml":
      return "text/xml";
    default:
      throw new Error('No known content type for extension "' + ext + '"');
  }
}
export function getFileFormat(resourcePath: string): FileFormat {
  let ext = resourcePath.toLowerCase();
  if (resourcePath.includes(".")) {
    ext = extname(resourcePath).substring(1);
  }
  if (resourcePath.startsWith(".") && !ext) {
    ext = resourcePath.slice(1);
  }
  switch (ext) {
    case "json":
      // throw new Error("No known parser for: " + ext);
      return PrettyJSON;
    case "yml":
    case "yaml":
      return YAML;
    case "xml":
      return XML;
    case "txt":
    case "curl":
      return TEXT;
    case "bru":
      return BRU;
    default:
      throw new Error('No known parser for extension "' + ext + '"');
  }
}
