import { IAuthorizer } from "../../core/app.ts";
import { HttpRequest } from "../requests/module.ts";

export default class HeaderAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, data: Header): void {
    theRequest.Headers[data.Name] = data.Value;
  }
}
type Header = {
  Name: string;
  Value: string;
};
