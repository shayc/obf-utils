import * as fs from "fs/promises";
import * as path from "path";
import { StorageError } from "../errors";
import type { Board } from "../schema/board";
import type { Obz } from "../schema/obz";
import type { StorageAdapter, StorageOptions } from "./interface";

const DEFAULT_STORAGE_DIR = ".obf-utils";

/**
 * Serializes binary data to base64 strings for JSON storage.
 *
 * @param files - Record of file paths to binary data
 * @returns Record of file paths to base64 encoded strings
 */
function serializeBinaryData(
  files: Record<string, Uint8Array>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(files).map(([key, value]) => [
      key,
      Buffer.from(value).toString("base64"),
    ]),
  );
}

/**
 * Deserializes base64 strings back to binary data.
 *
 * @param files - Record of file paths to base64 encoded strings
 * @returns Record of file paths to binary data
 */
function deserializeBinaryData(
  files: Record<string, string>,
): Record<string, Uint8Array> {
  return Object.fromEntries(
    Object.entries(files).map(([key, value]) => [
      key,
      new Uint8Array(Buffer.from(value, "base64")),
    ]),
  );
}

/**
 * Ensures a directory exists, creating it if necessary.
 *
 * @param dirPath - The directory path
 */
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new StorageError(`Failed to create directory "${dirPath}"`, {
      cause: error,
    });
  }
}

/**
 * Gets the storage directory path.
 *
 * @param options - Storage options
 * @returns The storage directory path
 */
function getStorageDir(options?: StorageOptions): string {
  if (options?.path) {
    return options.path;
  }

  const homeDir = process.env.HOME || process.env.USERPROFILE || ".";
  return path.join(homeDir, DEFAULT_STORAGE_DIR);
}

/**
 * Gets the board directory path.
 *
 * @param options - Storage options
 * @returns The board directory path
 */
function getBoardDir(options?: StorageOptions): string {
  return path.join(getStorageDir(options), "boards");
}

/**
 * Gets the OBZ directory path.
 *
 * @param options - Storage options
 * @returns The OBZ directory path
 */
function getObzDir(options?: StorageOptions): string {
  return path.join(getStorageDir(options), "obzs");
}

/**
 * Gets the path for a board file.
 *
 * @param id - The board ID
 * @param options - Storage options
 * @returns The board file path
 */
function getBoardPath(id: string, options?: StorageOptions): string {
  return path.join(getBoardDir(options), `${id}.json`);
}

/**
 * Gets the path for an OBZ file.
 *
 * @param id - The OBZ ID
 * @param options - Storage options
 * @returns The OBZ file path
 */
function getObzPath(id: string, options?: StorageOptions): string {
  return path.join(getObzDir(options), `${id}.json`);
}

/**
 * Node.js storage adapter using the filesystem.
 */
export const nodeStorage: StorageAdapter = {
  async saveBoard(board: Board, options?: StorageOptions): Promise<void> {
    try {
      const boardDir = getBoardDir(options);
      await ensureDir(boardDir);

      const boardPath = getBoardPath(board.id, options);
      await fs.writeFile(boardPath, JSON.stringify(board, null, 2));
    } catch (error) {
      throw new StorageError(`Failed to save board "${board.id}"`, {
        cause: error,
      });
    }
  },

  async loadBoard(id: string, options?: StorageOptions): Promise<Board | null> {
    try {
      const boardPath = getBoardPath(id, options);
      const data = await fs.readFile(boardPath, "utf-8");
      return JSON.parse(data) as Board;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw new StorageError(`Failed to load board "${id}"`, { cause: error });
    }
  },

  async deleteBoard(id: string, options?: StorageOptions): Promise<void> {
    try {
      const boardPath = getBoardPath(id, options);
      await fs.unlink(boardPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return;
      }
      throw new StorageError(`Failed to delete board "${id}"`, {
        cause: error,
      });
    }
  },

  async listBoards(options?: StorageOptions): Promise<Board[]> {
    try {
      const boardDir = getBoardDir(options);

      try {
        await ensureDir(boardDir);
      } catch {
        return [];
      }

      const files = await fs.readdir(boardDir);
      const boardFiles = files.filter((file) => file.endsWith(".json"));

      const boards: Board[] = [];
      for (const file of boardFiles) {
        try {
          const data = await fs.readFile(path.join(boardDir, file), "utf-8");
          const board = JSON.parse(data) as Board;
          boards.push(board);
        } catch (error) {
          console.warn(
            `Failed to read board file ${file}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      return boards;
    } catch (error) {
      throw new StorageError("Failed to list boards", { cause: error });
    }
  },

  async saveObz(obz: Obz, options?: StorageOptions): Promise<void> {
    try {
      const obzDir = getObzDir(options);
      await ensureDir(obzDir);

      const id = obz.manifest.root;
      const obzPath = getObzPath(id, options);

      const serializedObz = {
        ...obz,
        files: obz.files ? serializeBinaryData(obz.files) : undefined,
      };

      await fs.writeFile(obzPath, JSON.stringify(serializedObz, null, 2));
    } catch (error) {
      throw new StorageError(`Failed to save OBZ "${obz.manifest.root}"`, {
        cause: error,
      });
    }
  },

  async loadObz(id: string, options?: StorageOptions): Promise<Obz | null> {
    try {
      const obzPath = getObzPath(id, options);
      const data = await fs.readFile(obzPath, "utf-8");
      const serializedObz = JSON.parse(data);

      if (serializedObz.files) {
        serializedObz.files = deserializeBinaryData(
          serializedObz.files as Record<string, string>,
        );
      }

      return serializedObz as Obz;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw new StorageError(`Failed to load OBZ "${id}"`, { cause: error });
    }
  },

  async deleteObz(id: string, options?: StorageOptions): Promise<void> {
    try {
      const obzPath = getObzPath(id, options);
      await fs.unlink(obzPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return;
      }
      throw new StorageError(`Failed to delete OBZ "${id}"`, { cause: error });
    }
  },

  async listObzs(options?: StorageOptions): Promise<Obz[]> {
    try {
      const obzDir = getObzDir(options);

      try {
        await ensureDir(obzDir);
      } catch {
        return [];
      }

      const files = await fs.readdir(obzDir);
      const obzFiles = files.filter((file) => file.endsWith(".json"));

      const obzs: Obz[] = [];
      for (const file of obzFiles) {
        try {
          const data = await fs.readFile(path.join(obzDir, file), "utf-8");
          const serializedObz = JSON.parse(data);

          if (serializedObz.files) {
            serializedObz.files = deserializeBinaryData(
              serializedObz.files as Record<string, string>,
            );
          }

          obzs.push(serializedObz as Obz);
        } catch (error) {
          console.warn(
            `Failed to read OBZ file ${file}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      return obzs;
    } catch (error) {
      throw new StorageError("Failed to list OBZs", { cause: error });
    }
  },
};
