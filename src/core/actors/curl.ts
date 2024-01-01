import { IActor } from "../factories.ts";
import ZzzRequest from "../request.ts";

export default class CurlActor implements IActor {
  format(culCommand: any): string {
    return culCommand as string;
  }
  async act(theRequest: ZzzRequest): Promise<string> {
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
}
