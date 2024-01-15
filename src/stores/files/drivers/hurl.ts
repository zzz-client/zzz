import { Driver, getDriver } from "../drivers.ts";

const HURL = {
  parse,
  stringify,
} as Driver;
export default HURL;

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
  if (input.Name) {
    results.push(`# ${input.Name}`);
  }

  results.push(`${input.Method} ${input.URL}`);

  if (input.Headers) {
    results.push(...parseMap(input.Headers));
  }
  if (input.QueryParams) {
    results.push("[QueryStringParams]");
    results.push(...parseMap(input.QueryParams));
  }
  if (input.Body) {
    if (input.Headers?.content == "application/x-www-form-urlencoded") {
      results.push("[FormParams]");
      results.push(...parseMap(input.Body));
    } else if (input.Headers?.content == "multipart/form-data") {
      results.push("[MultipartFormData]");
      results.push(...parseMap(input.Body));
    } else if (typeof input.Body == "string") {
      results.push(...input.Body.split("\n"));
    } else {
      const driver = getDriver(".json"); // TODO, and XML
      results.push(driver.stringify(input.Body));
    }
  }
  if (input.Authorization) {
    console.log(input.Authorization);
    // TODO: only BasicAuth is natively supported...
  }
  return results.join("\n");
}

function parseMap(keyValue: any): any {
  const result = [];
  for (const key of Object.keys(keyValue)) {
    if (key !== "tag") {
      result.push(key + ": " + keyValue[key]);
    }
  }
  return result;
}
