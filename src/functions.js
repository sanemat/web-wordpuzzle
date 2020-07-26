// @ts-check

/**
 * @typedef {import('./models').Pass} Pass
 * @typedef {import('./models').Resign} Resign
 * @typedef {import('./models').Swap} Swap
 * @typedef {import('./models').SwapOpe} SwapOpe
 * @typedef {import('./models').Move} Move
 * @typedef {import('./models').MoveOpe} MoveOpe
 * @typedef {import('./models').Store} Store
 * @typedef {import('./models').Coordinate} Coordinate
 * @typedef {import('./models').Panel} Panel
 * @typedef {import('./models').BoardPanel} BoardPanel
 * @typedef {import('./models').Act} Act
 */

/**
 * @returns {string}
 * @param {Pass} pass
 * @throws {Error}
 */
export function passToParam(pass) {
  /** @type {string[]} */
  const r = [];
  r.push(pass.playerId.toString());
  r.push("p");
  return r.join("|");
}

/**
 * @returns {string}
 * @param {Resign} resign
 * @throws {Error}
 */
export function resignToParam(resign) {
  /** @type {string[]} */
  const r = [];
  r.push(resign.playerId.toString());
  r.push("r");
  return r.join("|");
}

/**
 * @returns {string}
 * @param {Swap} swap
 * @throws {Error}
 */
export function swapToParam(swap) {
  /** @type {string[]} */
  let r = [];
  r.push(swap.playerId.toString());
  r.push("s");
  r = r.concat(swap.panels);
  return r.join("|");
}

/**
 * @returns {string}
 * @param {Move} move
 * @throws {Error}
 */
export function moveToParam(move) {
  /** @type {string[]} */
  const r = [];
  r.push(move.playerId.toString());
  r.push("m");
  for (const c of move.coordinates) {
    r.push(c.x.toString());
    r.push(c.y.toString());
    r.push(c.panel);
  }
  return r.join("|");
}

/**
 * @returns {Store}
 */
export function _minimalStore() {
  return {
    players: [],
    version: null,
    boardMeta: { width: 0, height: 0 },
    board: [],
    hands: [],
    acts: [],
    jar: [],
    currentPlayerId: 0,
    moved: false,
    over: false,
  };
}

/**
 * @returns {Coordinate[]}
 * @param {Coordinate[]} coordinates
 */
export function sortCoordinates(coordinates) {
  if (coordinates.length === 0 || coordinates.length === 1) {
    return coordinates;
  }
  return coordinates.sort((a, b) => {
    if (a.x === b.x) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });
}

/**
 * @param {String} query
 * @returns {Store}
 * @throws {Error}
 */
