# @unsplash/sum-types

Safe, ergonomic, non-generic sum types in TypeScript.

Documentation: [unsplash.github.io/sum-types](https://unsplash.github.io/sum-types/)

> [!NOTE]
> @unsplash/sum-types is no longer actively maintained as we've migrated to the [Effect](https://effect.website) ecosystem.

```ts
import * as Sum from "@unsplash/sum-types"

type Weather = Sum.Member<"Sun"> | Sum.Member<"Rain", number>
const Weather = Sum.create<Weather>()

const getRainfall = Weather.match({
  Rain: n => `${n}mm`,
  Sun: () => "none",
})

const todayWeather = Weather.mk.Rain(5)

getRainfall(todayWeather) // '5mm'
```

## Installation

The library is available on the npm registry: [@unsplash/sum-types](https://www.npmjs.com/package/@unsplash/sum-types)

Note that due to usage of `Proxy` and `Symbol` this library only supports ES2015+.

The following bindings are also available:

- [@unsplash/sum-types-fp-ts](https://github.com/unsplash/sum-types-fp-ts)
- [@unsplash/sum-types-io-ts](https://github.com/unsplash/sum-types-io-ts)
- [@unsplash/sum-types-fast-check](https://github.com/unsplash/sum-types-fast-check)

## Motivation

The library solves a number of problems we've experienced at Unsplash with alternative libraries in this space. Specifically:

- Convenient member constructor functions are provided, unlike [ts-adt](https://github.com/pfgray/ts-adt).
- The API is small, simple, and boilerplate-free, unlike [tagged-ts](https://github.com/joshburgess/tagged-ts).
- Pattern matching is curried for use in pipeline application and function composition, unlike [@practical-fp/union-types](https://github.com/practical-fp/union-types).
- Types are not inlined in compiler output, improving readability and performance at scale, unlike [unionize](https://github.com/pelotom/unionize).

The compromise we've made to achieve this is to [not support generic sum types](https://unsplash.github.io/sum-types/generics.html).
