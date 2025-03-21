import { $bind, $class, $click, $disconnected, $on, $scrollable, Attrs, DisplayPromise, If, o, Renderable, Repeat, sym_insert } from "elt"

import { AdminWidget } from "./types"
import { FormContext } from "../form-context"

import css from "./select-css"
import { Future, popup } from "elt-shoelace"
import { SlPopup } from "elt-shoelace/lib/components"

export function options<T>(options: Options<T>): OptionsCtrl<T> {
  return new OptionsCtrl(options)
}

export interface FullOption<T, ST> {
  option: T
  value: ST
  key?: any
}


/** Manage options for a Select */
export class OptionsCtrl<R, T = R> {

  constructor(public options: Options<R>) { }

  o_search = o("")

  // o_options = o(Promise.resolve([]) as Promise<ST[]>)
  o_filter = o(null as null | ((search: string, item: R, value: T, key: any) => boolean))

  sync_options: FullOption<R, T>[] = []

  o_options = o.merge({opts: this.options, search: this.o_search}).tf<Promise<FullOption<R, T>[]>>(({opts, search}, old, prev) => {

    if (old !== o.NoValue && old.opts === opts && this.o_filter.get()) {
      return prev as Promise<FullOption<R, T>[]>
    }

    const populate_map = (opts: R[]) => {
      const res: FullOption<R, T>[] = []
      for (const opt of opts) {
          let value = (this._map?.(opt) ?? opt) as T
          let k = this._key?.(value)
          res.push({option: opt, value, key: k})
        }
      this.sync_options = res
      return res
    }

    if (typeof opts === "function") {
      return (Promise.resolve(opts(search, new AbortController())) as Promise<R[]>).then(populate_map)
    }

    return (Promise.resolve(opts) as Promise<R[]>).then(populate_map)
  })

  sync_visible_options = [] as FullOption<R, T>[]
  oo_visible_options = o.join(this.o_options, this.o_search, this.o_filter).tf(([opts, search, filter]) => {
    if (!filter || !search) {
      return opts.then(opts => {
        this.sync_visible_options = opts
        return opts
      })
    }

    return opts.then(op => {
      this.sync_visible_options = op.filter(item => filter(search, item.option, item.value, item.key))
      return this.sync_visible_options
    })
  })

  /** The options are searchable only if the provided function takes arguments, or only if a filter function is provided. */
  searchable = typeof this.options === "function" && this.options.length > 1

  _map: ((opt: R) => T) | null = null
  _render: ((opt: R) => Renderable) = (t) => t?.toString()
  _fallback_render: ((opt: T) => Renderable) = (t) => t?.toString()
  _key: ((opt: T) => string) | null = null
  _creator: ((opt: string) => T | Promise<T>) | null = null

  localFilter(fn: (search: string, item: R) => boolean) {
    this.o_filter.set(fn)
    this.searchable = true
    return this
  }

  key(fn: (opt: T) => string) {
    this._key = fn
    return this
  }

  /** Map needs to be a bijection. When we have map */
  map<T2>(fn: (opt: T) => T2): OptionsCtrl<T, T2> {
    (this as any)._map = fn
    return this as unknown as OptionsCtrl<T, T2>
  }

  render(fn: (opt: R) => Renderable) {
    this._render = fn
    return this
  }

  searchCreates(fn: (opt: string) => T | Promise<T>) {
    this._creator = fn
    return this
  }

  fallbackRender(fn: (opt: T) => Renderable) {
    this._fallback_render = fn
    return this
  }

}

/**
 There are three use cases:
  1. As a regular Select
    - Can be multiple or single
    - Can have a search box that goes into the popup
  2. As an editable input
    - No search box - the editable input *is* the search box
*/

export class SelectCtrl<T> {

  constructor(public attrs: SelectAttrs<T>) { }

  opts: OptionsCtrl<T> = this.attrs.options instanceof OptionsCtrl ? this.attrs.options : options(this.attrs.options)

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
  o_focused_idx = o(0)

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

  selectCreator() {

    const creator = this.opts._creator
    if (!creator) {
      return
    }
    const search = this.opts.o_search.get()
    Promise.resolve(creator(search)).then(val => {
      this.selectValue(val)
    })
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
    const opts = this.opts.sync_visible_options

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

      if ((focused_opt == null || ev.ctrlKey) && this.opts._creator) {
        this.selectCreator()
      }

      if (focused_opt) {
        this.selectValue(focused_opt.value)
      }
    } else if (ev.key === "Escape") {
      this.tryClose()
    } else {
      return
    }

