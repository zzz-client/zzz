# Models

## Scope

Replaces Workspace; e.g. "Salesforce Primary"

```yml
Name: string
Defaults?:
  key: value
```

## Collection

Represents both Collections and Folders

```yml
WorkspaceOrCollectionId?: id
AuthorizationId?: id
Name: string
Defaults?:
  key: value
```

## Entity

Replaces Request

```yml
CollectionId: id
Name: string
Method: GET | POST | PUT | PATCH | DELETE | OPTIONS
URL: string
Headers?:
 - key: value
QueryParams?:
 - key: value
PathParams?:
 - key: value
```

The Body is optional and can be one of three options:

1. Object

```yml
Body:
  Some:
    Nested:
      - structure
    Of: Values
```

2. A string

```yml
Body: '{ "Key": "Value" }'
```

3. A file

TODO: How will it know this being different from the above?

```yml
Body: filepath ???
```

## Context

Replaces Environment

```yml
Name: string
Defaults?:
  key: value
```

## Authorization

```yml
BasicAuth:
  Username: "{{_username}}"
  Password: "{{_password}}"
```
```yml
BearerToken: "{{_accessToken}}"
```
```yml
Header:
  Name: "{{_authHeader}}"
  Value: "{{_apiToken}}"
```
```yml
Query:
  Param: "{{_authParam}}"
  Value: "{{_apiToken}}"
```

# Interfaces

1. Set Scope
2. CRUD
    - Get Scopes
    - Get Scope (returns Collections)
    - Get Collection (returns Collections/Entities)
    - Get Entity
    - Get Context (Globals is just a special context)
    - Get Authorizations
    - Get Authorization
3. Format (GET with applying variable values)
4. Act (perform request as passthrough)

## REST/Act Server

1. Set Scope - X-Zzz-Scope header?
2. CRUD
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

1. Set Scope = Dropdown TODO
2. CRUD
3. Format = Show Variables
4. Act on Entity = Send

1. Navigate Collections to select a child
2. Navigate Contexts TODO
3. View Response
4. Tabbed Entities


## CLI

1. Set Scope = ZZZ_SCOPE environment variable
  - TODO How will this work with Scopes being a repo?
2. CRUD = --show [--type entity|collection|scope|auth] <id>
  - defaults to Entity
3. Format = Add --format to --show
4. Act on Entity



## TUI

TODO

1. Set Scope
2. CRUD
3. Format
4. Act on Entity
