# Models

1. A Collection has many Collections and/or Entities
2. A Collection can have defaults
3. A Collection can have an Authorization
4. An Environment can have defaults
10. Globals is a special Environment that is always loaded
11. An Authorization can be associated to a Collection, a Collection, or a Entity
12. Authorization supports:
    - BasicAuth
    - BearerToken
    - Header
    - Query
    - etc. see authorizations/types for definitions
13. A Session is a key/value variable store (aka defaults)
14. Each Environment can have Local default overrides

## Project

 - Name
 - defaults

## Collection

```yml
WorkspaceId: id
ParentCollectionId: id
AuthorizationId: Id
Name: string
Defaults: defaults[]
```

## Entity

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
Body: filepath?
```

## Authorization

```yml
BasicAuth:
  Username: ""
  Password: ""
BearerToken: "{{_accessToken}}"
Header:
  Name: "X-API-TOKEN"
  Value: "{{_api_token}}"
Query:
  Param: "X-API-TOKEN"
  Value: "{{_api_token}}"
```

# Storage

1. Get Projects
2. Get Project (returns Collections)
3. Get Collection (returns Collections/Entities)
4. Get Entity
5. Get Environment (Globals is just a special environment)
6. Get Authorizations
7. Get Authorization

# HTTP Server

1. GET only supported method for now
2. Passing "format" as a query parameter with GET will apply variable values
3. PATCH performs the request and passes back its results
4. OPTIONS works because of CORS
5. The file extension used in the request determines the return format
    - json
    - yml
    - xml
    - txt
    - curl
6. Get squashed defaults for any Workspace, Collection, or Entity
