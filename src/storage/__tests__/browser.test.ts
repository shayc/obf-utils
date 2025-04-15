import { beforeEach, describe, expect, it, vi } from "vitest";
import { StorageError } from "../../errors";
import type { Board } from "../../schema/board";
import type { Obz } from "../../schema/obz";
import { browserStorage } from "../browser";

vi.mock("idb", () => {
  return {
    openDB: vi.fn().mockImplementation(() => {
      return Promise.resolve({
        put: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
        getAll: vi.fn(),
      });
    }),
  };
});

const mockDB = {
  put: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  getAll: vi.fn(),
};

import { openDB } from "idb";

const createMockBoard = (id: string): Board => ({
  format: "open-board-0.1",
  id,
  locale: "en",
  name: `Test Board ${id}`,
  buttons: [],
  images: [],
  sounds: [],
  grid: {
    rows: 1,
    columns: 1,
    order: [[null]],
  },
});

const createMockObz = (id: string): Obz => ({
  boards: {
    [id]: createMockBoard(id),
  },
  manifest: {
    format: "open-board-0.1",
    root: id,
    paths: {},
  },
});

describe("Browser storage adapter", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(openDB).mockResolvedValue(mockDB as any);
  });

  describe("saveBoard", () => {
    it("puts board in the correct store", async () => {
      const board = createMockBoard("test-board");

      mockDB.put.mockResolvedValue(undefined);

      await browserStorage.saveBoard(board);

      expect(mockDB.put).toHaveBeenCalledWith("boards", board);
    });

    it("throws StorageError when put fails", async () => {
      const board = createMockBoard("test-board");

      const mockError = new Error("put failed");
      mockDB.put.mockRejectedValue(mockError);

      await expect(browserStorage.saveBoard(board)).rejects.toThrow(
        StorageError,
      );
    });
  });

  describe("loadBoard", () => {
    it("gets board from the correct store", async () => {
      const boardId = "test-board";
      const mockBoard = createMockBoard(boardId);

      mockDB.get.mockResolvedValue(mockBoard);

      const result = await browserStorage.loadBoard(boardId);

      expect(mockDB.get).toHaveBeenCalledWith("boards", boardId);

      expect(result).toEqual(mockBoard);
    });

    it("returns null when board is not found", async () => {
      const boardId = "non-existent-board";

      mockDB.get.mockResolvedValue(undefined);

      const result = await browserStorage.loadBoard(boardId);

      expect(result).toBeUndefined();
    });

    it("throws StorageError when get fails", async () => {
      const boardId = "test-board";

      const mockError = new Error("get failed");
      mockDB.get.mockRejectedValue(mockError);

      await expect(browserStorage.loadBoard(boardId)).rejects.toThrow(
        StorageError,
      );
    });
  });

  describe("deleteBoard", () => {
    it("deletes board from the correct store", async () => {
      const boardId = "test-board";

      mockDB.delete.mockResolvedValue(undefined);

      await browserStorage.deleteBoard(boardId);

      expect(mockDB.delete).toHaveBeenCalledWith("boards", boardId);
    });

    it("throws StorageError when delete fails", async () => {
      const boardId = "test-board";

      const mockError = new Error("delete failed");
      mockDB.delete.mockRejectedValue(mockError);

      await expect(browserStorage.deleteBoard(boardId)).rejects.toThrow(
        StorageError,
      );
    });
  });

  describe("listBoards", () => {
    it("gets all boards from the correct store", async () => {
      const mockBoards = [createMockBoard("board1"), createMockBoard("board2")];

      mockDB.getAll.mockResolvedValue(mockBoards);

      const result = await browserStorage.listBoards();

      expect(mockDB.getAll).toHaveBeenCalledWith("boards");

      expect(result).toEqual(mockBoards);
    });

    it("throws StorageError when getAll fails", async () => {
      const mockError = new Error("getAll failed");
      mockDB.getAll.mockRejectedValue(mockError);

      await expect(browserStorage.listBoards()).rejects.toThrow(StorageError);
    });
  });

  describe("saveObz", () => {
    it("puts obz in the correct store", async () => {
      const obz = createMockObz("test-obz");

      mockDB.put.mockResolvedValue(undefined);

      await browserStorage.saveObz(obz);

      expect(mockDB.put).toHaveBeenCalledWith("obzs", obz);
    });
  });

  describe("loadObz", () => {
    it("gets obz from the correct store", async () => {
      const obzId = "test-obz";
      const mockObz = createMockObz(obzId);

      mockDB.get.mockResolvedValue(mockObz);

      const result = await browserStorage.loadObz(obzId);

      expect(mockDB.get).toHaveBeenCalledWith("obzs", obzId);

      expect(result).toEqual(mockObz);
    });
  });

  describe("deleteObz", () => {
    it("deletes obz from the correct store", async () => {
      const obzId = "test-obz";

      mockDB.delete.mockResolvedValue(undefined);

      await browserStorage.deleteObz(obzId);

      expect(mockDB.delete).toHaveBeenCalledWith("obzs", obzId);
    });
  });

  describe("listObzs", () => {
    it("gets all obzs from the correct store", async () => {
      const mockObzs = [createMockObz("obz1"), createMockObz("obz2")];

      mockDB.getAll.mockResolvedValue(mockObzs);

      const result = await browserStorage.listObzs();

      expect(mockDB.getAll).toHaveBeenCalledWith("obzs");

      expect(result).toEqual(mockObzs);
    });
  });
});
