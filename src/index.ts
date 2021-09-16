/**
 * The library's only entrypoint. Get started with `Member` and `create`.
 *
 * @example
 * import { Member, create } from '@unsplash/sum-types'
 *
 * type Weather
 *   = Member<'Sun'>
 *   | Member<'Rain', number>
 *
 * const { mk: { Sun, Rain }, match } = create<Weather>()
 *
 * const getRainfall = match({
 *   Rain: n => `${n}mm`,
 *   Sun: () => 'none',
 * })
 *
 * const todayWeather = Rain(5)
 *
 * getRainfall(todayWeather) // '5mm'
 *
 * @since 0.1.0
 */

// Our internal structure is keyed with symbols to try and prevent anyone tying
// their code to it, with the intention being that they instead make use of
// (de)serialization.
/**
 * Symbol used to index a sum type and access its tag. Not exposed with the
 * intention that consumers make use of (de)serialization.
 */
const tagKey = Symbol("@unsplash/sum-types internal tag key")
type TagKey = typeof tagKey

/**
 * Symbol used to index a sum type and access its tag. Not exposed with the
 * intention that consumers make use of (de)serialization.
 */
const valueKey = Symbol("@unsplash/sum-types internal value key")
type ValueKey = typeof valueKey

/**
 * The `Member` type represents a single member of a sum type given a name and
 * an optional monomorphic value. A sum type is formed by unionizing these
 * members.
 *
 * @example
 * import { Member } from '@unsplash/sum-types'
 *
 * type Weather
 *   = Member<"Sun">
 *   | Member<"Rain", number>
 *
 * @since 0.1.0
 */
export interface Member<K extends string = never, A = undefined> {
  readonly [tagKey]: K
  readonly [valueKey]: A
}

export type AnyMember = Member<string, unknown>

type Tag<A extends AnyMember> = A[TagKey]
type Value<A extends AnyMember> = A[ValueKey]

/**
 * A type-level representation of the overloaded `mkConstructor` function.
 */
export type Constructor<A extends AnyMember, B> = readonly [
  B,
] extends readonly [undefined]
  ? () => A
  : (x: B) => A

/**
 * Create a constructor. Overloaded so that members without data don't have to
 * explicitly pass `undefined`.
 */
/* eslint-disable functional/functional-parameters */
export const mkConstructor =
  <A extends AnyMember>() =>
  <T extends Tag<A>, F extends Extract<A, Member<T, unknown>>>(
    k: T,
  ): Constructor<A, Value<F>> =>
    (x => ({ [tagKey]: k, [valueKey]: x } as unknown as A)) as Constructor<
      A,
      Value<F>
    >
/* eslint-enable functional/functional-parameters */

type Constructors<A extends AnyMember> = {
  readonly [V in A as Tag<V>]: Constructor<A, Value<V>>
}

// eslint-disable-next-line functional/functional-parameters
const mkConstructors = <A extends AnyMember>(): Constructors<A> =>
  new Proxy({} as Constructors<A>, {
    get: (__: Constructors<A>, tag: Tag<A>) => mkConstructor()(tag),
  })

/**
 * Symbol for declaring a wildcard case in a {@link match} expression.
 *
 * @example
 * import { Member, create, _ } from '@unsplash/sum-types'
 *
 * type Weather
 *   = Member<'Sun'>
 *   | Member<'Rain', number>
 *   | Member<'Clouds'>
 *   | Member<'Overcast', string>
 *
 * const Weather = create<Weather>()
 *
 * const getSun = Weather.match({
 *   Sun: () => 'sun',
 *   Overcast: () => 'partial sun',
 *   [_]: () => 'no sun',
 * })
 *
 * assert.strictEqual(getSun(Weather.mk.Sun()), 'sun')
 * assert.strictEqual(getSun(Weather.mk.Clouds()), 'no sun')
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

/**
 * Enables a {@link match} expression to cover only some cases provided a
 * wildcard case is declared with which to match the remaining cases.
 */
type CasesWildcard<A extends AnyMember, B> = Partial<CasesExhaustive<A, B>> & {
  readonly [_]: () => B
}

/**
 * Ensures that a {@link match} expression either covers all cases or contains
 * a wildcard for matching the remaining cases.
 */
type Cases<A extends AnyMember, B> = CasesExhaustive<A, B> | CasesWildcard<A, B>

type ReturnTypes<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  A extends Record<any, (...xs: ReadonlyArray<any>) => unknown>,
> = ReturnType<A[keyof A]>

type MatchW<A extends AnyMember> = <B extends Cases<A, unknown>>(
  fs: B,
) => (x: A) => ReturnTypes<B>

type Match<A extends AnyMember> = <B>(fs: Cases<A, B>) => (x: A) => B

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

const mkMatch =
  <A extends AnyMember>(): Match<A> => // eslint-disable-line functional/functional-parameters
  <B>(fs: Cases<A, B>) =>
  (x: A): B =>
    mkMatchW<A>()<Cases<A, B>>(fs)(x) as B

/**
 * The output of `create`, providing constructors and pattern matching.
 *
 * @since 0.1.0
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
   *   [_]: () => 'Nice weather today.',
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
   *   [_]: () => 'the return types can be different',
   * })
   *
   * @since 0.1.0
   */
  readonly matchW: MatchW<A>
}

/**
 * Create runtime constructors and a pattern matching function for a given
 * sum type.
 *
 * @example
 * import { Member, create } from '@unsplash/sum-types'
 *
 * type Weather
 *   = Member<'Sun'>
 *   | Member<'Rain', number>
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
})

/**
 * A serialized representation of our sum type, isomorphic to the sum type
 * itself. The conditional type distributes over the union members.
 */
type Serialized<A> = A extends AnyMember ? readonly [Tag<A>, Value<A>] : never

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
// This needs to be thunked because:
//   1. We want to enforce that `A` is provided, which to do with multiple type
//      arguments would require `= never`.
//   2. We want `K` to be inferred from the argument, which necessitates not
//      being provided a default type (`=`). However, it would have to have a
//      default type in order to follow `A`, which would itself have one.
export const deserialize =
  <A extends AnyMember>() => // eslint-disable-line functional/functional-parameters
  (x: Serialized<A>): A =>
    ({ [tagKey]: x[0], [valueKey]: x[1] } as unknown as A)
