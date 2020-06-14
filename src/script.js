// @ts-check
"use strict";

/**
 * @typedef {Object<string, any>} BoardMeta
 * @property {?number} width The width of the board.
 * @property {?number} height The height of the board.
 *
 * @typedef {string} Player players' name.
 * @typedef {?string} Version version string.
 */

/**
 * @typedef {Object<string, any>} Store
 * @property {Player[]} players The list of player.
 * @property {Version} version The app version.
 * @property {BoardMeta} boardMeta The board options.
 * @type {Store} store
 */
const store = {
  players: [],
  version: null,
  boardMeta: { width: null, height: null },
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
    store.boardMeta.width = Number(urlParams.get("bw")); // type-coverage:ignore-line
    store.boardMeta.height = Number(urlParams.get("bh")); // type-coverage:ignore-line
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
