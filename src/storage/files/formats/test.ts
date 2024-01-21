import HURL from "./hurl.ts";
import * as YAML from "https://deno.land/std/yaml/mod.ts";

const asYaml = Deno.readTextFileSync("requests/Salesforce Primary/Mess/v1/sendEmails.yml");

const asJs = YAML.parse(asYaml);

const asHURL = HURL.stringify(asJs);
