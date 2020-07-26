// @ts-check

import { strict as assert } from "assert";
import {
  _minimalStore,
  moveToParam,
  passToParam,
  resignToParam,
  swapToParam,
  sortCoordinates,
} from "../src/functions.js";

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

{
  /** @type {import("../src/models").Move} */
  const input = {
    type: "move",
    playerId: 0,
    coordinates: [
      { panel: "a", x: 0, y: 0 },
      { panel: "r", x: 1, y: 0 },
      { panel: "m", x: 2, y: 0 },
    ],
  };
  const expected = "0|m|0|0|a|1|0|r|2|0|m";
  assert.equal(moveToParam(input), expected);
}

{
  assert.deepEqual(_minimalStore(), _minimalStore());
}

{
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [];
  assert.deepEqual(sortCoordinates(coordinates), []);
}

{
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [{ x: 2, y: 3, panel: "x" }];
  assert.deepEqual(sortCoordinates(coordinates), [{ x: 2, y: 3, panel: "x" }]);
}

{
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [
    { x: 2, y: 3, panel: "x" },
    { x: 1, y: 3, panel: "x" },
  ];
  assert.deepEqual(sortCoordinates(coordinates), [
    { x: 1, y: 3, panel: "x" },
    { x: 2, y: 3, panel: "x" },
  ]);
}

{
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [
    { x: 2, y: 3, panel: "x" },
    { x: 2, y: 2, panel: "x" },
  ];
  assert.deepEqual(sortCoordinates(coordinates), [
    { x: 2, y: 2, panel: "x" },
    { x: 2, y: 3, panel: "x" },
  ]);
}
