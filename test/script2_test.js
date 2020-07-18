import test from "ava";

import { buildStore } from "../src/script.js";

test("store version", (t) => {
  const query = `v=0.1.0`;
  const store = buildStore(query);
  t.assert(store.version === "0.1.0");
});
