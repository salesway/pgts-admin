import { css } from "elt"

export default css`

${".select"} {
  min-width: 100px;
  align-self: start;

  display: inline-flex;
  align-items: baseline;
  flex-direction: row;
  gap: var(--sl-spacing-2x-small);
  border: solid var(--sl-input-border-width) var(--sl-input-border-color);
  border-radius: var(--sl-input-border-radius-medium);

  padding: calc(var(--sl-spacing-x-small) * 0.44) var(--sl-spacing-small);
  font-size: var(--sl-input-font-size-small);

  color: var(--sl-input-color);
  background-color: var(--sl-input-background-color);

  cursor: pointer;

  transition: var(--sl-transition-fast) color, var(--sl-transition-fast) border, var(--sl-transition-fast) box-shadow,
  var(--sl-transition-fast) background-color;

}

${".select"}:focus-within, ${".select_inside"} {
  background-color: var(--sl-input-background-color-focus);
  border-color: var(--sl-input-border-color-focus);
  box-shadow: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
}

${".select"}:hover:not([disabled]) {
  border-color: var(--sl-input-border-color-hover);
  background-color: var(--sl-input-filled-background-color-hover);
}

${".input"} {
  flex-grow: 1;
}

${".search_box"} {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--sl-spacing-2x-small);
  padding: var(--sl-spacing-2x-small) var(--sl-spacing-x-small);
  border: solid 1px var(--sl-color-neutral-100);
  background-color: var(--sl-color-neutral-50);
  border-top-left-radius: var(--sl-input-border-radius-small);
  border-top-right-radius: var(--sl-input-border-radius-small);
  margin-bottom: var(--sl-spacing-2x-small);
}

${".tag"} {
  padding: var(--sl-spacing-3x-small) var(--sl-spacing-2x-small);
  border-radius: var(--sl-input-border-radius-small);
  background-color: var(--sl-color-neutral-600);
  color: var(--sl-color-neutral-0);
}

${".tag"}:hover {
  background-color: var(--sl-color-neutral-200);
}

${".select_popup"} {
  overflow: hidden;
  background: var(--sl-color-neutral-0);
  border-radius: var(--sl-input-border-radius-medium);
  border: 1px solid var(--arrow-color);
  box-shadow: 0 2px 4px var(--sl-color-neutral-300);
}

${".arrow"} {
  margin-left: auto;
  transition: transform 0.1s ease-in-out;
  transform-origin: center;
}

${".arrow_open"} {
  transform: rotate(90deg);
}

${".item"} {
  padding: var(--sl-spacing-2x-small) var(--sl-spacing-small);
  cursor: pointer;
  box-sizing: border-box;
}

${".item_highlighted"}, ${".item"}:hover {
  background-color: var(--sl-color-primary-50);
  outline: 1px solid var(--sl-color-primary-300);
  z-index: 1;
}

${".item_selected"} {
  font-weight: bold;
}

${".loading_cont"} {
  padding: var(--sl-spacing-small) var(--sl-spacing-small);
  display: flex;
  align-items: center;
  justify-content: center;
}

${".create_button"} {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--sl-input-font-size-small);
  background-color: var(--sl-color-primary-300);
  border-radius: var(--sl-input-border-radius-small);
  padding: 0 var(--sl-spacing-small);
  color: var(--sl-color-neutral-0);
}

${".create_button"}:hover {
  background: var(--sl-color-primary-600);
}

`
