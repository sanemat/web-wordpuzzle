// @ts-check
"use strict";

/**
 * @typedef {{
 *   width: ?number,
 *   height: ?number,
 * }} BoardMeta
 */
/**
 * @typedef {string} Player players' name.
 * @typedef {?string} Version version string.
 * @typedef {?string} Panel the panel.
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
  boardMeta: { width: null, height: null },
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
  return new Promise((resolve, reject) => {
    const el = document.body.querySelector("#root");
    if (!el) {
      return reject(new Error("no #root"));
    }

    const area = document.createElement("textarea");
    area.classList.add("textarea");
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
    area.value = urlParams.toString();
    el.append(area);

    return resolve(true);
  });
}

(() => {
  window.addEventListener("load", () => {
    initialize()
      .then(() => {
        console.log(store);
      })
      .catch(
        /** @param {Error|string} err */ (err) => {
          console.error(err);
        }
      );
  });
})();
