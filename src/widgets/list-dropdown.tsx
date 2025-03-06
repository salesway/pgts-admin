import { o } from "elt"

export type Options<T> =
  | T[]
  | Promise<T[]>
  | o.ReadonlyObservable<T[]>
  | o.ReadonlyObservable<Promise<T[]>>
  | ((search: string) => T[])
  | ((search: string) => Promise<T[]>)

/**
 * ListPopup gives a way to render a list of items in a popup, where arrow keys can be used to navigate the list.
 *
 * It may display a search box, which will get the focus initially if the option asks for it.
 */
export class ListDropdown<T> {

  constructor(
    public options: Options<T>
  ) {

  }

  o_search = o("")

  getOptions(search: o.ReadonlyObservable<string>): o.ReadonlyObservable<Promise<T[]>> {
    return o.join(
      this.options,
      search,
    ).tf(([opts, search]) => Promise.resolve(opts).then(opts => {
      if (typeof opts === "function") {
        return opts(search) as T[] // not entirely true
      }
      return opts
    }))
  }

  render() {
    return <div>
      <div>ListPopup</div>
    </div>
  }
}