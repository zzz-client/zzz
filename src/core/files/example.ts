import { getDriver } from "./drivers.ts";

const file = "Salesforce Primary/Authentication/oauth-username-password.yml";
const rawText = Deno.readTextFileSync(file);
const parsedYaml = getDriver(file).parse(rawText);
// console.log("---------------------------- YAML ----------------------------");
// console.log(rawText);
// console.log("---------------------------- Parsed YAML ----------------------------");
// console.log(parsedYaml);
console.log("---------------------------- Bru ----------------------------");
const brued = getDriver(".bru").stringify(parsedYaml);
console.log(brued);
console.log("---------------------------- Parsed Bru ----------------------------");
console.log(getDriver(".bru").parse(brued));
