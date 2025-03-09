import { $click, $observe_changes, $on, $scrollable, App, If, o, Renderable, VirtualScroller } from "elt"
import { ModelMaker, SelectBuilder, PgtsResult, Model } from "@salesway/pgts"

import config from "./conf"
import { FormContext } from "./form-context"
import { ModelForm } from "./modelform"
import css from "./modellist.style"


export interface ModelListOptions<MT extends ModelMaker<any>, Result extends PgtsResult<MT>> {
  side_form?: () => ModelForm<MT, Result>,
  container_fn?: (node: HTMLElement) => Renderable,
}

export class ModelList<MT extends ModelMaker<any>, Result extends PgtsResult<MT>> {

  constructor(
    public select: SelectBuilder<MT, Result>,
    public render: <R extends Result>(ctx: FormContext<MT, R>) => Renderable,
    public render_header: (list: ModelList<MT, Result>) => Renderable,
    public options: ModelListOptions<MT, Result> = {},
  ) {
  }

  o_fetched = o<Result[]>([])
  o_list = o(this.o_fetched)

  /** A map of changes */
  o_changes_history = o([] as Map<string, Result>[])
  o_changes_redo = o([] as Map<string, Result>[])

  /** Changes in the current list */
  o_changes = o(new Map<string, Result>())
  o_current = o(new Map<string, Result>())

  o_single_none = o(null) as o.Observable<null | Result>
  o_single_selected = o.proxy(this.o_single_none)

  title() {
    return this.select.model.name
  }

  undo() {
    const history = this.o_changes_history.get()
    if (history.length == 0) { return }
    const last = history[history.length - 1]

  }

  pushChange(item: Result, old: Result) {
    const map_old = new Map(this.o_changes.get())
    const map_current = new Map(this.o_current.get())
    const r = item.row as Model

    map_old.set(r.__strkey_pk, old)
    map_current.set(r.__strkey_pk, item)
    this.o_changes.set(map_old)
    this.o_current.set(map_current)
  }

  async save() {
    // Changes tells us who changed
    const changes = this.o_current.get()
    const many = [...changes.values()].map(r => r.row)

    await this.select.model.saveMany(many)

    this.o_changes.set(new Map())
    this.o_current.set(new Map())

    this.o_changes_history.set([])
    this.o_changes_redo.set([])
  }

  renderListBody() {
    return <>
      <e-flex  gap pad nowrap grow align="stretch" style={{overflow: "hidden"}}>
        {$on("keydown", ev => {
          if (ev.key == "s" && ev.ctrlKey) {
            this.save()
            ev.stopPropagation()
            ev.preventDefault()
          }
        })}

        <e-box style={{width: "auto"}} class={css.table_container}>
          {$scrollable}

          <e-box class={css.grid}>
            {this.options.container_fn && (node => {
              this.options.container_fn?.(node)
            })}
            <div class={css.header_row}>
              {this.render_header(this)}
            </div>
            {new VirtualScroller(this.o_list)
            .RenderEach((o_item) => {
              const ctx = new FormContext(this.select, o_item, {
                readonly: true, // ?
                in_list: true,
              })
              return <div class={css.list_row}>
                {$observe_changes(o_item, (item: Result, old) => {
                  this.pushChange(item, old)
                })}
                {$click(ev => {
                  if (ev.defaultPrevented) return
                  this.o_single_selected.changeTarget(o_item)
                }
                )}
                {this.render(ctx)}
                {/* {ctrl._list_renderers.map(r => <div>{r.render(o_item, true)}</div>)} */}
              </div> as Renderable
            })
            }
          </e-box>
        </e-box>
        {this.options.side_form && If(this.o_single_selected, (o_item) => {
          const frm = this.options.side_form!()
          return <e-box relative style={{flexShrink: "1"}}>
            <sl-button style={{position: "absolute", top: "0", right: "0"}} size="small" variant="default">
              {$click(() => this.o_single_selected.changeTarget(this.o_single_none))}
              ×
            </sl-button>
            {frm._renderForm(o_item)}
          </e-box>
        })}
        <e-box>

        </e-box>
      </e-flex>
      <e-flex>
        {/* <div>Selected {ctrl.o_list_selected.p("size")} / {ctrl.o_fetched.p("length")}</div> */}
      </e-flex>
    </>
  }

  async fetch() {
    const list = await this.select.fetch()
    this.o_fetched.assign(list)
    this.o_list.assign(list)
  }

  asService() {

    return async (srv: App.Service<{[K in keyof MT["meta"]["pk_fields"]]: string}>) => {
      this.fetch()
      await srv.require(import("./admin-base"))

      srv.view("Toolbar", () => <>
        <e-box grow>{this.title()}</e-box>
        {If(this.o_current.p("size"), () => <sl-button size="small" variant="primary">
          {$click(() => this.save())}
          Enregistrer
        </sl-button>)}
        <sl-button size="small" variant="primary">
          {$click(() => this.createModal())}
          Créer 🞤
        </sl-button>
      </>)

      srv.view(config.view_content, () => this.renderListBody())

    }
  }

  createModal() {
    const frm = this.options.side_form!()
    frm.showModal()
  }
}
