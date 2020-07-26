// @ts-check

import { strict as assert } from "assert";
import { passToParam, resignToParam, swapToParam } from "../src/functions.js";

{
  /** @type {import("../src/models").Pass} */
  const input = {
    type: "pass",
    playerId: 0,
  };
  const expected = "0|p";
  assert.equal(passToParam(input), expected);
}

{
  /** @type {import("../src/models").Resign} */
  const input = {
    type: "resign",
    playerId: 0,
  };
  const expected = "0|r";
  assert.equal(resignToParam(input), expected);
}

{
  /** @type {import("../src/models").Swap} */
  const input = {
    type: "swap",
    playerId: 1,
    panels: ["a", "b"],
  };
  const expected = "1|s|a|b";
  assert.equal(swapToParam(input), expected);
}
