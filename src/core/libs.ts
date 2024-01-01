enum Runtime {
  Node,
  Deno,
}
// if (getRuntime() == Runtime.Node)
// export const exit = process.exit;
// import * as Minimist from 'minimist';
// export const _argv = Minimist(process.argv.slice(2));
// import { basename as _basename, dirname as _dirname, extname as _extname } from 'path';
// import { existsSync as _existsSync } from 'fs';
// import { readFileSync, writeFileSync, readDirSync as _readDirSync } from 'fs';
// const _readTextFileSync = (p: string): string => readFileSync(p, 'utf8');
// const _writeTextFileSync = (p: string, d: any): void => writeFileSync(p, d, 'utf8');
// import { parse as yamlParse, stringify as yamlStringify } from 'yaml';
// import { xmlStringify } from 'jstoxml';
// import { parse as xmlParse } from 'xml-parse';
// const _base64 = (s: string): string => Buffer.from(s).toString('base64');
// const _encodeUrl = encodeURIComponent;
// import _Server from "./server.node.ts";
// import * as _httpRequest from "axios";

// if (getRuntime() == Runtime.Deno)
export const exit = Deno.exit;
import { parseArgs } from "https://deno.land/std/cli/parse_args.ts";
const _argv = parseArgs(Deno.args);
import { basename as _basename, dirname as _dirname, extname as _extname } from "https://deno.land/std/path/posix/mod.ts";
import { existsSync as _existsSync } from "https://deno.land/std/fs/mod.ts";
const _readDirSync = Deno.readDirSync;
const _readTextFileSync = Deno.readTextFileSync;
const _writeTextFileSync = Deno.writeTextFileSync;
import { parse as yamlParse, stringify as yamlStringify } from "https://deno.land/std/yaml/mod.ts";
import { parse as xmlParse } from "https://deno.land/x/xml/mod.ts";
const xmlStringify = (x: any) => exit(1); // TODO: xmlStringify
import { encode64 as _base64 } from "https://deno.land/x/base64to@v0.0.2/mod.ts";
import { encodeUrl as _encodeUrl } from "https://deno.land/x/encodeurl/mod.ts";
import _Server from "./server.deno.ts";
import _httpRequest from "https://deno.land/x/axiod/mod.ts";

export function getRuntime(): Runtime {
  if (typeof Deno !== "undefined") {
    return Runtime.Deno;
  }
  return Runtime.Node;
}
export const argv = _argv;
export const existsSync = _existsSync;
export const readDirSync = _readDirSync;
export const readTextFileSync = _readTextFileSync;
export const writeTextFileSync = _writeTextFileSync;
export const dirname = _dirname;
export const extname = _extname;
export const basename = _basename;
export const encodeUrl = _encodeUrl;
export const base64 = _base64;
export const Server = _Server;
export const httpRequest = _httpRequest;

// Runtime independent
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
