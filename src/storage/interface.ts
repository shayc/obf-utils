import type { Board } from "../schema/board";
import type { Obz } from "../schema/obz";

/**
 * Options for storage operations.
 */
export interface StorageOptions {
  /**
   * The environment to use for storage.
   * If not specified, the current environment will be detected.
   */
  env?: "browser" | "node";

  /**
   * The path to use for file storage (Node.js only).
   */
  path?: string;

  /**
   * The key to use for IndexedDB storage (browser only).
   */
  key?: string;
}

/**
 * Interface for storage adapters.
 */
export interface StorageAdapter {
  /**
   * Saves a board to storage.
   *
   * @param board - The board to save
   * @param options - Storage options
   */
  saveBoard(board: Board, options?: StorageOptions): Promise<void>;

  /**
   * Loads a board from storage.
   *
   * @param id - The ID of the board to load
   * @param options - Storage options
   * @returns The loaded board, or null if not found
   */
  loadBoard(id: string, options?: StorageOptions): Promise<Board | null>;

  /**
   * Deletes a board from storage.
   *
   * @param id - The ID of the board to delete
   * @param options - Storage options
   */
  deleteBoard(id: string, options?: StorageOptions): Promise<void>;

  /**
   * Lists all boards in storage.
   *
   * @param options - Storage options
   * @returns Array of all stored boards
   */
  listBoards(options?: StorageOptions): Promise<Board[]>;

  /**
   * Saves an OBZ to storage.
   *
   * @param obz - The OBZ to save
   * @param options - Storage options
   */
  saveObz(obz: Obz, options?: StorageOptions): Promise<void>;

  /**
   * Loads an OBZ from storage.
   *
   * @param id - The ID of the OBZ to load (typically the manifest ID)
   * @param options - Storage options
   * @returns The loaded OBZ, or null if not found
   */
  loadObz(id: string, options?: StorageOptions): Promise<Obz | null>;

  /**
   * Deletes an OBZ from storage.
   *
   * @param id - The ID of the OBZ to delete
   * @param options - Storage options
   */
  deleteObz(id: string, options?: StorageOptions): Promise<void>;

  /**
   * Lists all OBZs in storage.
   *
   * @param options - Storage options
   * @returns Array of all stored OBZs
   */
  listObzs(options?: StorageOptions): Promise<Obz[]>;
}
