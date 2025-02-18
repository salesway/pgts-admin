import { Attrs, NRO } from "elt"

export interface LabelAttrs extends Attrs<HTMLDivElement> {
  label: NRO<string>
}

export function Label(attrs: LabelAttrs) {
  return <div>{attrs.label}</div>
}