import { ModelMaker, PgtsResult, SelectBuilder } from "@salesway/pgts"
import { Attrs, o, e, Renderable, $click, css, $disconnected, Repeat, $scrollable, DisplayPromise } from "elt"
import { FormContext } from "../form-context"
import { AdminWidget } from "./types"
import { popup } from "elt-shoelace"

export interface ForeignAttrs<
  M extends ModelMaker<any>,
  R extends PgtsResult<M>,
  K extends keyof M["meta"]["rels"],
>
extends
  Attrs<HTMLDivElement>,
  AdminWidget<
    FormContext<M, R>,
    InstanceType<ReturnType<M["meta"]["rels"][K]["model"]>>
  >
{
  rel: K
  repr: (item: InstanceType<ReturnType<M["meta"]["rels"][K]["model"]>>) => Renderable
  select?: (s: SelectBuilder<ReturnType<M["meta"]["rels"][K]["model"]>, PgtsResult<ReturnType<M["meta"]["rels"][K]["model"]>>>) => SelectBuilder<ReturnType<M["meta"]["rels"][K]["model"]>, PgtsResult<ReturnType<M["meta"]["rels"][K]["model"]>>>
}

/** Foreign key as a Select for a single field */
export function Foreign<
  M extends ModelMaker<any>,
  R extends PgtsResult<M>,
  K extends keyof M["meta"]["rels"] & keyof R
>
(attrs: ForeignAttrs<M, R, K>): Element {
  const ctx = attrs.ctx
  const meta = ctx.select.model.meta as M["meta"]
  const o_item = ctx.item
  const rel = meta.rels[attrs.rel as string]

  const select = rel.model().select(attrs.select as any ?? ((s) => s))

  const o_expanded = o(false)

  //
  const op_repr = o_item.tf(item => {
    const prev = item[attrs.rel] as PgtsResult<any>
    if (prev != null && prev.row != null) {
      return attrs.repr(prev.row)
    }
    return JSON.stringify(item)
  })

  return <sl-button class={cls.foreign} size="small">
    {op_repr}
    {$click(ev => {
      show_values(ev.currentTarget as HTMLElement)
    })}
    <sl-icon class={[[cls.expander, {[cls.expanded]: o_expanded}]]} library="system" name="chevron-down" slot="suffix"></sl-icon>
  </sl-button> as HTMLElement

  async function show_values(anchor: HTMLElement) {
    o_expanded.set(true)
    const size = "small"
    const o_opts = o(select.fetch() as Promise<PgtsResult<any>[]>)

    popup(anchor, fut => {
      return <sl-popup
        arrow
        distance={6}
        placement="bottom"
        flip-fallback-placements="bottom top"
        flip
        sync="width"
      >
        {$disconnected(() => {
          o_expanded.set(false)
        })}
        <div class={[cls.eltsl_select_popup, o.tf(size, s => s === "small" ? cls.eltsl_popup_small : s === "large" ? cls.eltsl_popup_big : undefined)]}>
        <e-flex style={{maxHeight: "50vh"}} column nowrap>
        {$scrollable}
        {DisplayPromise(o_opts)
          .WhileWaiting(() => <sl-spinner/>)
          .WhenResolved(o_res => {

            return Repeat(o_res, (opt, i) => {
              // const o_equals = o.join(item, opt).tf(([mod, opt]) => mod === opt)
              const o_equals = o(false)
              return <e-box class={[cls.eltsl_popup_cell, {[cls.eltsl_popup_selected]: o_equals}]} pad="small">
                  {"\u200C"}
                  {$click(() => {
                    // Assign to the rel item the foreign key value
                    const val = o.get(opt)
                    const ass = {
                      [attrs.rel]: val,
                      row: rel.from_columns.reduce((acc, from_col, idx) => {
                        const to_col = rel.to_columns[idx]
                        acc[from_col] = val.row[to_col]
                        return acc
                      }, {} as any)
                    }

                    o_item.assign(ass)

                    fut.resolve(null)
                    // if (o.get(at.disabled)) return
                    // var val = o.get(opt)
                    // model?.set(fn_convert(val))
                    // fut.resolve(null)
                  })}
                  {o.tf(opt, val => attrs.repr(val.row))}
                </e-box>
              })
            })}
      </e-flex></div></sl-popup>
    })
  }
}

const cls = css`
sl-button${".foreign"} {
  width: 100%;
}

sl-button${".foreign"}::part(label) {
  flex-grow: 1;
  text-align: left;
}


${".expander"} {
  transition: var(--sl-transition-medium) rotate ease;
  rotate: 0deg;
}

${".expanded"} {
  rotate: 180deg
}

${".eltsl_select_outside"} {
  display: inline-flex;
}

${".eltsl_select_button"}::part(label) {
  flex-grow: 1;
  text-align: left;
}

${".eltsl_popup_selected"} {
  background: var(--sl-color-primary-50);
}

${".eltsl_popup_cell"}:hover {
  background: var(--sl-color-neutral-50);
}

${".eltsl_select_popup"} {
  overflow: hidden;
  padding: var(--sl-spacing-small) 0px;
  background: var(--sl-color-neutral-0);
  border-radius: var(--sl-input-border-radius-medium);
  border: 1px solid var(--arrow-color);
  box-shadow: 0 2px 4px var(--sl-color-neutral-300);
}

${".eltsl_popup_small"} {
  font-size: 0.8em;
}

${".eltsl_popup_big"} {
  font-size: 1.25em;
}

`
