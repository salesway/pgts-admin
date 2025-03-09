import { $on, Attrs, css, o, } from "elt"
import { FormContext } from "../form-context"
import { AdminWidget } from "./types"
import { $model } from "elt-shoelace"

import "elt-shoelace/lib/components/input"

export interface TextAttrs extends Attrs<HTMLInputElement>, AdminWidget<FormContext<any, any>, string> {
  model: o.Observable<string>
  complete?: () => Promise<string[]>
  "complete-on-focus"?: boolean
}

/**
 * A text input widget.
 */
export function Text(attrs: TextAttrs) {
  const o_model = attrs.model

  const res = <sl-input size="small">
    {$model(o_model)}

    {attrs.complete && $on("input", () => {
      console.log("asdf")
    })}

  </sl-input>
  return res as HTMLInputElement
}
