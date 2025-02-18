import { Attrs, NRO, o, css } from "elt"

export interface SectionAttrs extends Attrs<HTMLDivElement> {
  label: NRO<string>
  collapsible?: o.RO<boolean>
}

export function Section(attrs: SectionAttrs) {
  return <section class={cls.section}>
    <div class={cls.section_title}>{attrs.label}</div>
  </section>
}

const cls = css`
${".section"} {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

${".section_title"} {
  font-weight: bold;
  font-size: 1.2em;
}
`