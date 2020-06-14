// @ts-check
"use strict";

/**
 * @typedef {Object<string, any>} Store
 * @property {Player[]} players list of player.
 * @property {Version} version The app version.
 * @typedef {string} Player players' name.
 * @typedef {string|null} Version version string.
 * @type {Store} store
 */
const store = {
  players: [],
  version: null,
};

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
      store.players = store.players.concat(urlParams.getAll("ps")); // type-coverage:ignore-line
      store.version = urlParams.get("v"); // type-coverage:ignore-line
      area.value = urlParams.toString();
      el.append(area);

      return resolve(true);
    });
  }
})();
