import { Model, ModelMaker, PgtsResult, SelectBuilder } from "@salesway/pgts"
import { Attrs, Renderable } from "elt"
import { FormContext } from "../form-context"
import { AdminWidget } from "./types"
// import { popup } from "elt-shoelace"
import { default_render } from "./default-render"

import { options, Select } from "./select"

export interface ForeignAttrs<
  M extends ModelMaker<any>,
  R extends PgtsResult<M>,
  K extends keyof M["meta"]["rels"],
>
extends
  Attrs<HTMLDivElement>,
  AdminWidget<
    FormContext<M, R>,
    InstanceType<ReturnType<M["meta"]["rels"][K]["model"]>>
  >
{
  rel: K
  repr?: (item: InstanceType<ReturnType<M["meta"]["rels"][K]["model"]>>) => Renderable
  select?: (s: SelectBuilder<ReturnType<M["meta"]["rels"][K]["model"]>, PgtsResult<ReturnType<M["meta"]["rels"][K]["model"]>>>) => SelectBuilder<ReturnType<M["meta"]["rels"][K]["model"]>, PgtsResult<ReturnType<M["meta"]["rels"][K]["model"]>>>
}

/** Foreign key as a Select for a single field */
export function Foreign<
  M extends ModelMaker<any>,
  R extends PgtsResult<M>,
  K extends keyof M["meta"]["rels"] & keyof R
>
(attrs: ForeignAttrs<M, R, K>): Element {
  const ctx = attrs.ctx
  const meta = ctx.select.model.meta as M["meta"]
  const o_item = ctx.item
  const rel = meta.rels[attrs.rel as string]

  const select = rel.model().select(attrs.select as any ?? ((s) => s))

  function repr(item: InstanceType<ReturnType<M["meta"]["rels"][K]["model"]>>) {
    return attrs.repr?.(item) ?? (item as Model)?.repr?.(ctx) ?? default_render(item)
  }

  return <Select
    searchable
    ctx={ctx}
    model={o_item.p(attrs.rel)}
    options={
      options(() => select.fetch() as Promise<PgtsResult<M>[]>)
      .render(item => repr(item?.row))
      .fallbackRender(item => repr(item?.row))
    }
  /> as Element

}
