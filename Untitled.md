# Models

## Scope

Replaces Workspace; e.g. "Salesforce Primary"

```yml
Id: string
Name: string
Defaults?:
  key: value
```

## Collection

Represents both Collections and Folders

```yml
Id: string
WorkspaceOrCollectionId: id
AuthorizationId?: id
Name: string
Defaults?:
  key: value
```

## Entity

Replaces Request

```yml
Id: string
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
Authorization: authorization
```

The `Authorization` is a tree of values that differ based on the type, or it can also reference a saved Authorization by name.

## Body

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
Maybe if it starts with `@`? or use two different ones, `Body` and `BodyFile`? that would require validation of only one being present.

```yml
Body: filepath ???
```

## Context

Replaces Environment

```yml
Id: string
Name: string
Defaults?:
  key: value
```

## Authorization

An Authorization can be a part of a Workspace, a Collection, or a File, but it can also be defined on its own so that it can be referenced by multiple entities.

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

## Interface Definition

1. Set Scope
2. Set Environment
3. CRUD
    - Get Scopes
    - Get Scope (returns Collections)
    - Get Collection (returns Collections/Entities)
    - Get Entity
    - Get Context (Globals is just a special context. maybe I should rename it to "All"?)
    - Get Authorizations
    - Get Authorization
4. Format (GET with applying variable values)
5. Act (perform request as passthrough)

## REST/Act Server

1. Set Scope - X-Zzz-Scope header?
2. Set Environment
3. CRUD
4. Format = "format" query param
5. Act on Entity = PATCH

1. OPTIONS works because of CORS
2. The file extension used in the request determines the return format
    - json
    - yml
    - xml
    - txt
    - curl

## Web

1. Set Scope = Dropdown TODO
2. Set Environment
3. CRUD
4. Format = Show Variables
5. Act on Entity = Send

1. Navigate Collections to select a child
2. Navigate Contexts TODO
3. View Response
4. Tabbed Entities


## CLI

1. Set Scope = ZZZ_SCOPE environment variable
  - TODO How will this work with Scopes being a repo?
2. Set Environment
3. CRUD = --show [--type entity|collection|scope|auth] <id>
  - defaults to Entity
4. Format = Add --format to --show
5. Act on Entity



## TUI

TODO

1. Set Scope
2. Set Environment
3. CRUD
4. Format
5. Act on Entity
