import type { Zippable } from "fflate";
import { zipSync } from "fflate";
import { ArchiveError } from "../errors";
import { createManifest } from "../obz/manifest";
import type { Board } from "../schema/board";
import type { Obz } from "../schema/obz";

/**
 * Options for packing boards into an OBZ file.
 */
export interface PackOptions {
  /**
   * The ID of the root board.
   * If not provided, the first board's ID will be used.
   */
  rootBoardId?: string;

  /**
   * Additional files to include in the OBZ.
   * Keys are file paths, values are file contents as Uint8Array.
   */
  additionalFiles?: Record<string, Uint8Array>;
}

/**
 * Packs one or more boards into an OBZ file.
 *
 * @param boards - The boards to include in the OBZ
 * @param options - Packing options
 * @returns A Uint8Array containing the zipped OBZ data
 */
export function packObz(
  boards: Board[],
  options: PackOptions = {},
): Uint8Array {
  try {
    if (boards.length === 0) {
      throw new Error("Cannot pack OBZ with no boards");
    }

    const files: Record<string, Uint8Array> = {};

    const manifest = createManifest(boards, {
      rootBoardId: options.rootBoardId,
    });
    files["manifest.json"] = new TextEncoder().encode(
      JSON.stringify(manifest, null, 2),
    );

    boards.forEach((board) => {
      const boardPath = `boards/${board.id}.obf`;
      const boardContent = JSON.stringify(board, null, 2);
      files[boardPath] = new TextEncoder().encode(boardContent);
    });

    if (options.additionalFiles) {
      Object.entries(options.additionalFiles).forEach(([path, content]) => {
        files[path] = content;
      });
    }

    return zipSync(files as Zippable);
  } catch (error) {
    throw new ArchiveError(
      `Failed to pack OBZ: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error },
    );
  }
}

/**
 * Packs an OBZ object into a zipped file.
 *
 * @param obz - The OBZ object to pack
 * @returns A Uint8Array containing the zipped OBZ data
 */
export function packObzObject(obz: Obz): Uint8Array {
  try {
    const files: Record<string, Uint8Array> = {};

    files["manifest.json"] = new TextEncoder().encode(
      JSON.stringify(obz.manifest, null, 2),
    );

    Object.entries(obz.boards).forEach(([id, board]) => {
      const boardPath = `boards/${id}.obf`;
      const boardContent = JSON.stringify(board, null, 2);
      files[boardPath] = new TextEncoder().encode(boardContent);
    });

    if (obz.files) {
      Object.entries(obz.files).forEach(([path, content]) => {
        files[path] = content;
      });
    }

    return zipSync(files as Zippable);
  } catch (error) {
    throw new ArchiveError(
      `Failed to pack OBZ object: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error },
    );
  }
}
