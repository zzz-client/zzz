// deno-lint-ignore-file
import { HttpRequest } from "../../../apps/zzz/modules/requests/mod.ts";
import { FileFormat } from "../formats.ts";

const CURL = {
  parse,
  stringify,
} as FileFormat;
export default CURL;

function parse(curlCommand: string): HttpRequest {
  throw new Error("Not implemented");
}

function stringify(theRequest: HttpRequest): string {
  let curlCommand = `curl -X ${theRequest.Method} ${theRequest.URL}?`;
  Object.keys(theRequest.QueryParams).forEach((key) => {
    const value = theRequest.QueryParams[key];
    curlCommand += `${key}=${value}&`;
  });
  curlCommand = curlCommand.substring(0, curlCommand.length - 1); // Remove either the '?' or the last '&'
  Object.keys(theRequest.Headers).forEach((key) => {
    const value = theRequest.Headers[key];
    curlCommand += ` -H "${key}: ${value}"`;
  });
  return curlCommand;
}
