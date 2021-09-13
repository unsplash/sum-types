/* eslint-disable functional/functional-parameters */

import { create, _, serialize, deserialize, Member, match, matchOn } from "../src/index"
import fc from "fast-check"

describe("index", () => {
  describe("create", () => {
    it("can pattern match", () => {
      type Weather =
        | Member<"Rain", number>
        | Member<"Sun">
        | Member<"Overcast", string>
      const Weather = create<Weather>()
      const f = matchOn<Weather>()({
        Rain: n => `${n}mm`,
        [_]: () => "not rain",
      })

      fc.assert(
        fc.property(fc.integer(), n =>
          expect(f(Weather.mk.Rain(n))).toBe(`${n}mm`),
        ),
      )

      expect(f(Weather.mk.Sun())).toBe("not rain")
    })
  })

  describe("serialize and deserialize", () => {
    it("are reversible", () => {
      type Sum = Member<string, number>

      fc.assert(
        fc.property(fc.string(), fc.integer(), (k, v) => {
          const x = create<Sum>().mk[k](v)
          expect(deserialize<Sum>()(serialize(x))).toEqual(x)
        }),
      )
    })
  })
})

// testing polymorphic match
/* eslint-disable */
type A = Member<'A1'> | Member<'A2', B>
type B = Member<'B1'> | Member<'B2', C>
type C = Member<'C1'> | Member<'C2', string>

const x = () => 123

// Expect: A -> number
const f = matchOn<A>()({
  A1: x,
  A2: match({
    B1: x,
    B2: match({
      C1: x,
      C2: x,
      // Expect excess property error
      pls: x,
    }),
  }),
})
