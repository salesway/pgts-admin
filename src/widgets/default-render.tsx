import { Renderable } from "elt"
import { css } from "elt"

/** The default renderer tries to display what it gets how well it can */
export function default_render(value: any): Renderable {
  if (value === null) {
    return <span class={rd.null}>null</span>
  }

  if (value === undefined) {
    return <span class={rd.undefined}>∅</span>
  }

  if (typeof value === "number") {
    return <span class={rd.number}>{value}</span>
  }

  if (typeof value === "string" || typeof value === "number") {
    return <span class={rd.string}>{value}</span>
  }

  if (value === true) {
    return <span class={rd.boolean_true}>🗹</span>
  }

  if (value === false) {
    return <span class={rd.boolean_false}>𐄂</span>
  }

  if (value instanceof Date) {
    // TODO: Implement date rendering
  }

  return <span class={rd.string}>{JSON.stringify(value)}</span>
}

const rd = css`
${".null"} {
  font-weight: bold;
  color: var(--pgts-number, #aabbdd);
  font-family: monospace;
}

${".undefined"} {
  font-weight: bold;
  color: var(--pgts-number, #aabbdd);
  font-family: monospace;
}

${".boolean"} {
  font-weight: bold;
  font-family: monospace;
  text-align: center;
}

${".boolean_true"} {
  color: var(--sl-color-emerald-600, #aabbdd);
}

${".boolean_false"} {
  color: var(--sl-color-red-600, #aabbdd);
}

${".number"} {
  font-weight: bold;
  color: var(--pgts-number, #aabbdd);
}

${".string"} {

}
`