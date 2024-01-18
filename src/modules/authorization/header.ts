import { HttpRequest } from "../requests/module.ts";
import { AuthType, IAuthorizer } from "./module.ts";

export default class HeaderAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, data: Header): void {
    theRequest.Headers[data.Name] = data.Value;
  }
}
export type Header = AuthType & {
  Name: string;
  Value: string;
};
