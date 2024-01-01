import { IAuthorization } from "../factories.ts";
import Request from "../request.ts";

export default class QueryAuthorizer implements IAuthorization {
  apply(theRequest: Request, authorizationConfig: Config): void {
    theRequest.QueryParams[authorizationConfig.Param] = authorizationConfig.Value;
  }
}
interface Config {
  Param: string;
  Value: string;
}
