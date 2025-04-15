import type { Board } from "../schema/board";
import type { Button } from "../schema/button";
import type { Grid } from "../schema/grid";
import type { Image } from "../schema/image";
import type { Sound } from "../schema/sound";
import { generateId } from "../utils/id";
import { validateBoardOrThrow } from "./validate";

/**
 * Options for creating a board.
 */
export interface CreateBoardOptions {
  /**
   * The name of the board.
   */
  name: string;

  /**
   * The locale of the board (e.g., "en", "fr").
   * Defaults to "en".
   */
  locale?: string;

  /**
   * The ID of the board.
   * If not provided, a random ID will be generated.
   */
  id?: string;

  /**
   * The number of rows in the grid.
   * Defaults to 3.
   */
  rows?: number;

  /**
   * The number of columns in the grid.
   * Defaults to 3.
   */
  columns?: number;

  /**
   * Optional description HTML.
   */
  description_html?: string;

  /**
   * Optional URL.
   */
  url?: string;

  /**
   * Initial buttons to add to the board.
   */
  buttons?: Button[];

  /**
   * Initial images to add to the board.
   */
  images?: Image[];

  /**
   * Initial sounds to add to the board.
   */
  sounds?: Sound[];
}

/**
 * Creates a grid with the specified dimensions.
 *
 * @param options - Grid options
 * @returns A new grid
 */
function createGrid(options: { rows: number; columns: number }): Grid {
  const { rows, columns } = options;

  const order: (string | null)[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: (string | null)[] = [];
    for (let j = 0; j < columns; j++) {
      row.push(null);
    }
    order.push(row);
  }

  return {
    rows,
    columns,
    order,
  };
}

/**
 * Creates a new board with the specified options.
 *
 * @param options - Board creation options
 * @returns A new board
 */
export function createBoard(options: CreateBoardOptions): Board {
  const {
    name,
    locale = "en",
    id = generateId(),
    rows = 3,
    columns = 3,
    description_html,
    url,
    buttons = [],
    images = [],
    sounds = [],
  } = options;

  const board: Board = {
    format: "open-board-0.1",
    id,
    locale,
    name,
    buttons,
    images,
    sounds,
    grid: createGrid({ rows, columns }),
  };

  if (description_html) {
    board.description_html = description_html;
  }

  if (url) {
    board.url = url;
  }

  validateBoardOrThrow(board);

  return board;
}

/**
 * Creates a board from existing data, filling in any missing required fields.
 *
 * @param data - Partial board data
 * @returns A complete, valid board
 */
export function createBoardFromData(data: Partial<Board>): Board {
  const baseBoard = createBoard({
    name: data.name || "Untitled Board",
    locale: data.locale,
    id: data.id,
  });

  const board: Board = {
    ...baseBoard,
    ...data,
    format: "open-board-0.1",
    id: data.id || baseBoard.id,
    locale: data.locale || baseBoard.locale,
    name: data.name || baseBoard.name,
    buttons: data.buttons || baseBoard.buttons,
    grid: data.grid || baseBoard.grid,
    images: data.images || [],
    sounds: data.sounds || [],
  };

  validateBoardOrThrow(board);

  return board;
}
