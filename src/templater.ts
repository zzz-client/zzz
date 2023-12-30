import render from "./tim";
export default function Do(data: any, variables: any): void {
    Object.keys(data).forEach((key) => {
        const dataValue = data[key];
        if (typeof dataValue === "string") {
            data[key] = render(dataValue, variables);
        } else if (typeof dataValue === "object" && dataValue !== null) {
            Do(dataValue, variables);
        } else {
            // console.warn("Unknown dataValue type", key, dataValue);
        }
    });
}
