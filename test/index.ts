/* eslint-disable functional/functional-parameters */

import {
  create,
  _,
  serialize,
  deserialize,
  Member,
  matchOn,
} from "../src/index"
import fc from "fast-check"

describe("index", () => {
  describe("matchOn", () => {
    it("can pattern match with a wildcard", () => {
      type Weather =
        | Member<"Rain", number>
        | Member<"Sun">
        | Member<"Overcast", string>
      const { Rain, Sun } = create<Weather>()
      const f = matchOn<Weather>()({
        Rain: n => `${n}mm`,
        [_]: () => "not rain",
      })

      fc.assert(
        fc.property(fc.integer(), n => expect(f(Rain(n))).toBe(`${n}mm`)),
      )

      expect(f(Sun())).toBe("not rain")
    })
  })

  describe("serialize and deserialize", () => {
    it("are reversible", () => {
      type Sum = Member<string, number>

      fc.assert(
        fc.property(fc.string(), fc.integer(), (k, v) => {
          const x = create<Sum>()[k](v)
          expect(deserialize<Sum>()(serialize(x))).toEqual(x)
        }),
      )
    })
  })
})
