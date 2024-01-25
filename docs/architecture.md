
# Architecture

> NOTE: This is probably still gonna change

## Model

This is the generic word for a set of attributes that can be stored and retrieved. Model itself is an abstract class, but a class must extend it to be able to be used with Storage.

## Storage

The way that Zzz accesses any type of model. The constructor parameters are the base directory and the file extension.

Current storage drivers:
  - Files

## Stores

A store is app-specific responsible for managing Storage. If it helps, think of it is going to a Store and buying stuff from their Storage.

The key thing about Stores is that they can use different types of Storage for different types of Models.


## Hooks

TODO: Needs its own modularity
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
