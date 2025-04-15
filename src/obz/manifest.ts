import { ObzError } from "../errors";
import type { Board } from "../schema/board";
import type { Manifest } from "../schema/manifest";
import { validateManifestOrThrow } from "./validate";

/**
 * Options for creating a manifest.
 */
export interface CreateManifestOptions {
  /**
   * The ID of the root board.
   * If not provided, the first board's ID will be used.
   */
  rootBoardId?: string;
}

/**
 * Creates a manifest for an OBZ file.
 *
 * @param boards - The boards to include in the manifest
 * @param options - Manifest creation options
 * @returns A new manifest
 */
export function createManifest(
  boards: Board[],
  options: CreateManifestOptions = {},
): Manifest {
  if (boards.length === 0) {
    throw new ObzError("Cannot create manifest with no boards");
  }

  const { rootBoardId } = options;

  const rootId = rootBoardId || boards[0].id;

  const rootBoard = boards.find((board) => board.id === rootId);
  if (!rootBoard) {
    throw new ObzError(`Root board with ID "${rootId}" not found`);
  }

  const boardPaths: Record<string, string> = {};
  const imagePaths: Record<string, string> = {};
  const soundPaths: Record<string, string> = {};

  boards.forEach((board) => {
    boardPaths[board.id] = `boards/${board.id}.obf`;

    board.images.forEach((image) => {
      if (image.path && !imagePaths[image.id]) {
        imagePaths[image.id] = image.path;
      }
    });

    if (board.sounds) {
      board.sounds.forEach((sound) => {
        if (sound.path && !soundPaths[sound.id]) {
          soundPaths[sound.id] = sound.path;
        }
      });
    }
  });

  const manifest: Manifest = {
    format: "open-board-0.1",
    root: `boards/${rootId}.obf`,
    paths: {
      boards: boardPaths,
    },
  };

  if (Object.keys(imagePaths).length > 0) {
    manifest.paths.images = imagePaths;
  }

  if (Object.keys(soundPaths).length > 0) {
    manifest.paths.sounds = soundPaths;
  }

  validateManifestOrThrow(manifest);

  return manifest;
}

/**
 * Updates a manifest with a new root board.
 *
 * @param manifest - The manifest to update
 * @param rootBoardId - The ID of the new root board
 * @returns A new manifest with the updated root board
 */
export function updateManifestRoot(
  manifest: Manifest,
  rootBoardId: string,
): Manifest {
  if (!manifest.paths.boards || !manifest.paths.boards[rootBoardId]) {
    throw new ObzError(`Board with ID "${rootBoardId}" not found in manifest`);
  }

  const updatedManifest: Manifest = {
    ...manifest,
    root: `boards/${rootBoardId}.obf`,
  };

  validateManifestOrThrow(updatedManifest);

  return updatedManifest;
}

/**
 * Adds a board to a manifest.
 *
 * @param manifest - The manifest to update
 * @param board - The board to add
 * @returns A new manifest with the added board
 */
export function addBoardToManifest(manifest: Manifest, board: Board): Manifest {
  const updatedManifest: Manifest = {
    ...manifest,
    paths: {
      ...manifest.paths,
      boards: {
        ...manifest.paths.boards,
        [board.id]: `boards/${board.id}.obf`,
      },
    },
  };

  if (board.images.length > 0) {
    const imagePaths: Record<string, string> = { ...manifest.paths.images };

    board.images.forEach((image) => {
      if (image.path) {
        imagePaths[image.id] = image.path;
      }
    });

    updatedManifest.paths.images = imagePaths;
  }

  if (board.sounds && board.sounds.length > 0) {
    const soundPaths: Record<string, string> = { ...manifest.paths.sounds };

    board.sounds.forEach((sound) => {
      if (sound.path) {
        soundPaths[sound.id] = sound.path;
      }
    });

    updatedManifest.paths.sounds = soundPaths;
  }

  validateManifestOrThrow(updatedManifest);

  return updatedManifest;
}

/**
 * Removes a board from a manifest.
 *
 * @param manifest - The manifest to update
 * @param boardId - The ID of the board to remove
 * @returns A new manifest with the board removed
 */
export function removeBoardFromManifest(
  manifest: Manifest,
  boardId: string,
): Manifest {
  if (!manifest.paths.boards || !manifest.paths.boards[boardId]) {
    throw new ObzError(`Board with ID "${boardId}" not found in manifest`);
  }

  if (manifest.root === `boards/${boardId}.obf`) {
    throw new ObzError(`Cannot remove root board "${boardId}" from manifest`);
  }

  const { [boardId]: _, ...remainingBoards } = manifest.paths.boards;

  const updatedManifest: Manifest = {
    ...manifest,
    paths: {
      ...manifest.paths,
      boards: remainingBoards,
    },
  };

  validateManifestOrThrow(updatedManifest);

  return updatedManifest;
}
