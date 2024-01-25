import { Trace } from "../../../../lib/lib.ts";
import { HttpRequest } from "../requests/mod.ts";
import { AuthContents, IAuthorizer } from "./mod.ts";

export default class HeaderAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, data: Header): void {
    Trace("Header:", data);
    theRequest.Headers[data.Name] = data.Value;
  }
}
export type Header = AuthContents & {
  Name: string;
  Value: string;
};
