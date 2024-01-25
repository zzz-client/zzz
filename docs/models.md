
# Models

### Scope

(Postman equivalent is Workspace)

```yml
Id: string
Name: string
Defaults?:
  key: value
```

### Collection

(Postman equivalent is both Collections and Folders)

```yml
Id: string
Name: string
WorkspaceOrCollectionId: id
AuthorizationId?: id
Defaults?:
  key: value
```

### HttpRequest

Would be named just "Request" but there's a standard class named that.

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
```

### Context

(Postman equivlanet is )Environment)

```yml
Id: string
Name: string
Defaults?:
  key: value
```

### Authorization

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
