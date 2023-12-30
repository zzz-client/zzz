import { IAuthorization } from "../authorizer";
import Letter from "../letter";

export default class BasicAuthAuthorizer implements IAuthorization {
    apply(letter: Letter, authorizationConfig: any): void {
        letter.Headers["Authorization"] = "Basic " + Buffer.from(authorizationConfig.Username + authorizationConfig.Password).toString("base64");
    }
}
