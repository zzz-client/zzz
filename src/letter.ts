export default class Letter {
    URL: string;
    Method: string;
    QueryParams: StringToStringMap = {};
    Headers: StringToStringMap = {};
    Variables: StringToStringMap | undefined;
}

interface StringToStringMap {
    [key: string]: string;
}
