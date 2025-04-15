import type { IDBPDatabase } from "idb";
import { openDB } from "idb";
import { StorageError } from "../errors";
import type { Board } from "../schema/board";
import type { Obz } from "../schema/obz";
import type { StorageAdapter } from "./interface";

const DB_NAME = "obf-utils";
const BOARD_STORE = "boards";
const OBZ_STORE = "obzs";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

/**
 * Gets the database connection, initializing it if necessary.
 */
function getDatabase(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(BOARD_STORE)) {
          db.createObjectStore(BOARD_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(OBZ_STORE)) {
          db.createObjectStore(OBZ_STORE, { keyPath: "manifest.format" });
        }
      },
    }).catch((error) => {
      dbPromise = null;
      throw new StorageError("Failed to initialize browser storage", {
        cause: error,
      });
    });
  }

  return dbPromise;
}

/**
 * Browser storage adapter using IndexedDB.
 */
export const browserStorage: StorageAdapter = {
  async saveBoard(board: Board): Promise<void> {
    try {
      const db = await getDatabase();
      await db.put(BOARD_STORE, board);
    } catch (error) {
      throw new StorageError(`Failed to save board "${board.id}"`, {
        cause: error,
      });
    }
  },

  async loadBoard(id: string): Promise<Board | null> {
    try {
      const db = await getDatabase();
      return await db.get(BOARD_STORE, id);
    } catch (error) {
      throw new StorageError(`Failed to load board "${id}"`, { cause: error });
    }
  },

  async deleteBoard(id: string): Promise<void> {
    try {
      const db = await getDatabase();
      await db.delete(BOARD_STORE, id);
    } catch (error) {
      throw new StorageError(`Failed to delete board "${id}"`, {
        cause: error,
      });
    }
  },

  async listBoards(): Promise<Board[]> {
    try {
      const db = await getDatabase();
      return await db.getAll(BOARD_STORE);
    } catch (error) {
      throw new StorageError("Failed to list boards", { cause: error });
    }
  },

  async saveObz(obz: Obz): Promise<void> {
    try {
      const db = await getDatabase();
      await db.put(OBZ_STORE, obz);
    } catch (error) {
      throw new StorageError(`Failed to save OBZ "${obz.manifest.root}"`, {
        cause: error,
      });
    }
  },

  async loadObz(id: string): Promise<Obz | null> {
    try {
      const db = await getDatabase();
      return await db.get(OBZ_STORE, id);
    } catch (error) {
      throw new StorageError(`Failed to load OBZ "${id}"`, { cause: error });
    }
  },

  async deleteObz(id: string): Promise<void> {
    try {
      const db = await getDatabase();
      await db.delete(OBZ_STORE, id);
    } catch (error) {
      throw new StorageError(`Failed to delete OBZ "${id}"`, { cause: error });
    }
  },

  async listObzs(): Promise<Obz[]> {
    try {
      const db = await getDatabase();
      return await db.getAll(OBZ_STORE);
    } catch (error) {
      throw new StorageError("Failed to list OBZs", { cause: error });
    }
  },
};
