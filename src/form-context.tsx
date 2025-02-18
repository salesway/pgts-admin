import { o, Renderable } from "elt"
import { ModelMaker, PgtsResult, SelectBuilder } from "@salesway/pgts"


/**
  Form context tracks read-only status, global validation state and remote errors if applicable (especially in the case of Form)
 */
export class FormContext<M extends ModelMaker<any>, T extends PgtsResult<M>> {

  public constructor(
    public select: SelectBuilder<M, T>,
    public item: o.Observable<T>,
    public options: {
      readonly?: boolean,
      in_list?: boolean
    } = {},
  ) {

  }

  get o_item(): o.Observable<T["row"]> {
    const a = (o(this.item) as o.Observable<T>)
    return a.p("row")
  }

  o_validation = o(new Map<any, Renderable | null>())
  oo_is_valid = this.o_validation.tf(v => v.size === 0)

  /** Used by widgets */
  setValidation(source: any, errors: Renderable | null) {
    this.o_validation.mutate(v => {
      const new_v = new Map(v)
      if (errors == null) {
        new_v.delete(source)
      } else {
        new_v.set(source, errors)
      }
      return new_v
    })
  }

}

