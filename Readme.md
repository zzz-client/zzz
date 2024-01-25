# (ー。ー) Zzz

> Pronounced as "zees" or "zeds" depending on where you live.

Zzz came out of the desire for a **REST client** replacement to Postman with generally the same features list. From there came the idea of making it be both storage- and user interface-agnostic. Additionally, Zzz has been made to be very modular.

# Interfaces

#### Desktop/Web
![Zzz web interface](./screenshots/web.png)
![Zzz_desktop_interface](./screenshots/desktop.png)

#### REST API
![Zzz web interface](./screenshots/rest.png)

### CLI
![Zzz cli interface](./screenshots/cli.png)

### TUI
TODO

# Usage

Run `--help` for more detail on flag usages and shorthands.

- `zzz http`: Start the HTTP server, defaults to port 8000
- `zzz web`: Start the Web (Vite) server, defaults to port 5173

Flags are available for CLI usage

- `--scope <name>`: The name of the scope to use
- `--context <name>`: The name of the context to use
- `--execute`: execute the request instead outputting its contents

Outside of the sense of a workspace of requests, for the file storage driver, a request can contain every bit of information it needs due to the way melding the files works. That means you can store a request as YAML and run it on demand.

```yaml
Method: POST
URL: "{{baseUrl}}{{auth_path}}token"
Authorization:
  BasicAuth: 32tersgvzfwt45g54=
QueryParams:
  grant_type: client_credentials
  client_id: "{{clientId}}"
  client_secret: "{{clientSecret}}"
  content: application/x-www-form-urlencoded
Variables:
  clientId: XXXXXXX
  clientSecret: XXXXXXXX
  baseUrl: https://test.salesforce.com
  auth_path: /services/oauth2/
```

Further [documentation](docs) in recommended reading order: 

  - [Architecture](docs/architecture.md)
  - [Models](docs/models.md)
  - [Modules](docs/modules.md)
  - [Interfaces](docs/interfaces.md)
  - [Alternatives to Zzz](docs/alternatives.md)





## Postman feature parity

- Request attributes:
  - Method
  - URL
  - Query params
  - Authorization
  - Headers
  - Body
- Environments and Globals (aka Scopes)
- Local variables (more Scopes)
- Default values per folder or collection (aka Variables)
- Cookie jar

**Planned**:

- Settings (per-request)
  - Disable cookie jar
  - Follow redirects (3xx)
  - Follow original HTTP method (instead of redirecting to GET)
  - Follow Authorization Header
  - Remove referrer header on redirect
  - Enable strict HTTP parser???
  - Encode URL automatically (path, query parameters, authorization fields)
  - Maximum number of redirects


