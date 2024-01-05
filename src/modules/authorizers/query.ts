import { IAuthorizer } from "../../core/app.ts";
import Entity from "../../core/models.ts";

export default class QueryAuthorizer implements IAuthorizer {
  authorize(theRequest: Entity, authorizationConfig: Config): void {
    theRequest.QueryParams[authorizationConfig.Param] = authorizationConfig.Value;
  }
}
interface Config {
  Param: string;
  Value: string;
}
