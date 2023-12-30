import { IActor } from "../actor";
import Letter, { AnyNonPromise } from "../letter";

export default class SummaryActor implements IActor {
    format<T>(data: AnyNonPromise<T>): string {
        return JSON.stringify(data, null, 2);
    }
    async act(_letter: Letter): Promise<void> {}
}
