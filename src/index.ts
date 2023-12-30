import { Load } from "./store";
import Authorize from "./authorizer";
import Act from "./actor";

const request = "requests/mess/v1/send/Send Emails.yml";
const environment = "Integrate";
const authDefinition = "default";
const actor = "Curl";

try {
    const letter = Load(request, environment);
    Authorize(letter, authDefinition);
    // TODO: Apply variables, which should all be available inside letter.Variables
    console.log(Act(letter, actor));
} catch (e) {
    console.error(e);
    process.exit(1);
}
