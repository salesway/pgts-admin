import { $click, css, type App } from "elt"
import config from "./conf"

/**
 *
 */
export default async function AdminBase(srv: App.Service) {
  srv.view(config.view_main, () => {
    return <e-flex nowrap column style={{height: "100%", width: "100%", overflow: "hidden"}}>
      <e-flex class={cls.toolbar} pad gap align="baseline">
        <button>
          {$click(() => {
            history.back()
          })}
          {/* utt-8 left arrow */}
          {"←"}
        </button>
        {srv.DisplayView("Toolbar")}
      </e-flex>
      {srv.DisplayView("Content")}
    </e-flex>
  })
}


const cls = css`
${".toolbar"} {
  background-color: var(--sl-color-primary-50);
}
`