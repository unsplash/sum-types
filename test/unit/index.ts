/* eslint-disable functional/functional-parameters */

import { create, _, serialize, deserialize, Member } from "../../src/index"
import fc from "fast-check"

describe("index", () => {
  describe("create", () => {
    describe("constructors", () => {
      it("are reference-equal", () => {
        type Weather = Member<"Sun"> | Member<"Rain", number> | Member<"Snow">
        const Weather = create<Weather>()

        expect(Weather.mk.Sun).toEqual(Weather.mk.Sun)
        expect(Weather.mk.Sun).not.toEqual(Weather.mk.Snow)
        expect(Weather.mk.Sun).not.toEqual(Weather.mk.Rain)
        expect(Weather.mk.Rain).toEqual(Weather.mk.Rain)

        expect({ foo: Weather.mk.Sun }).toEqual({ foo: Weather.mk.Sun })
        expect({ foo: Weather.mk.Sun }).not.toEqual({ foo: Weather.mk.Snow })
      })
    })

    describe("members", () => {
      it("are value-equal", () => {
        type Weather = Member<"Sun"> | Member<"Rain", number>
        const Weather = create<Weather>()

        expect(Weather.mk.Sun).toEqual(Weather.mk.Sun)
        expect(Weather.mk.Sun).not.toEqual(Weather.mk.Rain(123))
        expect(Weather.mk.Rain(123)).toEqual(Weather.mk.Rain(123))
        expect(Weather.mk.Rain(123)).not.toEqual(Weather.mk.Rain(456))
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

        expect(f(Weather.mk.Sun)).toBe("not rain")
      })
    })
  })

  describe("serialize and deserialize", () => {
    it("serialize nullary constructors to null value", () => {
      type Sum = Member<"foo"> | Member<"bar", undefined>
      const Sum = create<Sum>()

      expect(serialize(Sum.mk.foo)).toEqual(["foo", null])
      expect(serialize(Sum.mk.bar(undefined))).toEqual(["bar", undefined])
    })

    it("are reversible", () => {
      type Sum = Member<string, number>
      const Sum = create<Sum>()

      fc.assert(
        fc.property(fc.string(), fc.integer(), (k, v) => {
          const x = create<Sum>().mk[k](v)
          expect(deserialize(Sum)(serialize(x))).toEqual(x)
        }),
      )
    })

    it("deserializations are reference-equal", () => {
      type Weather = Member<"Sun"> | Member<"Rain", 123>
      const Weather = create<Weather>()

      const sun = Weather.mk.Sun
      expect(deserialize(Weather)(serialize(sun))).toEqual(sun)

      const rain = Weather.mk.Rain(123)
      expect(deserialize(Weather)(serialize(rain))).toEqual(rain)
    })
  })
})
