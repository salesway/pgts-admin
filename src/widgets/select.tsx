import { $bind, $class, $click, $disconnected, $observe, $on, $scrollable, Attrs, DisplayPromise, o, Renderable, Repeat, sym_insert } from "elt"

import { AdminWidget } from "./types"
import { FormContext } from "../form-context"

import css from "./select-css"
import { Future, popup } from "elt-shoelace"
import { SlPopup } from "elt-shoelace/lib/components"

/**
 There are three use cases:
  1. As a regular Select
    - Can be multiple or single
    - Can have a search box that goes into the popup
  2. As an editable input
    - No search box - the editable input *is* the search box
*/

export class SelectCtrl<T, ST = T> {

  constructor(public attrs: SelectAttrs<T, ST>) {

  }

  // oo_items = o.Observable<T[]>([])
  ;[sym_insert](el: HTMLElement) {
    this.el_select = el

    if (el.previousElementSibling instanceof HTMLInputElement) {
      this.el_input = el.previousElementSibling
    }
  }

  el_select!: HTMLElement
  el_input: HTMLInputElement | null = null

  o_showing_values = o(false)
  o_search = o("")
  o_focused_idx = o(0)

  oo_options = o.join(o.tf(this.attrs.options, opt => Promise.resolve(opt)), this.o_search)
    .tf(([opts, search], old, prev: o.NoValue | {abort_controller: AbortController, options: Promise<ST[]>}) => {
      const abort_controller = new AbortController()

      if (prev !== o.NoValue) {
        prev.abort_controller.abort()
      }

      return {
        abort_controller,
        options: opts.then(op => {
          if (typeof op === "function") {
            return op(search, abort_controller)
          }
          return op
        }).then(opts => {
          const ex = this.attrs.extract
          this.o_current_options.set((opts as ST[]).map(o => ({
            option: ex?.(o) ?? o, repr: o
          })) as {option: T, repr?: ST}[])
          return opts as ST[]
        })}
    })

  o_current_options = o([] as {option: T, repr?: ST}[])

  get editable() {
    return this.attrs.editable
  }

  // getOptions(search: o.ReadonlyObservable<string>): o.ReadonlyObservable<Promise<ST[]>> {
  //   return o.join(
  //     this.attrs.options,
  //     search,
  //   ).tf(([opts, search]) => Promise.resolve(opts)
  //     .then(opts => {
  //       if (typeof opts === "function") {
  //         return opts(search) as ST[] // not entirely true
  //       }
  //       return opts as ST[]
  //     }).then(opts => {
  //       this.o_current_options.set(opts)
  //       this.o_focused_idx.set(0)
  //       return opts
  //     })
  //   )
  // }

  handleFocus(anchor: HTMLElement) {
    if (!this.attrs.complete) {
      setTimeout(() => {
        this.show(anchor)
      }, 100)
    }
  }

  clear() {
    this.attrs.model.set(null)
  }

  selectValue(val: T) {
    if (this.attrs.multiple) {
      const vals = new Set(o.get(this.attrs.model) ?? [])
      if (vals.has(val)) {
        vals.delete(val)
      } else {
        vals.add(val)
      }
      this.attrs.model.set([...vals])
    } else {
      this.attrs.model.set(val)
      this.tryClose()
    }
  }

  handleKeydown(ev: KeyboardEvent) {
    const focused_idx = this.o_focused_idx.get()
    const opts = this.o_current_options.get()

    if (!this.o_showing_values.get()) {
      if ((ev.key === "Enter" || ev.key === " " || ev.key === "ArrowDown" || ev.key === "ArrowUp" || ev.key === "PageDown" || ev.key === "PageUp")) {
        this.show(ev.currentTarget as HTMLElement)
      }
      return
    }

    if (ev.key === "ArrowDown") {
      this.o_focused_idx.set(Math.min(focused_idx + 1, opts.length - 1))
    } else if (ev.key === "PageDown") {
      this.o_focused_idx.set(Math.min(focused_idx + 10, opts.length - 1))
    } else if (ev.key === "ArrowUp") {
      this.o_focused_idx.set(Math.max(focused_idx - 1, 0))
    } else if (ev.key === "PageUp") {
      this.o_focused_idx.set(Math.max(focused_idx - 10, 0))
    } else if (ev.key === "Enter") {
      const focused_opt = opts[focused_idx]
      if (focused_opt) {
        this.selectValue(focused_opt.option)
      }
    } else if (ev.key === "Escape") {
      this.tryClose()
    } else {
      return
    }

    ev.preventDefault()
    ev.stopPropagation()
  }

  tryClose() {
    if (this.resolve_promise) {
      this.el_select.focus()
      this.resolve_promise.resolve(null)
      this.resolve_promise = null
    }
  }

  handleBlur() {
    // Check that focus isn't instead in the popup.
    setTimeout(() => {
      if (this.popup?.contains(document.activeElement as Node)) {
        return
      }
      console.log("handleBlur", this.popup, document.activeElement)
      this.tryClose()
    }, 100)
  }

  resolve_promise: Future<any> | null = null
  popup: SlPopup | null = null

  evalEvent(ev: MouseEvent | FocusEvent | TouchEvent) {
    //
  }

