# lttr

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

 - where are workspace settings stored (e.g. environment)?
 - How does cookie jar work?
 - post-run script?
