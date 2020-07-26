// @ts-check
"use strict";

/**
 * @typedef {import('./models').Player} Player
 * @typedef {import('./models').Version} Version
 * @typedef {import('./models').Pass} Pass
 * @typedef {import('./models').Resign} Resign
 * @typedef {import('./models').Swap} Swap
 * @typedef {import('./models').Move} Move
 * @typedef {import('./models').Act} Act
 * @typedef {import('./models').MoveOpe} MoveOpe
 * @typedef {import('./models').SwapOpe} SwapOpe
 * @typedef {import('./models').Panel} Panel
 * @typedef {import('./models').BoardPanel} BoardPanel
 * @typedef {import('./models').BoardMeta} BoardMeta
 * @typedef {import('./models').Coordinate} Coordinate
 * @typedef {import('./models').Store} Store
 * @typedef {import('./models').Debug} Debug
 */
import {
  moveToParam,
  passToParam,
  resignToParam,
  swapToParam,
  buildStore,
  sortCoordinates,
  filterSwap,
  satisfyGameOver,
  playerIdFrom,
  buildSwap,
  allCandidatesInWordDictionary,
  hasConnection,
  isUnique,
  isSequence,
} from "./functions.js";

/**
 * @type {Store} store
 */
let store;

/** @type {Debug} debug */
let debug;

/** @typedef {Set<string>} Words */
/** @type {Words} words */
let words;

/**
 * @param {String} query
 * @returns {Debug}
 * @throws {Error}
 */
