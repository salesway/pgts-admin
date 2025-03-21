import { css } from "elt"

const admin_css = css`
  ${".grid"} {
    position: relative;
    display: grid;
    justify-content: start;
    gap: 0 8px;
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
    padding: 8px;
    cursor: pointer;
  }

  ${".list_row"}:hover {
    background: var(--sl-color-primary-50);
  }

  ${".selected"} {
    background: var(--sl-color-primary-50);
    box-shadow: inset 0 0 10px var(--sl-color-primary-200);
  }

  ${".header_row"} {
    position: sticky;
    top: 0;
    background: var(--sl-color-neutral-0);
    border-bottom: 1px solid var(--sl-color-primary-200);
    z-index: 1;
  }

  ${".side_form"} {
    overflow: auto;
    padding: var(--sl-spacing-small);
  }

  ${".split_panel"} {
    overflow: hidden;
  }
`
export default admin_css
