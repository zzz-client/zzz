class DumbDi {
  private mappings = new Map<string, Map<string, Object>>();
  register(name: string, value: Object, keyBy: Object | null = null) {
    if (keyBy === "") {
      throw new Error("Cannot use a key of blank string for mapping");
    }
    if (this.mappings.get(name) != null) {
      this.mappings.set(name, new Map<string, Object>());
    }
    this.mappings.get(name)!.set(keyBy + "", value);
  }
  getInstance(name: string, keyBy: Object | null = null): Object {
    const result = this.mappings.get(name)?.get(keyBy + "");
    if (result === undefined) {
      throw new Error(`No mapping found for ${name} with key ${keyBy}`);
    }
    return result;
  }
}

const DI = new DumbDi();
export default DI;
