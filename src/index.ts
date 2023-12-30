import { Load } from "./store";
import Authorize from "./authorizer";
import Act from "./actor";
import Do from "./templater";

// const request = "requests/mess/v1/send/Send Emails.yml";
const request = "requests/Authentication/OAuth/ClientCredentials.yml";
// const request = "requests/BasicFunctionality.yml";
const environment = "Integrate";
const authDefinition = "default";
const actor = "Curl";

async function main() {
    try {
        const letter = Load(request, environment);
        await Authorize(letter, authDefinition);
        Do(letter, letter.Variables);
        console.info(await Act(letter, actor));
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
