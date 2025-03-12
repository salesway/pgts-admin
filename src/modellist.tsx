import { $click, $observe, $observe_changes, $on, $scrollable, App, If, o, Renderable, RepeatScroll, tf_array_filter, VirtualScroll, VirtualScroller } from "elt"
import { ModelMaker, SelectBuilder, PgtsResult, Model, PgtsWhere } from "@salesway/pgts"

import config from "./conf"
import { FormContext } from "./form-context"
import { ModalOptions, ModelForm } from "./modelform"
import css from "./modellist.style"
import { $model, modal } from "elt-shoelace"


export interface ModelListOptions<MT extends ModelMaker<any>, Result extends PgtsResult<MT>> {
  side_form?: () => ModelForm<MT, Result>,
  create_form?: () => ModelForm<MT, Result>,
  allow_create?: boolean | (() => o.assign.AssignPartial<Result> | Promise<o.assign.AssignPartial<Result>>)
  allow_delete?: boolean
  container_fn?: (node: HTMLElement) => Renderable,
  local_search?: (item: Result, search: string) => boolean
  title?: Renderable
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
  o_search = o("")

  oo_display_list = this.options.local_search ? this.o_list.tf(tf_array_filter(this.o_search.tf(search => {

    if (search === "") {
      return () => true
    }

    const fn = this.options.local_search ?? (() => true)

    return (element: Result) => {
      return fn(element, search)
    }
  }))) : this.o_list

  /** A map of changes */
  o_changes_history = o([] as Map<string, Result>[])
  o_changes_redo = o([] as Map<string, Result>[])

  /** Changes in the current list */
  o_changes = o(new Map<string, Result>())
  o_current = o(new Map<string, Result>())

  o_single_none = o(null) as o.Observable<null | Result>
  o_single_selected = o.proxy(this.o_single_none)

  title() {
    return this.options.title ?? this.select.model.name
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

  asInline() {
    // this.fetch()
    return <>
      {this.renderListBody()}
    </>
  }

  renderListBody() {
    return <>
      <e-flex gap pad nowrap grow align="stretch" style={{overflow: "hidden"}}>
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
            {RepeatScroll(this.oo_display_list, (o_item, n) => {

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
          return <e-flex column relative gap nowrap>
            <sl-button style={{position: "absolute", top: "0", right: "0"}} size="small" variant="default">
              {$click(() => this.o_single_selected.changeTarget(this.o_single_none))}
              ×
            </sl-button>
            {frm._renderForm(o_item)}
            <e-flex justify="end" gap>
              {this.options.allow_delete &&
                <sl-button size="small" variant="primary">
                {$click(async () => {
                  await modal({
                    title: "Supprimer",
                    text: "Êtes-vous sûr de vouloir supprimer cet élément ?",
                    agree: "Supprimer",
                    disagree: "Annuler",
                  }).then(async (res) => {
                    if (res) {
                      await o_item.get().row.delete()
                      this.o_fetched.mutate(fet => fet.filter(r => r.row.__strkey_pk != o_item.get().row.__strkey_pk))
                      this.o_list.mutate(list => list.filter(r => r.row.__strkey_pk != o_item.get().row.__strkey_pk))
                      this.o_changes.mutate(map => {
                        map.delete(o_item.get().row.__strkey_pk)
                        return map
                      })
                      this.o_current.mutate(map => {
                        map.delete(o_item.get().row.__strkey_pk)
                        return map
                      })
                      this.o_single_selected.changeTarget(this.o_single_none)
                    }
                  })
                })}
                Supprimer 💀
                </sl-button>
              }
            </e-flex>
          </e-flex>
        })}
        <e-box>

        </e-box>
      </e-flex>
      <e-flex>
        {/* <div>Selected {ctrl.o_list_selected.p("size")} / {ctrl.o_fetched.p("length")}</div> */}
      </e-flex>
    </>
  }

  async fetch(...where: PgtsWhere<any>[]) {
    const select = where.length ? this.select.where(...where) : this.select
    const list = await select.where(...where).fetch()
    this.o_fetched.assign(list)
    this.o_list.assign(list)
  }

  asService() {

    return async (srv: App.Service<any>) => {
      this.fetch()
      await srv.require(import("./admin-base"))

      srv.view("Toolbar", () => <>
        <e-box>{this.title()}</e-box>
        {this.options.local_search && <sl-input placeholder="Rechercher" size="small">{$model(this.o_search)}</sl-input>}

        {/** Spacer */}
        <e-box grow data-desc="spacer"></e-box>

        {If(this.o_current.p("size"), () => <sl-button size="small" variant="primary">
          {$click(() => this.save())}
          Enregistrer
        </sl-button>)}
        {this.options.allow_create && If(this.options.allow_create, () => <sl-button size="small" variant="primary">
          {$click(async () => {
            let empty = this.select.empty()
            if (typeof this.options.allow_create === "function") {
              const res = await this.options.allow_create()
              empty = o.assign(empty, res)
            }
            this.createModal({
              initial: empty
            })
          })}
          Créer 🞤
        </sl-button>)}
      </>)

      srv.view(config.view_content, () => this.renderListBody())

    }
  }

  createModal(options: ModalOptions<MT, Result>) {
    const frm = (this.options.create_form ?? this.options.side_form)!()
    frm.showModal({
      label_save: "Créer 🞤",
      on_validate: async (item) => {
        const sv = await item.row.save() as Result
        if (sv) {
          this.o_fetched.mutate(fet => [...fet, sv])
          const o_last = this.o_fetched.p(this.o_fetched.get().length - 1)
          this.o_single_selected.changeTarget(o_last)
          return true
        }
        return false
      },
      ...options
    })
  }
}
