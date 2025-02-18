import { Attrs, o, $bind } from "elt"
import { FormContext } from "../form-context"
import { AdminWidget } from "./types"

export interface TextAttrs extends Attrs<HTMLInputElement>, AdminWidget<FormContext<any, any>, string> {
  model: o.Observable<string>
}

export function Text(attrs: TextAttrs) {
  const res = <input>
    {$bind.string(attrs.model)}
  </input>
  return res as HTMLInputElement
}