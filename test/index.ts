/* eslint-disable functional/functional-parameters */

import {
  create,
  _,
  serialize,
  deserialize,
  Member,
  matchOn,
  match,
} from "../src/index"
import fc from "fast-check"
import { pipe } from "fp-ts/function"
import * as A from "fp-ts/ReadonlyArray"

declare const xs: ReadonlyArray<{ readonly prop: string }>
export const _a = pipe(
  xs,
  A.map(x => x.prop),
)
type Y = Member<"Y1">
declare const y: Y
// TODO: return type inferred as unknown
export const _b = pipe(y, match({ Y1: () => 123 }))

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
