import { Attrs, o, e, $bind } from "elt"
import { FormContext } from "../form-context"
import { AdminWidget } from "./types"

export interface DateAttrs extends Attrs<HTMLInputElement>, AdminWidget<FormContext<any, any>, Date> {
  model: o.Observable<Date>
}

export function Date(attrs: DateAttrs) {
  const { model, ...rest } = attrs
  const res = e("input",
    { type: "date", ...rest },
    $bind.date(model),
  )
  return res
}