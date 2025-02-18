import { o, Renderable } from "elt"

import { ModelMaker, SelectBuilder } from "@salesway/pgts"

// import { App } from "elt"
export { default as config } from "./conf"
export { default as routes } from "./routes"
export * from "./field"
export * from "./widgets"
export * from "./form-context"
export * from "./modelform"
export * from "./modellist"
export * from "./modelgrid"

export function register(path: string) {
  return {
    list<M extends ModelMaker<any>, R>(sel: SelectBuilder<M, R>, lst: (row: o.Observable<R>) => Renderable) {
      return {
        form<R2 = R>(sel: SelectBuilder<M, R2>, frm: (row: o.Observable<R>) => Renderable) {
          return {

          }
        }
      }
    }
  }
}