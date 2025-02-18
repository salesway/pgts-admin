
import { ModelMaker, PgtsResult, SelectBuilder } from "@salesway/pgts"

import { FieldDefinition } from "./field"
import { ModelList } from "./modellist"


export class ModelGrid<MT extends ModelMaker<any>, Result extends PgtsResult<MT>> extends ModelList<MT> {

  constructor(
    public select: SelectBuilder<MT, Result>,
    public fields: FieldDefinition<Result>[],
  ) {
    super(select)
  }
}