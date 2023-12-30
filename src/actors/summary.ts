import { IActor } from "../actor";
import { AnyNonPromise } from "../request";
import { Parsers } from "../run";

export default class SummaryActor implements IActor {
    format<T>(data: AnyNonPromise<T>): string {
        return Parsers.TEXT.stringify(data);
    }
    async act<T>(data: AnyNonPromise<T>): Promise<any> {
        // TODO: bad use of any?
        return data;
    }
}
