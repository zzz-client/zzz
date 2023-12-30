export default function tim(data: any, variables: any): void {
    Object.keys(data).forEach((key) => {
        const dataValue = data[key];
        if (typeof dataValue === "string") {
            data[key] = render(dataValue, variables);
        } else if (typeof dataValue === "object" && dataValue !== null) {
            tim(dataValue, variables);
        } else {
            // console.warn("Unknown dataValue type", key, dataValue);
        }
    });
}

// github.com/premasagar/tim
// MIT License
function render(template: string, data: any): string {
    var start = "{{",
        end = "}}",
        path = "[a-z0-9_$][\\.a-z0-9_]*", // e.g. config.person.name
        pattern = new RegExp(start + "\\s*(" + path + ")\\s*" + end, "gi"),
        undef;

    // Merge data into the template string
    return template.replace(pattern, function (tag, token) {
        var path = token.split("."),
            len = path.length,
            lookup = data,
            i = 0;

        for (; i < len; i++) {
            lookup = lookup[path[i]];

            // Property not found
            if (lookup === undef) {
                throw "tim: '" + path[i] + "' not found in " + tag;
            }

            // Return the required value
            if (i === len - 1) {
                return lookup;
            }
        }
    });
}
