import { IActor } from "../actor";
import Letter from "../letter";

export default class SummaryActor implements IActor {
    async act(letter: Letter): Promise<string> {
        return JSON.stringify(letter, null, 2);
    }
}
