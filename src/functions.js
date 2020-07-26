// @ts-check

/**
 * @typedef {import('./models').Pass} Pass
 * @typedef {import('./models').Resign} Resign
 * @typedef {import('./models').Swap} Swap
 * @typedef {import('./models').Move} Move
 * @typedef {import('./models').Store} Store
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

/**
 * @returns {string}
 * @param {Swap} swap
 * @throws {Error}
 */
export function swapToParam(swap) {
  /** @type {string[]} */
  let r = [];
  r.push(swap.playerId.toString());
  r.push("s");
  r = r.concat(swap.panels);
  return r.join("|");
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
  r.push("m");
  for (const c of move.coordinates) {
    r.push(c.x.toString());
    r.push(c.y.toString());
    r.push(c.panel);
  }
  return r.join("|");
}

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
    acts: [],
    jar: [],
    currentPlayerId: 0,
    moved: false,
    over: false,
  };
}
