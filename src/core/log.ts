export default function Log(...args) {
  console.log.apply(null, args);
}

Log({ foo: "foo" }, { bar: "bar" });
