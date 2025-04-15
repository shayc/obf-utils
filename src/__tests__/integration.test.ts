import { beforeEach, describe, expect, it, vi } from "vitest";
import { unpackObz } from "../archive/unpack";
import { addButton, addImage, addSound, createBoard } from "../board";
import { createObz } from "../obz";
import type { Board } from "../schema/board";
import type { Obz } from "../schema/obz";
import { loadBoard, loadObz, saveBoard, saveObz } from "../storage";

vi.mock("../storage", () => {
  const boards: Record<string, Board> = {};
  const obzs: Record<string, Obz> = {};

  return {
    saveBoard: vi.fn((board: Board) => {
      boards[board.id] = board;
      return Promise.resolve();
    }),
    loadBoard: vi.fn((id: string) => {
      return Promise.resolve(boards[id] || null);
    }),
    deleteBoard: vi.fn((id: string) => {
      delete boards[id];
      return Promise.resolve();
    }),
    listBoards: vi.fn(() => {
      return Promise.resolve(Object.values(boards));
    }),
    saveObz: vi.fn((obz: Obz) => {
      const rootId = Object.keys(obz.boards)[0];
      obzs[rootId] = obz;
      return Promise.resolve();
    }),
    loadObz: vi.fn((id: string) => {
      return Promise.resolve(obzs[id] || null);
    }),
    deleteObz: vi.fn((id: string) => {
      delete obzs[id];
      return Promise.resolve();
    }),
    listObzs: vi.fn(() => {
      return Promise.resolve(Object.values(obzs));
    }),
  };
});

vi.mock("fflate", () => {
  return {
    zipSync: vi.fn((files) => {
      const mockZip: Record<string, Uint8Array> = {};

      for (const [path, content] of Object.entries(files)) {
        if (typeof content === "string") {
          mockZip[path] = new TextEncoder().encode(content);
        } else if (content instanceof Uint8Array) {
          mockZip[path] = content;
        } else {
          mockZip[path] = new TextEncoder().encode(JSON.stringify(content));
        }
      }

      return new TextEncoder().encode(JSON.stringify(mockZip));
    }),
    unzipSync: vi.fn((data) => {
      const mockZip = JSON.parse(new TextDecoder().decode(data));

      const result: Record<string, Uint8Array> = {};
      for (const [path, content] of Object.entries(mockZip)) {
        if (typeof content === "string") {
          result[path] = new TextEncoder().encode(content);
        } else if (Array.isArray(content)) {
          result[path] = new Uint8Array(content);
        }
      }

      return result;
    }),
  };
});

const createMockObzData = (board: Board): Uint8Array => {
  const manifest = {
    format: "open-board-0.1",
    root: `boards/${board.id}.obf`,
    paths: {
      boards: {
        [board.id]: `boards/${board.id}.obf`,
      },
    },
  };

  const mockZip: Record<string, string> = {
    "manifest.json": JSON.stringify(manifest),
    [`boards/${board.id}.obf`]: JSON.stringify(board),
  };

  return new TextEncoder().encode(JSON.stringify(mockZip));
};

