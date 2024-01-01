# (ー。ー) Zzz

> Pronounced as "zees" or "zeds" depending on where you live.

Zzz came out of the desire for a light replacement to Postman with generally the same features list. From there came the idea of making it be both storage- and user interface-agnostic. Lastly, different renderers can be used to alter the output

**Postman feature parity:**

- Request attributes:
  - Method
  - URL
  - Query params
  - Authorization
  - Headers
  - Body
- Environments and Globals
- Default values per folder or collection
- Local variables

**Planned**:

- Cookie jar
- Settings (per-request)
  - Disable cookie jar
  - Follow redirects (3xx)
  - Follow original HTTP method (instead of redirecting to GET)
  - Follow Authorization Header
  - Remove referrer header on redirect
  - Enable strict HTTP parser???
  - Encode URL automatically (path, query parameters, authentication fields)
  - Maximum number of redirects


# Interfaces



## Web

![Zzz web interface](./screenshots/web.png)

Currently read only and still a work in progress but coming along very nicely!

Response panel needs a lot of attention;

breadcrumbs shouldn't actually be clickable until there's a tab for configuring folder settings. Also, the ability to see folder settings.


## CLI

![Zzz web interface](./screenshots/cli.png)

Passing in the name of a request (i.e. the path to the file with or without extension) will perform it and output the response.

You can override some implementations using flags:

- `-e` / `--environment`: The name of the environment inside `environments` to load from
- `-a` / `--actor`: The class to perform the action on the parsed request (see below)
- `-h` / `--hooks`: TBD

```shell
# Makes HTTP request and outputs response
$ zzz "Folder Name/Request Name"

# Load variables and settings from a specific environment
$ zzz --environment qa "Folder Name/Request Name"

# Run an HTTP server as an output for the program instead of the CLI
$ zzz
```

---

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


## REST

![Zzz REST API](./screenshots/api.png)


This is itself an API that serves up the Zzz resources so that they can be used for other applications, like the web frontend. It is a basic REST API that maps URLs one-to-one with Requests; in other words, the path to retrieve the Request from the Store is the contents of the URL to get it from the server. The Request named "OAuth Client Credentials" in the folder "Authentication" would translate to the URL http://127.0.0.1:8000/Authentication/OAuth%20Client%20Credentials

Adding a file extension to the end will change what format is returned: `http://127.0.0.1:8000/MyRequest.json` will yield the result as JSON and `http://127.0.0.1:8000/MyRequest.curl` will do it as the equivalent curl command as plaintext.

- json
- yml
- xml
- txt
- curl

## TUI

This would be SO sick and I think it should just be a matter of finding an ncurses-like library for Node and then getting the UI right


# Structure

> NOTE: This is gonna change a lot

## Storage

The way that Zzz accesses requests, environments, variables and etc are done through an interface called IStore.

- FileStore: Store each request in separate file; can use yml, json, or xml
- Postman: Reads requests from a collection JSON exported from Postman
  - **NOTE**: This currently does not support writing

## Authorizers

After a request has been loaded from the Store, it will need to be massaged to have whatever changes made to it for authorization. Authorization profiles can be shared across requests and are set via the `Authorization` attribute in Zzz config, which allows a Request to override the Authorization schema of its Collection or Folder.

The form of the file should only have 1 key: the name of the type of Authorization, each of which has an example in the `authorization/types` folder.

Here are the currently supported types:

- BearerToken
- BasicAuth
- Header (equivalent to "API Key" in Postman with "Header" selected as "Add to")
- Query (equivalent to "API Key" in Postman with "Query Params" selected as "Add to")

## Actors

An Actor is responsible for taking a fully loaded Request, performing an action on it, and yielding a result. Note that Actors are _not_ responsible for formatting the result.

The supported actors are:

- Client: Performs the HTTP request and returns its response. NOTE: just the body for now; nothing else more like headers or status
- Curl: Outputs an equivalent `curl` command similar to Postman
- Summary: Outputs the result as plaintext
- Pass: Just passes the Request through

## VariableLibrary

> NOTE: This needs to be changed to be not only file driven.

When constructing a request, Zzz will apply the following in order:

- globals
- globals (local)
- environment
- environment (local)
- defaults.yml anywhere in the directory tree
- the request itself

At the `defaults.yml` stage, Zzz will check every directory down in the path to the Request for a file named `defaults.yml`.

For example, supposed you had the following:

- `v1/defaults.yml`
- `v1/Auth/defaults.yml`
- `v1/Auth/Token.yml`
- `v1/Foo/defaults.yml`
- `v1/Foo/Bar.yml`

When making the `Authorization/Token` request, it will find and apply these files in this order:

- `v1/defaults.yml`
- `v1/Auth/defaults.yml`
- `v1/Auth/Token.yml`

This allows `v1/Foo/defaults.yml` to use an `Authorization` like BearerToken whereas `v1/Auth/Token.yml` needs to _not_ have any Authorization specified. We can do this by using `v1/Auth/defaults.yml` to unset `Authorization`.

## Hooks

Needs its own modularity, or part of the Store?

## TODO

backend:
  - Sweet mother of god, fix the design pattern in serve.ts
  - Split Store
    - Where should we write to for Postman Store?
    - Add workspace entity for Get, and some command to get all workspaces
  - Finish auth UI per-request
    - Create auth UI for bulk edit and creation (using above component)
  - Cookie jar
  - Redo Hooks so it's not only file-based
  - find xmlStringify

Frontend:
  - form-* Body
  - binary Body
  - Settings tab

### Bonus

- Expand & Collapse All
- TUI
- Determine parser based on the supplied content-type header instead of having to do extension?
- More Stores & parsers; TOML, SQLite
