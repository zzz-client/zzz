import { IActor } from "../actor.ts";
import { Parsers } from "../libs.ts";
import { AnyNonPromise } from "../request.ts";

export default class SummaryActor implements IActor {
  format<T>(data: AnyNonPromise<T>): string {
    return Parsers.TEXT.stringify(data);
  }
  async act<T>(data: AnyNonPromise<T>): Promise<any> {
    // TODO: bad use of any?
    return Promise.resolve(data);
  }
}
