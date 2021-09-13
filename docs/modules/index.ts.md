---
title: index.ts
nav_order: 1
parent: Modules
---

## index overview

The library's only entrypoint. Get started with `Member`, `create`, and
`matchOn`.

**Example**

```ts
import { Member, create, matchOn } from '@unsplash/sum-types'

type Weather = Member<'Sun'> | Member<'Rain', number>

const { Rain } = create<Weather>()

const getRainfall = matchOn<Weather>()({
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
  - [match](#match)
  - [matchOn](#matchon)
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
import { Member, create, matchOn, _ } from '@unsplash/sum-types'

type Weather = Member<'Sun'> | Member<'Rain', number> | Member<'Clouds'> | Member<'Overcast', string>

const { Sun, Clouds } = create<Weather>()

const getSun = matchOn<Weather>()({
  Sun: () => 'sun',
  Overcast: () => 'partial sun',
  [_]: () => 'no sun',
})

assert.strictEqual(getSun(Sun()), 'sun')
assert.strictEqual(getSun(Clouds()), 'no sun')
```

Added in v0.1.0

## create

Create runtime constructors for a given sum type.

**Signature**

```ts
export declare const create: <A extends AnyMember>() => Constructors<A>
```

**Example**

```ts
import { Member, create } from '@unsplash/sum-types'

type Weather = Member<'Sun'> | Member<'Rain', number>

// Depending upon your preferences you may prefer to destructure the
// returned object or effectively namespace it:
const { Sun, Rain } = create<Weather>()
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

## match

Pattern match against each member of a sum type. All members must
exhaustively be covered unless a wildcard (@link \_) is present.

**Signature**

```ts
export declare const match: <A extends AnyMember, B>(fs: Cases<A, B>) => (x: A) => B
```

**Example**

```ts
import { Member, create, match, _ } from '@unsplash/sum-types'

type Weather = Member<'Sun'> | Member<'Rain', number> | Member<'Clouds'> | Member<'Overcast', string>

const { Sun, Rain } = create<Weather>()

const getRainMsg: (x: Weather) => string = match({
  Rain: (n) => `It's rained ${n}mm today!`,
  [_]: () => 'Nice weather today.',
})

assert.strictEqual(getRainMsg(Rain(5)), "It's rained 5mm today!")
assert.strictEqual(getRainMsg(Sun()), 'Nice weather today.')
```

Added in v0.1.0

## matchOn

Pattern match against each member of a sum type. All members must
exhaustively be covered unless a wildcard (@link \_) is present.

The same as (@link match), except the type argument representing the sum type
is thunked for use in circumstances in which TypeScript cannot infer its
type.

**Signature**

```ts
export declare const matchOn: <A extends AnyMember>() => <B>(fs: Cases<A, B>) => (x: A) => B
```

**Example**

```ts
import { Member, create, matchOn, _ } from '@unsplash/sum-types'

type Weather = Member<'Sun'> | Member<'Rain', number> | Member<'Clouds'> | Member<'Overcast', string>

const { Sun, Rain } = create<Weather>()

const getRainMsg = matchOn<Weather>()({
  Rain: (n) => `It's rained ${n}mm today!`,
  [_]: () => 'Nice weather today.',
})

assert.strictEqual(getRainMsg(Rain(5)), "It's rained 5mm today!")
assert.strictEqual(getRainMsg(Sun()), 'Nice weather today.')
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
