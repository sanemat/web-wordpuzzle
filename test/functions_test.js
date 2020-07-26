// @ts-check

import { strict as assert } from "assert";
import { passToParam } from "../src/functions.js";

{
  /** @type {import("../src/functions").Pass} */
  const input = {
    type: "pass",
    playerId: 0,
  };
  const expected = "0|p";
  assert.equal(passToParam(input), expected);
}
