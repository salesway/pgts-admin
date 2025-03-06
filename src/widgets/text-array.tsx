import { $on, Attrs, css, o, } from "elt"
import { FormContext } from "../form-context"
import { AdminWidget } from "./types"
import { $model } from "elt-shoelace"

import "elt-shoelace/lib/components/input"

export interface TextArrayAttrs extends Attrs<HTMLInputElement>, AdminWidget<FormContext<any, any>, string[]> {
  model: o.Observable<string[]>
  values: string[]
  "complete-on-focus"?: boolean
}

/**
 * A text input widget.
 */
export function TextArray(attrs: TextArrayAttrs) {
  const ctx = attrs.ctx

  const original = o.get(attrs.model)
  const o_model = attrs.model
  const oo_changed = o_model.tf(v => v !== original)

  const o_propositions = o(null as null | string[])

  const res = <sl-input size="small">
    {$model(o_model)}

  </sl-input>
  return res as HTMLInputElement
}

const cls = css`
${".changed"} {
  --sl-primary-color: #f0f0f0;

}
`
