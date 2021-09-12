# sum-types-ts

Safe, ergonomic, non-generic sum types in TypeScript.

Documentation: [unsplash.github.io/sum-types-ts](https://unsplash.github.io/sum-types-ts/)

Example:

```ts
import { Member, create } from 'sum-types-ts'

type Weather
  = Member<'Sun'>
  | Member<'Rain', number>

const { mk: { Sun, Rain }, match } = create<Weather>()

const getRainfall = match({
  Rain: n => `${n}mm`,
  Sun: () => 'none',
})

const todayWeather = Rain(5)

getRainfall(todayWeather) // '5mm'
```

## Installation

The library is available on the npm registry under the same package name: [sum-types-ts](https://www.npmjs.com/package/sum-types-ts)

Note that due to usage of `Proxy` and `Symbol` this library only supports ES2015+.

## Motivation

TODO compare against other libs

## Trade-offs

TODO