    ev.preventDefault()
    ev.stopPropagation()
  }

  tryClose(keep_focus = true) {
    if (this.resolve_promise) {
      if (keep_focus) { this.el_select.focus() }
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
      this.tryClose(false)
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

        {$click(ev => {
          ev.stopPropagation()
        })}

        {$disconnected(() => {
          this.popup = null
          this.o_showing_values.set(false)
        })}

        <div class={[css.select_popup]}>

          {this.opts.searchable && <div class={css.search_box}>
            <input size="small" class={css.input} placeholder="Search">
              {$bind.string(this.opts.o_search)}
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
            {this.opts._creator && If(this.opts.o_search, () => <span class={css.create_button} >
            🞤
              {$click(() => {
                this.selectCreator()
              })}
            </span>)}
          </div>}

          <e-flex style={{maxHeight: "50vh"}} column nowrap tabindex={-1}>

            {$on("mousedown", ev => {
              // prevent the popup from closing when clicking on it, otherwise input blur is called and we want it to keep the focus
              ev.stopPropagation()
              ev.preventDefault()
            })}

            {$scrollable}
            {DisplayPromise(this.opts.oo_visible_options)
              .WhileWaiting(() => <div class={css.loading_cont}><sl-spinner/></div>)
              .WhenResolved(o_res => {
                const labelfn = this.opts._render

                return Repeat(o_res, (opt, o_idx) => {
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
                        this.selectValue(o.get(opt).value)
                        if (!this.attrs.multiple) {
                          fut.resolve(null)
                        }
                      })}
                      <e-box grow>
                        {"\u200C"}
                        {o.tf(opt, val => labelfn?.(val.option) ?? val?.option?.toString())}
                      </e-box>
                      {o_equals.tf(v => v && <span>✓</span>)}
                    </e-flex>
                  })
                  .DisplayWhenEmpty(() => <div class={[css.item, css.no_results]}>∅ No results</div>)
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

export function Select<T>(attrs: SelectAttrs<T>) {
  const ctrl = new SelectCtrl(attrs)
  let prevent_focus_event = false

  return <div class={css.select} tabindex={0}>
    <span>&zwnj;</span>

    {$click(ev => {
      ev.stopPropagation()
      if ((ev.target as Element).closest("sl-popup")) {
        return
      }
      ctrl.show(ev.currentTarget as HTMLElement)
    })}

    {$on("focusin", ev => {
      if (prevent_focus_event) {
        prevent_focus_event = false
        return
      }
      ev.currentTarget.scrollIntoView({block: "nearest", behavior: "smooth"})
      if (!attrs.no_open_on_focus) {
        ctrl.show(ev.currentTarget as HTMLElement)
      }
      ev.stopPropagation()
    })}

    {$on("focusout", ev => {
      // ev.stopPropagation()
      ctrl.handleBlur()
    })}

    {$on("keydown", ev => {
      ctrl.handleKeydown(ev)
    })}

    <span class={css.content}>
      {attrs.multiple ?
        <e-flex inline gap="2x-small" align="baseline" >
          {Repeat(attrs.model, o_m =>
            <e-flex inline gap="2x-small" align="baseline" class={css.tag} >
              {o.tf(o_m, m => <span>{ctrl.opts._fallback_render(m as any) ??  m?.toString()}</span>)}
              {attrs.tag_click_removes && [$on("mousedown", ev => {
                prevent_focus_event = true
                ev.preventDefault()
                ev.stopPropagation()
                ctrl.selectValue(o.get(o_m) as T)
              }), <span>×</span>]}
            </e-flex>
          )}
        </e-flex>
        :
        <span>{o.tf(attrs.model, m => ctrl.opts._fallback_render(m as any) ??  m?.toString())}</span>
      }
    </span>

    {ctrl}

    <span class={[css.arrow, ctrl.o_showing_values.tf(v => v && css.arrow_open)]}>▾</span>
    {attrs.clearable ? If(ctrl.attrs.model, () => <span class={css.clear_button}>
      {$on("mousedown",ev => {
        prevent_focus_event = true
        ctrl.clear()
        ev.stopPropagation()
        ev.preventDefault()
      })}
      ×
    </span>, () => <span>&zwnj;</span>) : <span>&zwnj;</span>}

  </div>

}

Select.css = css



export type Options<T> =
  | o.ReadonlyObservable<T[]>
  | o.ReadonlyObservable<Promise<T[]>>
  | T[]
  | Promise<T[]>
  | ((search: string, abort: AbortController) => T[] | Promise<T[]>)


export interface BaseSelectAttrs<T> extends Attrs<HTMLDivElement>, AdminWidget<FormContext<any, any>, T> {
  options: OptionsCtrl<any, T> | T[] | Promise<T[]>
  size?: o.RO<"small" | "medium" | "large">
  no_open_on_focus?: boolean
  complete?: number // how many characters to type before showing results. If 0, there is no input.
  clearable?: boolean
  disabled?: boolean
  placeholder?: string
}

export interface SingleSelectAttrs<T> extends BaseSelectAttrs<T> {
  model: o.Observable<T | null>
  multiple?: false
}

export interface MultipleSelectAttrs<T> extends BaseSelectAttrs<T> {
  model: o.Observable<T[] | null>
  tag_click_removes?: boolean
  multiple: true
}

export type SelectOrMultipleAttrs<T> = SingleSelectAttrs<T> | MultipleSelectAttrs<T>
export type SelectAttrs<T> = SelectOrMultipleAttrs<T>
