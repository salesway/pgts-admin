import { o } from "elt"

import { ModelMaker, PGWhere, SelectBuilder } from "@salesway/pgts"


export class FormController<MT extends ModelMaker<any>, Result> {

  constructor(
    public readonly select: SelectBuilder<MT, Result>,
  ) {

  }

  /** */
  async getItem(key: string): Promise<Result> {
    const values = key.split("\u200c").map(v => v.trim())
    const model = this.select.model
    const select = (this.select).where(...values.map((v, i) => [model.meta.pk_fields[i], "eq", v]) as PGWhere<MT>)
    return (await select.fetch())[0] as Result
  }

  /** Render the form */
  render!: (item: o.Observable<Result>) => HTMLElement
}