  show(anchor: HTMLElement) {
    // o_expanded.set(true)
    if (this.o_showing_values.get()) {
      return
    }
    this.o_showing_values.set(true)
    this.o_focused_idx.set(0)

    this.resolve_promise = popup(anchor, fut => {
      return <sl-popup
        arrow
        distance={6}
        placement="bottom"
        flip-fallback-placements="bottom top"
        flip
        sync="width"
      >
        {node => { this.popup = node }}

        {$observe(this.oo_options, () => { })}

        {$click(ev => {
          ev.stopPropagation()
        })}

        {$disconnected(() => {
          this.popup = null
          this.o_showing_values.set(false)
        })}

        <div class={css.select_popup}>

          {this.attrs.searchable && <div class={css.search_box}>
            <input size="small" class={css.input} placeholder="Search">
              {$bind.string(this.o_search)}
              {$disconnected(ev => {
                this.el_select.tabIndex = 0
              })}
              {node => {
                this.el_select.tabIndex = -1
                setTimeout(() => {
                  node.focus()
                }, 1)
              }}
            </input>
          </div>}

          <e-flex style={{maxHeight: "50vh"}} column nowrap tabindex={-1}>

            {$on("mousedown", ev => {
              // prevent the popup from closing when clicking on it, otherwise input blur is called and we want it to keep the focus
              ev.stopPropagation()
              ev.preventDefault()
            })}

            {$scrollable}
            {DisplayPromise(this.oo_options.p("options"))
              .WhileWaiting(() => <div class={css.loading_cont}><sl-spinner/></div>)
              .WhenResolved(o_res => {
                const labelfn = this.attrs.render_option

                return Repeat(this.o_current_options, (opt, o_idx) => {
                  const o_equals = o.join(this.attrs.model, opt).tf(([mod, opt]) => {
                    if (Array.isArray(mod)) {
                      return mod.includes(opt.option)
                    }
                    return mod === opt.option
                  })

                  return <e-flex gap="small" align="baseline" class={[
                    css.item,
                    o_equals.tf(v => v && css.item_selected),

                  ]}>
                    {node => {
                      $class(this.o_focused_idx.tf(i => {
                        const c = i === o.get(o_idx) && css.item_highlighted
                        if (c) {
                          node.scrollIntoView({block: "nearest", behavior: "smooth"})
                        }
                        return c
                      }))(node)
                    }}
                      {$click(() => {
                        if (o.get(this.attrs.disabled)) return
                        this.selectValue(o.get(opt).option)
                        if (!this.attrs.multiple) {
                          fut.resolve(null)
                        }
                      })}
                      <e-box grow>
                        {"\u200C"}
                        {o.tf(opt, val => labelfn?.(val.repr ?? val.option as any) ?? val?.option?.toString())}
                      </e-box>
                      {o_equals.tf(v => v && <span>✓</span>)}
                    </e-flex>
                  })
                })}
        </e-flex>
      </div>
    </sl-popup>
    }, anchor)

    this.resolve_promise.finally(() => {
      this.resolve_promise = null
      this.o_showing_values.set(false)
    })

  }

}

export function Select<T, ST = T>(attrs: SelectAttrs<T, ST>) {
  const ctrl = new SelectCtrl(attrs)

  return <div class={css.select} tabindex={0}>

    {$click(ev => {
      ev.stopPropagation()
      if ((ev.target as Element).closest("sl-popup")) {
        return
      }
      ctrl.show(ev.currentTarget as HTMLElement)
    })}

    {$on("focusin", ev => {
      ev.currentTarget.scrollIntoView({block: "nearest", behavior: "smooth"})
      ctrl.show(ev.currentTarget as HTMLElement)
      ev.stopPropagation()
    })}

    {$on("keydown", ev => {
      ctrl.handleKeydown(ev)
    })}


    {attrs.multiple && Repeat(attrs.model, o_m => <e-flex inline gap="2x-small" align="baseline" class={css.tag} part="tag" >
      {o.tf(o_m, m => <span>{attrs.render?.(m as any) ?? m?.toString()}</span>)}
      {attrs.tag_click_removes && [$click(ev => {
        ev.preventDefault()
        ctrl.selectValue(o.get(o_m) as T)
      }), <span>×</span>]}
    </e-flex>)}

    {!attrs.multiple && <span>{o.tf(attrs.model, m => attrs.render?.(m as any) ?? m?.toString())}</span>}

    {ctrl}

    <span class={[css.arrow, ctrl.o_showing_values.tf(v => v && css.arrow_open)]}>▿</span>
    {attrs.clearable && <span>
      {$click(() => {
        ctrl.clear()
      })}
      ×
    </span>}

  </div>

}

Select.css = css


export type Options<T> =
  | T[]
  | Promise<T[]>
  | o.ReadonlyObservable<T[]>
  | o.ReadonlyObservable<Promise<T[]>>
  | ((search: string) => T[])
  | ((search: string, abort: AbortController) => Promise<T[]>)


export interface BaseSelectAttrs<T, ST> extends Attrs<HTMLDivElement>, AdminWidget<FormContext<any, any>, T> {
  extract?: (item: ST) => T
  options: Options<ST>
  size?: o.RO<"small" | "medium" | "large">
  complete?: number // how many characters to type before showing results. If 0, there is no input.
  clearable?: boolean
  disabled?: boolean
  editable?: boolean
  searchable?: boolean
  search_create?: true | ((v: string) => T)
  render?: (item: T) => Renderable
}

export interface SimpleOptions<T> {
  options: Options<T>
}

export interface ComplexOptions<T, ST> {
  options: Options<ST>
  extract: (item: ST) => T
  render_option: (item: ST) => Renderable
}

export interface SingleSelectAttrs<T, ST> extends BaseSelectAttrs<T, ST> {
  model: o.Observable<T | null>
  multiple?: false
}

export interface MultipleSelectAttrs<T, ST> extends BaseSelectAttrs<T, ST> {
  model: o.Observable<T[] | null>
  tag_click_removes?: boolean
  multiple: true
}

export type SelectOrMultipleAttrs<T, ST = T> = SingleSelectAttrs<T, ST> | MultipleSelectAttrs<T, ST>
export type SelectAttrs<T, ST = T> = SelectOrMultipleAttrs<T, ST> & (SimpleOptions<T> | ComplexOptions<T, ST>)
