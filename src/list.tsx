import { App, $click, $scrollable, VirtualScroller, Renderable, css } from "elt"

import { } from "elt-shoelace"

import config from "./conf"
import routes from "./routes"
import ListController from "./list-controller"
/**
 *
 * @param srv
 */
export default async function AdminList(srv: App.Service) {

  const ctrl = new ListController()

  srv.view(config.view_main, () => {
    return <div>List</div>
  })

  srv.view(config.view_content, () => {
    return <>
      <e-flex column pad nowrap grow align="start" >
        <e-box grow style={{width: "auto"}} class={admin_css.table_container}>
          {$scrollable}

          <e-box class={admin_css.grid} style={{
            gridTemplateColumns: `repeat(${ctrl.nb_columns}, auto)`,
          }}>
            <div class={admin_css.header_row}>
              {ctrl._list_renderers.map(r => r.label)}
            </div>
            {new VirtualScroller(ctrl.o_fetched)
            .RenderEach((o_item, o_idx) => {
              return <div class={admin_css.list_row}>
                {$click(ev => {
                  if (ev.defaultPrevented) return
                  routes.admin.single.activate({
                    model: mod, key: ctrl.key(o_item.get())
                  })
                }
                )}
                {ctrl._list_renderers.map(r => <div>{r.render(o_item, true)}</div>)}
              </div> as Renderable
            })
            }
          </e-box>
        </e-box>
      </e-flex>
      <e-flex>
        <div>Selected {ctrl.o_list_selected.p("size")} / {ctrl.o_fetched.p("length")}</div>
      </e-flex>
    </>
  })
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
