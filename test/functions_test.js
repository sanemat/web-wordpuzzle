// @ts-check

import { strict as assert } from "assert";
import {
  _minimalStore,
  moveToParam,
  passToParam,
  resignToParam,
  swapToParam,
  sortCoordinates,
  buildStore,
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

{
  const query = `v=0.1.0`;
  const store = buildStore(query);
  assert.equal(store.version, "0.1.0");
}

{
  const query = "bw=3&bh=4";
  const store = buildStore(query);
  assert.equal(store.boardMeta.width, 3);
  assert.equal(store.boardMeta.height, 4);
  assert.equal(store.board.length, 4);
  assert.equal(store.board[0].length, 3);
}

{
  const query = `ps=foo&ps=bar`;
  const store = buildStore(query);
  assert.equal(store.players.length, 2);
  assert.deepEqual(store.players, ["foo", "bar"]);
}

{
  const query = `hs=a|b|c|t`;
  const store = buildStore(query);
  assert.deepEqual(store.hands, [["a", "b", "c", "t"]]);
}

{
  const query = `as=0|m|0|0|a|1|0|r|2|0|m&bw=3&bh=4`;
  const store = buildStore(query);
  assert.equal(store.acts.length, 1);
  const act = store.acts[0];
  assert.equal(act.type, "move");
  assert.equal(/** @type {import("../src/models").Move} */ (act).playerId, 0);
  assert.equal(
    /** @type {import("../src/models").Move} */ (act).coordinates.length,
    3
  );
  assert.deepEqual(
    /** @type {import("../src/models").Move} */ (act).coordinates[1],
    { panel: "r", x: 1, y: 0 }
  );
}

{
  const query = `as=0|m|1|10|a&bw=2&bh=11`;
  const store = buildStore(query);
  assert.equal(store.acts.length, 1);
  const act = store.acts[0];
  assert.equal(act.type, "move");
  assert.equal(/** @type {import("../src/models").Move} */ (act).playerId, 0);
  assert.equal(
    /** @type {import("../src/models").Move} */ (act).coordinates.length,
    1
  );
  assert.deepEqual(
    /** @type {import("../src/models").Move} */ (act).coordinates[0],
    { panel: "a", x: 1, y: 10 }
  );
}

{
  const query = `as=0|p&bw=3&bh=4`;
  const store = buildStore(query);
  assert.equal(store.acts.length, 1);
  const act = store.acts[0];
  assert.equal(act.type, "pass");
  assert.equal(/** @type {import("../src/models").Move} */ (act).playerId, 0);
}

{
  const query = `as=0|r&bw=3&bh=4`;
  const store = buildStore(query);
  assert.equal(store.acts.length, 1);
  const act = store.acts[0];
  assert.equal(act.type, "resign");
  assert.equal(/** @type {import("../src/models").Resign} */ (act).playerId, 0);
}

{
  const query = `as=0|s|a|b&bw=3&bh=4`;
  const store = buildStore(query);
  assert.equal(store.acts.length, 1);
  const act = store.acts[0];
  assert.equal(act.type, "swap");
  assert.equal(/** @type {import("../src/models").Swap} */ (act).playerId, 0);
  assert.deepEqual(/** @type {import("../src/models").Swap} */ (act).panels, [
    "a",
    "b",
  ]);
}

{
  const query = `j=a|b|x|x`;
  const store = buildStore(query);
  assert.equal(store.jar.length, 4);
  assert.deepEqual(store.jar, ["a", "b", "x", "x"]);
}

{
  const query = `cp=0`;
  const store = buildStore(query);
  assert.equal(store.currentPlayerId, 0);
}

{
  const query = `cp=1`;
  const store = buildStore(query);
  assert.equal(store.currentPlayerId, 1);
}

{
  const query = `md=0`;
  const store = buildStore(query);
  assert.equal(store.moved, false);
}

{
  const query = `md=1`;
  const store = buildStore(query);
  assert.equal(store.moved, true);
}

{
  const query = `ov=0`;
  const store = buildStore(query);
  assert.equal(store.over, false);
}

{
  const query = `ov=1`;
  const store = buildStore(query);
  assert.equal(store.over, true);
}

{
  const query = `ps=foo&ps=bar&as=0|m|0|0|a|1|0|r|2|0|m&hs=a|b|c|t&hs=e|a|f&v=0.1.0&bw=3&bh=4&j=a|b|x|x&cp=0&md=1&ov=1`;
  const store = buildStore(query);
  const expected = _minimalStore();
  expected.board = [
    ["a", "r", "m"],
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  expected.boardMeta = { width: 3, height: 4 };
  expected.hands = [
    ["a", "b", "c", "t"],
    ["e", "a", "f"],
  ];
  expected.version = "0.1.0";
  expected.players = ["foo", "bar"];
  expected.acts = [
    {
      type: "move",
      playerId: 0,
      coordinates: [
        { panel: "a", x: 0, y: 0 },
        { panel: "r", x: 1, y: 0 },
        { panel: "m", x: 2, y: 0 },
      ],
    },
  ];
  expected.jar = ["a", "b", "x", "x"];
  expected.currentPlayerId = 0;
  expected.moved = true;
  expected.over = true;
  assert.deepEqual(store, expected);
}
