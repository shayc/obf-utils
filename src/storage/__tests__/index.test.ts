import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Board } from "../../schema/board";
import type { Obz } from "../../schema/obz";
import * as envUtils from "../../utils/env";
import { browserStorage } from "../browser";
import {
  createStorage,
  deleteBoard,
  deleteObz,
  listBoards,
  listObzs,
  loadBoard,
  loadObz,
  saveBoard,
  saveObz,
  storage,
} from "../index";
import { nodeStorage } from "../node";

vi.mock("../../utils/env", () => ({
  detectEnvironment: vi.fn(),
  isBrowser: vi.fn(),
  isNode: vi.fn(),
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

describe("Storage module", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("createStorage", () => {
    it("returns browserStorage when in browser environment", () => {
      vi.mocked(envUtils.detectEnvironment).mockReturnValue("browser");

      const result = createStorage();

      expect(result).toBe(browserStorage);
    });

    it("returns nodeStorage when in Node.js environment", () => {
      vi.mocked(envUtils.detectEnvironment).mockReturnValue("node");

      const result = createStorage();

      expect(result).toBe(nodeStorage);
    });

    it("respects env option when provided", () => {
      vi.mocked(envUtils.detectEnvironment).mockReturnValue("node");

      const result = createStorage({ env: "browser" });

      expect(result).toBe(browserStorage);
    });
  });

  describe("convenience functions", () => {
    beforeEach(() => {
      vi.spyOn(storage, "saveBoard").mockImplementation(vi.fn());
      vi.spyOn(storage, "loadBoard").mockImplementation(vi.fn());
      vi.spyOn(storage, "deleteBoard").mockImplementation(vi.fn());
      vi.spyOn(storage, "listBoards").mockImplementation(vi.fn());
      vi.spyOn(storage, "saveObz").mockImplementation(vi.fn());
      vi.spyOn(storage, "loadObz").mockImplementation(vi.fn());
      vi.spyOn(storage, "deleteObz").mockImplementation(vi.fn());
      vi.spyOn(storage, "listObzs").mockImplementation(vi.fn());
    });

    it("saveBoard delegates to storage.saveBoard", async () => {
      const board = createMockBoard("test-board");
      const options = { path: "/custom/path" };

      await saveBoard(board, options);

      expect(storage.saveBoard).toHaveBeenCalledWith(board, options);
    });

    it("loadBoard delegates to storage.loadBoard", async () => {
      const boardId = "test-board";
      const options = { path: "/custom/path" };
      const mockBoard = createMockBoard(boardId);

      vi.mocked(storage.loadBoard).mockResolvedValue(mockBoard);

      const result = await loadBoard(boardId, options);

      expect(storage.loadBoard).toHaveBeenCalledWith(boardId, options);
      expect(result).toBe(mockBoard);
    });

    it("deleteBoard delegates to storage.deleteBoard", async () => {
      const boardId = "test-board";
      const options = { path: "/custom/path" };

      await deleteBoard(boardId, options);

      expect(storage.deleteBoard).toHaveBeenCalledWith(boardId, options);
    });

    it("listBoards delegates to storage.listBoards", async () => {
      const options = { path: "/custom/path" };
      const mockBoards = [createMockBoard("board1"), createMockBoard("board2")];

      vi.mocked(storage.listBoards).mockResolvedValue(mockBoards);

      const result = await listBoards(options);

      expect(storage.listBoards).toHaveBeenCalledWith(options);
      expect(result).toBe(mockBoards);
    });

    it("saveObz delegates to storage.saveObz", async () => {
      const obz = createMockObz("test-obz");
      const options = { path: "/custom/path" };

      await saveObz(obz, options);

      expect(storage.saveObz).toHaveBeenCalledWith(obz, options);
    });

    it("loadObz delegates to storage.loadObz", async () => {
      const obzId = "test-obz";
      const options = { path: "/custom/path" };
      const mockObz = createMockObz(obzId);

      vi.mocked(storage.loadObz).mockResolvedValue(mockObz);

      const result = await loadObz(obzId, options);

      expect(storage.loadObz).toHaveBeenCalledWith(obzId, options);
      expect(result).toBe(mockObz);
    });

    it("deleteObz delegates to storage.deleteObz", async () => {
      const obzId = "test-obz";
      const options = { path: "/custom/path" };

      await deleteObz(obzId, options);

      expect(storage.deleteObz).toHaveBeenCalledWith(obzId, options);
    });

    it("listObzs delegates to storage.listObzs", async () => {
      const options = { path: "/custom/path" };
      const mockObzs = [createMockObz("obz1"), createMockObz("obz2")];

      vi.mocked(storage.listObzs).mockResolvedValue(mockObzs);

      const result = await listObzs(options);

      expect(storage.listObzs).toHaveBeenCalledWith(options);
      expect(result).toBe(mockObzs);
    });
  });
});
