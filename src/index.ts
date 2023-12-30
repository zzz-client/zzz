import Construct from "./constructor";
import Authorize from "./authorizer";
import Act from "./actor";

const request = "requests/mess/v1/send/Send Emails.yml";
const environment = "Integrate";
const authDefinition = "default";
const actor = "Summary";

try {
    const letter = Construct(request, environment);
    Authorize(letter, authDefinition);
    Act(letter, actor);
} catch (e) {
    console.error(e);
    process.exit(1);
}
