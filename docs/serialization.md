---
title: Serialization
nav_order: 3
---

# Serialization

The library makes use of tagged/disjoint/discriminated unions under the hood, however this is deemed an implementation detail. If you need to transfer or store a sum type, you should make use of the provided `serialize` and `deserialize` functions.

The two functions are purely reversible. `Serialized` is a tuple of the discriminant string (the sum type member name) and the value, if any. For example, given a sum type member `Member<'Rain', number>` with value `123`, its serialized form is `['Rain', 123]`.

## io-ts

For something more powerful and plugging into a broader ecosystem, consider [@unsplash/sum-types-io-ts](https://github.com/unsplash/sum-types-io-ts).

```ts
import * as Sum from '@unsplash/sum-types'
import * as t from 'io-ts'
import { getCodecFromStringlyMappedNullaryTag } from '@unsplash/sum-types-io-ts'

type Weather = Sum.Member<'Sun'> | Sum.Member<'Rain'>
const Weather = Sum.create<Weather>()

const Response = t.type({
  weather: getCodecFromStringlyMappedNullaryTag<Weather>()({
    Sun: 'sun',
    Rain: 'rain',
  }),
})

Response.decode({ weather: 'rain' }) // Right({ weather: Weather.mk.Rain })

Response.encode({ weather: Weather.mk.Rain }) // { weather: 'rain' }
```
