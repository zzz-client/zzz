
# Architecture

Here are some terms that are used throughout Zzz:

  - **[Model](./models)** - the generic word for a set of attributes that can be stored and retrieved. Model can be thought of as an abstract class which defines a contract without an implementation.
  - **Storage** - the lowest level way that Zzz accesses a specific type of Model. Current storage drivers:
    - Files
  - **Store** - a coordinator for Storages for each different Model type. If it helps, think of it is going to a Store and buying stuff from their Storage.
  - **Hook** - a set actions to be performed before or after a Request is executed. An example would be persisting a bearer token to Session storage
  - **[Module](./modules)** - TODO


# Modules

Zzz is fundamentally modular; moreso, Modules can have dependencies to help ensure they are loaded in the right order.

A Module can supply any number of the following:

 - Features: TODO
 - Models: A list of the names of Models the module provides. These can be used by any dependencies
 - Modifier: Acts on the Model that
 - Renderer: TODO

These provide extra manipulation after a Model has been loaded from the Store and before it has been passed to the Actor.

## Features

TODO
