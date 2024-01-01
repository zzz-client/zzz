import { IAuthorization } from "../factories.ts";
import ZzzRequest from "../request.ts";

export default class QueryAuthorizer implements IAuthorization {
  apply(theRequest: ZzzRequest, authorizationConfig: Config): void {
    theRequest.QueryParams[authorizationConfig.Param] = authorizationConfig.Value;
  }
}
interface Config {
  Param: string;
  Value: string;
}
