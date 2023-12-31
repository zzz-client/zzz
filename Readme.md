# (ー。ー) Zzz

> Pronounced as "zees" or "zeds" depending on where you live.

Zzz came out of the desire for a light replacement to Postman with generally the same features list. From there the idea expanded modularity for how requests are stored, what actions are taken for the request instead of just performing the request, and how to format the output.


__Postman feature parity:__

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


__Planned__:

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

## Usage

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

## Defaults

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

This allows `v1/Foo/defaults.yml` to use an `Authorization` like BearerToken whereas `v1/Auth/Token.yml` needs to *not*  have any Authorization specified. We can do this by using `v1/Auth/defaults.yml` to unset `Authorization`.


## Hooks

TODO

# Interfaces

In addition to the standard CLI interface covered in [Usage](#Usage), Zzz can be accessed in other ways

## REST

A basic REST API is provided that maps URLs one-to-one with Requests; in other words, the path to retrieve the Request from the Store is the contents of the URL to get it from the server. The Request named "OAuth Client Credentials" in the folder "Authentication" would translate to the URL http://127.0.0.1:8000/Authentication/OAuth%20Client%20Credentials

Adding a file extension to the end will change what format is returned. Using the above example, `http://127.0.0.1:8000/MyRequest.json` will yield the result as JSON and `http://127.0.0.1:8000/MyRequest.curl` will do it as the equivalent curl command as plaintext.

  - json
  - yml
  - xml
  - txt
  - curl

## Web

TODO: I'm thinking utilize the above API server with something like React and shove it into an interface. Will also need to write some kind of client-side "actor" to translate the API results into an XHR call in the browser. And update it in the view. I dunno, I'm not a frontend dude.


## TUI

TODO: This would be SO sick and I think it should just be a matter of finding an ncurses-like library for Node and then getting the UI right

## TODO

 - How does cookie jar work?
 - Where should we write to for Postman Store?
 - Where can we store variables for the Postman Store?
 - Determine parser based on the supplied content-type header instead of having to do extension?
 - More Stores & parsers; TOML
 - Hooks readme
