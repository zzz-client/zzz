import { IAuthorization } from "../authorizer";
import Letter from "../request";

export default class HeaderAuthorizer implements IAuthorization {
    apply(letter: Letter, authorizationConfig: Config): void {
        letter.Headers[authorizationConfig.Name] = authorizationConfig.Value;
    }
}
interface Config {
    Name: string;
    Value: string;
}
