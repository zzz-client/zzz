
## Desktop

![Zzz_desktop_interface](./screenshots/desktop.png)

TODO

## Web

![Zzz web interface](./screenshots/web.png)

Currently read only and still a work in progress but coming along very nicely!

Response panel needs a lot of attention;

breadcrumbs shouldn't actually be clickable until there's a tab for configuring folder settings. Also, the ability to see folder settings.


## CLI

![Zzz CLI interface](./screenshots/cli.png)

```shell
# Makes HTTP request and outputs response
$ zzz "Folder Name/Request Name" # Note: no file extension
```

## REST/Act

![Zzz REST API](./screenshots/api.png)

This is itself an API that serves up the Zzz resources so that they can be used for other applications, like the web frontend. It is a basic REST API that maps URLs one-to-one with Requests; in other words, the path to retrieve the Request from the Store is the contents of the URL to get it from the server. The Request named "OAuth Client Credentials" in the folder "Authorization" would translate to the URL http://127.0.0.1:8000/Authorization/OAuth%20Client%20Credentials

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

## TUI

TODO: The tui package on deno.land/x looks sick!


# Interface Definition

Here is a full list of features an interface needs to suply:

1. Specify Context
2. CRUD
    - Get Entity
    - Get Collection (returns Collections/Entities)
    - Get Contexts (Globals is just a special context. maybe I should rename it to "All"?)
    - Get Authorizations
    - Get Authorization
4. Format
5. Act (execute) - perform request as passthrough

## REST/Act Server

1. Specify Context
    - Header: `X-Zzz-Context`
    - QueryParam: `?context`
2. CRUD
    - POST `/:id`
    - GET `/:id`
    - PUT `/:id`
    - DELETE `/:id`
3. Format = "format" query param
4. Act on Entity = PATCH

1. OPTIONS works because of CORS
2. The file extension used in the request determines the return format
    - json
    - yml
    - xml
    - txt
    - curl

## Web

1. Specify Context = dropdown TODO
2. CRUD
    - Entity
    - Collection
    - Context
    - Authorization
3. Format = Show Variables
4. Act on Entity = Send

1. Navigate Collections to select a child
2. Navigate Contexts TODO
3. View Response
4. Tabbed Entities


## CLI

1. Specify Context = ZZZ_CONTEXT environment variable
2. CRUD - `[--type entity|collection|context|auth] <id>`
    - `zzz --create ...`
    - `zzz <id>`
    - `zzz --edit <id> ...`
    - `zzz --delete <id>`
3. Format = `--format`
4. Act on Entity = `zzz --execute <id>` or `zzz -x <id>`

## TUI

TODO

1. Specify Context
2. CRUD
3. Format
4. Act on Entity


## Browser Extensions

TODO
