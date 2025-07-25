/**
 * The library's only entrypoint. Get started with `Member` and `create`.
 *
 * @example
 * import { Member, create } from "@unsplash/sum-types"
 *
 * type Weather
 *   = Member<"Sun">
 *   | Member<"Rain", number>
 *
 * const { mk: { Sun, Rain }, match } = create<Weather>()
 *
 * const getRainfall = match({
 *   Rain: n => `${n}mm`,
 *   Sun: () => "none",
 * })
 *
 * const todayWeather = Rain(5)
 *
 * getRainfall(todayWeather) // "5mm"
 *
 * @since 0.1.0
 */

/**
 * Key used to index a sum type and access its tag. Not exposed with the
 * intention that consumers make use of (de)serialization.
 */
const tagKey = "_tag"
type TagKey = typeof tagKey

/**
 * Key used to index a sum type and access its tag. Not exposed with the
 * intention that consumers make use of (de)serialization.
 */
const valueKey = "_value"
type ValueKey = typeof valueKey

/**
 * The `Member` type represents a single member of a sum type given a name and
 * an optional monomorphic value. A sum type is formed by unionizing these
 * members.
 *
 * @example
 * import { Member } from "@unsplash/sum-types"
 *
 * type Weather
 *   = Member<"Sun">
 *   | Member<"Rain", number>
 *
 * @since 0.1.0
 */
export interface Member<K extends string = never, A = null> {
  readonly [tagKey]: K
  readonly [valueKey]: A
}

/**
 * @internal
 */
export type AnyMember = Member<string, unknown>

type Tag<A extends AnyMember> = A[TagKey]
type Value<A extends AnyMember> = A[ValueKey]

type ValueByTag<A extends AnyMember, K extends Tag<A>> = Value<
  Extract<A, Member<K, unknown>>
>

/**
 * Indexes a sum union by the member tag to determine the constructor shape.
 * The third type argument can be inferred via its default.
 *
 * @internal
 */
// eslint-disable-next-line functional/prefer-readonly-type
export type Constructor<
  A extends AnyMember,
  K extends Tag<A>,
  V = ValueByTag<A, K>,
  // eslint-disable-next-line functional/prefer-readonly-type
> = (x: V) => A

/**
 * Build a constructor for a member. If the member is nullary it won't be a
 * function but a plain value.
 *
 * @internal
 */
export const mkConstructor =
  <A extends AnyMember = never>() => // eslint-disable-line functional/functional-parameters
  <T extends Tag<A>>(k: T): Constructor<A, T> =>
  v =>
    ({
      [tagKey]: k,
      [valueKey]: v,
    } as unknown as A)

type Constructors<A extends AnyMember> = {
  readonly // eslint-disable-next-line functional/prefer-readonly-type
  [V in A as Tag<V>]: Constructor<A, Tag<V>>
}

// eslint-disable-next-line functional/functional-parameters
const mkConstructors = <A extends AnyMember>(): Constructors<A> => {
  // Reuse constructors to preserve referential equality. This improves interop
  // with the likes of Jest.
  const xs = new Map<Tag<A>, Constructor<A, Tag<A>>>()

  return new Proxy({} as Constructors<A>, {
    get: (__: Constructors<A>, tag: Tag<A>) => {
      const f = xs.get(tag)
      // eslint-disable-next-line functional/no-conditional-statement
      if (f !== undefined) return f

      const g = mkConstructor<A>()(tag)
      // eslint-disable-next-line functional/no-expression-statement
      xs.set(tag, g)

      return g
    },
  })
}
/**
 * Symbol for declaring a wildcard case in a {@link match} expression.
 *
 * @example
 * import { Member, create, _ } from "@unsplash/sum-types"
 *
 * type Weather
 *   = Member<"Sun">
 *   | Member<"Rain", number>
 *   | Member<"Clouds">
 *   | Member<"Overcast", string>
 *
 * const Weather = create<Weather>()
 *
 * const getSun = Weather.match({
 *   Sun: () => "sun",
 *   Overcast: () => "partial sun",
 *   [_]: () => "no sun",
 * })
 *
 * assert.strictEqual(getSun(Weather.mk.Sun(null)), "sun")
 * assert.strictEqual(getSun(Weather.mk.Clouds(null)), "no sun")
 *
 * @since 0.1.0
 */
export const _ = Symbol("@unsplash/sum-types pattern matching wildcard")

/**
 * Ensures that a {@link match} expression covers all cases.
 */
type CasesExhaustive<A extends AnyMember, B> = {
  readonly [V in A as Tag<V>]: (val: Value<V>) => B
}

type CasesXExhaustive<A extends AnyMember, B> = {
  readonly [V in A as Tag<V>]: B
}

/**
 * Enables a {@link match} expression to cover only some cases provided a
 * wildcard case is declared with which to match the remaining cases.
 */
