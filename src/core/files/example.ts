import { getDriver } from "./drivers.ts";
import { basename, dirname, extname } from "path";

import { Factory } from "../app.ts";
import { ModelType } from "../models.ts";

const file = Deno.args[0];
const dir = dirname(file);
const based = basename(file);
const parsedYaml = await (await new Factory().newStore(".yaml")).get(ModelType.Entity, based, "");
if (!parsedYaml.Name) {
  parsedYaml.Name = basename(file);
}
// console.log("---------------------------- YAML ----------------------------");
// console.log(rawText);
// console.log("---------------------------- Parsed YAML ----------------------------");
// console.log(parsedYaml);
// console.log("---------------------------- Bru ----------------------------");
const brued = getDriver(".bru").stringify(parsedYaml);
console.log(brued);
// console.log("---------------------------- Parsed Bru ----------------------------");
// console.log(getDriver(".bru").parse(brued));

/*
Get-ChildItem -Recurse ".\Salesforce Primary\**\*.yml" | % {
  echo $_.FullName
  deno run -A .\src\core\files\example.ts $_.FullName > ($_.FullName + ".bru")
  Remove-Item $_.FullName
}
*/
