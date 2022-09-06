---
title: Home
nav_order: 1
---

# @unsplash/sum-types

Safe, ergonomic, non-generic sum types in TypeScript.

## What are sum types?

From a TypeScript perspective we can think of sum types as superpowered enums. Sum types:

- Can hold arbitrary data, not only string and number literals.
- Come with exhaustive [pattern matching](./pattern-matching.html) out of the box.
- Are safer than enums with respect to [this issue](https://www.aaron-powell.com/posts/2020-05-27-the-dangers-of-typescript-enums/).

### Why the name?

Sum types are [algebraic data types](https://en.wikipedia.org/wiki/Algebraic_data_type), a well established concept in type theory and functional programming. There are also product types, such as tuples and records.

## Why not enums?

Enums can't hold arbitrary data, so things become complicated as soon as you need something other than string or number literals.

It's common for enums to implicitly be used to hold special data, such as string literals expected back from an API, making changes in confidence difficult. This also couples your internal domain representation to something external. Sum types must be explicitly [serialized](./serialization.html), bypassing these problems.

Enums have a habit of being narrowed to specific members by the type system, making unification difficult. Sum types on the other hand, by design, always refer to the entire sum.

On the plus side for enums, language server support for things like renaming members is superior to what a library like this can offer.

## Why not unions?

Sum types are implemented via discriminated unions, however this should be considered an irrelevant implementation detail.

Unions don't offer pattern matching. Instead you must write a match function per-union by hand, or use imperative, unergonomic switch statements.

Non-discriminated unions don't give a distinct identity to each member. Consider a fallible function in which the happy and unhappy path both return a string. `string | string = string`, so it's not possible to determine the outcome.

Discriminated unions a la fp-ts are implicitly serializable. This can be problematic given it's an implementation detail, hence [serialization](./serialization.html). Additionally these are verbose and error-prone to write by hand.
