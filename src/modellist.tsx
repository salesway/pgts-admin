import { $click, $observe, $scrollable, App, css, If, o, Renderable, VirtualScroller } from "elt"
import { ModelMaker, SelectBuilder, PgtsResult } from "@salesway/pgts"

import config from "./conf"
import { FormContext } from "./form-context"
import { ModelForm } from "./modelform"


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

  o_single_none = o(null) as o.Observable<null | Result>
  o_single_selected = o.proxy(this.o_single_none)

  title() {
    return this.select.model.name
  }

  renderListBody() {
    return <>
      <e-flex gap pad nowrap grow align="stretch" style={{overflow: "hidden"}}>
        <e-box style={{width: "auto"}} class={admin_css.table_container}>
          {$scrollable}

          <e-box class={admin_css.grid}>
            {this.options.container_fn && (node => {
              this.options.container_fn?.(node)
            })}
            <div class={admin_css.header_row}>
              {this.render_header(this)}
            </div>
            {new VirtualScroller(this.o_list)
            .RenderEach((o_item) => {
              const ctx = new FormContext(this.select, o_item, {
                readonly: true, // ?
                in_list: true,
              })
              return <div class={admin_css.list_row}>
                {$click(ev => {
                  if (ev.defaultPrevented) return
                  this.o_single_selected.changeTarget(o_item)
                  console.log(o_item.get().row.username, this.o_single_selected.get())
                }
                )}
                {this.render(ctx)}
                {/* {ctrl._list_renderers.map(r => <div>{r.render(o_item, true)}</div>)} */}
              </div> as Renderable
            })
            }
          </e-box>
        </e-box>
        {$observe(this.o_single_selected, (item) => {
          console.log("??", item)
        })}
        {this.options.side_form && If(this.o_single_selected, (o_item) => {
          const frm = this.options.side_form!()
          console.log("??")
          return <e-box style={{flexShrink: "1"}}>
            {frm._renderForm(this.o_single_selected)}
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
        <sl-button size="small" variant="primary">Ajouter</sl-button>
      </>)

      srv.view(config.view_content, () => this.renderListBody())

    }
  }
}

const admin_css = css`
  ${".grid"} {
    position: relative;
    display: grid;
    gap: 8px;
    justify-content: start;
  }

  ${".table_container"} {
    border: 1px solid var(--sl-color-primary-200);
  }

  ${".row"}, ${".list_row"}, ${".header_row"} {
    grid-column-start: 1;
    grid-column-end: -1;
    min-height: 1px;
    display: grid;
    grid-template-columns: subgrid;
    padding: 0 8px;
    cursor: pointer;
  }

  ${".list_row"}:hover {
    background: var(--sl-color-primary-50);
  }

  ${".header_row"} {
    position: sticky;
    top: 0;
    background: var(--sl-color-neutral-0);
    border-bottom: 1px solid var(--sl-color-primary-200);
    z-index: 1;
  }
`