function buildDebug(query) {
  /** @type {Debug} */
  const data = {};
  const urlParams = new URLSearchParams(query);
  let render = true;
  if (urlParams.get("debugRender") === "0") {
    render = false;
  }
  data.render = render;
  return data;
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function initialize() {
  const queryString = window.location.search;
  store = buildStore(queryString);
  debug = buildDebug(queryString);
  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function renderGame() {
  const el = document.body.querySelector("#game");
  if (!el) {
    return Promise.reject(new Error("no #game"));
  }
  el.innerHTML = "";

  const game = document.createElement("div");
  // players
  {
    const rowElem = document.createElement("div");
    rowElem.classList.add("columns");
    rowElem.classList.add("is-mobile");
    for (const [i, player] of store.players.entries()) {
      const playerElem = document.createElement("div");
      playerElem.classList.add("column");
      const playerText = document.createTextNode(
        `${player}${store.currentPlayerId === i ? " *" : ""}`
      );
      playerElem.appendChild(playerText);
      rowElem.appendChild(playerElem);
    }
    game.appendChild(rowElem);
  }

  // board header
  {
    const rowElem = document.createElement("div");
    rowElem.classList.add("columns");
    rowElem.classList.add("is-mobile");
    const panelElem = document.createElement("div");
    panelElem.classList.add("column");
    const text = "";
    const panelText = document.createTextNode(text);
    panelElem.appendChild(panelText);
    rowElem.appendChild(panelElem);
    for (let i = 0; i < store.boardMeta.width; i++) {
      const panelElem = document.createElement("div");
      panelElem.classList.add("column");
      const text = `x${i}`;
      const panelText = document.createTextNode(text);
      panelElem.appendChild(panelText);
      rowElem.appendChild(panelElem);
    }
    game.appendChild(rowElem);
  }
  // board
  for (const [i, row] of store.board.entries()) {
    const rowElem = document.createElement("div");
    rowElem.classList.add("columns");
    rowElem.classList.add("is-mobile");
    {
      const panelElem = document.createElement("div");
      panelElem.classList.add("column");
      const text = `y${i}`;
      const panelText = document.createTextNode(text);
      panelElem.appendChild(panelText);
      rowElem.appendChild(panelElem);
    }
    for (const boardPanel of row) {
      const panelElem = document.createElement("div");
      panelElem.classList.add("column");
      /** @type {string} */
      let text;
      if (boardPanel === null) {
        text = "(null)";
      } else {
        text = boardPanel;
      }
      const panelText = document.createTextNode(text);
      panelElem.appendChild(panelText);
      rowElem.appendChild(panelElem);
    }
    game.appendChild(rowElem);
  }
  el.appendChild(game);

  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function showPlayArea() {
  const playArea = document.body.querySelector(".js-play-area");
  if (!playArea || !(playArea instanceof HTMLElement)) {
    return Promise.reject(new Error("no .js-play-area"));
  }
  playArea.style.display = "block";

  const coordinatesElem = document.body.querySelector(".js-play-coordinates");
  if (!coordinatesElem) {
    return Promise.reject(new Error("no .js-play-coordinates"));
  }
  coordinatesElem.innerHTML = "";

  const playerId = store.currentPlayerId;

  const playerIdInput = document.createElement("input");
  playerIdInput.setAttribute("type", "hidden");
  playerIdInput.setAttribute("name", "playerId");
  playerIdInput.setAttribute("value", playerId.toString());
  coordinatesElem.appendChild(playerIdInput);
  for (const [i, v] of store.hands[playerId].entries()) {
    const grouped = document.createElement("div");
    grouped.classList.add("field");
    grouped.classList.add("is-grouped");

    {
      const handId = document.createElement("input");
      handId.setAttribute("type", "hidden");
      handId.setAttribute("name", "handId");
      handId.setAttribute("value", i.toString());
      grouped.appendChild(handId);
    }

    // panel
    {
      const control = document.createElement("div");
      control.classList.add("control");
      const label = document.createElement("label");
      label.setAttribute("for", `play${i}panel`);
      const select = document.createElement("div");
      select.classList.add("select");
      const panel = document.createElement("select");
      panel.setAttribute("name", "panel");
      panel.setAttribute("id", `play${i}panel`);
      panel.add(new Option(v, v, true, true));
      select.appendChild(panel);
      control.appendChild(label);
      control.appendChild(select);
      grouped.appendChild(control);
    }

    // x, y
    for (const xy of ["x", "y"]) {
      const control = document.createElement("div");
      control.classList.add("control");
      const label = document.createElement("label");
      label.setAttribute("for", `play${i}${xy}`);
      const select = document.createElement("div");
      select.classList.add("select");
      const coordinate = document.createElement("select");
      coordinate.setAttribute("name", xy);
      coordinate.setAttribute("id", `play${i}${xy}`);
      coordinate.add(new Option());
      const lim = xy === "x" ? store.boardMeta.width : store.boardMeta.height;
      for (let j = 0; j < lim; j++) {
        coordinate.add(new Option(j.toString(), j.toString()));
      }
      select.appendChild(coordinate);
      control.appendChild(label);
      control.appendChild(select);
      grouped.appendChild(control);
    }

    coordinatesElem.appendChild(grouped);
  }
  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function hidePlayArea() {
  const playArea = document.body.querySelector(".js-play-area");
  if (!playArea || !(playArea instanceof HTMLElement)) {
    return Promise.reject(new Error("no .js-play-area"));
  }
  playArea.style.display = "none";
  return Promise.resolve(true);
}
/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function renderPlayArea() {
  if (store.moved || store.over) {
    return hidePlayArea();
  } else {
    return showPlayArea();
  }
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function showResignArea() {
  const resignArea = document.body.querySelector(".js-resign-area");
  if (!resignArea || !(resignArea instanceof HTMLElement)) {
    return Promise.reject(new Error("no .js-resign-area"));
  }
  resignArea.style.display = "block";
  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function hideResignArea() {
  const resignArea = document.body.querySelector(".js-resign-area");
  if (!resignArea || !(resignArea instanceof HTMLElement)) {
    return Promise.reject(new Error("no .js-resign-area"));
  }
  resignArea.style.display = "none";
  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function renderResignArea() {
  if (store.moved || store.over) {
    return hideResignArea();
  } else {
    return showResignArea();
  }
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function hidePassArea() {
  const passArea = document.body.querySelector(".js-pass-area");
  if (!passArea || !(passArea instanceof HTMLElement)) {
    return Promise.reject(new Error("no .js-pass-area"));
  }
  passArea.style.display = "none";
  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function showPassArea() {
  const passArea = document.body.querySelector(".js-pass-area");
  if (!passArea || !(passArea instanceof HTMLElement)) {
    return Promise.reject(new Error("no .js-pass-area"));
  }
  passArea.style.display = "block";
  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function renderPassArea() {
  if (store.moved || store.over) {
    return hidePassArea();
  } else {
    return showPassArea();
  }
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function hideOverArea() {
  const overArea = document.body.querySelector(".js-over-area");
  if (!overArea || !(overArea instanceof HTMLElement)) {
    return Promise.reject(new Error("no .js-over-area"));
  }
  overArea.style.display = "none";
  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function showOverArea() {
  const overArea = document.body.querySelector(".js-over-area");
  if (!overArea || !(overArea instanceof HTMLElement)) {
    return Promise.reject(new Error("no .js-over-area"));
  }
  overArea.style.display = "block";
  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function renderOverArea() {
  if (store.over) {
    return showOverArea();
  } else {
    return hideOverArea();
  }
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function hideNextArea() {
  const nextArea = document.body.querySelector(".js-next-area");
  if (!nextArea || !(nextArea instanceof HTMLElement)) {
    return Promise.reject(new Error("no .js-next-area"));
  }

  nextArea.style.display = "none";
  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function showNextArea() {
  const nextArea = document.body.querySelector(".js-next-area");
  if (!nextArea || !(nextArea instanceof HTMLElement)) {
    return Promise.reject(new Error("no .js-next-area"));
  }

  nextArea.style.display = "block";
  const handsElem = nextArea.querySelector(".js-next-hands");
  if (!handsElem) {
    return Promise.reject(new Error("no .js-next-hands"));
  }
  handsElem.innerHTML = "";
  const playerId = store.currentPlayerId;

  {
    const columns = document.createElement("div");
    columns.classList.add("columns");
    for (const hand of store.hands[playerId]) {
      const handElem = document.createElement("div");
      handElem.classList.add("column");
      const panelText = document.createTextNode(hand);
      handElem.appendChild(panelText);
      columns.appendChild(handElem);
    }
    handsElem.appendChild(columns);
  }

  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function renderNextArea() {
  if (store.moved || store.over) {
    return showNextArea();
  } else {
    return hideNextArea();
  }
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function hideSwapArea() {
  const swapArea = document.body.querySelector(".js-swap-area");
  if (!swapArea || !(swapArea instanceof HTMLElement)) {
    return Promise.reject(new Error("no .js-swap-area"));
  }
  swapArea.style.display = "none";
  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function showSwapArea() {
  const swapArea = document.body.querySelector(".js-swap-area");
  if (!swapArea || !(swapArea instanceof HTMLElement)) {
    return Promise.reject(new Error("no .js-swap-area"));
  }
  swapArea.style.display = "block";

  const coordinatesElem = document.body.querySelector(".js-swap-coordinates");
  if (!coordinatesElem) {
    return Promise.reject(new Error("no .js-swap-coordinates"));
  }
  coordinatesElem.innerHTML = "";

  const playerId = store.currentPlayerId;

  const playerIdInput = document.createElement("input");
  playerIdInput.setAttribute("type", "hidden");
  playerIdInput.setAttribute("name", "playerId");
  playerIdInput.setAttribute("value", playerId.toString());
  coordinatesElem.appendChild(playerIdInput);
  for (const [i, v] of store.hands[playerId].entries()) {
    const grouped = document.createElement("div");
    grouped.classList.add("field");
    grouped.classList.add("is-grouped");

    {
      const handId = document.createElement("input");
      handId.setAttribute("type", "hidden");
      handId.setAttribute("name", "handId");
      handId.setAttribute("value", i.toString());
      grouped.appendChild(handId);
    }

    // panel
    {
      const control = document.createElement("div");
      control.classList.add("control");
      const label = document.createElement("label");
      label.setAttribute("for", `swap${i}panel`);
      const select = document.createElement("div");
      select.classList.add("select");
      const panel = document.createElement("select");
      panel.setAttribute("name", "panel");
      panel.setAttribute("id", `swap${i}panel`);
      panel.add(new Option(v, v, true, true));
      select.appendChild(panel);
      control.appendChild(label);
      control.appendChild(select);
      grouped.appendChild(control);
    }

    // swap
    {
      const control = document.createElement("div");
      control.classList.add("control");
      const label = document.createElement("label");
      label.setAttribute("for", `swap${i}`);
      const select = document.createElement("div");
      select.classList.add("select");
      const swap = document.createElement("select");
      swap.setAttribute("name", "swap");
      swap.setAttribute("id", `swap${i}`);
      swap.add(new Option());
      swap.add(new Option("swap", "1"));
      select.appendChild(swap);
      control.appendChild(label);
      control.appendChild(select);
      grouped.appendChild(control);
    }

    coordinatesElem.appendChild(grouped);
  }

  return Promise.resolve(true);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
function renderSwapArea() {
  if (store.moved || store.over) {
    return hideSwapArea();
  } else {
    return showSwapArea();
  }
}

/**
 * @promise
 * @reject {Error}
 * @returns {Promise.<any>}
 */
function render() {
  if (!debug.render) {
    return Promise.resolve(true);
  }
  return Promise.all([
    renderGame(),
    renderPlayArea(),
    renderNextArea(),
    renderSwapArea(),
    renderPassArea(),
    renderOverArea(),
    renderResignArea(),
  ]);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {string[][]}
 * @returns {Promise.<string[][]>}
 * @param {string[][]} data
 */
export function filterMove(data) {
  /** @type {string[][]} */
  const r = [];
  r.push([data[0][0], data[0][1]]);
  for (let i = 0; i < data.length - 1; i += 4) {
    // panel, x, y are exists
    if (
      data[i + 2][1].length > 0 &&
      data[i + 3][1].length > 0 &&
      data[i + 4][1].length > 0
    ) {
      r.push([data[i + 1][0], data[i + 1][1]]); // handId
      r.push([data[i + 2][0], data[i + 2][1]]); // panel
      r.push([data[i + 3][0], data[i + 3][1]]); // x
      r.push([data[i + 4][0], data[i + 4][1]]); // y
    }
  }
  return Promise.resolve(r);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {MoveOpe}
 * @returns {Promise.<MoveOpe>}
 * @param {string[][]} data
 */
export function buildMove(data) {
  /** @type {Move} */
  const move = {
    type: "move",
    playerId: 0,
    coordinates: [],
  };
  /** @type {number[]} */
  const used = [];
  move.playerId = playerIdFrom(data);
  for (let i = 0; i < data.length - 1; i += 4) {
    move.coordinates.push({
      panel: data[i + 2][1],
      x: parseInt(data[i + 3][1], 10),
      y: parseInt(data[i + 4][1], 10),
    });
    used.push(parseInt(data[i + 1][1], 10));
  }
  move.coordinates = sortCoordinates(move.coordinates);
  return Promise.resolve([move, used]);
}

/**
 * @returns {BoardPanel}
 * @param {number} x
 * @param {number} y
 * @param {BoardPanel[][]} board
 * @param {Coordinate[]} coordinates
 * @throws {Error}
 */
export function anywayGet(x, y, board, coordinates) {
  if (typeof board[y] === "undefined") {
    throw new Error(`y: ${y} is out of range`);
  }
  if (typeof board[y][x] === "undefined") {
    throw new Error(`x: ${x} is out of range`);
  }
  if (board[y][x] !== null) {
    return board[y][x];
  }
  const fit = coordinates.find((coordinate) => {
    return coordinate.x === x && coordinate.y === y;
  });

  return fit ? fit.panel : null;
}

/**
 * @param {BoardPanel[][]} board
 * @param {Coordinate[]} coordinates
 * @promise
 * @reject {Error}
 * @fulfill {[Error[]|null, string[]|null]}
 * @returns {Promise.<[Error[]|null, string[]|null]>}
 * @throws {Error}
 */
export function findCandidates(board, coordinates) {
  /** @type {Error[]} */
  const errors = [];
  const height = board.length;
  if (height === 0) {
    errors.push(new Error("require height"));
    return Promise.resolve([errors, null]);
  }
  const width = board[0].length;
  if (width === 0) {
    errors.push(new Error("require width"));
    return Promise.resolve([errors, null]);
  }

  if (coordinates.length === 0) {
    return Promise.resolve([null, null]);
  }

  /** @type {string[]} */
  const results = [];

  for (let i = 0; i <= height - 1; i++) {
    const some = coordinates.some((coordinate) => {
      return coordinate.y === i;
    });
    if (!some) {
      continue;
    }
    let start = coordinates[0].x;
    let end = coordinates[coordinates.length - 1].x;
    for (;;) {
      /** @type {boolean} */
      let cond;
      try {
        cond =
          start - 1 < 0 || anywayGet(start - 1, i, board, coordinates) === null;
      } catch (e) {
        errors.push(e);
        return Promise.resolve([errors, null]);
      }
      if (cond) {
        break;
      }
      start--;
    }
    for (;;) {
      /** @type {boolean} */
      let cond;
      try {
        cond =
          end + 1 > width - 1 ||
          anywayGet(end + 1, i, board, coordinates) === null;
      } catch (e) {
        errors.push(e);
        return Promise.resolve([errors, null]);
      }
      if (cond) {
        break;
      }
      end++;
    }
    if (end - start <= 0) {
      continue;
    }
    /** @type {Panel[]} panels */
    let panels = [];
    for (let j = start; j <= end; j++) {
      /** @type {BoardPanel} */
      let target;
      try {
        target = anywayGet(j, i, board, coordinates);
      } catch (e) {
        errors.push(e);
        return Promise.resolve([errors, null]);
      }
      if (target) {
        panels.push(target);
      } else {
        errors.push(new Error(`Empty panel x:${j}, y: ${i}`));
      }
    }
    results.push(panels.join(""));
  }

  for (let i = 0; i <= width - 1; i++) {
    const some = coordinates.some((coordinate) => {
      return coordinate.x === i;
    });
    if (!some) {
      continue;
    }
    let start = coordinates[0].y;
    let end = coordinates[coordinates.length - 1].y;
    for (;;) {
      /** @type {boolean} */
      let cond;
      try {
        cond =
          start - 1 < 0 || anywayGet(i, start - 1, board, coordinates) === null;
      } catch (e) {
        errors.push(e);
        return Promise.resolve([errors, null]);
      }
      if (cond) {
        break;
      }
      start--;
    }
    for (;;) {
      /** @type {boolean} */
      let cond;
      try {
        cond =
          end + 1 > height - 1 ||
          anywayGet(i, end + 1, board, coordinates) === null;
      } catch (e) {
        errors.push(e);
        return Promise.resolve([errors, null]);
      }
      if (cond) {
        break;
      }
      end++;
    }
    if (end - start <= 0) {
      continue;
    }
    /** @type {Panel[]} panels */
    let panels = [];
    for (let j = start; j <= end; j++) {
      /** @type {BoardPanel} */
      let target;
      try {
        target = anywayGet(i, j, board, coordinates);
      } catch (e) {
        errors.push(e);
        return Promise.resolve([errors, null]);
      }
      if (target) {
        panels.push(target);
      } else {
        errors.push(new Error(`Empty panel x: ${i}, y: ${j}`));
      }
    }
    results.push(panels.join(""));
  }

  return errors.length === 0
    ? Promise.resolve([null, results])
    : Promise.resolve([errors, null]);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {[Error[]|null, Boolean, string[]|null]}
 * @returns {Promise.<[Error[]|null, Boolean, string[]|null]>} errors, valid, wordList
 * @param {Move} move
 * @param {Store} store
 * @param {Set<string>} words
 */
export async function validateMove(move, store, words) {
  if (move.coordinates.length === 0) {
    return Promise.resolve([
      [new Error("move has no coordinates")],
      false,
      null,
    ]);
  }
  /** @type {Error[]} */
  let errors = [];
  for (const coordinate of move.coordinates) {
    if (typeof store.board[coordinate.y] === "undefined") {
      errors.push(new Error(`y: ${coordinate.y} is out of board`));
      continue;
    }
    if (typeof store.board[coordinate.y][coordinate.x] === "undefined") {
      errors.push(new Error(`x: ${coordinate.x} is out of board`));
      continue;
    }
    if (store.board[coordinate.y][coordinate.x] !== null) {
      errors.push(
        new Error(
          `x: ${coordinate.x}, y: ${coordinate.y} exists ${
            store.board[coordinate.y][coordinate.x]
          }`
        )
      );
    }
  }
  if (errors.length !== 0) {
    return Promise.resolve([errors, false, null]);
  }
  {
    const [errs, res] = isUnique(move.coordinates);
    if (!res && errs !== null) {
      errors = errors.concat(errs);
      return Promise.resolve([errors, false, null]);
    }
  }
  {
    const [errs, res] = isSequence(store.board, move.coordinates);
    if (!res && errs !== null) {
      errors = errors.concat(errs);
      return Promise.resolve([errors, false, null]);
    }
  }
  {
    const [errs, res] = hasConnection(store.board, move.coordinates);
    if (!res && errs !== null) {
      errors = errors.concat(errs);
      return Promise.resolve([errors, false, null]);
    }
  }

  /** @type {string[]|null} */
  let candidates;
  {
    /** @type {Error[]|null} */
    let errs;
    [errs, candidates] = await findCandidates(store.board, move.coordinates);
    if (errs !== null) {
      errors = errors.concat(errs);
      return Promise.resolve([errors, false, null]);
    }
    if (candidates) {
      const [errs, res] = await allCandidatesInWordDictionary(
        candidates,
        words
      );
      if (!res && errs !== null) {
        errors = errors.concat(errs);
        return Promise.resolve([errors, false, null]);
      }
    }
  }

  return Promise.resolve([null, true, candidates]);
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 * @param {Event} ev
 */
async function playAction(ev) {
  try {
    ev.preventDefault();
    if (!(ev.target instanceof HTMLFormElement)) {
      return Promise.reject(new Error("event is not form"));
    }
    // Convert from (string|FormDataEntryValue)[][] to string[][]
    const data = [...new FormData(ev.target).entries()].map((value) => {
      if (typeof value[1] !== "string") {
        throw new Error("form value is not string");
      }
      return [value[0], value[1]];
    });

    // get playerId from
    const playerId = playerIdFrom(data);
    const [move, used] = await buildMove(await filterMove(data));
    console.log(move);
    const [errors, , wordList] = await validateMove(move, store, words);
    if (errors !== null) {
      errors.map((err) => {
        console.error(err);
      });
      return Promise.resolve(true);
    }
    console.log(`wordList: ${wordList?.join("|")}`);
    console.log("move is valid");
    store.acts.push(move);
    const params = new URLSearchParams(location.search);
    params.append("as", moveToParam(move));

    // update hands
    used.reverse().forEach((usedIndex) => {
      store.hands[playerId].splice(usedIndex, 1);
    });

    // satisfy the condition for the game is over
    if (await satisfyGameOver(store)) {
      console.log("this game is over!");
      store.over = true;
      params.set("ov", "1");
    }

    // fill from jar
    while (store.hands[playerId].length < 7 && store.jar.length > 0) {
      store.hands[playerId].push(
        store.jar.splice(Math.floor(Math.random() * store.jar.length), 1)[0]
      );
    }
    params.set("j", store.jar.join("|"));

    const hs = params.getAll("hs");
    params.delete("hs");
    for (const [i, v] of hs.entries()) {
      if (i === playerId) {
        params.append("hs", store.hands[playerId].join("|"));
      } else {
        params.append("hs", v);
      }
    }

    store.moved = true;
    params.set("md", "1");

    for (const a of store.acts) {
      if (a.type === "move") {
        for (const c of /** @type {Move} */ (a).coordinates) {
          store.board[c.y][c.x] = c.panel;
        }
      }
    }
    window.history.pushState({}, "", `${location.pathname}?${params}`);
    console.log(store);
    return render();
  } catch (/** @type {Error|string} */ e) {
    return Promise.reject(e);
  }
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
async function resignAction() {
  console.log("resign!");
  const params = new URLSearchParams(location.search);

  /** @type {Resign} */
  const resign = {
    type: "resign",
    playerId: store.currentPlayerId,
  };
  store.acts.push(resign);
  params.append("as", resignToParam(resign));

  // satisfy the condition for the game is over
  if (await satisfyGameOver(store)) {
    console.log("this game is over!");
    store.over = true;
    params.set("ov", "1");
  }

  store.moved = true;
  params.set("md", "1");

  window.history.pushState({}, "", `${location.pathname}?${params}`);
  console.log(store);
  return render();
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
async function passAction() {
  console.log("pass!");
  const params = new URLSearchParams(location.search);

  /** @type {Pass} */
  const pass = {
    type: "pass",
    playerId: store.currentPlayerId,
  };
  store.acts.push(pass);
  params.append("as", passToParam(pass));

  // satisfy the condition for the game is over
  if (await satisfyGameOver(store)) {
    console.log("this game is over!");
    store.over = true;
    params.set("ov", "1");
  }

  store.moved = true;
  params.set("md", "1");

  window.history.pushState({}, "", `${location.pathname}?${params}`);
  console.log(store);
  return render();
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
async function nextAction() {
  console.log("next!");
  const params = new URLSearchParams(location.search);
  const nextPlayerId = (store.currentPlayerId + 1) % store.players.length;
  store.currentPlayerId = nextPlayerId;
  params.set("cp", nextPlayerId.toString());

  store.moved = false;
  params.set("md", "0");
  window.history.pushState({}, "", `${location.pathname}?${params}`);
  console.log(store);
  return render();
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 * @param {Event} ev
 */
async function swapAction(ev) {
  console.log("swap");
  try {
    ev.preventDefault();
    if (!(ev.target instanceof HTMLFormElement)) {
      return Promise.reject(new Error("event is not form"));
    }
    // Convert from (string|FormDataEntryValue)[][] to string[][]
    const data = [...new FormData(ev.target).entries()].map((value) => {
      if (typeof value[1] !== "string") {
        throw new Error("form value is not string");
      }
      return [value[0], value[1]];
    });

    // get playerId from
    const playerId = playerIdFrom(data);
    const [swap, used] = await buildSwap(await filterSwap(data));
    console.log(swap);

    store.acts.push(swap);
    const params = new URLSearchParams(location.search);
    params.append("as", swapToParam(swap));

    // update hands
    used.reverse().forEach((usedIndex) => {
      store.hands[playerId].splice(usedIndex, 1);
    });

    // satisfy the condition for the game is over
    if (await satisfyGameOver(store)) {
      console.log("this game is over!");
      store.over = true;
      params.set("ov", "1");
    }

    // fill from jar
    while (store.hands[playerId].length < 7 && store.jar.length > 0) {
      store.hands[playerId].push(
        store.jar.splice(Math.floor(Math.random() * store.jar.length), 1)[0]
      );
    }
    params.set("j", store.jar.join("|"));

    const hs = params.getAll("hs");
    params.delete("hs");
    for (const [i, v] of hs.entries()) {
      if (i === playerId) {
        params.append("hs", store.hands[playerId].join("|"));
      } else {
        params.append("hs", v);
      }
    }

    store.moved = true;
    params.set("md", "1");

    window.history.pushState({}, "", `${location.pathname}?${params}`);
    console.log(store);
    return render();
  } catch (/** @type {Error|string} */ e) {
    return Promise.reject(e);
  }
}

/**
 * @promise
 * @reject {Error}
 * @fulfill {Boolean}
 * @returns {Promise.<Boolean>}
 */
async function loadDictionary() {
  const data = await fetch("./english-words/words_dictionary.json");
  /** @type {{Object: any}} */
  const dict = await data.json();
  words = new Set(Object.keys(dict));
  return Promise.resolve(true);
}

(() => {
  if (typeof window === "undefined") {
    return;
  }
  window.addEventListener("load", async () => {
    try {
      await initialize();
      console.log(store);
      await render();
    } catch (/** @type {Error|string} */ err) {
      console.error(err);
    }
  });
  window.addEventListener("load", async () => {
    try {
      await loadDictionary();
    } catch (/** @type {Error|string} */ err) {
      console.error(err);
    }
  });

  const play = document.body.querySelector(".js-play");
  if (play) {
    play.addEventListener("submit", playAction);
  }
  const next = document.body.querySelector(".js-next");
  if (next) {
    next.addEventListener("click", nextAction);
  }
  const swap = document.body.querySelector(".js-swap");
  if (swap) {
    swap.addEventListener("submit", swapAction);
  }
  const pass = document.body.querySelector(".js-pass");
  if (pass) {
    pass.addEventListener("click", passAction);
  }
  const resign = document.body.querySelector(".js-resign");
  if (resign) {
    resign.addEventListener("click", resignAction);
  }
})();
