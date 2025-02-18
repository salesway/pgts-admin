import { Attrs, o, e, $bind } from "elt"
import { FormContext } from "../form-context"
import { AdminWidget } from "./types"

export interface CheckboxAttrs extends Attrs<HTMLInputElement>, AdminWidget<FormContext<any, any>, boolean> {
  model: o.Observable<boolean>
}

export function Checkbox(attrs: CheckboxAttrs) {
  const { model, ...rest } = attrs
  const res = e("input",
    { type: "checkbox", ...rest },
    $bind.boolean(model),
  )
  return res
}