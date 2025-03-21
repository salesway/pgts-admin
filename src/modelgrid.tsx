
import { ModelMaker, PgtsResult, SelectBuilder } from "@salesway/pgts"

import { FieldDefinition } from "./field"
import { ModelList, ModelListOptions } from "./modellist"
import css from "./modelgrid.style"

export interface ModelGridOptions<MT extends ModelMaker<any>, Result extends PgtsResult<MT>>
extends ModelListOptions<MT, Result> {

}

export class ModelGrid<MT extends ModelMaker<any>, Result extends PgtsResult<MT>> extends ModelList<MT, Result> {

  constructor(
    select: SelectBuilder<MT, Result>,
    public fields: FieldDefinition<MT, Result>[],
    options: ModelGridOptions<MT, Result> = {},
  ) {
    super(select, (ctx) => {
      return <>
        {fields.map(Field => <Field ctx={ctx}/>)}
      </>
    }, () => {
      return <>
        {fields.map(f => <div class={css.header}>{f.label}</div>)}
      </>
    }, {
      ...options,
      container_fn: (node) => {
        node.classList.add(css.grid)
        node.style.gridTemplateColumns = `repeat(${fields.length}, auto)`
        options.container_fn?.(node)
      }
    })
  }
}

