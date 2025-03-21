import { Renderable } from "elt"
import { FormContext } from "../form-context"
import { Model } from "@salesway/pgts"

declare module "@salesway/pgts" {
  interface Model {
    repr(ctx?: FormContext<any, any>): Renderable
  }
}

Model.prototype.repr = function(this: Model, ctx: FormContext<any, any>) {
  const meta = this.__meta
  // return the primary key
  const pk = meta.pk_fields
  return pk.map(f => (this as any)[f]?.toString()).join("|")
}

export * from "./types"
export * from "./default-render"
export * from "./text"
export * from "./number"
export * from "./checkbox"
export * from "./date"
export * from "./any"
export * from "./foreign"
export * from "./foreign-list"
export * from "./label"
export * from "./section"
export * from "./select"
export * from "./toggle"