
export type ValidationFn<T> = (model: T) => Promise<string | undefined>
