## Zzz Modules

These modules exist as part of Zzz.

### Body

This module will further process the `Body` attribute on Entities.

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

### Authorization

The Authorization module adds a key for specifying the authorization via key/value instead of having it inside of `Headers`.

Example Entity using a manual Authorization:

```yml
Url: /
Method: GET
Authorization:
  BasicAuth:
    Username: foo
    Password: bar
```

The Authorization Module can be used to extract this to an Authorization Model record.

Example `foobar` Authorization:
```yml
BasicAuth:
  Username: foo
  Password: bar
```

Previous example using the Authorization module:
```yml
Url: /
Method: GET
Authorization: foobar
```

### Context

This module resolves all variable values for a given Model to help yield an actionable Model. Zzz will apply the following in order:

- globals
- globals (local)
- environment
- environment (local)
- defaults
- the model itself

The defaults will walk the Collection tree applying all defaults as needed.

As a concrete example let us look at the File store. At the defaults stage, Zzz will check every directory down in the path to the Request for a file named `_defaults.yml`.

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

This allows `v1/Foo/defaults.yml` to use an `Authorization` like BearerToken whereas `v1/Auth/Token.yml` needs to _not_ have any Authorization specified. We can do this by using `v1/Auth/defaults.yml` to unset `Authorization`.

