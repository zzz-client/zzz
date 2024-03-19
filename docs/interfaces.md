# Interface Definition

Here is a full list of features an interface needs to supply:

1. Specify Context
2. CRUD
    - Get Request
    - Get Collection (returns Collections/Requests)
    - Get Contexts (Globals is just a special context. maybe I should rename it to "All"?)
    - Get Authorizations
    - Get Authorization
4. Format
5. Act (execute) - perform request as passthrough

## Desktop
![Zzz Desktop interface](./screenshots/desktop.png)

The desktop interface is just web interface wrapped in Tauri

## Web
![Zzz Web interface](./screenshots/web.png)

It basically works like Postman but not as fancy

1. Specify Context = Dropdown
2. CRUD
    - Request = Save button in RequestTab
    - Collection
    - Context
    - Authorization
3. Format = Show Variables
4. Act on Request = Send
5. Render Response = Response panel


## CLI

![Zzz CLI interface](./screenshots/cli.png)

The CLI can be used to execute requests but it can also be to create, edit, and delete models.

```shell
# Makes HTTP request and outputs response
$ zzz -x "Folder Name/Request Name" # Note: no file extension
```

1. Specify Context = ZZZ_CONTEXT environment variable
2. CRUD - `[--type request|collection|context|auth] <id>`
    - `zzz --create ...`
        - `zzz --create request --name "New Request" --url "https://example.com"`
    - `zzz <id>`
    - `zzz --edit <id> ...`
      - `zzz --edit <id> --name "New Name"`
      - `zzz --edit <id> --variables  # to unset a value`
    - `zzz --delete <id>`
3. Format = `--format`
4. Act on Request = `zzz --execute <id>` or `zzz -x <id>`
5. Render Response = stdout

## TUI

Under heavy development

1. Specify Context
2. CRUD
3. Format
4. Act on Request
5. Render Response

## REST/Act

![Zzz REST API](./screenshots/api.png)

This is itself an API that serves up the Zzz resources so that they can be used for other applications, like the web frontend. It is a basic REST API that maps URLs one-to-one with Requests; in other words, the path to retrieve the Request from the Store is the contents of the URL to get it from the server. The Request named "OAuth Client Credentials" in the folder "Authorization" would translate to the URL http://127.0.0.1:8000/Authorization/OAuth%20Client%20Credentials


1. Specify Context
    - Header: `X-Zzz-Context`
    - QueryParam: `?context`
2. CRUD
    - POST `/:id`
    - GET `/:id`
    - PUT `/:id`
    - DELETE `/:id`
3. Format = "format" query param
4. Act on Request = PATCH `/:id`
5. Render Response = HTTP

Notes:
    - OPTIONS works because of CORS
    - The file extension used in the request determines the return format
        - json
        - yml
        - xml
        - txt
        - curl

### Act

This API can behave in one of two ways:

  - GET: Responds with information about the subject Request
  - PATCH: Performs the subject Request and responds with its results

That is to say, performing a GET on `http://127.0.0.1:8000/Duck.json` would give you the JSON with the definition of the request, something like

```json
{
  "Id": "ddg"
  "URL": "https://ddg.gg",
  "METHOD": "GET"
}
```

Meanwhile, performing a PATCH on `http://127.0.0.1:8000/Duck.json` - that same endpoint - would actually perform `GET https://ddg.gg` and pass along its results.

Adding a file extension to the end will change what format is returned: `http://127.0.0.1:8000/Duck.json` will yield the result as JSON and `http://127.0.0.1:8000/Duck.curl` will do it as the equivalent curl command as plaintext.

- json
- yml
- xml
- bru
- txt
- curl

## Browser Extensions

TODO
