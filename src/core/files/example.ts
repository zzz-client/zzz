import { getParser } from "./files.ts";

const file = "Salesforce Primary/Authentication/oauth-username-password.yml";
const rawText = Deno.readTextFileSync(file);
const parsedYaml = getParser(file).parse(rawText);
// console.log("---------------------------- YAML ----------------------------");
// console.log(rawText);
// console.log("---------------------------- Parsed YAML ----------------------------");
// console.log(parsedYaml);
console.log("---------------------------- Bru ----------------------------");
const brued = getParser(".bru").stringify(parsedYaml);
console.log(brued);
console.log("---------------------------- Parsed Bru ----------------------------");
console.log(getParser(".bru").parse(brued));
