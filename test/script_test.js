import { strict as assert } from "assert";

import { _minimalStore, buildStore } from "../src/script.js";

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
  const query = `ps=foo&ps=bar&ms=0|00|a|10|r|20|m&hs=a|b|c|t&hs=e|a|f&v=0.1.0&bw=3&bh=4`;
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
  assert.deepEqual(store, expected);
}

assert.deepEqual(_minimalStore(), _minimalStore());
