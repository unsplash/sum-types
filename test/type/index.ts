/* eslint-disable functional/functional-parameters, functional/no-expression-statement */

import { create, Member, mkConstructor } from "../../src/index"

//# constructors don't distribute over union input
type A = Member<"A1", string | number>
const {
  mk: { A1 },
} = create<A>()
A1 // $ExpectType (x: string | number) => A

//# match does not unionise match branch return types
type B = Member<"B1", string> | Member<"B2", number>
const { match } = create<B>()
match({ B1: () => 123, B2: () => "hello" }) // $ExpectError

//# matchW unionises branch return types
type C = Member<"C1", string> | Member<"C2", number>
const { matchW } = create<C>()
// $ExpectType (x: C) => string | number
matchW({ C1: () => 123, C2: () => "hello" })

type D = Member<"C1", string> | Member<"C2", number> | Member<"C3">

// $ExpectType (x: string) => D
const constructor1 = mkConstructor<D>()("C1")

// $ExpectError
constructor1(2)
constructor1("2")

// $ExpectType (x: number) => D
const constructor2 = mkConstructor<D>()("C2")

constructor2(2)
// $ExpectError
constructor2("2")

const newLocal = mkConstructor<D>()
// $ExpectType () => D
const constructor3 = newLocal("C3")

constructor3()
// $ExpectError
constructor3(1)
