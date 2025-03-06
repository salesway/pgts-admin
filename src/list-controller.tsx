
import { o, Renderable } from "elt"
import { ModelMaker, PgtsWhere, SelectBuilder, PgtsResult } from "@salesway/pgts"

/**
 The ListController
*/

/**
 *
 */
export default class ListController<MT extends ModelMaker<any>> {

  constructor(
    public readonly base_selector: SelectBuilder<MT>,
    partial: Partial<ListController<MT>> = {}
  ) {

    for (const [key, value] of Object.entries(partial)) {
      (this as any)[key] = value
    }

  }

  // Pour tous les filtres sur le côté droit
  o_more_where = o(null as null | PgtsWhere<MT>)

  // o_fetched is the inital state that we use to compare the list with
  o_fetched = o([] as PgtsResult<MT>[])
  o_list = o([] as PgtsResult<MT>[])

  /** Fetch the items from postgrest */
  async fetchItems() {
    let sel = this.base_selector
    const more_where = this.o_more_where.get()

    if (more_where != null) {
      sel = sel.where(more_where)
    }

    const items = await sel.fetch()
    return items
  }

  /**  */
  async refresh() {

    o.transaction(async () => {
      this.o_list.set(await this.fetchItems())
      this.o_fetched.set(this.o_list.get())
    })

  }

  header!: () => Renderable

  // Est-ce qu'on trouverait pas un moyen de l'appeler une première fois pour savoir quels sont les headers à afficher ?
  render!: (o_item: o.Observable<PgtsResult<MT>>, is_list: boolean) => Renderable

}