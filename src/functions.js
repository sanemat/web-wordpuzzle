// @ts-check

/**
 * @typedef {{
 *   type: string,
 *   playerId: number,
 * }} Pass
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
