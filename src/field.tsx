import { ModelMaker, PgtsResult, SelectBuilder } from "@salesway/pgts"
import { Attrs, Renderable, css } from "elt"

import { FormContext } from "./form-context"
import { ValidationFn } from "./types"


export interface FieldProperties {
  label?: Renderable,
  help?: Renderable,
  validation?: ValidationFn<any> | ValidationFn<any>[]
}

export type FieldDefinition<MT extends ModelMaker<any>, Result extends PgtsResult<MT>> = ((attrs: Attrs<HTMLDivElement> & { ctx: FormContext<MT, Result> }) => Node) & FieldProperties


export function fields<
  MT extends ModelMaker<any>,
  Result extends PgtsResult<MT>,
  Fields extends {[name: string]: [render: (ctx: FormContext<MT, Result>) => Node, FieldProperties]},
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
        {props.label && <div class={cls.label}>{props.label}</div>}
        {render(attrs.ctx)}
      </div>
    }
    Object.assign(_, props)
    res[name] = _
  }
  return res
}


export function F<MT extends ModelMaker<any>, Result extends PgtsResult<MT>, Ctx extends FormContext<MT, Result>, T>(render: (ctx: Ctx) => Node) {
  return new Field(render)
}


export class Field<MT extends ModelMaker<any>, Result extends PgtsResult<MT>, Ctx extends FormContext<MT, Result>, T> {
  constructor(
    public render: (ctx: Ctx) => Node,
    // public readonly label: string,
    // public readonly help: string,
    // public readonly validation: ValidationFn<T> | ValidationFn<T>[]
  ) {}
}

export const cls = css`
${".label"} {
  font-weight: bold;
}

${".field_holder"} {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 0.5rem;
}
`