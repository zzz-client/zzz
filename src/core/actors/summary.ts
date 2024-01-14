import { IActor } from "../app.ts";

export default class SummaryActor implements IActor {
  format(data: any): string {
    return data + "";
  }
  act(data: any): Promise<any> {
    return data;
  }
}
