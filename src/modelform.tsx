import { ModelMaker, PgtsResult, SelectBuilder, PgtsWhere } from "@salesway/pgts"
import { App, css, o, Renderable } from "elt"
import { FormContext } from "./form-context"
import config from "./conf"


/**
 How does a Form know whether it's operating as Add or Edit?
 */
export class ModelForm<MT extends ModelMaker<any>, Result extends PgtsResult<MT>> {

  public constructor(
    public readonly select_base: SelectBuilder<MT, Result>,
    public readonly render: (ctx: FormContext<MT, Result>) => Renderable,
    _conf?: Partial<typeof config>,
  ) {
    this.config = { ...config, ..._conf }
    // A Form only works with a single object.s
    // this.select_base = select_base.limit(1)
  }

  config: typeof config

  async get<A extends {[K in keyof MT["meta"]["pk_fields"]]: InstanceType<MT>[K]}>(...values: A) {

  }

  async getItem(where: PgtsWhere<MT>): Promise<Result | undefined> {
    // needs some where ?
    const res = await this.select_base.where(where).fetch()
    if (res.length === 0) {
      return undefined
    }
    return res[0]
  }

  /** setup observables. What form container ? */
  _doRender(initial_value?: Result) {
    // When do we ask for an initial value ?
    // When do we try to get the item ?

    const o_result = o(initial_value) as o.Observable<Result>
    const ctx = new FormContext(this.select_base, o_result, o(false))
    const frm = <div class={C.form_container}>
      {this.render(ctx)}
    </div>
    return frm
  }

  showModal(): Promise<Result> {
    // Show the form in a modal
  }

  /**
   *
   */
  asService(): (srv: App.Service<{[K in MT["meta"]["pk_fields"][number]]: InstanceType<MT>[K]}>) => void {
    const meta = this.select_base.model.meta

    return async (srv) => {
      const pk1 = meta.pk_fields.reduce((acc, pk) => {
        const val = srv.param(pk)
        if (val == undefined || acc == undefined) { return undefined }
        acc.push([pk, "eq", val])
        return acc
      }, [] as PgtsWhere<MT>[] | undefined)

      const item = pk1 ? (await this.select_base.where(...pk1).fetch())[0] : this.select_base.empty()

      // Get the pk from the params
      srv.view(config.view_main, () => {
        return <div>{this._doRender(item)}</div>
      })

    }

  }

}


const C = css`
${".form_container"} {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

${".label"} {
  font-weight: bold;
}

`

export { C as css }
