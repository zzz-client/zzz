class DI {
  private mappings = new Map<string, [Function, Object | null, Object]>();
  register(name: string, value: Function, param: any[] | any | null = null) {
    this.mappings.set(name, [value, param, value(...param)]);
  }
  getInstance(name: string): Object {
    const mappedValue = this.mappings.get(name);
    if (mappedValue === undefined) {
      throw new Error(`No mapping found for ${name}`);
    }
    return mappedValue[2];
  }
  newInstance(name: string, args?: any[] | any): Object {
    if (!Array.isArray(args)) {
      args = [args];
    }
    const mappedValue = this.mappings.get(name);
    if (mappedValue === undefined) {
      throw new Error(`No mapping found for ${name}`);
    }
    return mappedValue[0](...args);
  }
}

export interface DIable {
  newInstance(args?: any[]): Object;
}

const DumbDi = new DI();
export default DumbDi as DI;
