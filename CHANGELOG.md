# Changelog

This project adheres to semantic versioning.

## 1.0.0 (2025-07-22)

Makes the structure of sums JSON-serialisable for improved ecosystem compatibility.

## 0.4.1 (2023-10-04)

Fixes pattern matching branches which return `undefined` in `matchX` and `matchXW`.

## 0.4.0 (2023-05-16)

Adds supports for convenient "strict" pattern matching without access to member values, denoted by an "X" suffix.

Adds a first-class, low-level `is` primitive for refining foreign data to a known sum member.

Fixes reference equality of deserialized nullary sums.

## 0.3.2 (2023-03-23)

Fixes nullary equality checks in Jest and others that compare the reference equality of functions.

## 0.3.1 (2022-09-13)

Exports the types `Match` and `MatchW` to workaround type errors that appear when compiling with the `declaration` compiler option enabled.

## 0.3.0 (2022-09-05)

Nullary constructors are no longer function calls, fixing an edge case unsafety. Where you previously called `mk.Member()`, now simply refer to `mk.Member`.

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
