export default function Log(...args: any[]): void {
  console.log.apply(null, args);
}
