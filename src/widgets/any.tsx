import { Attrs, o, e } from "elt"
import { FormContext } from "../form-context"
import { AdminWidget } from "./types"

export interface AnyAttrs extends Attrs<HTMLDivElement>, AdminWidget<FormContext<any, any>, any> {
  model: o.Observable<any>
}

/** Renders something by default as a readonly component */
export function Any(attrs: AnyAttrs) {
  const { model, ...rest } = attrs
  const res = e("div",
    { ...rest },
    model
  )
  return res
}