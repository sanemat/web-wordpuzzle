// @ts-check

/**
 * @typedef {import('./models').Pass} Pass
 * @typedef {import('./models').Resign} Resign
 * @typedef {import('./models').Swap} Swap
 * @typedef {import('./models').Move} Move
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
