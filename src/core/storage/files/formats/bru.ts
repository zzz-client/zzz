// deno-lint-ignore-file
import { FileFormat } from "../formats.ts";

// import { bruToJson, jsonToBru } from "npm:@bruno/lang";
// const BRU = {
//   parse: bruToJson,
//   stringify: jsonToBru,
// } as FileFormat;
const BRU = {
  parse,
  stringify,
} as FileFormat;

export default BRU;

function parse(input: string): any {
  let result = {};
  const lines = input.split("\n");
  let index = 0;
  while (index < lines.length) {
    const [block, newIndex] = readBlock(lines, index);
    result = { ...result, ...parseBlock(block) };
    index = newIndex;
  }
  return result;
}
function stringify(input: any): string {
  const results = [] as string[];
  results.push("meta {");
  results.push(`  name: ${input.Name}`);
  results.push(`  type: http`);
  // TODO: Sequence
  results.push("}");
  if (input.Method) {
    results.push(
      `${input.Method.toLowerCase()} {`,
      `  url: ${input.URL}`,
      `}`,
    );
  }
  if (input.Headers) {
    results.push("headers {");
    for (const header in input.Headers) {
      results.push(`  ${header}: ${input.Headers[header]}`);
    }
    results.push("}");
  }
  if (input.QueryParams) {
    results.push("query {");
    for (const param in input.QueryParams) {
      results.push(`  ${param}: ${input.QueryParams[param]}`);
    }
    results.push("}");
  }
  if (input.Body) {
    results.push("body {");
    // TODO: body, body:text, body:xml, body:form-urlencoded, body:multipart-form
    results.push("}");
  }
  // TODO: script:post-response & script:pre-request (javascript), tests
  return results.join("\n");
}

function readBlock(lines: string[], index: number): [any, number] {
  while (!lines[index].endsWith("{") || lines[index].trim() === "") {
    index++;
  }
  const tag = lines[index].substring(0, lines[index].length - 2);
  index++; // Skip the opening brace
  const block = { tag: tag } as any;
  while (!lines[index].startsWith("}")) {
    const [key, value] = lines[index].split(": ");
    block[key.trim()] = value;
    index++;
  }
  index++; // Skip the closing brace
  return [block, index];
}
function parseBlock(block: any): any {
  const parseMethod = blockParsers.get(block);
  if (!parseMethod) {
    throw new Error(`Unsupported Bru tag: '${block.tag}'`);
  }
  return parseMethod(block);
}
function parseMetaBlock(block: any): any {
  return {
    Name: block.name,
  };
}
function parseMethodBlock(block: any): any {
  return {
    Method: block.tag.toUpperCase(),
    URL: block.url,
  };
}
function parseMap(block: any): any {
  const body = {} as any;
  for (const key in block) {
    if (key !== "tag") {
      body[key] = block[key];
    }
  }
  const result = {} as any;
  result[block.tag == "query" ? "QueryParams" : block.tag.toUpperCase()] = body;
  return result;
}
const blockParsers = {
  meta: parseMetaBlock,
  get: parseMethodBlock,
  post: parseMethodBlock,
  put: parseMethodBlock,
  patch: parseMethodBlock,
  delete: parseMethodBlock,
  options: parseMethodBlock,
  query: parseMap,
  headers: parseMap,
  body: parseBody,
};
function parseBody(block: any): any {
  // TODO
  return parseMap(block);
}
