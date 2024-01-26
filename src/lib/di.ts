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
    const instance = this.instances.get(name);
    if (!instance) {
      this.instances.set(name, this._newInstance(this.constructors.get(name)!, this.args.get(name)));
      throw new Error(`No mapping found for ${name}`);
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
      return constructor.newInstance(...args);
    } else {
      return constructor.newInstance();
    }
  }
}

export interface newInstance {
  newInstance(args?: any[] | any | null): object;
}

const DumbDi = new DI();
export default DumbDi as DI;
