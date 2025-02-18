
export default {
  single: ["/:model/:key", () => import("./single")],
  list: ["/:model", () => import("./list")],
  root: ["", () => import("./admin-base")],
}
