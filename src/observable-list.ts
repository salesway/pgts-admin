import { o } from "elt"

export class ObservableList<T, K> {

  constructor(
    public key_fn: (item: T) => K
  ) {

  }

  o_keys = o([] as K[])
  o_initial_map = o(new Map<K, T>())

  o_changes = o(new Map<K, T>())
  o_deletions = o(new Set<K>())

  /** Initial item set, usually when coming from a database query */
  setItems(items: T[]) {
    const map = new Map(items.map(item => [this.key_fn(item), item]))
    this.o_keys.set([...map.keys()])
    this.o_initial_map.set(map)
    this.o_changes.set(new Map<K, T>())
    this.o_deletions.set(new Set<K>())
  }

  /**
   * Get an observable for an item in the list that will modify the changes map instead of the initial map
   */
  getObservable(_key: o.RO<K>) {

    const o_result = o.expression(get => {
      const changes = get(this.o_changes)
      const key = get(_key)
      const initial = get(this.o_initial_map)
      const deletions = get(this.o_deletions)

      if (changes.has(key)) {
        return changes.get(key)
      }
      if (deletions.has(key)) {
        return undefined
      }
      return initial.get(key)

    }, (item, set, _, get) => {
      if (item != undefined) {
        const chgs = new Map(get(this.o_changes))
        set(this.o_changes, chgs)
      }
    })

    return o.merge({
      initial: this.o_initial_map,
      changes: this.o_changes,
      deletions: this.o_deletions,
      key: _key as o.IReadonlyObservable<K>
    })
    .tf(({initial, changes, deletions, key}) => {
      if (changes.has(key)) {
        return changes.get(key)
      }
      if (deletions.has(key)) {
        return undefined
      }
      return initial.get(key)
    }, (item, _, current) => {
      const res = {
        initial: o.NoValue,
        changes: o.NoValue,
        deletions: o.NoValue,
        key: o.NoValue
      }

      if (item != undefined) {
        const chgs = new Map(current.changes)
        chgs.set(current.key, item!)
      }

      return res as any
    })
  }

}
