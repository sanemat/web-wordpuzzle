// @ts-check
"use strict";

(() => {
  /**
   * @typedef {Object<string, any>} Store
   * @property {string[]} players The players' name.
   * @type {Store} store
   */
  const store = {
    players: [],
  };

  window.addEventListener("load", () => {
    initialize()
      .then((value) => {
        console.log(store);
      })
      .catch((/** @type {Error|string} */ err) => {
        console.error(err);
      });
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
      area.value = urlParams.toString();
      el.append(area);

      return resolve(true);
    });
  }
})();
