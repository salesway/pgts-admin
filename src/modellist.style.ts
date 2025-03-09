import { css } from "elt"

const admin_css = css`
  ${".grid"} {
    position: relative;
    display: grid;
    gap: 8px;
    justify-content: start;
  }

  ${".table_container"} {
    border: 1px solid var(--sl-color-primary-200);
  }

  ${".row"}, ${".list_row"}, ${".header_row"} {
    grid-column-start: 1;
    grid-column-end: -1;
    min-height: 1px;
    display: grid;
    grid-template-columns: subgrid;
    padding: 0 8px;
    cursor: pointer;
  }

  ${".list_row"}:hover {
    background: var(--sl-color-primary-50);
  }

  ${".header_row"} {
    position: sticky;
    top: 0;
    background: var(--sl-color-neutral-0);
    border-bottom: 1px solid var(--sl-color-primary-200);
    z-index: 1;
  }
`
export default admin_css
