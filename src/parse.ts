import fs = require("node:fs");
import { parse, stringify } from "yaml";

export default function Parse(filePath: string): any {
    return newInstance(filePath).parse(filePath);
}
export function Save(filePath: string, obj: any): void {
    newInstance(filePath).save(filePath, obj);
}
function newInstance(filePath: string): IParser {
    const lowerFilePath = filePath.toLowerCase();
    if (lowerFilePath.endsWith(".json")) {
        return new JsonParser();
    } else if (lowerFilePath.endsWith(".yml") || lowerFilePath.endsWith(".yaml")) {
        return new YamlParser();
    } else {
        throw new Error(`Unknown file extension: ${filePath}`);
    }
}

interface IParser {
    parse(filePath: string): any;
    save(filePath: string, obj: any): void;
}
class JsonParser implements IParser {
    parse(filePath: string): any {
        if (!fs.existsSync(filePath)) {
            return {};
        }
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    save(filePath: string, obj: any): void {
        fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
    }
}
class YamlParser implements IParser {
    parse(filePath: string): any {
        if (!fs.existsSync(filePath)) {
            return {};
        }
        return parse(fs.readFileSync(filePath, "utf8"));
    }
    save(filePath: string, obj: any): void {
        fs.writeFileSync(filePath, stringify(obj));
    }
}
