export default class Letter {
    URL: string;
    Method: string;
    QueryParams: StringToStringMap = {};
    Headers: StringToStringMap = {};
    Variables: StringToStringMap | undefined;
    Body: any;
    Trigger: Trigger;
}

interface Trigger {
    Before: Function;
    After: Function;
}

interface StringToStringMap {
    [key: string]: string;
}
