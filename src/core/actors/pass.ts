import { IActor } from "../app.ts";

export default class PassThruActor implements IActor {
  act(theRequest: any): Promise<any> {
    return theRequest;
  }
}
