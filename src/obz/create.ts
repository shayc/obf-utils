import { ObzError } from "../errors";
import type { Board } from "../schema/board";
import type { Obz } from "../schema/obz";
import type { CreateManifestOptions } from "./manifest";
import { createManifest } from "./manifest";
import { validateObzIdUniqueness, validateObzOrThrow } from "./validate";

/**
 * Options for creating an OBZ.
 */
export interface CreateObzOptions extends CreateManifestOptions {
  /**
   * Additional files to include in the OBZ.
   * Keys are file paths, values are file contents as Uint8Array.
   */
  files?: Record<string, Uint8Array>;
}

/**
 * Creates an OBZ from a collection of boards.
 *
 * @param boards - The boards to include in the OBZ
 * @param options - OBZ creation options
 * @returns A new OBZ
 */
export function createObz(
  boards: Board[],
  options: CreateObzOptions = {},
): Obz {
  if (boards.length === 0) {
    throw new ObzError("Cannot create OBZ with no boards");
  }

  const manifest = createManifest(boards, options);

  const obz: Obz = {
    manifest,
    boards: Object.fromEntries(boards.map((board) => [board.id, board])),
  };

  if (options.files) {
    obz.files = options.files;
  }

  validateObzOrThrow(obz);

  const idUniquenessResult = validateObzIdUniqueness(obz);
  if (!idUniquenessResult.success) {
    throw new ObzError(`Invalid OBZ: ${idUniquenessResult.error}`, {
      cause: idUniquenessResult.details,
    });
  }

  return obz;
}

/**
 * Adds a board to an OBZ.
 *
 * @param obz - The OBZ to modify
 * @param board - The board to add
 * @returns A new OBZ with the added board
 */
export function addBoard(obz: Obz, board: Board): Obz {
  if (obz.boards[board.id]) {
    throw new ObzError(`Board with ID "${board.id}" already exists in OBZ`);
  }

  const updatedObz: Obz = {
    ...obz,
    boards: {
      ...obz.boards,
      [board.id]: board,
    },
    manifest: {
      ...obz.manifest,
      paths: {
        ...obz.manifest.paths,
        boards: {
          ...obz.manifest.paths.boards,
          [board.id]: `boards/${board.id}.obf`,
        },
      },
    },
  };

  validateObzOrThrow(updatedObz);

  const idUniquenessResult = validateObzIdUniqueness(updatedObz);
  if (!idUniquenessResult.success) {
    throw new ObzError(`Invalid OBZ: ${idUniquenessResult.error}`, {
      cause: idUniquenessResult.details,
    });
  }

  return updatedObz;
}

/**
 * Removes a board from an OBZ.
 *
 * @param obz - The OBZ to modify
 * @param boardId - The ID of the board to remove
 * @returns A new OBZ with the board removed
 */
export function removeBoard(obz: Obz, boardId: string): Obz {
  if (!obz.boards[boardId]) {
    throw new ObzError(`Board with ID "${boardId}" not found in OBZ`);
  }

  if (obz.manifest.root === `boards/${boardId}.obf`) {
    throw new ObzError(`Cannot remove root board "${boardId}" from OBZ`);
  }

  const { [boardId]: _, ...remainingBoards } = obz.boards;

  const { [boardId]: __, ...remainingBoardPaths } =
    obz.manifest.paths.boards || {};

  const updatedObz: Obz = {
    ...obz,
    boards: remainingBoards,
    manifest: {
      ...obz.manifest,
      paths: {
        ...obz.manifest.paths,
        boards: remainingBoardPaths,
      },
    },
  };

  validateObzOrThrow(updatedObz);

  return updatedObz;
}

/**
 * Updates the root board of an OBZ.
 *
 * @param obz - The OBZ to modify
 * @param boardId - The ID of the new root board
 * @returns A new OBZ with the updated root board
 */
export function updateRootBoard(obz: Obz, boardId: string): Obz {
  if (!obz.boards[boardId]) {
    throw new ObzError(`Board with ID "${boardId}" not found in OBZ`);
  }

  const updatedObz: Obz = {
    ...obz,
    manifest: {
      ...obz.manifest,
      root: `boards/${boardId}.obf`,
    },
  };

  validateObzOrThrow(updatedObz);

  return updatedObz;
}
