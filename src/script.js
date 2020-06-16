// @ts-check
"use strict";

/**
 * @typedef {Object<string, any>} BoardMeta
 * @property {?number} width The width of the board.
 * @property {?number} height The height of the board.
 */
/**
 * @typedef {string} Player players' name.
 * @typedef {?string} Version version string.
 * @typedef {?string} Panel the panel.
 */
/**
 * @typedef {Object<string, any>} Coordinate
 * @property {number} x
 * @property {number} y
 * @property {Panel} panel
 */
/**
 * @typedef {Object<string, any>} Move
 * @property {Player} player
 * @property {Coordinate[]} coordinates
 */

/**
 * @typedef {Object<string, any>} Store
 * @property {Player[]} players The list of player.
 * @property {Version} version The app version.
 * @property {BoardMeta} boardMeta The board options.
 * @property {Panel[][]} board The board.
 * @property {Panel[]} hands The hands.
 * @property {Move[]} moves The moves.
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
    store.players = urlParams.getAll("ps"); // type-coverage:ignore-line
    store.version = urlParams.get("v"); // type-coverage:ignore-line
    store.hands = urlParams.getAll("hs"); // type-coverage:ignore-line
    store.boardMeta.width = Number(urlParams.get("bw")); // type-coverage:ignore-line
    store.boardMeta.height = Number(urlParams.get("bh")); // type-coverage:ignore-line
    const ms = urlParams.getAll("ms");
    for (const m of ms) {
      const parts = m.split("|");
      /** @type {Move} */
      const move = {};
      move.player = parts[0]; // type-coverage:ignore-line
      move.coordinates = []; // type-coverage:ignore-line
      for (let i = 0; i < parts.length - 1; i += 2) {
        // type-coverage:ignore-next-line
        move.coordinates = move.coordinates.concat({
          x: parseInt(parts[i + 1].charAt(0), 10),
          y: parseInt(parts[i + 1].charAt(1), 10),
          panel: parts[i + 2],
        });
      }
      store.moves = store.moves.concat(move); // type-coverage:ignore-line
    }
    // type-coverage:ignore-next-line
    store.board = Array.from(
      new Array(store.boardMeta.height), // type-coverage:ignore-line
      () => new Array(store.boardMeta.width).fill(null) // type-coverage:ignore-line
    );
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
