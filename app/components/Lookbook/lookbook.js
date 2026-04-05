/**
 * Random packing for a 2×4 lookbook grid (2 rows, 4 columns).
 * Tile labels are **row span × column span** (height × width in cells).
 */

/** @typedef {{ rowSpan: number; colSpan: number; id: string }} LookbookTileShape */

/** @type {LookbookTileShape[]} */
export const LOOKBOOK_TILE_SHAPES = [
  {id: '1x1', rowSpan: 1, colSpan: 1},
  {id: '1x2', rowSpan: 1, colSpan: 2},
  {id: '1x3', rowSpan: 1, colSpan: 3},
  {id: '2x1', rowSpan: 2, colSpan: 1},
  {id: '2x2', rowSpan: 2, colSpan: 2},
  {id: '2x3', rowSpan: 2, colSpan: 3},
];

export const LOOKBOOK_GRID_ROWS = 2;
export const LOOKBOOK_GRID_COLS = 4;

/**
 * @param {boolean[][]} occupied
 * @param {number} row
 * @param {number} col
 * @param {number} rowSpan
 * @param {number} colSpan
 */
function canPlaceTile(occupied, row, col, rowSpan, colSpan) {
  if (row < 0 || col < 0) return false;
  if (row + rowSpan > LOOKBOOK_GRID_ROWS || col + colSpan > LOOKBOOK_GRID_COLS)
    return false;
  for (let r = row; r < row + rowSpan; r++) {
    for (let c = col; c < col + colSpan; c++) {
      if (occupied[r][c]) return false;
    }
  }
  return true;
}

/**
 * First available top-left cell in row-major order.
 * @param {boolean[][]} occupied
 * @param {number} rowSpan
 * @param {number} colSpan
 * @returns {{ row: number; col: number } | null}
 */
function firstAvailableOrigin(occupied, rowSpan, colSpan) {
  for (let row = 0; row <= LOOKBOOK_GRID_ROWS - rowSpan; row++) {
    for (let col = 0; col <= LOOKBOOK_GRID_COLS - colSpan; col++) {
      if (canPlaceTile(occupied, row, col, rowSpan, colSpan)) {
        return {row, col};
      }
    }
  }
  return null;
}

/**
 * @param {boolean[][]} occupied
 * @param {number} row
 * @param {number} col
 * @param {number} rowSpan
 * @param {number} colSpan
 */
function occupy(occupied, row, col, rowSpan, colSpan) {
  for (let r = row; r < row + rowSpan; r++) {
    for (let c = col; c < col + colSpan; c++) {
      occupied[r][c] = true;
    }
  }
}

/**
 * @param {LookbookTileShape[]} shapes
 * @param {() => number} rng Returns [0, 1)
 */
function pickRandomShape(shapes, rng) {
  return shapes[Math.floor(rng() * shapes.length)] ?? shapes[0];
}

/**
 * @template T
 * @param {T[]} array
 * @param {() => number} rng
 * @returns {T[]}
 */
function shuffle(array, rng) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Try random shapes until one fits on the first available slot, or exhaust attempts.
 * Falls back to trying every shape in a shuffled order once (still first-available placement).
 *
 * @param {boolean[][]} occupied
 * @param {() => number} rng
 * @param {number} maxRandomAttempts
 * @returns {{ shape: LookbookTileShape; row: number; col: number } | null}
 */
function placeNextRandomTile(occupied, rng, maxRandomAttempts) {
  for (let attempt = 0; attempt < maxRandomAttempts; attempt++) {
    const shape = pickRandomShape(LOOKBOOK_TILE_SHAPES, rng);
    const origin = firstAvailableOrigin(
      occupied,
      shape.rowSpan,
      shape.colSpan,
    );
    if (origin) return {shape, row: origin.row, col: origin.col};
  }

  const order = shuffle(LOOKBOOK_TILE_SHAPES, rng);
  for (const shape of order) {
    const origin = firstAvailableOrigin(
      occupied,
      shape.rowSpan,
      shape.colSpan,
    );
    if (origin) return {shape, row: origin.row, col: origin.col};
  }

  return null;
}

