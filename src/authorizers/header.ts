import { IAuthorization } from "../authorizer";
import Letter from "../letter";

export default class HeaderAuthorizer implements IAuthorization {
    apply(letter: Letter, authorizationConfig: any): void {
        letter.Headers[authorizationConfig.Name] = authorizationConfig.Value;
    }
}
