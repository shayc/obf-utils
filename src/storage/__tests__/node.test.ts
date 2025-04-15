import * as fs from "fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StorageError } from "../../errors";
import type { Board } from "../../schema/board";
import type { Obz } from "../../schema/obz";
import { nodeStorage } from "../node";

vi.mock("fs/promises", () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  readFile: vi.fn(),
  unlink: vi.fn(),
  readdir: vi.fn().mockImplementation(() => Promise.resolve([])),
}));

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

vi.mock("path", () => ({
  join: vi.fn((...args) => args.join("/")),
}));

describe("Node.js storage adapter", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();

    process.env = { ...originalEnv, HOME: "/mock-home" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("saveBoard", () => {
    it("creates directory if it does not exist", async () => {
      const board = createMockBoard("test-board");

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await nodeStorage.saveBoard(board);

      expect(fs.mkdir).toHaveBeenCalled();
    });

    it("writes board to file with correct path", async () => {
      const board = createMockBoard("test-board");

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await nodeStorage.saveBoard(board);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining("test-board.json"),
        expect.any(String),
      );
    });

    it("throws StorageError when mkdir fails", async () => {
      const board = createMockBoard("test-board");

      const mockError = new Error("mkdir failed");
      vi.mocked(fs.mkdir).mockRejectedValue(mockError);

      await expect(nodeStorage.saveBoard(board)).rejects.toThrow(StorageError);
    });

    it("throws StorageError when writeFile fails", async () => {
      const board = createMockBoard("test-board");

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      const mockError = new Error("writeFile failed");
      vi.mocked(fs.writeFile).mockRejectedValue(mockError);

      await expect(nodeStorage.saveBoard(board)).rejects.toThrow(StorageError);
    });
  });

  describe("loadBoard", () => {
    it("reads board from file with correct path", async () => {
      const boardId = "test-board";
      const mockBoard = createMockBoard(boardId);

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockBoard));

      const result = await nodeStorage.loadBoard(boardId);

      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining("test-board.json"),
        "utf-8",
      );

      expect(result).toEqual(mockBoard);
    });

    it("returns null when file does not exist", async () => {
      const boardId = "non-existent-board";

      const mockError = new Error("File not found");
      (mockError as NodeJS.ErrnoException).code = "ENOENT";
      vi.mocked(fs.readFile).mockRejectedValue(mockError);

      const result = await nodeStorage.loadBoard(boardId);

      expect(result).toBeNull();
    });

    it("throws StorageError for other errors", async () => {
      const boardId = "test-board";

      const mockError = new Error("Other error");
      vi.mocked(fs.readFile).mockRejectedValue(mockError);

      await expect(nodeStorage.loadBoard(boardId)).rejects.toThrow(
        StorageError,
      );
    });
  });

  describe("deleteBoard", () => {
    it("deletes board file with correct path", async () => {
      const boardId = "test-board";

      vi.mocked(fs.unlink).mockResolvedValue(undefined);

      await nodeStorage.deleteBoard(boardId);

      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining("test-board.json"),
      );
    });

    it("does not throw when file does not exist", async () => {
      const boardId = "non-existent-board";

      const mockError = new Error("File not found");
      (mockError as NodeJS.ErrnoException).code = "ENOENT";
      vi.mocked(fs.unlink).mockRejectedValue(mockError);

      await expect(nodeStorage.deleteBoard(boardId)).resolves.not.toThrow();
    });

    it("throws StorageError for other errors", async () => {
      const boardId = "test-board";

      const mockError = new Error("Other error");
      vi.mocked(fs.unlink).mockRejectedValue(mockError);

      await expect(nodeStorage.deleteBoard(boardId)).rejects.toThrow(
        StorageError,
      );
    });
  });

  describe("listBoards", () => {
    it("returns empty array when directory does not exist", async () => {
      const mockError = new Error("Directory creation failed");
      vi.mocked(fs.mkdir).mockRejectedValue(mockError);

      const result = await nodeStorage.listBoards();

      expect(result).toEqual([]);
    });

    it("returns array of boards from directory", async () => {
      const mockBoards = [createMockBoard("board1"), createMockBoard("board2")];

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      vi.mocked(fs.readdir).mockImplementation(() => {
        return Promise.resolve([
          "board1.json",
          "board2.json",
          "not-a-json-file",
        ] as any);
      });
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify(mockBoards[0]))
        .mockResolvedValueOnce(JSON.stringify(mockBoards[1]));

      const result = await nodeStorage.listBoards();

      expect(result).toEqual(mockBoards);
    });

    it("skips files that cannot be read", async () => {
      const mockBoard = createMockBoard("board1");

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      vi.mocked(fs.readdir).mockImplementation(() => {
        return Promise.resolve(["board1.json", "invalid.json"] as any);
      });
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify(mockBoard))
        .mockRejectedValueOnce(new Error("Read error"));

      const originalConsoleWarn = console.warn;
      console.warn = vi.fn();

      try {
        const result = await nodeStorage.listBoards();

        expect(result).toEqual([mockBoard]);
        expect(console.warn).toHaveBeenCalled();
      } finally {
        console.warn = originalConsoleWarn;
      }
    });

    it("throws StorageError when readdir fails", async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      const mockError = new Error("readdir failed");
      vi.mocked(fs.readdir).mockRejectedValue(mockError);

      await expect(nodeStorage.listBoards()).rejects.toThrow(StorageError);
    });
  });

  describe("saveObz", () => {
    it("creates directory if it does not exist", async () => {
      const obz = createMockObz("test-obz");

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await nodeStorage.saveObz(obz);

      expect(fs.mkdir).toHaveBeenCalled();
    });

    it("serializes binary data when saving", async () => {
      const obz = {
        ...createMockObz("test-obz"),
        files: {
          "image.png": new Uint8Array([1, 2, 3, 4]),
        },
      };

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await nodeStorage.saveObz(obz);

      expect(fs.writeFile).toHaveBeenCalled();

      const writeFileArgs = vi.mocked(fs.writeFile).mock.calls[0];

      expect(writeFileArgs[1]).toContain("AQIDBA==");
    });
  });

  describe("loadObz", () => {
    it("deserializes binary data when loading", async () => {
      const obzId = "test-obz";
      const serializedObz = {
        boards: {
          [obzId]: createMockBoard(obzId),
        },
        manifest: {
          format: "open-board-0.1",
          root: obzId,
          paths: {},
        },
        files: {
          "image.png": Buffer.from([1, 2, 3, 4]).toString("base64"),
        },
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(serializedObz));

      const result = await nodeStorage.loadObz(obzId);

      expect(result?.files?.["image.png"]).toBeInstanceOf(Uint8Array);
    });
  });
});
