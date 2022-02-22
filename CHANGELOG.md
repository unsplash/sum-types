# Changelog

This project adheres to semantic versioning.

## 0.2.2 (2022-02-22)

Add ESM support.

## 0.2.1 (2022-01-12)

Fix runtime representation of nullary constructors.

## 0.2.0 (2022-01-12)

Exhaustive checking in pattern matching now reports on missing members. Previously it would report on a missing wildcard.

The internal representation of nullary constructors has been changed to use `null` instead of `undefined` for easier JSON interop post-serialisation.

## 0.1.1 (2021-12-08)

Expose the `Serialized` type for easier usage of the serialization functions.

## 0.1.0 (2021-09-17)

The initial release of `@unsplash/sum-types` with support for non-generic sum types, pattern matching with or without wildcards, and (de)serialization.
