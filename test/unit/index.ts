/* eslint-disable functional/functional-parameters */

import { create, _, is, serialize, deserialize, Member } from "../../src/index"
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

      fc.assert(
        fc.property(fc.string(), fc.integer(), (k, v) => {
          const x = create<Sum>().mk[k](v)
          expect(deserialize<Sum>()(serialize(x))).toEqual(x)
        }),
      )
    })
  })

  describe("is", () => {
    type T =
      | Member<"Foo">
      | Member<"Bar", string>
      | Member<"Baz", ReadonlyArray<number>>
    const T = create<T>()
    const f = is<T>()

    it("parses according to provided refinement", () => {
      expect(f("Foo")((x): x is null => x === null)(T.mk.Foo)).toBe(true)

      expect(
        f("Bar")((x): x is string => typeof x === "string")(T.mk.Bar("ciao")),
      ).toBe(true)

      expect(
        f("Baz")(
          (x): x is ReadonlyArray<number> =>
            Array.isArray(x) && x.every(y => typeof y === "number"),
        )(T.mk.Baz([1, 2, 3])),
      ).toBe(true)
    })

    it("fails if refinement fails", () => {
      expect(f("Foo")((x): x is null => false)(T.mk.Foo)).toBe(false)
    })

    it("fails bad input key", () => {
      expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        f("Food" as any)((x): x is null => x === null)(T.mk.Foo),
      ).toBe(false)
    })

    it("fails wholly bad data", () => {
      const g = f("Foo")((x): x is null => x === null)

      expect(g(undefined)).toBe(false)
      expect(g(null)).toBe(false)
      expect(g("Foo")).toBe(false)
      expect(g(["Foo", null])).toBe(false)
      expect(g({ Foo: "Foo" })).toBe(false)
    })

    it("fails bad parsed key", () => {
      type U = Member<"NotFoo">
      const U = create<U>()

      expect(f("Foo")((x): x is null => x === null)(U.mk.NotFoo)).toBe(false)
    })

    it("fails bad parsed value", () => {
      type U = Member<"Foo", string>
      const U = create<U>()

      expect(f("Foo")((x): x is null => x === null)(U.mk.Foo("not null"))).toBe(
        false,
      )
    })

    it("tolerates excess properties", () => {
      expect(
        f("Foo")((x): x is null => x === null)({ ...T.mk.Foo, excess: true }),
      ).toBe(true)
    })
  })
})
