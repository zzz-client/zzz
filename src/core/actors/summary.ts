import { IActor } from "../factories.ts";
import { Parsers } from "../render.ts";

export default class SummaryActor implements IActor {
  format(data: any): string {
    return Parsers.TEXT.stringify(data);
  }
  act(data: any): Promise<any> {
    return data;
  }
}