export function buildStore(query) {
  const data = _minimalStore();
  const urlParams = new URLSearchParams(query);
  data.players = urlParams.getAll("ps");
  data.version = urlParams.get("v");

  /** @type {Panel[][]} */
  const hands = [];
  const hs = urlParams.getAll("hs");
  for (const h of hs) {
    hands.push(h.split("|"));
  }
  data.hands = hands;

  /** @type {Panel[]} */
  let jar = [];
  const j = urlParams.get("j");
  if (j) {
    jar = j.split("|");
  }
  data.jar = jar;

  const cp = urlParams.get("cp");
  if (typeof cp === "string") {
    data.currentPlayerId = parseInt(cp, 10);
  } else {
    data.currentPlayerId = 0;
  }

  const md = urlParams.get("md");
  data.moved = md === "1";
  const ov = urlParams.get("ov");
  data.over = ov === "1";

  data.boardMeta.width = Number(urlParams.get("bw"));
  data.boardMeta.height = Number(urlParams.get("bh"));
  const as = urlParams.getAll("as");
  /** @type {Act[]} */
  const acts = [];
  for (const m of as) {
    const parts = m.split("|");
    if (parts[1] === "m") {
      /** @type {Move} */
      const move = {
        type: "move",
        playerId: parseInt(parts[0], 10),
        coordinates: [],
      };
      for (let i = 0; i < parts.length - 2; i += 3) {
        move.coordinates.push({
          x: parseInt(parts[i + 2], 10),
          y: parseInt(parts[i + 3], 10),
          panel: parts[i + 4],
        });
      }
      move.coordinates = sortCoordinates(move.coordinates);
      acts.push(move);
    } else if (parts[1] === "p") {
      /** @type {Pass} */
      const pass = {
        type: "pass",
        playerId: parseInt(parts[0], 10),
      };
      acts.push(pass);
    } else if (parts[1] === "r") {
      /** @type {Resign} */
      const resign = {
        type: "resign",
        playerId: parseInt(parts[0], 10),
      };
      acts.push(resign);
    } else if (parts[1] === "s") {
      /** @type {Swap} */
      const swap = {
        type: "swap",
        playerId: parseInt(parts[0], 10),
        panels: parts.slice(2),
      };
      acts.push(swap);
    }
  }
  data.acts = acts;

  /** @type {BoardPanel[][]} */
  const board = [];
  for (let i = 0; i < data.boardMeta.height; i++) {
    board.push(new Array(data.boardMeta.width).fill(null));
  }
  data.board = board;

  for (const a of data.acts) {
    if (a.type === "move") {
      for (const c of /** @type {Move} */ (a).coordinates) {
        if (
          typeof data.board[c.y] === "undefined" ||
          typeof data.board[c.y][c.x] === "undefined"
        ) {
          throw new Error(`board x: ${c.x}, y: ${c.y} is unavailable`);
        }
        data.board[c.y][c.x] = c.panel;
      }
    }
  }
  return data;
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {string[][]}
 * @returns {Promise.<string[][]>}
 * @param {string[][]} data
 */
export function filterSwap(data) {
  /** @type {string[][]} */
  const r = [];
  r.push([data[0][0], data[0][1]]);
  for (let i = 0; i < data.length - 1; i += 3) {
    // panel, swap are exists
    if (data[i + 2][1].length > 0 && data[i + 3][1].length > 0) {
      r.push([data[i + 1][0], data[i + 1][1]]); // handId
      r.push([data[i + 2][0], data[i + 2][1]]); // panel
      r.push([data[i + 3][0], data[i + 3][1]]); // swap
    }
  }
  return Promise.resolve(r);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {boolean}
 * @returns {Promise.<boolean>}
 * @param {Store} store
 */
export async function passTwice(store) {
  const threshold = 2 * store.players.length;
  const targetMoves = store.acts.slice(store.acts.length - threshold);
  if (
    targetMoves.length >= threshold &&
    targetMoves.every((m) => {
      return m.type === "pass";
    })
  ) {
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {boolean}
 * @returns {Promise.<boolean>}
 * @param {Store} store
 */
export async function hasResign(store) {
  if (
    store.acts.length > 0 &&
    store.acts.some((a) => {
      return a.type === "resign";
    })
  ) {
    return Promise.resolve(true);
  } else {
    return Promise.resolve(false);
  }
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {boolean}
 * @returns {Promise.<boolean>}
 * @param {Store} store
 */
export async function satisfyGameOver(store) {
  if ((await passTwice(store)) || (await hasResign(store))) {
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}

/**
 * @promise
 * @returns {number}
 * @param {string[][]} data
 */
export function playerIdFrom(data) {
  const playerIdString = data[0][1];
  return parseInt(playerIdString, 10);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {SwapOpe}
 * @returns {Promise.<SwapOpe>}
 * @param {string[][]} data
 */
export function buildSwap(data) {
  /** @type {Swap} */
  const swap = {
    type: "swap",
    playerId: 0,
    panels: [],
  };
  /** @type {number[]} */
  const used = [];
  swap.playerId = playerIdFrom(data);
  for (let i = 0; i < data.length - 1; i += 3) {
    swap.panels.push(data[i + 2][1]);
    used.push(parseInt(data[i + 1][1], 10));
  }
  return Promise.resolve([swap, used]);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {[Error[]|null, Boolean]}
 * @returns {Promise.<[Error[]|null, Boolean]>}
 * @param {string[]} candidates
 * @param {Set<string>} wordDict
 */
export async function allCandidatesInWordDictionary(candidates, wordDict) {
  /** @type {Error[]} */
  const errors = [];
  candidates.map((candidate) => {
    if (!wordDict.has(candidate)) {
      errors.push(new Error(`${candidate} is not valid word`));
    }
  });

  return Promise.resolve(errors.length === 0 ? [null, true] : [errors, false]);
}

/**
 * @returns {[Error[]|null, Boolean]}
 * @param {Coordinate} coordinate
 * @param {BoardPanel[][]} board
 */
export function connected(board, coordinate) {
  const height = board.length;
  if (height === 0) {
    return [[new Error("require height")], false];
  }
  const width = board[0].length;
  if (width === 0) {
    return [[new Error("require width")], false];
  }

  // up
  if (coordinate.y > 0 && board[coordinate.y - 1][coordinate.x] !== null) {
    return [null, true];
  }
  // down
  if (
    coordinate.y < height - 1 &&
    board[coordinate.y + 1][coordinate.x] !== null
  ) {
    return [null, true];
  }
  // left
  if (coordinate.x > 0 && board[coordinate.y][coordinate.x - 1] !== null) {
    return [null, true];
  }
  // right
  if (
    coordinate.x < width - 1 &&
    board[coordinate.y][coordinate.x + 1] !== null
  ) {
    return [null, true];
  }
  return [null, false];
}

/**
 * @returns {[Error[]|null, Boolean]}
 * @param {Coordinate[]} coordinates
 * @param {BoardPanel[][]} board
 */
export function hasConnection(board, coordinates) {
  const result = coordinates.some((coordinate) => {
    const [, res] = connected(board, coordinate);
    return res;
  });
  return result ? [null, true] : [[new Error("has no connection")], false];
}

/**
 * @returns {[Error[]|null, Boolean]}
 * @param {Coordinate[]} coordinates
 */
export function isUnique(coordinates) {
  /** @type {Error[]} */
  const errors = [];
  if (coordinates.length === 0 || coordinates.length === 1) {
    return [null, true];
  }
  for (const [i, coordinate] of coordinates.entries()) {
    for (let j = i + 1; j < coordinates.length; j++) {
      if (
        coordinate.x === coordinates[j].x &&
        coordinate.y === coordinates[j].y
      ) {
        errors.push(
          new Error(`x: ${coordinate.x}, y: ${coordinate.y} repeats`)
        );
      }
    }
  }
  return errors.length === 0 ? [null, true] : [errors, false];
}

/**
 * @returns {[Error[]|null, Boolean]}
 * @param {Coordinate[]} coordinates
 * @param {BoardPanel[][]} board
 */
export function isSequence(board, coordinates) {
  if (coordinates.length === 0 || coordinates.length === 1) {
    return [null, true];
  }
  /** @type {Error[]} */
  const errors = [];
  const hasSameX = coordinates.every((coordinate) => {
    return coordinate.x === coordinates[0].x;
  });
  const hasSameY = coordinates.every((coordinate) => {
    return coordinate.y === coordinates[0].y;
  });
  if (!hasSameX && !hasSameY) {
    errors.push(new Error(`not same x and not same y`));
  }

  return errors.length === 0 ? [null, true] : [errors, false];
}

/**
 * @returns {BoardPanel}
 * @param {number} x
 * @param {number} y
 * @param {BoardPanel[][]} board
 * @param {Coordinate[]} coordinates
 * @throws {Error}
 */
export function anywayGet(x, y, board, coordinates) {
  if (typeof board[y] === "undefined") {
    throw new Error(`y: ${y} is out of range`);
  }
  if (typeof board[y][x] === "undefined") {
    throw new Error(`x: ${x} is out of range`);
  }
  if (board[y][x] !== null) {
    return board[y][x];
  }
  const fit = coordinates.find((coordinate) => {
    return coordinate.x === x && coordinate.y === y;
  });

  return fit ? fit.panel : null;
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {string[][]}
 * @returns {Promise.<string[][]>}
 * @param {string[][]} data
 */
export function filterMove(data) {
  /** @type {string[][]} */
  const r = [];
  r.push([data[0][0], data[0][1]]);
  for (let i = 0; i < data.length - 1; i += 4) {
    // panel, x, y are exists
    if (
      data[i + 2][1].length > 0 &&
      data[i + 3][1].length > 0 &&
      data[i + 4][1].length > 0
    ) {
      r.push([data[i + 1][0], data[i + 1][1]]); // handId
      r.push([data[i + 2][0], data[i + 2][1]]); // panel
      r.push([data[i + 3][0], data[i + 3][1]]); // x
      r.push([data[i + 4][0], data[i + 4][1]]); // y
    }
  }
  return Promise.resolve(r);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {MoveOpe}
 * @returns {Promise.<MoveOpe>}
 * @param {string[][]} data
 */
export function buildMove(data) {
  /** @type {Move} */
  const move = {
    type: "move",
    playerId: 0,
    coordinates: [],
  };
  /** @type {number[]} */
  const used = [];
  move.playerId = playerIdFrom(data);
  for (let i = 0; i < data.length - 1; i += 4) {
    move.coordinates.push({
      panel: data[i + 2][1],
      x: parseInt(data[i + 3][1], 10),
      y: parseInt(data[i + 4][1], 10),
    });
    used.push(parseInt(data[i + 1][1], 10));
  }
  move.coordinates = sortCoordinates(move.coordinates);
  return Promise.resolve([move, used]);
}

/**
 * @param {BoardPanel[][]} board
 * @param {Coordinate[]} coordinates
 * @promise
 * @reject {Error}
 * @fulfill {[Error[]|null, string[]|null]}
 * @returns {Promise.<[Error[]|null, string[]|null]>}
 * @throws {Error}
 */
export function findCandidates(board, coordinates) {
  /** @type {Error[]} */
  const errors = [];
  const height = board.length;
  if (height === 0) {
    errors.push(new Error("require height"));
    return Promise.resolve([errors, null]);
  }
  const width = board[0].length;
  if (width === 0) {
    errors.push(new Error("require width"));
    return Promise.resolve([errors, null]);
  }

  if (coordinates.length === 0) {
    return Promise.resolve([null, null]);
  }

  /** @type {string[]} */
  const results = [];

  for (let i = 0; i <= height - 1; i++) {
    const some = coordinates.some((coordinate) => {
      return coordinate.y === i;
    });
    if (!some) {
      continue;
    }
    let start = coordinates[0].x;
    let end = coordinates[coordinates.length - 1].x;
    for (;;) {
      /** @type {boolean} */
      let cond;
      try {
        cond =
          start - 1 < 0 || anywayGet(start - 1, i, board, coordinates) === null;
      } catch (e) {
        errors.push(e);
        return Promise.resolve([errors, null]);
      }
      if (cond) {
        break;
      }
      start--;
    }
    for (;;) {
      /** @type {boolean} */
      let cond;
      try {
        cond =
          end + 1 > width - 1 ||
          anywayGet(end + 1, i, board, coordinates) === null;
      } catch (e) {
        errors.push(e);
        return Promise.resolve([errors, null]);
      }
      if (cond) {
        break;
      }
      end++;
    }
    if (end - start <= 0) {
      continue;
    }
    /** @type {Panel[]} panels */
    let panels = [];
    for (let j = start; j <= end; j++) {
      /** @type {BoardPanel} */
      let target;
      try {
        target = anywayGet(j, i, board, coordinates);
      } catch (e) {
        errors.push(e);
        return Promise.resolve([errors, null]);
      }
      if (target) {
        panels.push(target);
      } else {
        errors.push(new Error(`Empty panel x:${j}, y: ${i}`));
      }
    }
    results.push(panels.join(""));
  }

  for (let i = 0; i <= width - 1; i++) {
    const some = coordinates.some((coordinate) => {
      return coordinate.x === i;
    });
    if (!some) {
      continue;
    }
    let start = coordinates[0].y;
    let end = coordinates[coordinates.length - 1].y;
    for (;;) {
      /** @type {boolean} */
      let cond;
      try {
        cond =
          start - 1 < 0 || anywayGet(i, start - 1, board, coordinates) === null;
      } catch (e) {
        errors.push(e);
        return Promise.resolve([errors, null]);
      }
      if (cond) {
        break;
      }
      start--;
    }
    for (;;) {
      /** @type {boolean} */
      let cond;
      try {
        cond =
          end + 1 > height - 1 ||
          anywayGet(i, end + 1, board, coordinates) === null;
      } catch (e) {
        errors.push(e);
        return Promise.resolve([errors, null]);
      }
      if (cond) {
        break;
      }
      end++;
    }
    if (end - start <= 0) {
      continue;
    }
    /** @type {Panel[]} panels */
    let panels = [];
    for (let j = start; j <= end; j++) {
      /** @type {BoardPanel} */
      let target;
      try {
        target = anywayGet(i, j, board, coordinates);
      } catch (e) {
        errors.push(e);
        return Promise.resolve([errors, null]);
      }
      if (target) {
        panels.push(target);
      } else {
        errors.push(new Error(`Empty panel x: ${i}, y: ${j}`));
      }
    }
    results.push(panels.join(""));
  }

  return errors.length === 0
    ? Promise.resolve([null, results])
    : Promise.resolve([errors, null]);
}
