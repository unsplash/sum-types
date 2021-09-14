/* eslint-disable functional/functional-parameters */

import { create, _, serialize, deserialize, Member } from "../src/index"
import fc from "fast-check"
import { expectType } from "ts-expect"

describe("index", () => {
  describe("create", () => {
    describe("constructors", () => {
      it("don't distribute over union input", () => {
        type Sum = Member<"A", string | number>
        const {
          mk: { A },
        } = create<Sum>()
        expectType<(x: string | number) => Sum>(A)
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
