import { Attrs, css, o } from "elt"
import { PgtsResult, ModelMaker, SelectBuilder, Model, PgtsWhere } from "@salesway/pgts"
import { AdminWidget } from "./types"
import { FormContext } from "../form-context"
import { ModelList } from "../modellist"


export function ForeignList<
  Source extends ModelMaker<any>,
  Destination extends PgtsResult<any>,
  K extends keyof Extract<Source["meta"]["rels"], {is_array: true, model: () => Destination}>,
>(attrs: ForeignListAttrs<Source, Destination, K>) {
  const ctx = attrs.ctx
  const k = attrs.rel
  const rel = ctx.select.model.meta.rels[k as any] //as {is_array: true, model: () => any}
  const modellist = attrs.modellist()

  return <e-flex column class={cls["inline_list"]}>
    {modellist.asInline()}
    {ctx.item.path("row", "__strkey_pk").tf(() => {
      const item = ctx.item.get().row
      const where: PgtsWhere<any>[] = rel.to_columns.map((c, idx): PgtsWhere<any> => [c, "eq", item[rel.from_columns[idx]]])
      modellist.fetch(...where)
    })}
  </e-flex>

}


export interface ForeignListAttrs<
  Source extends ModelMaker<any>,
  Destination extends PgtsResult<any>,
  K extends keyof Extract<Source["meta"]["rels"], {is_array: true, model: () => Destination}>,
>
extends
  Attrs<HTMLDivElement>,
  AdminWidget<
    FormContext<Source, PgtsResult<Source>>,
    Destination["row"]
> {
  rel: K
  modellist: () => ModelList<any, Destination>
}


const cls = css`
${".inline_list"} {
  min-height: 420px;

}
`