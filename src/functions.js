// @ts-check

/**
 * @typedef {import('./models').Pass} Pass
 * @typedef {import('./models').Resign} Resign
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
