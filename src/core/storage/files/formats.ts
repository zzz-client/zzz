// deno-lint-ignore-file no-explicit-any
import { extname, xmlParse, YAML } from "../../deps.ts";
import { StringToStringMap } from "../../etc.ts";
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

const contentTypesByExt = {
  json: "application/json",
  yml: "text/yaml",
  yaml: "text/yaml",
  txt: "text/plain",
  curl: "text/plain",
  bru: "text/plain",
} as StringToStringMap;

export const formatsByExtension = {
  json: PrettyJSON,
  xml: XML,
  yml: YAML,
  yaml: YAML,
  txt: TEXT,
  bru: BRU,
} as { [key: string]: FileFormat };

// TODO: search deno land for better
export function getContentType(resourcePath: string): string {
  const ext = extname(resourcePath).substring(1).toLowerCase();
  const contentType = contentTypesByExt[ext];
  if (!contentType) {
    throw new Error('No known content type for extension "' + ext + '"');
  }
  return contentType;
}
export function getFileFormat(resourcePath: string): FileFormat {
  let ext = resourcePath.toLowerCase();
  if (resourcePath.includes(".")) {
    ext = extname(resourcePath).substring(1);
  }
  if (resourcePath.startsWith(".") && !ext) {
    ext = resourcePath.slice(1);
  }
  const formatter = formatsByExtension[ext];
  if (!formatter) {
    throw new Error('No known parser for extension "' + ext + '"');
  }
  return formatter;
}
