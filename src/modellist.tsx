import { ModelMaker, SelectBuilder } from "@salesway/pgts"
import config from "./conf"
import { App } from "elt"


export class ModelList<MT extends ModelMaker<any>> {

  constructor(
    public select: SelectBuilder<MT, any>
  ) {

  }

  asService() {
    return (srv: App.Service<{[K in keyof MT["meta"]["pk_fields"]]: string}>) => {

      srv.view(config.view_main, () => {
        return <div>List</div>
      })

    }
  }
}
