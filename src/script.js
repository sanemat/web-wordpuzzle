// @ts-check
"use strict";

(() => {
  /**
   * @type {string} name A name to use.
   */
  const name = "Joe";
  const store = {};
  console.log(`init ${name}`);
  window.addEventListener("load", () => {
    initialize()
      .then()
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
      area.value = urlParams.toString();
      el.append(area);

      return resolve(true);
    });
  }
})();
