import { FormContext } from "../form-context"
import { Renderable } from "elt"
import { ValidationFn } from "../types"

export interface AdminWidget<Ctx extends FormContext<any, any>, T> {
  ctx: Ctx
  label?: Renderable
  help?: Renderable
  validation?: ValidationFn<T> | ValidationFn<T>[]
}