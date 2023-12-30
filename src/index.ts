import { Load } from "./store";
import Authorize from "./authorizer";
import Act from "./actor";
import Do from "./templater";

const request = "requests/mess/v1/send/Send Emails.yml";
// const request = "requests/Authentication/OAuth/ClientCredentials.yml";
// const request = "requests/BasicFunctionality.yml";
// const request = "requests/Authentication/OAuth/ClientCredentials.json";
const environment = "Integrate";
const actor = "Http";

async function main() {
    try {
        const letter = Load(request, environment);
        await Authorize(letter, letter.Authorization);
        Do(letter, letter.Variables);
        const actResult = await Act(letter, actor);
        console.info(actResult);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
