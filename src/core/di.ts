// deno-lint-ignore-file no-explicit-any
class DI {
  private constructors = new Map<string, newInstance>();
  private args = new Map<string, any[] | any | null>();
  private instances = new Map<string, object>();
  register(name: string, constructor: newInstance, args: any[] | any | null = null) {
    this.constructors.set(name, constructor);
    this.args.set(name, args);
  }
  getInstance(name: string): object {
    let instance = this.instances.get(name);
    if (!instance) {
      instance = this._newInstance(this.constructors.get(name)!, this.args.get(name));
      this.instances.set(name, instance);
    }
    return instance;
  }
  newInstance(name: string, args?: any[] | any): object {
    if (args && !Array.isArray(args)) {
      args = [args];
    }
    const constructor = this.constructors.get(name);
    if (!constructor) {
      throw new Error(`No mapping found for ${name}`);
    }
    return this._newInstance(constructor, args);
  }
  private _newInstance(constructor: newInstance, args?: any[] | any): object {
    if (args) {
      return constructor(...args);
    } else {
      return constructor();
    }
  }
}

type newInstance = (args?: any[] | any | null) => object;

const DumbDi = new DI();
export default DumbDi as DI;

// ----------------------------------------- TESTS -----------------------------------------

// import { describe, fail, it } from "./tests.ts";

// describe("DumbDI", () => {
//   describe("register", () => {
//     it("works", async () => {
//       fail("Write this test");
//     });
//   });
//   describe("getInstance", () => {
//     it("works", async () => {
//       fail("Write this test");
//     });
//   });
//   describe("newInstance", () => {
//     it("works", async () => {
//       fail("Write this test");
//     });
//   });
// });
