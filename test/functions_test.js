// @ts-check

import { strict as assert } from "assert";
import { passToParam, resignToParam } from "../src/functions.js";

{
  /** @type {import("../src/functions").Pass} */
  const input = {
    type: "pass",
    playerId: 0,
  };
  const expected = "0|p";
  assert.equal(passToParam(input), expected);
}

{
  /** @type {import("../src/functions").Resign} */
  const input = {
    type: "resign",
    playerId: 0,
  };
  const expected = "0|r";
  assert.equal(resignToParam(input), expected);
}
