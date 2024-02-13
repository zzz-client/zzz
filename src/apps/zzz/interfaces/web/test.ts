import { newInstance as iNewInstance } from "../../../../lib/di.ts";

export const newFakeInstance = {
  newInstance(): object {
    return {
      describe: () => {},
      it: () => {},
      fail: () => {},
    };
  },
} as iNewInstance;

export interface ITest {
  describe: Function;
  it: Function;
  fail: Function;
}
