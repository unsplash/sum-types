# @unsplash/sum-types

Safe, ergonomic, non-generic sum types in TypeScript.

Documentation: [unsplash.github.io/sum-types](https://unsplash.github.io/sum-types/)

Example:

```ts
import { Member, create } from "@unsplash/sum-types"

type Weather = Member<"Sun"> | Member<"Rain", number>

const {
  mk: { Sun, Rain },
  match,
} = create<Weather>()

const getRainfall = match({
  Rain: n => `${n}mm`,
  Sun: () => "none",
})

const todayWeather = Rain(5)

getRainfall(todayWeather) // '5mm'
```

## Installation

The library is available on the npm registry: [@unsplash/sum-types](https://www.npmjs.com/package/@unsplash/sum-types)

Note that due to usage of `Proxy` and `Symbol` this library only supports ES2015+.

## Motivation

The library solves a number of problems we've experienced at Unsplash with alternative libraries in this space. Specifically:

- Convenient member constructor functions are provided, unlike [ts-adt](https://github.com/pfgray/ts-adt).
- The API is small, simple, and boilerplate-free, unlike [tagged-ts](https://github.com/joshburgess/tagged-ts).
- Pattern matching is both curried and safe at arbitrary depths, unlike [@practical-fp/union-types](https://github.com/practical-fp/union-types).
- Types are not inlined in compiler output, improving readability and performance at scale, unlike [unionize](https://github.com/pelotom/unionize).

The compromise we've made to achieve this is to not support generic sum types, as in our testing we've found that they introduce unsafety into pattern matching and complicate the API. We deem this acceptable as, in our experience, in an ecosystem which already contains the likes of [fp-ts](https://github.com/gcanti/fp-ts) and [remote-data-ts](https://github.com/devexperts/remote-data-ts), non-generic sum types are good enough for almost all domain types written in real-world application code.