// Don't directly reuse `CasesExhaustive` here (via `Partial`), it causes
// exhaustive errors to always point to the absence of a wildcard.
type CasesWildcard<A extends AnyMember, B> = {
  readonly [K in keyof CasesExhaustive<A, B>]?: CasesExhaustive<A, B>[K]
} & {
  readonly [_]: () => B
}

type CasesXWildcard<A extends AnyMember, B> = {
  readonly [K in keyof CasesXExhaustive<A, B>]?: CasesXExhaustive<A, B>[K]
} & {
  readonly [_]: B
}

/**
 * Ensures that a {@link match} expression either covers all cases or contains
 * a wildcard for matching the remaining cases.
 */
// The order of this union impacts exhaustive error reporting.
type Cases<A extends AnyMember, B> = CasesWildcard<A, B> | CasesExhaustive<A, B>

type CasesX<A extends AnyMember, B> =
  | CasesXWildcard<A, B>
  | CasesXExhaustive<A, B>

type ReturnTypes<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  A extends Record<any, (...xs: ReadonlyArray<any>) => unknown>,
> = ReturnType<A[keyof A]>

/**
 * @internal
 */
export type MatchW<A extends AnyMember> = <B extends Cases<A, unknown>>(
  fs: B,
) => (x: A) => ReturnTypes<B>

/**
 * @internal
 */
export type MatchXW<A extends AnyMember> = <B extends CasesX<A, unknown>>(
  fs: B,
) => (x: A) => B[keyof B]

/**
 * @internal
 */
export type Match<A extends AnyMember> = <B>(fs: Cases<A, B>) => (x: A) => B

/**
 * @internal
 */
export type MatchX<A extends AnyMember> = <B>(fs: CasesX<A, B>) => (x: A) => B

const mkMatchW =
  <A extends AnyMember>(): MatchW<A> => // eslint-disable-line functional/functional-parameters
  <B extends Cases<A, unknown>>(fs: B) =>
  <C extends ReturnTypes<B>>(x: A): C => {
    const tag = x[tagKey] as Tag<A>

    const g = fs[tag]
    // eslint-disable-next-line functional/no-conditional-statement, @typescript-eslint/no-unsafe-return
    if (g !== undefined) return g(x[valueKey]) as C

    const h = (fs as CasesWildcard<A, B>)[_]
    // eslint-disable-next-line functional/no-conditional-statement, @typescript-eslint/no-unsafe-return
    if (h !== undefined) return h() as C

    // eslint-disable-next-line functional/no-throw-statement
    throw new Error(`Failed to pattern match against tag "${tag}".`)
  }

const mkMatchXW =
  <A extends AnyMember>(): MatchXW<A> => // eslint-disable-line functional/functional-parameters
  <B extends CasesX<A, unknown>>(fs: B) =>
  <C extends B[keyof B]>(x: A): C => {
    const tag = x[tagKey] as Tag<A>

    // eslint-disable-next-line functional/no-conditional-statement, @typescript-eslint/no-unsafe-return
    if (Object.prototype.hasOwnProperty.call(fs, tag)) return fs[tag] as C

    // eslint-disable-next-line functional/no-conditional-statement, @typescript-eslint/no-unsafe-return
    if (Object.prototype.hasOwnProperty.call(fs, _))
      return (fs as CasesXWildcard<A, B>)[_] as C

    // eslint-disable-next-line functional/no-throw-statement
    throw new Error(`Failed to pattern match against tag "${tag}".`)
  }

const mkMatch =
  <A extends AnyMember>(): Match<A> => // eslint-disable-line functional/functional-parameters
  <B>(fs: Cases<A, B>) =>
  (x: A): B =>
    mkMatchW<A>()(fs)(x) as B

const mkMatchX =
  <A extends AnyMember>(): MatchX<A> => // eslint-disable-line functional/functional-parameters
  <B>(fs: CasesX<A, B>) =>
  (x: A): B =>
    mkMatchXW<A>()(fs)(x) as B

/**
 * The output of `create`, providing constructors and pattern matching.
 *
 * @internal
 */
