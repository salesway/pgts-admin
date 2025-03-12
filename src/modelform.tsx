import { ModelMaker, PgtsResult, SelectBuilder, PgtsWhere } from "@salesway/pgts"
import { $click, $scrollable, App, css, o, Renderable } from "elt"
import { FormContext } from "./form-context"
import config from "./conf"
import { show } from "elt-shoelace"


export interface ModalOptions<MT extends ModelMaker<any>, Result extends PgtsResult<MT>> {
  initial?: Result | o.Observable<Result>
  on_validate?: (item: Result) => boolean | Promise<boolean>
  label_save?: Renderable
  label_cancel?: Renderable
}


/**
 How does a Form know whether it's operating as Add or Edit?
 */
export class ModelForm<MT extends ModelMaker<any>, Result extends PgtsResult<MT>> {

  public constructor(
    public readonly select: SelectBuilder<MT, Result>,
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
    const res = await this.select.where(where).fetch()
    if (res.length === 0) {
      return undefined
    }
    return res[0]
  }

  /** setup observables. What form container ? */
  _renderForm(initial_value?: Result | o.Observable<Result>) {
    // When do we ask for an initial value ?
    // When do we try to get the item ?

    const o_original = o(initial_value)
    const o_result = o(initial_value) as o.Observable<Result>

    const ctx = new FormContext(this.select, o_result, {
      in_list: false,
      readonly: false,
    })

    const frm = <div class={C.form_container}>
      {$scrollable}
      {this.render(ctx)}
    </div>
    return frm
  }

  async showModal(options?: ModalOptions<MT, Result>) {
    return show<Result>(fut => {
      const o_item = o<Result>(options?.initial as Result ?? {row: new this.select.model()} as Result)

      return <sl-dialog no-header>
        <e-box>
          {this._renderForm(o_item)}
        </e-box>
        <e-flex slot="footer" gap justify="end">
          <sl-button variant="default" size="small">
            {$click(() => fut.reject(null!))}
            {options?.label_cancel ?? "Cancel"}
          </sl-button>
          <sl-button variant="primary" size="small">
            {$click(async () => {
              if (options?.on_validate) {
                const res = await options.on_validate(o_item.get())
                if (res) {
                  fut.resolve(o_item.get())
                }
              } else {
                fut.resolve(o_item.get())
              }
            })}
            {options?.label_save ?? "Save"}
          </sl-button>
        </e-flex>
      </sl-dialog>

    })    // Show the form in a modal

  }

  _renderControls() {
    return <div>
      <sl-button>Save</sl-button>
      <sl-button>Cancel</sl-button>
    </div>
  }

  /**
   *
   */
  asService(): (srv: App.Service<{[K in MT["meta"]["pk_fields"][number]]: InstanceType<MT>[K]}>) => void {
    const meta = this.select.model.meta

    return async (srv) => {

      const pk1 = meta.pk_fields.reduce((acc, pk) => {
        const val = srv.param(pk)
        if (val == undefined || acc == undefined) { return undefined }
        acc.push([pk, "eq", val])
        return acc
      }, [] as PgtsWhere<MT>[] | undefined)

      const item = pk1 ? (await this.select.where(...pk1).fetch())[0] : this.select.empty()

      // Get the pk from the params
      srv.view(config.view_main, () => {
        return <div>{this._renderForm(item)}</div>
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
