import { table } from "table";
import { IActor } from "../actor";
import Letter, { AnyNonPromise } from "../request";

export default class SummaryActor implements IActor {
    format<T>(data: AnyNonPromise<T>): string {
        console.log("data", data);
        return table(data as any);
    }
    async act(_letter: Letter): Promise<void> {}
}
