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
/** @typedef {string} Player players' name. */
/** @typedef {?string} Version version string. */
/** @typedef {Move|Pass|Resign|Swap} Act */
/**
 * @typedef {{
 *   players: Player[],
 *   version: Version,
 *   boardMeta: BoardMeta,
 *   board: BoardPanel[][],
 *   hands: Panel[][],
 *   acts: Act[],
 *   jar: Panel[],
 *   currentPlayerId: number,
 *   moved: boolean,
 *   over: boolean,
 * }} Store
 */
/** @typedef {{render: boolean}} Debug */

export function _dummy() {
  return true;
}
