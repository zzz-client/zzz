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
Authorization?: authorization
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

2. String

```yml
Body: '{ "Key": "Value" }'
```

3. File

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

21. Specify Context
2. CRUD
3. Format
4. Act on Entity


## Browser Extensions

TODO

# Comparison / Inspiratos

## Zzz
  - License: OSL
  - Platforms
    - CLI
    - TUI TODO
    - REST/Act
    - Web
    - Desktop (Tauri) TODO
    - Browser extensions? TODO
  - Technologies:
    - Runtime: Deno
    - Language: Typescript
    - Server: Vite
    - Front end: Vue
    - Desktop: Tauri
    - Readline: [tui](https://deno.land/x/tui@2.1.7)
  - Notable Features:
    - Hooks (JS) TODO
    - Modules (e.g. Authorization, Body)
  - Storage:
    - YAML
    - JSON
    - XML
    - SQLite TODO
    - Postman TODO
    - [Bru](https://docs.usebruno.com/bru-lang-overview.html)
  - Extras:
    - VS Code extension TODO?

## [Bruno](https://github.com/usebruno/bruno)

  - License: MIT
  - Platforms
    - Desktop (Electron)
    - CLI
  - Technologies:
    - Runtime: Nodejs
    - Language: Javascript
    - Server: Webpack
    - Front end: ???
    - Desktop: Electron
  - Notable Features:
    - GraphQL
    - Declarative scripting...though Bru files appear to have Javascript?
    - Declarative tests?
  - Storage: [Bru](https://docs.usebruno.com/bru-lang-overview.html)
  - Extras:
    - VS Code extension
  - Pros of Zzz:
    - REST/Act
    - Web
    - TUI

## [Restfox](https://github.com/flawiddsouza/Restfox)

[Try live](restfox.dev)

  - License: MIT
  - Platforms:
    - Web
    - Desktop (Tauri & Electron)
    - [Chrome extension](https://chromewebstore.google.com/detail/restfox/fihmegnabgglklkppphibngblkomlhcn)
  - Technologies:
    - Runtime: Nodejs
    - Language: Javascript
    - Server: Express
    - Front end: Vue
    - Desktop: Tauri & Electron
  - Notable Features:
    - GraphQL
    - Plugins (Javascript)
  - Storage: IndexedDB (via [Dexie](https://dexie.org/))
  - Extras:
  - Pros of Zzz:
    - CLI
    - TUI



## Yaade

TODO

## RecipeUI

TODO

# Hoppscotch

TODO


## [Hello HTTP](https://github.com/sunny-chung/hello-http)

  - License: Apache 2.0
  - Platforms: Desktop
  - Technologies:
    - Runtime: JVM
    - Language: Kotlin
    - Front end: [Jetpack](https://developer.android.com/jetpack/androidx/)
    - Desktop: Jetpack
  - Notable Features:
    - Websockets
    - GraphQL
  - Storage: [ExperimentalSerializationApi](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-experimental-serialization-api/)?
  - Pros of Zzz:
    - CLI
    - TUI
    - Web
    - REST/Act



## [Advanced REST Client](https://github.com/advanced-rest-client/arc-electron)

TODO

  - License: Apache 2.0
  - Platforms: Desktop
  - Technologies:
    - Runtime: Nodejs?
    - Language: Javascript
    - Server: ???
    - Front end: ???
    - Desktop: Electron
  - Notable Features:
  - Storage
  - Pros of Zzz:


## Another...

  - License:
  - Platforms:
  - Technologies:
  - Notable Features:
  - Storage
  - Pros of Zzz:
