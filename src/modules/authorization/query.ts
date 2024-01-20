import { HttpRequest } from "../requests/mod.ts";
import { AuthType, IAuthorizer } from "./mod.ts";

export class QueryAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, data: Query): void {
    theRequest.QueryParams[data.Name] = data.Value;
  }
}
export type Query = AuthType & {
  Name: string;
  Value: string;
};
