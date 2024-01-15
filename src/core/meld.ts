export default function Meld(destination: any, source: any): void {
  if (!source) {
    return;
  }
  for (const key of Object.keys(source)) {
    if (destination[key] !== undefined && typeof destination[key] === "object") {
      Meld(destination[key], source[key]);
    } else {
      destination[key] = source[key];
    }
  }
}