describe("Integration tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Full lifecycle", () => {
    it("supports the complete board lifecycle: create, modify, pack, save, load, unpack", async () => {
      let board = createBoard({
        name: "Test Board",
        id: "test-board",
      });

      board = addButton(board, {
        id: "btn1",
        label: "Hello",
        background_color: "rgb(200, 200, 200)",
        border_color: "rgb(100, 100, 100)",
      });

      board = addImage(board, {
        id: "img1",
        url: "https://example.com/image.png",
      });

      board = addSound(board, {
        id: "snd1",
        url: "https://example.com/sound.mp3",
      });

      await saveBoard(board);

      const loadedBoard = await loadBoard("test-board");
      expect(loadedBoard).not.toBeNull();
      expect(loadedBoard!.id).toBe("test-board");
      expect(loadedBoard!.buttons.length).toBe(1);
      expect(loadedBoard!.images.length).toBe(1);
      expect(loadedBoard!.sounds.length).toBe(1);

      const obzData = createMockObzData(loadedBoard!);

      const result = unpackObz(obzData);

      const unpackedBoard = result.boards["test-board"];
      expect(unpackedBoard.id).toBe(board.id);
      expect(unpackedBoard.name).toBe(board.name);
      expect(unpackedBoard.buttons.length).toBe(1);
      expect(unpackedBoard.buttons[0].label).toBe("Hello");
      expect(unpackedBoard.images.length).toBe(1);
      expect(unpackedBoard.images[0].id).toBe("img1");
      expect(unpackedBoard.sounds.length).toBe(1);
      expect(unpackedBoard.sounds[0].id).toBe("snd1");
    });

    it("supports multi-board OBZ operations", async () => {
      const board1 = createBoard({
        name: "Board 1",
        id: "board1",
      });

      const board2 = createBoard({
        name: "Board 2",
        id: "board2",
      });

      const board1WithButton = addButton(board1, {
        id: "btn1",
        label: "Go to Board 2",
        load_board: {
          id: "board2",
          name: "Board 2",
          path: "boards/board2.obf",
        },
      });

      const board2WithButton = addButton(board2, {
        id: "btn2",
        label: "Go to Board 1",
        load_board: {
          id: "board1",
          name: "Board 1",
          path: "boards/board1.obf",
        },
      });

      const obz = createObz([board1WithButton, board2WithButton], {
        rootBoardId: "board1",
      });

      await saveObz(obz);

      const loadedObz = await loadObz("board1");
      expect(loadedObz).not.toBeNull();
      expect(loadedObz!.boards["board1"]).toBeDefined();
      expect(loadedObz!.boards["board2"]).toBeDefined();

      const board1Button = loadedObz!.boards["board1"].buttons[0];
      expect(board1Button.load_board).toBeDefined();
      expect(board1Button.load_board!.id).toBe("board2");

      const board2Button = loadedObz!.boards["board2"].buttons[0];
      expect(board2Button.load_board).toBeDefined();
      expect(board2Button.load_board!.id).toBe("board1");
    });

    it("handles binary data correctly throughout the lifecycle", async () => {
      let board = createBoard({
        name: "Binary Test",
        id: "binary-test",
      });

      const manifest = {
        format: "open-board-0.1",
        root: `boards/${board.id}.obf`,
        paths: {
          boards: {
            [board.id]: `boards/${board.id}.obf`,
          },
        },
      };

      const mockZip: Record<string, any> = {
        "manifest.json": JSON.stringify(manifest),
        [`boards/${board.id}.obf`]: JSON.stringify(board),
        "images/test.png": [1, 2, 3, 4], // Array will be converted to Uint8Array
        "sounds/test.mp3": [5, 6, 7, 8], // Array will be converted to Uint8Array
      };

      const obzData = new TextEncoder().encode(JSON.stringify(mockZip));

      const result = unpackObz(obzData);

      expect(result.files).toBeDefined();
      expect(result.files!["images/test.png"]).toBeInstanceOf(Uint8Array);
      expect(result.files!["sounds/test.mp3"]).toBeInstanceOf(Uint8Array);

      expect(Array.from(result.files!["images/test.png"])).toEqual([
        1, 2, 3, 4,
      ]);

      expect(Array.from(result.files!["sounds/test.mp3"])).toEqual([
        5, 6, 7, 8,
      ]);
    });
  });

  describe("Error handling", () => {
    it("handles missing boards gracefully", async () => {
      const board = await loadBoard("non-existent");
      expect(board).toBeNull();
    });

    it("handles missing OBZ files gracefully", async () => {
      const obz = await loadObz("non-existent");
      expect(obz).toBeNull();
    });

    it("prevents creation of OBZ with duplicate IDs", () => {
      const board1 = createBoard({ name: "Board 1", id: "board1" });
      const board1WithButton = addButton(board1, {
        id: "duplicate-id",
        label: "Button 1",
      });

      const board2 = createBoard({ name: "Board 2", id: "board2" });
      const board2WithButton = addButton(board2, {
        id: "duplicate-id",
        label: "Button 2",
      });

      expect(() => createObz([board1WithButton, board2WithButton])).toThrow();
    });
  });

  describe("Resource sharing", () => {
    it("allows sharing images between boards", async () => {
      let board1 = createBoard({ name: "Board 1", id: "board1" });

      board1 = addImage(board1, {
        id: "shared-image",
        url: "https://example.com/shared.png",
      });

      board1 = addButton(board1, {
        id: "btn1",
        label: "Button with shared image",
        image_id: "shared-image",
      });

      let board2 = createBoard({ name: "Board 2", id: "board2" });
      board2 = addButton(board2, {
        id: "btn2",
        label: "Button with shared image",
        image_id: "shared-image",
      });

      const manifest = {
        format: "open-board-0.1",
        root: "boards/board1.obf",
        paths: {
          boards: {
            board1: "boards/board1.obf",
            board2: "boards/board2.obf",
          },
          images: {
            "shared-image": "images/shared.png",
          },
        },
      };

      const mockZip = {
        "manifest.json": JSON.stringify(manifest),
        "boards/board1.obf": JSON.stringify(board1),
        "boards/board2.obf": JSON.stringify({
          ...board2,
          images: [],
        }),
        "images/shared.png": [1, 2, 3, 4], // Array will be converted to Uint8Array
      };

      const obzData = new TextEncoder().encode(JSON.stringify(mockZip));

      const result = unpackObz(obzData);

      expect(result.boards.board1.buttons[0].image_id).toBe("shared-image");
      expect(result.boards.board2.buttons[0].image_id).toBe("shared-image");

      expect(result.files).toBeDefined();
      expect(result.files!["images/shared.png"]).toBeDefined();
    });
  });
});
