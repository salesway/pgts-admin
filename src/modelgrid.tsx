
import { ModelMaker, PgtsResult, SelectBuilder } from "@salesway/pgts"

import { FieldDefinition } from "./field"
import { ModelList, ModelListOptions } from "./modellist"
import { css } from "elt"


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
        {fields.map(f => <div class={grid_css.header}>{f.label}</div>)}
      </>
    }, {
      ...options,
      container_fn: (node) => {
        node.classList.add(grid_css.grid)
        node.style.gridTemplateColumns = `repeat(${fields.length}, auto)`
        options.container_fn?.(node)
      }
    })
  }
}

const grid_css = css`
${".grid"} {
  display: inline-grid;
  grid-template-columns: subgrid;
  align-items: start;
  align-content: start;
}

${".header"} {
  font-weight: bold;
  font-size: 0.75em;
  padding: 4px 0;
}

${".row"}, ${".header_row"} {
  display: grid;
  grid-template-columns: subgrid;
  padding: 0 8px;
  grid-columns: 1 / -1;
}
`