import { strict as assert } from "assert";

import { validateMove } from "../src/script.js";

import { buildStore } from "../src/functions.js";

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
