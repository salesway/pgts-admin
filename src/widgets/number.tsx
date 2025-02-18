import { Attrs, o, e, $bind } from "elt"
import { FormContext } from "../form-context"
import { AdminWidget } from "./types"

export interface NumberAttrs extends Attrs<HTMLInputElement>, AdminWidget<FormContext<any, any>, number> {
  model: o.Observable<number>
}

export function Number(attrs: NumberAttrs) {
  const { model, ...rest } = attrs

  const res = e("input",
    { type: "number", ...rest },
    $bind.number(model),
  )
  return res
}