---
title: Serialization
nav_order: 3
---

# Serialization

The library makes use of tagged/disjoint/discriminated unions under the hood, however this is deemed an implementation detail. If you need to transfer or store a sum type, you should make use of the provided `serialize` and `deserialize` functions.

The two functions are purely reversible. `Serialized` is a tuple of the discriminant string (the sum type member name) and the value, if any. For example, given a sum type member `Member<'Rain', number>` with value `123`, its serialized form is `['Rain', 123]`.

