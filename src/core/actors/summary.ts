import { IActor } from "../actor.ts";
import { Parsers } from "../format.ts";

export default class SummaryActor implements IActor {
  format(data: any): string {
    return Parsers.TEXT.stringify(data);
  }
  act(data: any): Promise<any> {
    return data;
  }
}
