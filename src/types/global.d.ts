type Nullable<T> = T | undefined | null;
type Brand<T, B extends string> = T & { readonly _brand: B };