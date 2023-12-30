import { IAuthorization } from "../authorizer";
import Letter from "../letter";

export default class BasicAuthAuthorizer implements IAuthorization {
    apply(letter: Letter, authorizationConfig: Config): void {
        letter.Headers["Authorization"] = "Basic " + Buffer.from(authorizationConfig.Username + authorizationConfig.Password).toString("base64");
    }
}
interface Config {
    Username: string;
    Password: string;
}
