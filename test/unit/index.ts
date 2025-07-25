/* eslint-disable functional/functional-parameters */

import { create, _, is, serialize, deserialize, Member } from "../../src/index"
import fc from "fast-check"

describe("index", () => {
  describe("create", () => {
    describe("constructors", () => {
      it("are reference-equal", () => {
        type Weather = Member<"Sun"> | Member<"Rain", number> | Member<"Snow">
        const Weather = create<Weather>()

        expect(Weather.mk.Sun).toBe(Weather.mk.Sun)
        expect(Weather.mk.Sun).not.toBe(Weather.mk.Snow)
        expect(Weather.mk.Sun).not.toBe(Weather.mk.Rain)
        expect(Weather.mk.Rain).toBe(Weather.mk.Rain)

        expect({ foo: Weather.mk.Sun(null) }).toEqual({
          foo: Weather.mk.Sun(null),
        })
        expect({ foo: Weather.mk.Sun(null) }).not.toEqual({
          foo: Weather.mk.Snow(null),
        })
      })
    })

    describe("members", () => {
      it("are value-equal", () => {
        type Weather = Member<"Sun"> | Member<"Rain", number>
        const Weather = create<Weather>()

        expect(Weather.mk.Sun(null)).toEqual(Weather.mk.Sun(null))
        expect(Weather.mk.Sun(null)).not.toEqual(Weather.mk.Rain(123))
        expect(Weather.mk.Rain(123)).toEqual(Weather.mk.Rain(123))
        expect(Weather.mk.Rain(123)).not.toEqual(Weather.mk.Rain(456))
      })
    })

    describe("supports pattern matching via", () => {
      type Weather =
        | Member<"Rain", number>
        | Member<"Sun">
        | Member<"Overcast", string>
      const Weather = create<Weather>()

      it("match", () => {
        const f = Weather.match({
          Rain: n => `${n}mm`,
          [_]: () => "not rain",
        })

        fc.assert(
          fc.property(fc.integer(), n =>
            expect(f(Weather.mk.Rain(n))).toBe(`${n}mm`),
          ),
        )

        expect(f(Weather.mk.Sun(null))).toBe("not rain")
      })

      it("matchW", () => {
        const f = Weather.matchW({
          Rain: n => `${n}mm`,
          [_]: () => null,
        })

        fc.assert(
          fc.property(fc.integer(), n =>
            expect(f(Weather.mk.Rain(n))).toBe(`${n}mm`),
          ),
        )

        expect(f(Weather.mk.Sun(null))).toBeNull()
      })

      it("matchX", () => {
        const f = Weather.matchX({
          Rain: "rained",
          [_]: "didn't rain",
        })

        fc.assert(
          fc.property(fc.integer(), n =>
            expect(f(Weather.mk.Rain(n))).toBe("rained"),
          ),
        )

        expect(f(Weather.mk.Sun(null))).toBe("didn't rain")
      })

      it("matchX allow undefined value", () => {
        type T = Member<"A"> | Member<"B"> | Member<"toString">
        const T = create<T>()

        const f = T.matchX({
          A: undefined,
          [_]: undefined,
        })

        expect(f(T.mk.A(null))).toBe(undefined)
        expect(f(T.mk.B(null))).toBe(undefined)
        // Check that `toString` does not match an object prototype function
        // This check would fail when the `in` operator is used instead of `hasOwnProperty`.
        expect(f(T.mk.toString(null))).toBe(undefined)
      })

      it("matchXW", () => {
        const f = Weather.matchXW({
          Rain: "rained",
          [_]: null,
        })

        fc.assert(
          fc.property(fc.integer(), n =>
            expect(f(Weather.mk.Rain(n))).toBe("rained"),
          ),
        )

        expect(f(Weather.mk.Sun(null))).toBeNull()
      })

      it("matchXW allow undefined value", () => {
        type T = Member<"A"> | Member<"B"> | Member<"toString">
        const T = create<T>()

        const f = T.matchXW({
          A: undefined,
          [_]: undefined,
        })

        expect(f(T.mk.A(null))).toBe(undefined)
        expect(f(T.mk.B(null))).toBe(undefined)
        // Check that `toString` does not match an object prototype function.
        // This check would fail when the `in` operator is used instead of `hasOwnProperty`.
        expect(f(T.mk.toString(null))).toBe(undefined)
      })
    })
  })

  describe("serialize and deserialize", () => {
    it("serialize nullary constructors to null value", () => {
      type Sum = Member<"foo"> | Member<"bar", undefined>
      const Sum = create<Sum>()

      expect(serialize(Sum.mk.foo(null))).toEqual(["foo", null])
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

      const sun = Weather.mk.Sun(null)
      expect(deserialize(Weather)(serialize(sun))).toEqual(sun)

      const rain = Weather.mk.Rain(123)
      expect(deserialize(Weather)(serialize(rain))).toEqual(rain)
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
      expect(f("Foo")((x): x is null => x === null)(T.mk.Foo(null))).toBe(true)

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
      expect(f("Foo")((x): x is null => false)(T.mk.Foo(null))).toBe(false)
    })

    it("fails bad input key", () => {
      expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        f("Food" as any)((x): x is null => x === null)(T.mk.Foo(null)),
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

      expect(f("Foo")((x): x is null => x === null)(U.mk.NotFoo(null))).toBe(
        false,
      )
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
        f("Foo")((x): x is null => x === null)({
          ...T.mk.Foo(null),
          excess: true,
        }),
      ).toBe(true)
    })
  })
})
