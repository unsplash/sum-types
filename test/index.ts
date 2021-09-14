/* eslint-disable functional/functional-parameters, functional/no-expression-statement */

import { create, _, serialize, deserialize, Member } from "../src/index"
import fc from "fast-check"

describe("index", () => {
  describe("create", () => {
    describe("constructors", () => {
      it("don't distribute over union input", () => {
        type Sum = Member<"A", string | number>
        const {
          mk: { A },
        } = create<Sum>()
        A // $ExpectType (x: string | number) => Sum
      })
    })

    describe("pattern match function", () => {
      it("can pattern match", () => {
        type Weather =
          | Member<"Rain", number>
          | Member<"Sun">
          | Member<"Overcast", string>
        const Weather = create<Weather>()
        const f = Weather.match({
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

      it("unionises matchW branch return types", () => {
        type Sum = Member<"A", string> | Member<"B", number>
        const { matchW } = create<Sum>()
        // $ExpectType (x: Sum) => string | number
        matchW({ A: () => 123, B: () => "hello" })
      })
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
