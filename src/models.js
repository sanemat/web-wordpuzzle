// @ts-check
/**
 * @typedef {{
 *   type: string,
 *   playerId: number,
 * }} Pass
 */
/**
 * @typedef {{
 *   type: string,
 *   playerId: number,
 * }} Resign
 */
/**
 * @typedef {{
 *   type: string,
 *   playerId: number,
 *   panels: Panel[],
 * }} Swap
 */
/**
 * @typedef {{
 *   width: number,
 *   height: number,
 * }} BoardMeta
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
 *   type: string,
 *   playerId: number,
 *   coordinates: Coordinate[],
 * }} Move
 */
/** @typedef {[Move, number[]]} MoveOpe */
/** @typedef {[Swap, number[]]} SwapOpe */
/**
 * @typedef {string} Panel the panel.
 * @typedef {Panel|null} BoardPanel
 */

export function _dummy() {
  return true;
}
