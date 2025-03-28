import { Attrs, o, } from "elt"
import { FormContext } from "../form-context"
import { AdminWidget } from "./types"
import { $model } from "elt-shoelace"

import css from "./text.style"
import "elt-shoelace/lib/components/input"

export interface TextAttrs extends Attrs<HTMLInputElement>, AdminWidget<FormContext<any, any>, string> {
  model: o.IObservable<string | null | undefined, string>
  placeholder?: o.RO<string>
  area?: boolean
}

/**
 * A text input widget.
 */
export function Text(attrs: TextAttrs) {
  const o_model = attrs.model

  const res = attrs.area ? <sl-textarea size="small" placeholder={attrs.placeholder} class={css.text_input}>
    {$model(o_model)}
  </sl-textarea> : <sl-input size="small" placeholder={attrs.placeholder} class={css.text_input}>
    {$model(o_model)}
  </sl-input>
  return res as HTMLInputElement
}
