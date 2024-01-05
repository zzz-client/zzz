import { IAuthorizer } from "../../core/app.ts";
import ZzzRequest from "../../core/models.ts";

export default class QueryAuthorizer implements IAuthorizer {
  authorize(theRequest: ZzzRequest, authorizationConfig: Config): void {
    theRequest.QueryParams[authorizationConfig.Param] = authorizationConfig.Value;
  }
}
interface Config {
  Param: string;
  Value: string;
}
