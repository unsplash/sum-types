---
title: index.ts
nav_order: 1
parent: Modules
---

## index overview

The library's only entrypoint. Get started with `Member` and `create`.

**Example**

```ts
import { Member, create } from '@unsplash/sum-types'

type Weather = Member<'Sun'> | Member<'Rain', number>

const {
  mk: { Sun, Rain },
  match,
} = create<Weather>()

const getRainfall = match({
  Rain: (n) => `${n}mm`,
  Sun: () => 'none',
})

const todayWeather = Rain(5)

getRainfall(todayWeather) // '5mm'
```

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Member (interface)](#member-interface)
  - [\_](#_)
  - [create](#create)
  - [deserialize](#deserialize)
  - [serialize](#serialize)

---

# utils

## Member (interface)

The `Member` type represents a single member of a sum type given a name and
an optional monomorphic value. A sum type is formed by unionizing these
members.

**Signature**

```ts
export interface Member<K extends string = string, A = undefined> {
  readonly [tagKey]: K
  readonly [valueKey]: A
}
```

**Example**

```ts
import { Member } from '@unsplash/sum-types'

type Weather = Member<'Sun'> | Member<'Rain', number>
```

Added in v0.1.0

## \_

Symbol for declaring a wildcard case in a {@link match} expression.

**Signature**

```ts
export declare const _: typeof _
```

**Example**

```ts
import { Member, create, _ } from '@unsplash/sum-types'

type Weather = Member<'Sun'> | Member<'Rain', number> | Member<'Clouds'> | Member<'Overcast', string>

const Weather = create<Weather>()

const getSun = Weather.match({
  Sun: () => 'sun',
  Overcast: () => 'partial sun',
  [_]: () => 'no sun',
})

assert.strictEqual(getSun(Weather.mk.Sun()), 'sun')
assert.strictEqual(getSun(Weather.mk.Clouds()), 'no sun')
```

Added in v0.1.0

## create

Create runtime constructors and a pattern matching function for a given
sum type.

**Signature**

```ts
export declare const create: <A extends AnyMember>() => Sum<A>
```

**Example**

```ts
import { Member, create } from '@unsplash/sum-types'

type Weather = Member<'Sun'> | Member<'Rain', number>

// Depending upon your preferences you may prefer to destructure the
// returned object or effectively namespace it:
const {
  mk: { Sun, Rain },
  match,
} = create<Weather>()
const Weather = create<Weather>()
```

Added in v0.1.0

## deserialize

Deserialize any prospective sum type member, represented by a tuple of its
discriminant tag and its value (if any), into its programmatic data
structure. Reversible by `serialize`.

**Signature**

```ts
export declare const deserialize: <A extends AnyMember>() => (x: Serialized<A>) => A
```

Added in v0.1.0

## serialize

Serialize any sum type member into a tuple of its discriminant tag and its
value (if any). It is recommended that you do this for any persistent data
storage instead of relying upon how the library internally structures this
data, which is an implementation detail. Reversible by `deserialize`.

**Signature**

```ts
export declare const serialize: <A extends AnyMember>(x: A) => Serialized<A>
```

Added in v0.1.0