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
Name: string
WorkspaceOrCollectionId: id
AuthorizationId?: id
Defaults?:
  key: value
```

## Entity

Replaces Request

```yml
Id: string
Name: string
CollectionId: id
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

1. Specify Context
2. CRUD
    - Get Collection (returns Collections/Entities)
    - Get Entity
    - Get Contexts (Globals is just a special context. maybe I should rename it to "All"?)
    - Get Authorizations
    - Get Authorization
4. Format (GET with applying variable values)
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
  - Authorizations = TODO
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

1. Specify Context
2. CRUD
3. Format = Show Variables
4. Act on Entity = Send

1. Navigate Collections to select a child
2. Navigate Contexts TODO
3. View Response
4. Tabbed Entities


## CLI

1. Specify Context = ZZZ_CONTEXT environment variable
2. CRUD - `[--type entity|collection|auth] <id>`
  - `zzz --create ...`
  - `zzz <id>`
  - `zzz --edit <id> ...`
  - `zzz --delete <id>`
  - Context = TODO
  - Authorization = TODO
3. Format = Add --format to --show
4. Act on Entity



## TUI

TODO

1. Set Scope
2. Set Environment
3. CRUD
4. Format
5. Act on Entity
