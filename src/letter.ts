export default class Letter {
    URL: string;
    Method: string;
    QueryParams = new Map<string, string>();
    Headers = new Map<string, string>();
}
