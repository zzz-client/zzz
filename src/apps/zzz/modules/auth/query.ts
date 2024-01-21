import { HttpRequest } from "../requests/mod.ts";
import { AuthContents, IAuthorizer } from "./mod.ts";

export class QueryAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, data: Query): void {
    theRequest.QueryParams[data.Name] = data.Value;
  }
}
export type Query = AuthContents & {
  Name: string;
  Value: string;
};
