export const DefaultFlags = {
  HTTP_PORT: 8000,
  WEB_PORT: 5173,
};
export default {
  preamble: "Usage: zzz <options>", // Optional preamble for describing non-flag/positional arguments
  description: {
    context: "Context to execute in",
    workspace: "Workspace to execute in",
    http: "Start HTTP server",
    web: "Start web UI server",
    format: "Format the request with variables and params",
    execute: "Execute the request instead of outputting it",
  },
  argument: {
    context: "context",
    workspace: "workspace",
    http: "port",
    web: "port",
  },
  alias: {
    context: "c",
    workspace: "w",
    format: "f",
    execute: "x",
  },
  string: ["context", "workspace", "http", "web"],
  boolean: ["format", "execute"],
  default: {
    http: DefaultFlags.HTTP_PORT,
    web: DefaultFlags.WEB_PORT,
  },
};
