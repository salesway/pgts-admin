// A toggle widget

import { $click, o } from "elt"

import { Attrs, } from "elt/src/types"
import { AdminWidget } from "./types"
import { FormContext } from "../form-context"
import { theme } from "elt-shoelace"

export interface ToggleAttrs extends Attrs<HTMLButtonElement>, AdminWidget<FormContext<any, any>, boolean> {
  model: o.Observable<boolean>
}

export function Toggle(attrs: ToggleAttrs) {
  const o_model = attrs.model

  return <sl-button
    size="small"
    variant={o_model.tf(val => val ? "primary" : "default")}
    class={o_model.tf(val => val && theme.green)}
  >
    {$click(ev => {
      o_model.set(!o_model.get())
    })}
    {o_model.tf(val => val ? "✔" : "❌")}
  </sl-button> as HTMLElement
}
