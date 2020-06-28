// @ts-check
"use strict";

/**
 * @typedef {{
 *   width: number,
 *   height: number,
 * }} BoardMeta
 */
/**
 * @typedef {string} Player players' name.
 * @typedef {?string} Version version string.
 * @typedef {string} Panel the panel.
 * @typedef {Panel|null} BoardPanel
 */
/**
 * @typedef {{
 *   x: number,
 *   y: number,
 *   panel: Panel,
 * }} Coordinate
 */
/**
 * @typedef {{
 *   playerId: number,
 *   coordinates: Coordinate[],
 * }} Move
 */
/**
 * @typedef {{
 *   players: Player[],
 *   version: Version,
 *   boardMeta: BoardMeta,
 *   board: BoardPanel[][],
 *   hands: Panel[][],
 *   moves: Move[],
 *   jar: Panel[],
 * }} Store
 */
/**
 * @type {Store} store
 */
let store;

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
    moves: [],
    jar: [],
  };
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

  data.boardMeta.width = Number(urlParams.get("bw"));
  data.boardMeta.height = Number(urlParams.get("bh"));
  const ms = urlParams.getAll("ms");
  /** @type {Move[]} */
  const moves = [];
  for (const m of ms) {
    const parts = m.split("|");
    /** @type {Move} */
    const move = { playerId: parseInt(parts[0], 10), coordinates: [] };
    for (let i = 0; i < parts.length - 1; i += 2) {
      move.coordinates.push({
        x: parseInt(parts[i + 1].charAt(0), 10),
        y: parseInt(parts[i + 1].charAt(1), 10),
        panel: parts[i + 2],
      });
    }
    moves.push(move);
  }
  data.moves = moves;

  /** @type {BoardPanel[][]} */
  const board = [];
  for (let i = 0; i < data.boardMeta.height; i++) {
    board.push(new Array(data.boardMeta.width).fill(null));
  }
  data.board = board;

  for (const m of data.moves) {
    for (const c of m.coordinates) {
      if (
        typeof data.board[c.y] === "undefined" ||
        typeof data.board[c.y][c.x] === "undefined"
      ) {
        throw new Error(`board x: ${c.x}, y: ${c.y} is unavailable`);
      }
      data.board[c.y][c.x] = c.panel;
    }
  }
  return data;
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function initialize() {
  const queryString = window.location.search;
  store = buildStore(queryString);
  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function renderGame() {
  const el = document.body.querySelector("#game");
  if (!el) {
    return Promise.reject(new Error("no #game"));
  }
  el.innerHTML = "";

  const area = document.createElement("pre");
  area.innerText = JSON.stringify(store.board, null, 2);
  el.appendChild(area);
  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function renderHands() {
  const el = document.body.querySelector(".js-hands");
  if (!el) {
    return Promise.reject(new Error("no .js-hands"));
  }
  el.innerHTML = "";

  // TODO: Choose current player
  const playerId = 0;
  const playerIdInput = document.createElement("input");
  playerIdInput.setAttribute("type", "hidden");
  playerIdInput.setAttribute("name", "playerId");
  playerIdInput.setAttribute("value", playerId.toString());
  el.appendChild(playerIdInput);
  for (const [i, v] of store.hands[playerId].entries()) {
    const grouped = document.createElement("div");
    grouped.classList.add("field");
    grouped.classList.add("is-grouped");
    const handId = document.createElement("input");
    handId.setAttribute("type", "hidden");
    handId.setAttribute("name", "handId");
    handId.setAttribute("value", i.toString());
    grouped.appendChild(handId);

    // panel
    const control1 = document.createElement("div");
    control1.classList.add("control");
    const select1 = document.createElement("div");
    select1.classList.add("select");
    const panel = document.createElement("select");
    panel.setAttribute("name", "panel");
    panel.add(new Option(v ?? "", v ?? "", true, true));
    select1.appendChild(panel);
    control1.appendChild(select1);
    grouped.appendChild(control1);

    // x, y
    for (const xy of ["x", "y"]) {
      const control2 = document.createElement("div");
      control2.classList.add("control");
      const select2 = document.createElement("div");
      select2.classList.add("select");
      const coordinate = document.createElement("select");
      coordinate.setAttribute("name", xy);
      coordinate.add(new Option());
      const lim = xy === "x" ? store.boardMeta.width : store.boardMeta.height;
      for (let j = 0; j < lim; j++) {
        coordinate.add(new Option(j.toString(), j.toString()));
      }
      select2.appendChild(coordinate);
      control2.appendChild(select2);
      grouped.appendChild(control2);
    }

    el.appendChild(grouped);
  }
  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @returns {Promise.<any>}
 */
function render() {
  return Promise.all([renderGame(), renderHands()]);
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

/** @typedef {[Move, number[]]} MoveOpe */

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
    playerId: 0,
    coordinates: [],
  };
  /** @type {number[]} */
  const used = [];
  move.playerId = parseInt(data[0][1], 10);
  for (let i = 0; i < data.length - 1; i += 4) {
    move.coordinates.push({
      panel: data[i + 2][1],
      x: parseInt(data[i + 3][1], 10),
      y: parseInt(data[i + 4][1], 10),
    });
    used.push(parseInt(data[i + 1][1], 10));
  }
  return Promise.resolve([move, used]);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 * @param {Move} move
 */
function validateMove(move) {
  return Promise.resolve(true);
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
  for (const c of move.coordinates) {
    r.push(`${c.x.toString()}${c.y.toString()}`);
    r.push(c.panel);
  }
  return r.join("|");
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 * @param {Event} ev
 */
async function playAction(ev) {
  try {
    ev.preventDefault();
    if (!(ev.target instanceof HTMLFormElement)) {
      return Promise.reject(new Error("event is not form"));
    }
    // Convert from (string|FormDataEntryValue)[][] to string[][]
    const data = [...new FormData(ev.target).entries()].map((value) => {
      if (typeof value[1] !== "string") {
        throw new Error("form value is not string");
      }
      return [value[0], value[1]];
    });

    const playerId = 0;
    const [move, used] = await buildMove(await filterMove(data));
    console.log(move);
    if (await validateMove(move)) {
      console.log("move is valid");
      store.moves.push(move);
      const params = new URLSearchParams(location.search);
      params.append("ms", moveToParam(move));

      // update hands
      used.reverse().forEach((usedIndex) => {
        store.hands[playerId].splice(usedIndex, 1);
      });

      // fill from jar
      while (store.hands[playerId].length < 7 && store.jar.length > 0) {
        store.hands[playerId].push(
          store.jar.splice(Math.floor(Math.random() * store.jar.length), 1)[0]
        );
      }
      params.set("j", store.jar.join("|"));

      const hs = params.getAll("hs");
      params.delete("hs");
      for (const [i, v] of hs.entries()) {
        if (i === playerId) {
          params.append("hs", store.hands[playerId].join("|"));
        } else {
          params.append("hs", v);
        }
      }

      for (const m of store.moves) {
        for (const c of m.coordinates) {
          store.board[c.y][c.x] = c.panel;
        }
      }
      window.history.pushState({}, "", `${location.pathname}?${params}`);
      console.log(store);
      return render();
    }
    return Promise.resolve(true);
  } catch (/** @type {Error|string} */ e) {
    return Promise.reject(e);
  }
}

(() => {
  if (typeof window === "undefined") {
    return;
  }
  window.addEventListener("load", async () => {
    try {
      await initialize();
      console.log(store);
      await render();
    } catch (/** @type {Error|string} */ err) {
      console.error(err);
    }
  });
  const play = document.body.querySelector(".js-play");
  if (play) {
    play.addEventListener("submit", playAction);
  }
})();
