export default class Letter {
    URL: string;
    Method: string;
    QueryParams: StringToStringMap = {};
    Headers: StringToStringMap = {};
    Variables: StringToStringMap | undefined;
    Body: any;
}

export interface StringToStringMap {
    [key: string]: string;
}
export type AnyNonPromise<T> = (T & { then?: void }) | Letter;
