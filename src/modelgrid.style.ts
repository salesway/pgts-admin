import { css } from "elt"

export default css`
${".grid"} {
  display: inline-grid;
  grid-template-columns: subgrid;
  align-items: start;
  align-content: start;
}

${".header"} {
  font-weight: bold;
  font-size: 0.75em;
  padding: 4px 0;
}

${".row"}, ${".header_row"} {
  display: grid;
  grid-template-columns: subgrid;
  padding: 0 8px;
  grid-columns: 1 / -1;
}
`