export interface Sum<A extends AnyMember> {
  /**
   * An object of constructors for the sum type's members.
   *
   * @since 0.1.0
   */
  readonly mk: Constructors<A>
  /**
   * Pattern match against each member of a sum type. All members must
   * exhaustively be covered unless a wildcard (@link \_) is present.
   *
   * @example
   * match({
   *   Rain: (n) => `It's rained ${n} today!`,
   *   [_]: () => "Nice weather today.",
   * })
   *
   * @since 0.1.0
   */
  readonly match: Match<A>
  /**
   * Pattern match against each member of a sum type. All members must
   * exhaustively be covered unless a wildcard (@link \_) is present. Unionises
   * the return types of the branches, hence the "W" suffix ("widen").
   *
   * @example
   * matchW({
   *   Sun: () => 123,
   *   [_]: () => "the return types can be different",
   * })
   *
   * @since 0.1.0
   */
  readonly matchW: MatchW<A>
  /**
   * Pattern match against each member of a sum type strictly, hence the "X"
   * suffix ("strict"). All members must exhaustively be covered unless a
   * wildcard (@link \_) is present.
   *
   * @example
   * matchX({
   *   Sun: 123,
   *   [_]: 456,
   * })
   *
   * @since 0.4.0
   */
  readonly matchX: MatchX<A>
  /**
   * Pattern match against each member of a sum type strictly, hence the "X"
   * suffix ("strict"). All members must exhaustively be covered unless a
   * wildcard (@link \_) is present. Unionises the return types of the branches,
   * hence the "W" suffix ("widen").
   *
   * @example
   * matchXW({
   *   Sun: 123,
   *   [_]: "the return types can be different",
   * })
   *
   * @since 0.4.0
   */
  readonly matchXW: MatchXW<A>
}

/**
 * Create runtime constructors and pattern matching functions for a given sum
 * type.
 *
 * @example
 * import { Member, create } from "@unsplash/sum-types"
 *
 * type Weather
 *   = Member<"Sun">
 *   | Member<"Rain", number>
 *
 * // Depending upon your preferences you may prefer to destructure the
 * // returned object or effectively namespace it:
 * const { mk: { Sun, Rain }, match } = create<Weather>()
 * const Weather = create<Weather>()
 *
 * @since 0.1.0
 */
// eslint-disable-next-line functional/functional-parameters
export const create = <A extends AnyMember>(): Sum<A> => ({
  mk: mkConstructors<A>(),
  match: mkMatch<A>(),
  matchW: mkMatchW<A>(),
  matchX: mkMatchX<A>(),
  matchXW: mkMatchXW<A>(),
})

/**
 * The serialized representation of a sum type, isomorphic to the sum type
 * itself.
 *
 * @since 0.1.1
 */
// The conditional type distributes over the union members.
export type Serialized<A> = A extends AnyMember
  ? readonly [Tag<A>, Value<A>]
  : never

/**
 * Serialize any sum type member into a tuple of its discriminant tag and its
 * value (if any). It is recommended that you do this for any persistent data
 * storage instead of relying upon how the library internally structures this
 * data, which is an implementation detail. Reversible by `deserialize`.
 *
 * @since 0.1.0
 */
export const serialize = <A extends AnyMember>(x: A): Serialized<A> =>
  [x[tagKey], x[valueKey]] as unknown as Serialized<A>

/**
 * Deserialize any prospective sum type member, represented by a tuple of its
 * discriminant tag and its value (if any), into its programmatic data
 * structure. Reversible by `serialize`.
 *
 * @since 0.1.0
 */
export const deserialize =
  <A extends AnyMember>(x: Sum<A>) =>
  (y: Serialized<A>): A => {
    const k: Tag<A> = y[0]
    const v: Value<A> = y[1]

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore This is unit tested.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return x.mk[k](v)
  }

/**
 * Refine a foreign value to a sum type member given its key and a refinement to
 * its value.
 *
 * This is a low-level primitive. Instead consider `@unsplash/sum-types-io-ts`.
 *
 * @example
 * import { Member, create, is } from "@unsplash/sum-types"
 *
 * type Weather
 *   = Member<"Sun">
 *   | Member<"Rain", number>
 * const Weather = create<Weather>()
 *
 * assert.strictEqual(
 *   is<Weather>()("Rain")((x): x is number => typeof x === 'number')(Weather.mk.Rain(123)),
 *   true,
 * )
 *
 * @since 0.4.0
 */
// This needs to be thunked because:
//   1. We want to enforce that `A` is provided, which to do with multiple type
//      arguments would require `= never`.
//   2. We want `B` to be inferred from the argument, which necessitates not
//      being provided a default type (`=`). However, it would have to have a
//      default type in order to follow `A`, which would itself have one.
export const is =
  <A extends AnyMember>() => // eslint-disable-line functional/functional-parameters
  <B extends Tag<A>>(k: B) =>
  (f: (mv: unknown) => mv is ValueByTag<A, B>) =>
  (x: unknown): x is A => {
    // eslint-disable-next-line functional/no-conditional-statement
    if (x === null || !["object", "function"].includes(typeof x)) return false

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const xx: any = x

    // eslint-disable-next-line functional/no-conditional-statement, @typescript-eslint/no-unsafe-member-access
    if (!(tagKey in xx) || xx[tagKey] !== k) return false

    // eslint-disable-next-line functional/no-conditional-statement, @typescript-eslint/no-unsafe-member-access
    if (!(valueKey in xx) || !f(xx[valueKey])) return false

    return true
  }
