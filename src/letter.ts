export default class Letter {
    URL: string;
    Method: string;
    QueryParams: StringToStringMap = {};
    Headers: StringToStringMap = {};
    Variables: StringToStringMap | undefined;
    Body: any;
}

interface StringToStringMap {
    [key: string]: string;
}
