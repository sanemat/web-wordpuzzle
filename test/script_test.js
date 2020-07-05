import { strict as assert } from "assert";

import {
  _minimalStore,
  buildStore,
  filterMove,
  buildMove,
  moveToParam,
  validateMove,
} from "../src/script.js";

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
  const query = `ms=0|00|a|10|r|20|m&bw=3&bh=4`;
  const store = buildStore(query);
  assert.equal(store.moves.length, 1);
  assert.equal(store.moves[0].playerId, 0);
  assert.equal(store.moves[0].coordinates.length, 3);
  assert.deepEqual(store.moves[0].coordinates[1], { panel: "r", x: 1, y: 0 });
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
  const query = `ps=foo&ps=bar&ms=0|00|a|10|r|20|m&hs=a|b|c|t&hs=e|a|f&v=0.1.0&bw=3&bh=4&j=a|b|x|x&cp=0&md=1`;
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
  expected.moves = [
    {
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
  assert.deepEqual(store, expected);
}

{
  const input = [
    ["playerId", "0"],
    ["handId", "0"],
    ["panel", "x"],
    ["x", ""],
    ["y", ""],
  ];
  const expected = [["playerId", "0"]];
  (async () => {
    assert.deepEqual(await filterMove(input), expected);
  })();
}

{
  const input = [
    ["playerId", "0"],
    ["handId", "0"],
    ["panel", "x"],
    ["x", "2"],
    ["y", "3"],
  ];
  const expected = [
    ["playerId", "0"],
    ["handId", "0"],
    ["panel", "x"],
    ["x", "2"],
    ["y", "3"],
  ];
  (async () => {
    assert.deepEqual(await filterMove(input), expected);
  })();
}

{
  const input = [["playerId", "0"]];
  /** @type {import("../src/script.js").MoveOpe} */
  const expected = [
    {
      playerId: 0,
      coordinates: [],
    },
    [],
  ];
  (async () => {
    assert.deepEqual(await buildMove(input), expected);
  })();
}

{
  const input = [
    ["playerId", "0"],
    ["handId", "0"],
    ["panel", "x"],
    ["x", "2"],
    ["y", "3"],
  ];
  /** @type {import("../src/script.js").MoveOpe} */
  const expected = [
    {
      playerId: 0,
      coordinates: [{ x: 2, y: 3, panel: "x" }],
    },
    [0],
  ];
  (async () => {
    assert.deepEqual(await buildMove(input), expected);
  })();
}

{
  /** @type {import("../src/script.js").Move} */
  const input = {
    playerId: 0,
    coordinates: [],
  };
  const expected = "0";
  assert.equal(moveToParam(input), expected);
}

{
  /** @type {import("../src/script.js").Move} */
  const input = {
    playerId: 0,
    coordinates: [
      { panel: "a", x: 0, y: 0 },
      { panel: "r", x: 1, y: 0 },
      { panel: "m", x: 2, y: 0 },
    ],
  };
  const expected = "0|00|a|10|r|20|m";
  assert.equal(moveToParam(input), expected);
}

{
  /** @type {import("../src/script.js").Move} */
  const move = {
    playerId: 0,
    coordinates: [{ panel: "a", x: 1, y: 0 }],
  };
  const query = `ms=0|00|a|10|r|20|m&bw=3&bh=4`; // will conflict 1,0:r
  const store = buildStore(query);
  (async () => {
    assert.equal(await validateMove(move, store), false);
  })();
}

{
  // will conflict 1,0:r
  /** @type {import("../src/script.js").Move} */
  const move = {
    playerId: 0,
    coordinates: [{ panel: "a", x: 1, y: 0 }],
  };
  const query = `ms=0|00|a|10|r|20|m&bw=3&bh=4`;
  const store = buildStore(query);
  (async () => {
    assert.equal(await validateMove(move, store), false);
  })();
}


assert.deepEqual(_minimalStore(), _minimalStore());
