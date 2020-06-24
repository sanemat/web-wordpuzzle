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
 *   board: Panel[][],
 *   hands: Panel[],
 *   moves: Move[],
 * }} Store
 */
/**
 * @type {Store} store
 */
const store = {
  players: [],
  version: null,
  boardMeta: { width: 0, height: 0 },
  board: [],
  hands: [],
  moves: [],
};

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function initialize() {
  return new Promise((resolve) => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    store.players = urlParams.getAll("ps");
    store.version = urlParams.get("v");
    const hs = urlParams.get("hs");
    if (hs !== null) {
      store.hands = hs.split("|");
    }
    store.boardMeta.width = Number(urlParams.get("bw"));
    store.boardMeta.height = Number(urlParams.get("bh"));
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
    store.moves = moves;

    /** @type {Panel[][]} */
    const board = [];
    for (let i = 0; i < store.boardMeta.height; i++) {
      board.push(new Array(store.boardMeta.width).fill(null));
    }
    store.board = board;

    for (const m of store.moves) {
      for (const c of m.coordinates) {
        store.board[c.y][c.x] = c.panel;
      }
    }
    return resolve(true);
  });
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function renderGame() {
  return new Promise((resolve, reject) => {
    const el = document.body.querySelector("#game");
    if (!el) {
      return reject(new Error("no #game"));
    }

    const area = document.createElement("pre");
    area.innerText = JSON.stringify(store.board, null, 2);
    el.appendChild(area);
    return resolve(true);
  });
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function renderHands() {
  return new Promise((resolve, reject) => {
    const el = document.body.querySelector(".js-hands");
    if (!el) {
      return reject(new Error("no .js-hands"));
    }

    for (const [i, v] of store.hands.entries()) {
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
      panel.add(new Option(v, v, true, true));
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

    return resolve(true);
  });
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
 * @fulfill {Move}
 * @returns {Promise.<Move>}
 * @param {FormData} data
 */
function buildMove(data) {
  return new Promise((resolve) => {
    // TODO: Reject no use
    // TODO: Build move from actual data
    /** @type {Move} */
    const move = { playerId: 0, coordinates: [] };
    return resolve(move);
  });
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
      throw new Error("event is not form");
    }
    const move = await buildMove(new FormData(ev.target));
    console.log(move);
    if (await validateMove(move)) {
      console.log("move is valid");
      const params = new URLSearchParams(location.search);
      params.set("bh", "5");

      window.history.pushState({}, "", `${location.pathname}?${params}`);
      return Promise.resolve(true);
    }
    return Promise.resolve(true);
  } catch (/** @type {Error|string} */ e) {
    return Promise.reject(e);
  }
}

(() => {
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
