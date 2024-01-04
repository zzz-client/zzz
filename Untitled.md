# Models

1. A Collection has many Collections and/or Entities
2. A Collection can have defaults
3. A Collection can have an Authorization
4. An Context can have defaults
10. Globals is a special Context that is always loaded
11. An Authorization can be associated to a Collection, a Collection, or a Entity
12. Authorization supports:
    - BasicAuth
    - BearerToken
    - Header
    - Query
    - etc. see authorizations/types for definitions
13. A Session is a key/value variable store (aka defaults)
14. Each Context can have Local default overrides

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

# Storage

1. Get Scopes
2. Get Scope (returns Collections)
3. Get Collection (returns Collections/Entities)
4. Get Entity
5. Get Context (Globals is just a special context)
6. Get Authorizations
7. Get Authorization

# Interfaces

## REST & Act Server

1. GET only supported method for now
2. Passing "format" as a query parameter with GET will apply variable values
3. PATCH performs the request (Acts on the Entity) and passes back its results
4. OPTIONS works because of CORS
5. The file extension used in the request determines the return format
    - json
    - yml
    - xml
    - txt
    - curl
6. Get squashed defaults for any Workspace, Collection, or Entity

## Web

1. Change Scopes TODO
2. List Collections
3. List Contexts TODO
4. Tabbed Entities
5. Act on Entity
6. View Response


## CLI

1. Act on an Entity
2. --show = print out an Entity
3. --reveal = print out a formatted Entity
4. --create
  - --scope
  - --context

Create an entity via prompts
  --scope
  --context
  --

Edit an entity using EDITOR?

--

## TUI

