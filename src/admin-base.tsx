import type { App } from "elt"
import config from "./conf"

/**
 *
 */
export default async function AdminBase(srv: App.Service) {
  srv.view(config.view_main, () => {
    return <div>AdminBase</div>
  })
}
