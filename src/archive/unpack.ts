import { unzipSync } from "fflate";
import { validateBoard } from "../board/validate";
import { ArchiveError } from "../errors";
import { validateManifest } from "../obz/validate";
import type { Board } from "../schema/board";
import type { Manifest } from "../schema/manifest";
import type { Obz } from "../schema/obz";

/**
 * Result of unpacking an OBZ file.
 */
export interface UnpackResult {
  /**
   * The manifest from the OBZ file.
   */
  manifest: Manifest;

  /**
   * The boards from the OBZ file, indexed by ID.
   */
  boards: Record<string, Board>;

  /**
   * Additional files from the OBZ file, indexed by path.
   */
  files?: Record<string, Uint8Array>;
}

/**
 * Unpacks an OBZ file into its constituent boards and files.
 *
 * @param data - The OBZ file data as a Uint8Array
 * @returns The extracted boards, manifest, and additional files
 */
export function unpackObz(data: Uint8Array): UnpackResult {
  try {
    const files = unzipSync(data);

    const manifestData = files["manifest.json"];
    if (!manifestData) {
      throw new Error("Invalid OBZ: missing manifest.json");
    }

    const manifestText = new TextDecoder().decode(manifestData);
    const manifest = JSON.parse(manifestText) as Manifest;

    const manifestValidation = validateManifest(manifest);
    if (!manifestValidation.success) {
      throw new Error(`Invalid manifest: ${manifestValidation.error}`);
    }

    const boards: Record<string, Board> = {};

    const boardPaths = manifest.paths.boards || {};

    for (const [boardId, path] of Object.entries(boardPaths)) {
      const boardData = files[path];
      if (!boardData) {
        throw new Error(`Missing board file: ${path}`);
      }

      const boardText = new TextDecoder().decode(boardData);
      const board = JSON.parse(boardText) as Board;

      const boardValidation = validateBoard(board);
      if (!boardValidation.success) {
        throw new Error(`Invalid board in ${path}: ${boardValidation.error}`);
      }

      boards[boardId] = board;
    }

    const additionalFiles: Record<string, Uint8Array> = {};
    for (const [path, data] of Object.entries(files)) {
      if (
        path !== "manifest.json" &&
        !Object.values(boardPaths).includes(path)
      ) {
        additionalFiles[path] = data;
      }
    }

    return {
      manifest,
      boards,
      files:
        Object.keys(additionalFiles).length > 0 ? additionalFiles : undefined,
    };
  } catch (error) {
    throw new ArchiveError(
      `Failed to unpack OBZ: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error },
    );
  }
}

/**
 * Unpacks an OBZ file into an Obz object.
 *
 * @param data - The OBZ file data as a Uint8Array
 * @returns The Obz object
 */
export function unpackToObzObject(data: Uint8Array): Obz {
  const result = unpackObz(data);

  return {
    manifest: result.manifest,
    boards: result.boards,
    files: result.files,
  };
}
