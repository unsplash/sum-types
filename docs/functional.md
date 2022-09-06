---
title: Functional interop
nav_order: 4
---

# Functional interop

The library is written with the functional programming ecosystem in mind. [Pattern matching](./pattern-matching.html) is curried to faciliate partial application, including in pipelines.

```ts
import * as Sum from "@unsplash/sum-types"
import { pipe } from "fp-ts/function"

type Weather = Sum.Member<"Sun"> | Sum.Member<"Rain", number>

declare const weather: Weather
const status = pipe(
  weather,
  Weather.match({
    Sun: () => "Sunny out!",
    Rain: () => "Remember your umbrella.",
  }),
)

const getRainfall: (x: Weather) => string = Weather.match({
  Rain: n => `${n}mm`,
  Sun: () => "0mm",
})
```

[@unsplash/sum-types-fp-ts](https://github.com/unsplash/sum-types-fp-ts) provides [fp-ts](https://github.com/gcanti/fp-ts) bindings, enabling things like equivalence checks via [`Eq`](https://gcanti.github.io/fp-ts/modules/Eq.ts.html).
