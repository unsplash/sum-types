---
title: Pattern matching
nav_order: 2
---

# Pattern matching

Pattern matching is exposed via the `match` method returned by `create`. This function is monomorphic to the sum type that's been created; this bypasses some type unsafety we observed with a polymorphic solution. It's curried out of the box.

Two forms of pattern matching are supported by the same function, exhaustive and wildcard.

## Exhaustive

By default pattern matching is exhaustive. This means that the compiler will flag up any constructors unaccounted for.

```ts
MySum.match({
  X: f,
  Y: g,
  // If there are other members we haven't accounted for, the compiler will
  // flag this for us here.
})
```

## Wildcard

By adding the `_` wildcard symbol case, pattern matching ceases to be exhaustive and instead any cases unaccounted for are handed to the wildcard callback.

```ts
MySum.match({
  X: f,
  Y: g,
  // Any remaining members will be handled by the wildcard callback. Note that
  // whilst it's idiomatic to place the wildcard at the end, its position does
  // not matter.
  [_]: h,
})
```
