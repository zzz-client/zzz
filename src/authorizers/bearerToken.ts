import { IAuthorization } from "../authorizer";
import Letter from "../request";

export default class BearerTokenAuthorizer implements IAuthorization {
    apply(letter: Letter, authorizationConfig: any): void {
        letter.Headers["Authorization"] = `Bearer ${authorizationConfig}`;
    }
}
