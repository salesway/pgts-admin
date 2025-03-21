import { ModelMaker, PgtsResult, SelectBuilder } from "@salesway/pgts"
import { Attrs, Renderable, css } from "elt"

import { FormContext } from "./form-context"
import { ValidationFn } from "./types"


export interface FieldProperties {
  label?: Renderable,
  help?: Renderable,
  required?: boolean,
  validation?: ValidationFn<any> | ValidationFn<any>[]
}

export type FieldDefinition<MT extends ModelMaker<any>, Result extends PgtsResult<MT>> = ((attrs: Attrs<HTMLDivElement> & { ctx: FormContext<MT, Result> }) => Node) & FieldProperties


export class FieldMaker<K extends string, MT extends ModelMaker<any>, Result extends PgtsResult<MT>> {
  constructor(
    public key: K,
    public select: SelectBuilder<MT, Result>,
    public fields: {[name: string]: FieldDefinition<MT, Result>}
  ) {}
}


export function F<K extends string, MT extends ModelMaker<any>, Result extends PgtsResult<MT>,>(key: K, render: (ctx: FormContext<MT, Result>) => Renderable): FieldMaker<K, MT, Result> {
  // return new FieldMaker(key, render)
  return null!
}


export function fields2<
  MT extends ModelMaker<any>,
  Result extends PgtsResult<MT>,
  Fields extends FieldMaker<any, MT, Result>[],
>(
  select: SelectBuilder<MT, Result>,
  ...fields: Fields
): {[Key in keyof Fields]: Fields[Key] extends FieldMaker<infer K, MT, Result> ? {K: Fields[Key]} : never }[number] {
  return null!
}


export function fields<
  MT extends ModelMaker<any>,
  Result extends PgtsResult<MT>,
  Fields extends {[name: string]: [render: (ctx: FormContext<MT, Result>) => Renderable, FieldProperties]},
>(
  select: SelectBuilder<MT, Result>,
  f: Fields
): {[name in keyof Fields]: FieldDefinition<MT, Result>} {
  const res: any = {}
  for (const [name, [render, props]] of Object.entries(f)) {
    function _(attrs: Attrs<HTMLDivElement> & { ctx: FormContext<MT, Result> }) {
      if (attrs.ctx.options.in_list) {
        return render(attrs.ctx)
      }
      return <div class={cls.field_holder}>
        {props.label && <div class={cls.label}>{props.label}{props.required && <span>*</span>}</div>}
        {render(attrs.ctx)}
      </div>
    }
    Object.assign(_, props)
    res[name] = _
  }
  return res
}


export class Field<MT extends ModelMaker<any>, Result extends PgtsResult<MT>, Ctx extends FormContext<MT, Result>, T> {
  constructor(
    public render: (ctx: Ctx) => Renderable,
    // public readonly label: string,
    // public readonly help: string,
    // public readonly validation: ValidationFn<T> | ValidationFn<T>[]
  ) {}
}

export const cls = css`
${".label"} {
  font-weight: bold;
  font-size: 0.75em;
}

${".field_holder"} {
  display: flex;
  flex-direction: column;
  align-items: baseline;
  gap: 0.1em;
}
`