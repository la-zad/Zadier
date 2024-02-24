/**
 * Either a promise or the result of said promise.
 */
type Awaitable<T> = T | PromiseLike<T>;

/**
 * An object or null.
 */
type Option<T> = T | null;

/**
 * Represent any function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fn = (...args: any) => any;

/**
 * Makes the hover overlay more readable.
 */
type Prettify<T> = {
    [K in keyof T]: T[K];
} & NonNullable<unknown>;

/////////////////////////////////////////////////////
///////            Key extractions            ///////
/////////////////////////////////////////////////////
/**
 * Returns a union type with all methods key names.
 */
type MethodsKeyNames<T> = Exclude<
    {
        [K in keyof T]: T[K] extends Fn ? K : never;
    }[keyof T],
    undefined
>;

/**
 * Returns a union type with all properties key names.
 */
type PropsKeyNames<T> = keyof Omit<T, MethodsKeyNames<T>>;

/**
 * Returns a union type with all non nullable members.
 */
type NonNullMembersNames<T> = Exclude<
    {
        [K in keyof T]: null extends T[K] ? never : K;
    }[keyof T],
    undefined
>;

/**
 * Returns a union type with all non undefined members.
 */
type NonOptionnalMembersNames<T> = Exclude<
    {
        [K in keyof T]: undefined extends T[K] ? never : K;
    }[keyof T],
    undefined
>;

/////////////////////////////////////////////////////
///////            Type reductions            ///////
/////////////////////////////////////////////////////

/**
 * Returns a type containing only the members uniques to T.
 */
type UniqueProps<T, U> = Omit<T, keyof U>;

/**
 * Only keeps methods within a type.
 */
type ExtractMethods<T> = Pick<T, MethodsKeyNames<T>>;

/**
 * Only keeps propeties within a type.
 */
type ExtractProps<T> = Pick<T, PropsKeyNames<T>>;

/**
 * Only keeps non nullable members within a type.
 */
type ExtractNonNull<T> = Pick<T, NonNullMembersNames<T>>;

/**
 * Only keeps non optionnal members within a type.
 */
type ExtractNonOptionnal<T> = Pick<T, NonOptionnalMembersNames<T>>;
