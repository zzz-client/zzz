# TODO

Why the hell is primevue/menuitem not cached by Deno?

Parsing body, notably as an external file.

Sequence, somehow

Hooks as module?

Cookie jar as module?

find xmlStringify

Web:
  - Contexts
  - Scopes
  - form-* Body
  - binary Body
  - Settings tab

Fix HTTP so it returns different formats for different extensions given

Per-request settings? Is a Settings module even needed? how? see Readme.md for list


## Chipping away

- HTTP - POST `/:id`
- HTTP - PUT `/:id`
- HTTP - DELETE `/:id`
- HTTP - POST `/:id`
- HTTP - Authentications, Contexts, Scope, etc

- CLI - `--create ...`
- CLI - `--edit <id> ...`
- CLI - `--delete <id>`


### Bonus

- Determine return format based on the supplied content-type header instead of having to do extension?
- TUI
- Where should we write to for Postman Store?
- More Stores & parsers; TOML, SQLite
- GET Image


### Polish
- Expand & Collapse All
- Remove in all tables
- Remove in accordions
- Examples for requests. That's a lot of work.
- Tooltip over variables to show their resolved values

