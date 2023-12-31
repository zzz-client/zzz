import { IAuthorization } from "../authorizer";
import Request from "../request";

export default class BasicAuthAuthorizer implements IAuthorization {
    apply(theRequest: Request, authorizationConfig: Config): void {
        theRequest.Headers["Authorization"] = "Basic " + Buffer.from(authorizationConfig.Username + authorizationConfig.Password).toString("base64");
    }
}
interface Config {
    Username: string;
    Password: string;
}
