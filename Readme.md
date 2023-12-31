# Zzz

Program that stores requests as YAML. Meant to be a sleek modular replacement for Postman.

- Method
- URL
- Query params
- Authorization
- Headers
  - Default headers; Postman-Token calculated when request is sent
- Body
- Cookie jar
- Variables & Environments
  - Easiest thing is probably just use mustache syntax?
- Settings (per-request)
  - Follow redirects (3xx)
  - Follow original HTTP method (instead of redirecting to GET)
  - Follow Authorization Header
  - Remove referrer header on redirect
  - enable strict HTTP parser???
  - Encode URL automatically (path, query parameters, authentication fields)
  - Disable cookie jar
  - Maximum number of redirects

## How it would work

1. Construct Request using:
  **Dependency Injection**: seems like they all do the same thing, but maybe could also parse from curl or postman?
  > IRequestConstructor.construct(requestFilePath: string): Request
  we would start with 1 implementation of the above that would iterate over the following files each doing the same thing (collapsing down)
  1. globals.yml
  2. globals.local.yml
  3. environment.yml
  4. environment.local.yml
  5. defaults.yml from root dir walked down to working dir (location of request)
    Not allowed to be defaulted: Method, URL, QueryParams, Body, maybe more
  6. request itself
    Certain params should only be allowed to be specified on the request itself
3. If [Authorization] is not null, load it from authorizations per-type and apply it to the Request
    **Dependency Injection**: to start with, 3 implementations: ApiKey, BasicAuth, BearerToken
    > IAuthorization.apply(request: Request, config: AuthConfig): void
4. Convert to output
    **Dependency Injection**: implementation to output compiled summary, convert to curl, to make request using node, etc


## TODO

 - How does cookie jar work?
 - Where should we write to for Postman Store?
 - Where can we store variables for the Postman Store?
 - Determine parser based on the supplied content-type header instead of having to do extension?
 - More Stores & parsers; TOML

# Actual Documentation

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

## Stores

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

An Actor is responsible for taking a fully loaded Request, performing an action on it, and yielding a result. Note that Actors are *not* responsible for formatting the result.

The supported actors are:

  - Client: Actually makes the HTTP requests!
  - Summary:
  - Curl: Outputs an equivalent `curl` command similar to Postman

## Hooks

TODO

## Web Server

In addition to acting as a CLI REST client, Zzz also has a built in web server that is run when no specific request is passed as a param. The URL path maps one-to-one with the Store; in other words, the path to retrieve the Request from the Store is the contents of the URL to get it from the server. The Request named "OAuth Client Credentials" in the folder "Authentication" would translate to the URL http://127.0.0.1:8000/Authentication/OAuth%20Client%20Credentials


Adding a file extension to the end will change what format is returned. Using the above example, `http://127.0.0.1:8000/MyRequest.json` will yield the result as JSON and `http://127.0.0.1:8000/MyRequest.curl` will do it as the equivalent curl command as plaintext.

  - json
  - yml
  - xml
  - txt
  - curl