/**
 * @typedef {{
 *   image: unknown;
 *   shape: LookbookTileShape;
 *   row: number;
 *   col: number;
 * }} LookbookGridPlacement
 */

/**
 * Pack `images` onto a 2×4 grid: for each image, pick a random tile shape, then use the
 * first row-major cell where that rectangle fits. Continues until images or space run out.
 *
 * @param {unknown[]} images
 * @param {{
 *   rng?: () => number;
 *   maxRandomAttemptsPerImage?: number;
 * } | undefined} options
 * @returns {{
 *   placements: LookbookGridPlacement[];
 *   occupied: boolean[][];
 * }}
 */
export function buildLookbookRandomGrid(images, options = {}) {
  const rng = options.rng ?? Math.random;
  const maxRandomAttemptsPerImage = options.maxRandomAttemptsPerImage ?? 24;

  /** @type {boolean[][]} */
  const occupied = Array.from({length: LOOKBOOK_GRID_ROWS}, () =>
    Array(LOOKBOOK_GRID_COLS).fill(false),
  );

  /** @type {LookbookGridPlacement[]} */
  const placements = [];

  for (const image of images) {
    const placed = placeNextRandomTile(
      occupied,
      rng,
      maxRandomAttemptsPerImage,
    );
    if (!placed) break;

    occupy(occupied, placed.row, placed.col, placed.shape.rowSpan, placed.shape.colSpan);
    placements.push({
      image,
      shape: placed.shape,
      row: placed.row,
      col: placed.col,
    });
  }

  return {placements, occupied};
}

/**
 * @typedef {{ type: 'solo'; image: unknown }} LookbookCarouselSoloSlide
 * @typedef {{
 *   type: 'grid';
 *   placements: LookbookGridPlacement[];
 *   occupied: boolean[][];
 * }} LookbookCarouselGridSlide
 * @typedef {LookbookCarouselSoloSlide | LookbookCarouselGridSlide} LookbookCarouselSlide
 */

/**
 * Build swiper slides: pack each slide with `buildLookbookRandomGrid` until the grid is
 * full, then continue with remaining images. A single leftover image uses `solo`.
 *
 * @param {unknown[]} images
 * @param {{
 *   rngForSlide?: (slideIndex: number) => () => number;
 *   maxRandomAttemptsPerImage?: number;
 * } | undefined} options
 * @returns {LookbookCarouselSlide[]}
 */
export function buildLookbookCarouselSlides(images, options = {}) {
  const {rngForSlide, maxRandomAttemptsPerImage} = options;

  /** @type {LookbookCarouselSlide[]} */
  const slides = [];
  let remaining = images.slice();
  let slideIndex = 0;

  while (remaining.length) {
    if (remaining.length === 1) {
      slides.push({type: 'solo', image: remaining[0]});
      break;
    }

    const rng = rngForSlide ? rngForSlide(slideIndex) : Math.random;
    const {placements, occupied} = buildLookbookRandomGrid(remaining, {
      rng,
      maxRandomAttemptsPerImage,
    });

    if (placements.length === 0) {
      slides.push({type: 'solo', image: remaining[0]});
      remaining = remaining.slice(1);
      slideIndex++;
      continue;
    }

    slides.push({type: 'grid', placements, occupied});
    remaining = remaining.slice(placements.length);
    slideIndex++;
  }

  return slides;
}

/**
 * CSS grid lines (1-based) for `.lookbook-slide` (4 columns, 2 rows).
 * @param {Pick<LookbookGridPlacement, 'row' | 'col'> & Pick<LookbookTileShape, 'rowSpan' | 'colSpan'>} p
 * @returns {{ gridColumn: string; gridRow: string }}
 */
export function lookbookPlacementToGridStyle(p) {
  const colStart = p.col + 1;
  const colEnd = p.col + p.colSpan + 1;
  const rowStart = p.row + 1;
  const rowEnd = p.row + p.rowSpan + 1;
  return {
    gridColumn: `${colStart} / ${colEnd}`,
    gridRow: `${rowStart} / ${rowEnd}`,
  };
}
