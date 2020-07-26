import { strict as assert } from "assert";

import {
  filterMove,
  buildMove,
  validateMove,
  findCandidates,
  anywayGet,
  isUnique,
  isSequence,
  connected,
  hasConnection,
  allCandidatesInWordDictionary,
  buildSwap,
} from "../src/script.js";

import { buildStore } from "../src/functions.js";

{
  const input = [
    ["playerId", "1"],
    ["handId", "0"],
    ["panel", "x"],
    ["swap", "1"],
  ];
  /** @type {import("../src/models").SwapOpe} */
  const expected = [
    {
      type: "swap",
      playerId: 1,
      panels: ["x"],
    },
    [0],
  ];
  (async () => {
    assert.deepEqual(await buildSwap(input), expected);
  })();
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
  /** @type {import("../src/models").MoveOpe} */
  const expected = [
    {
      type: "move",
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
  /** @type {import("../src/models").MoveOpe} */
  const expected = [
    {
      type: "move",
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
  const message = "will conflict 1,0:r";
  /** @type {import("../src/models").Move} */
  const move = {
    type: "move",
    playerId: 0,
    coordinates: [{ panel: "a", x: 1, y: 0 }],
  };
  const query = `as=0|m|0|0|a|1|0|r|2|0|m&bw=3&bh=4`;
  const store = buildStore(query);
  const words = new Set([]);
  (async () => {
    const [errors, result] = await validateMove(move, store, words);
    assert.equal(errors?.length, 1, message);
    assert.equal(result, false, message);
  })();
}

{
  const message = "y is out of board";
  /** @type {import("../src/models").Move} */
  const move = {
    type: "move",
    playerId: 0,
    coordinates: [{ panel: "a", x: 4, y: 5 }],
  };
  const query = `as=0|m|0|0|a|1|0|r|2|0|m&bw=3&bh=4`;
  const store = buildStore(query);
  const words = new Set([]);
  (async () => {
    const [errors, result] = await validateMove(move, store, words);
    assert.equal(errors?.length, 1, message);
    assert.equal(result, false, message);
  })();
}

{
  const message = "x4 is out of board";
  /** @type {import("../src/models").Move} */
  const move = {
    type: "move",
    playerId: 0,
    coordinates: [{ panel: "a", x: 4, y: 2 }],
  };
  const query = `as=0|m|0|0|a|1|0|r|2|0|m&bw=3&bh=4`;
  const store = buildStore(query);
  const words = new Set([]);
  (async () => {
    const [errors, result] = await validateMove(move, store, words);
    assert.equal(errors?.length, 1, message);
    assert.equal(result, false, message);
  })();
}

{
  /** @type {import("../src/models").Move} */
  const move = {
    type: "move",
    playerId: 0,
    coordinates: [{ panel: "a", x: 0, y: 1 }],
  };
  const query = `as=0|m|0|0|a|1|0|r|2|0|m&bw=3&bh=4`;
  const store = buildStore(query);
  const words = new Set(["aa"]); // valid
  (async () => {
    const [errors, result, wordList] = await validateMove(move, store, words);
    assert.equal(errors, null);
    assert.equal(result, true);
    assert.deepEqual(wordList, ["aa"]);
  })();
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    ["a", "b"],
    [null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [];
  (async () => {
    assert.deepEqual(await findCandidates(board, coordinates), [null, null]);
  })();
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    ["a", null],
    ["a", null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [{ x: 1, y: 0, panel: "x" }];
  const expected = [null, ["ax"]];
  (async () => {
    assert.deepEqual(await findCandidates(board, coordinates), expected);
  })();
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    ["a", null],
    ["a", null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [{ x: 1, y: 1, panel: "x" }];
  const expected = [null, ["ax"]];
  (async () => {
    assert.deepEqual(await findCandidates(board, coordinates), expected);
  })();
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    ["a", null, "b"],
    ["a", null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [{ x: 1, y: 0, panel: "x" }];
  const expected = [null, ["axb"]];
  (async () => {
    assert.deepEqual(await findCandidates(board, coordinates), expected);
  })();
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    ["a", null, "b", null],
    ["a", null, null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [
    { x: 1, y: 0, panel: "x" },
    { x: 3, y: 0, panel: "y" },
  ];
  const expected = [null, ["axby"]];
  (async () => {
    assert.deepEqual(await findCandidates(board, coordinates), expected);
  })();
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    [null, null, "b", null],
    ["a", null, null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [
    { x: 1, y: 0, panel: "x" },
    { x: 3, y: 0, panel: "y" },
  ];
  const expected = [null, ["xby"]];
  (async () => {
    assert.deepEqual(await findCandidates(board, coordinates), expected);
  })();
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    ["a", null],
    [null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [{ x: 0, y: 1, panel: "x" }];
  const expected = [null, ["ax"]];
  (async () => {
    assert.deepEqual(await findCandidates(board, coordinates), expected);
  })();
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    ["a", null],
    [null, null],
    ["a", null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [{ x: 0, y: 1, panel: "x" }];
  const expected = [null, ["axa"]];
  (async () => {
    assert.deepEqual(await findCandidates(board, coordinates), expected);
  })();
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    ["a", null],
    [null, null],
    ["a", null],
    [null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [
    { x: 0, y: 1, panel: "x" },
    { x: 0, y: 3, panel: "x" },
  ];
  const expected = [null, ["axax"]];
  (async () => {
    assert.deepEqual(await findCandidates(board, coordinates), expected);
  })();
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    ["a", null],
    [null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [
    { x: 0, y: 1, panel: "x" },
    { x: 1, y: 1, panel: "y" },
  ];
  const expected = [null, ["xy", "ax"]];
  (async () => {
    assert.deepEqual(await findCandidates(board, coordinates), expected);
  })();
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    ["a", null],
    [null, null],
    [null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [
    { x: 1, y: 0, panel: "x" },
    { x: 1, y: 2, panel: "y" },
  ];
  (async () => {
    const [errors] = await findCandidates(board, coordinates);
    if (errors !== null) {
      assert.equal(errors.length, 1);
      assert.equal(errors[0].message, "Empty panel x: 1, y: 1");
    } else {
      assert.fail("unreachable");
    }
  })();
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    ["a", "b"],
    [null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [];
  assert.equal(anywayGet(0, 0, board, coordinates), "a");
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    ["a", "b"],
    [null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [];
  assert.equal(anywayGet(0, 1, board, coordinates), null);
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    ["a", "b"],
    [null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [{ x: 0, y: 1, panel: "a" }];
  assert.equal(anywayGet(0, 1, board, coordinates), "a");
}

{
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [];
  const [, result] = isUnique(coordinates);
  assert.equal(result, true);
}

{
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [{ x: 0, y: 1, panel: "a" }];
  const [, result] = isUnique(coordinates);
  assert.equal(result, true);
}

{
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [
    { x: 0, y: 1, panel: "a" },
    { x: 0, y: 1, panel: "b" },
  ];
  const [errors, result] = isUnique(coordinates);
  assert.equal(errors?.length, 1);
  assert.equal(result, false);
}

{
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [
    { x: 0, y: 1, panel: "a" },
    { x: 0, y: 1, panel: "b" },
    { x: 1, y: 1, panel: "a" },
    { x: 1, y: 1, panel: "b" },
  ];
  const [errors, result] = isUnique(coordinates);
  assert.equal(errors?.length, 2);
  assert.equal(result, false);
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    [null, null],
    [null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [];
  const [errors, result] = isSequence(board, coordinates);
  assert.equal(errors, null);
  assert.equal(result, true);
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    [null, null],
    [null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [{ x: 0, y: 1, panel: "a" }];
  const [errors, result] = isSequence(board, coordinates);
  assert.equal(errors, null);
  assert.equal(result, true);
}

{
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [
    { x: 0, y: 1, panel: "a" },
    { x: 0, y: 2, panel: "b" },
  ];
  const [errors, result] = isUnique(coordinates);
  assert.equal(errors, null);
  assert.equal(result, true);
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    [null, null],
    [null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [
    { x: 0, y: 0, panel: "a" },
    { x: 0, y: 1, panel: "b" },
  ];
  const [errors, result] = isSequence(board, coordinates);
  assert.equal(errors, null);
  assert.equal(result, true);
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    [null, null],
    [null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [
    { x: 0, y: 0, panel: "a" },
    { x: 1, y: 0, panel: "b" },
  ];
  const [errors, result] = isSequence(board, coordinates);
  assert.equal(errors, null);
  assert.equal(result, true);
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    [null, null],
    [null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [
    { x: 0, y: 0, panel: "a" },
    { x: 1, y: 1, panel: "b" },
  ];
  const [errors, result] = isSequence(board, coordinates);
  assert.equal(errors?.length, 1);
  assert.equal(result, false);
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    [null, null, null],
    [null, "x", null],
    [null, null, null],
  ];
  /** @type {import("../src/models").Coordinate} */
  const coordinate = { x: 0, y: 0, panel: "a" };
  const [, result] = connected(board, coordinate);
  assert.equal(result, false);
}

{
  // up
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    [null, null, null],
    [null, "x", null],
    [null, null, null],
  ];
  /** @type {import("../src/models").Coordinate} */
  const coordinate = { x: 1, y: 2, panel: "a" };
  const [, result] = connected(board, coordinate);
  assert.equal(result, true);
}

{
  // down
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    [null, null, null],
    [null, "x", null],
    [null, null, null],
  ];
  /** @type {import("../src/models").Coordinate} */
  const coordinate = { x: 1, y: 0, panel: "a" };
  const [, result] = connected(board, coordinate);
  assert.equal(result, true);
}

{
  // left
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    [null, null, null],
    [null, "x", null],
    [null, null, null],
  ];
  /** @type {import("../src/models").Coordinate} */
  const coordinate = { x: 2, y: 1, panel: "a" };
  const [, result] = connected(board, coordinate);
  assert.equal(result, true);
}

{
  // right
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    [null, null, null],
    [null, "x", null],
    [null, null, null],
  ];
  /** @type {import("../src/models").Coordinate} */
  const coordinate = { x: 0, y: 1, panel: "a" };
  const [, result] = connected(board, coordinate);
  assert.equal(result, true);
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    [null, null, null],
    [null, "x", null],
    [null, null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [{ x: 0, y: 0, panel: "a" }];
  const [errors, result] = hasConnection(board, coordinates);
  assert.equal(result, false);
  assert.equal(errors?.length, 1);
}

{
  /** @type {import("../src/models").BoardPanel[][]} */
  const board = [
    [null, null, null],
    [null, "x", null],
    [null, null, null],
  ];
  /** @type {import("../src/models").Coordinate[]} */
  const coordinates = [
    { x: 0, y: 0, panel: "a" },
    { x: 1, y: 0, panel: "b" },
  ];
  const [, result] = hasConnection(board, coordinates);
  assert.equal(result, true);
}

{
  const candidates = ["invalid"];
  const wordDict = new Set(["aa", "bb"]);
  (async () => {
    const [errors, result] = await allCandidatesInWordDictionary(
      candidates,
      wordDict
    );
    if (errors === null) {
      assert.fail("unreachable");
    } else {
      assert.equal(errors.length, 1);
      assert.equal(errors[0].message, "invalid is not valid word");
      assert.equal(result, false);
    }
  })();
}

{
  const candidates = ["valid"];
  const wordDict = new Set(["aa", "valid"]);
  (async () => {
    const [errors, result] = await allCandidatesInWordDictionary(
      candidates,
      wordDict
    );
    if (errors === null) {
      assert.equal(result, true);
    } else {
      assert.fail("unreachable");
    }
  })();
}

{
  const candidates = ["valid", "invalid"];
  const wordDict = new Set(["aa", "valid"]);
  (async () => {
    const [errors, result] = await allCandidatesInWordDictionary(
      candidates,
      wordDict
    );
    if (errors === null) {
      assert.fail("unreachable");
    } else {
      assert.equal(errors.length, 1);
      assert.equal(errors[0].message, "invalid is not valid word");
      assert.equal(result, false);
    }
  })();
}

{
  const candidates = ["valid", "true"];
  const wordDict = new Set(["true", "valid"]);
  (async () => {
    const [errors, result] = await allCandidatesInWordDictionary(
      candidates,
      wordDict
    );
    if (errors === null) {
      assert.equal(result, true);
    } else {
      assert.fail("unreachable");
    }
  })();
}
