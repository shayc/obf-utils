import type { Board } from "../schema/board";
import type { Obz } from "../schema/obz";
import { detectEnvironment } from "../utils/env";
import { browserStorage } from "./browser";
import type { StorageAdapter, StorageOptions } from "./interface";
import { nodeStorage } from "./node";

/**
 * Creates a storage adapter appropriate for the current environment.
 *
 * @param options - Storage options
 * @returns Storage adapter for the specified environment
 */
export function createStorage(options?: StorageOptions): StorageAdapter {
  const env = options?.env || detectEnvironment();
  return env === "browser" ? browserStorage : nodeStorage;
}

/**
 * Default storage instance, automatically configured for the current environment.
 */
export const storage = createStorage();

export * from "./interface";
export { browserStorage, nodeStorage };

/**
 * Saves a board to storage.
 *
 * @param board - The board to save
 * @param options - Storage options
 */
export async function saveBoard(
  board: Board,
  options?: StorageOptions,
): Promise<void> {
  return storage.saveBoard(board, options);
}

/**
 * Loads a board from storage.
 *
 * @param id - The ID of the board to load
 * @param options - Storage options
 * @returns The loaded board, or null if not found
 */
export async function loadBoard(
  id: string,
  options?: StorageOptions,
): Promise<Board | null> {
  return storage.loadBoard(id, options);
}

/**
 * Deletes a board from storage.
 *
 * @param id - The ID of the board to delete
 * @param options - Storage options
 */
export async function deleteBoard(
  id: string,
  options?: StorageOptions,
): Promise<void> {
  return storage.deleteBoard(id, options);
}

/**
 * Lists all boards in storage.
 *
 * @param options - Storage options
 * @returns Array of all stored boards
 */
export async function listBoards(options?: StorageOptions): Promise<Board[]> {
  return storage.listBoards(options);
}

/**
 * Saves an OBZ to storage.
 *
 * @param obz - The OBZ to save
 * @param options - Storage options
 */
export async function saveObz(
  obz: Obz,
  options?: StorageOptions,
): Promise<void> {
  return storage.saveObz(obz, options);
}

/**
 * Loads an OBZ from storage.
 *
 * @param id - The ID of the OBZ to load
 * @param options - Storage options
 * @returns The loaded OBZ, or null if not found
 */
export async function loadObz(
  id: string,
  options?: StorageOptions,
): Promise<Obz | null> {
  return storage.loadObz(id, options);
}

/**
 * Deletes an OBZ from storage.
 *
 * @param id - The ID of the OBZ to delete
 * @param options - Storage options
 */
export async function deleteObz(
  id: string,
  options?: StorageOptions,
): Promise<void> {
  return storage.deleteObz(id, options);
}

/**
 * Lists all OBZs in storage.
 *
 * @param options - Storage options
 * @returns Array of all stored OBZs
 */
export async function listObzs(options?: StorageOptions): Promise<Obz[]> {
  return storage.listObzs(options);
}
