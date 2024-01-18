import { IAuthorizer } from "../../core/app.ts";
import { HttpRequest } from "../requests/module.ts";

export class QueryAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, data: Query): void {
    theRequest.QueryParams[data.Name] = data.Value;
  }
}
export type Query = {
  Name: string;
  Value: string;
};
