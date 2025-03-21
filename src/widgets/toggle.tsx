// A toggle widget

import { $click, o } from "elt"

import { Attrs, } from "elt/src/types"
import { AdminWidget } from "./types"
import { FormContext } from "../form-context"
import { $model, theme } from "elt-shoelace"

import "elt-shoelace/lib/components/switch"

export interface ToggleAttrs extends Attrs<HTMLButtonElement>, AdminWidget<FormContext<any, any>, boolean> {
  model: o.Observable<boolean>
  switch?: o.RO<boolean>
}

export function Toggle(attrs: ToggleAttrs) {
  const o_model = attrs.model

  return o.tf(attrs.switch, sw => sw ?
    <sl-switch class={theme.green}>
      {$model(attrs.model)}
    </sl-switch> as HTMLElement
    : <sl-button
    size="small"
    variant={o_model.tf(val => val ? "primary" : "default")}
    class={o_model.tf(val => val && theme.green)}
  >
    {$click(ev => {
      o_model.set(!o_model.get())
    })}
    {o_model.tf(val => val ? "✔" : "❌")}
  </sl-button> as HTMLElement) as Node
}
