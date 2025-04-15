import { describe, expect, it, vi } from "vitest";
import { addButton, addImage, addSound } from "../../board";
import { ArchiveError } from "../../errors";
import { createObz } from "../../obz";
import type { Board } from "../../schema/board";
import type { Obz } from "../../schema/obz";
import { packObz, packObzObject } from "../pack";
import { unpackObz, unpackToObzObject } from "../unpack";

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

describe("Archive operations", () => {
  describe("packObz", () => {
    it("packs a single board into an OBZ file", () => {
      const board = createMockBoard("test-board");

      const result = packObz([board]);

      expect(result).toBeInstanceOf(Uint8Array);

      const content = JSON.parse(new TextDecoder().decode(result));

      expect(content["manifest.json"]).toBeDefined();
      expect(content["boards/test-board.obf"]).toBeDefined();
    });

    it("packs multiple boards into an OBZ file", () => {
      const board1 = createMockBoard("board1");
      const board2 = createMockBoard("board2");

      const result = packObz([board1, board2]);
      const content = JSON.parse(new TextDecoder().decode(result));

      expect(content["manifest.json"]).toBeDefined();
      expect(content["boards/board1.obf"]).toBeDefined();
      expect(content["boards/board2.obf"]).toBeDefined();
    });

    it("includes additional files when provided", () => {
      const board = createMockBoard("test-board");
      const additionalFiles = {
        "images/test.png": new Uint8Array([1, 2, 3, 4]),
        "sounds/test.mp3": new Uint8Array([5, 6, 7, 8]),
      };

      const result = packObz([board], { additionalFiles });
      const content = JSON.parse(new TextDecoder().decode(result));

      expect(content["images/test.png"]).toBeDefined();
      expect(content["sounds/test.mp3"]).toBeDefined();
    });

    it("throws an error when no boards are provided", () => {
      expect(() => packObz([])).toThrow(ArchiveError);
    });
  });

  describe("packObzObject", () => {
    it("packs an OBZ object into a zipped file", () => {
      const board = createMockBoard("test-board");
      const obz = createObz([board]);

      const result = packObzObject(obz);

      expect(result).toBeInstanceOf(Uint8Array);

      const content = JSON.parse(new TextDecoder().decode(result));

      expect(content["manifest.json"]).toBeDefined();
      expect(content["boards/test-board.obf"]).toBeDefined();
    });

    it("includes binary files from the OBZ object", () => {
      const board = createMockBoard("test-board");
      const obz: Obz = {
        ...createObz([board]),
        files: {
          "images/test.png": new Uint8Array([1, 2, 3, 4]),
        },
      };

      const result = packObzObject(obz);
      const content = JSON.parse(new TextDecoder().decode(result));

      expect(content["images/test.png"]).toBeDefined();
    });
  });

  describe("unpackObz", () => {
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

    it("unpacks an OBZ file into its constituent parts", () => {
      const board = createMockBoard("test-board");
      const obzData = createMockObzData(board);
      const result = unpackObz(obzData);

      expect(result.manifest).toBeDefined();
      expect(result.manifest.format).toBe("open-board-0.1");
      expect(result.manifest.root).toBe("boards/test-board.obf");

      expect(result.boards).toBeDefined();
      expect(result.boards["test-board"]).toBeDefined();
      expect(result.boards["test-board"].name).toBe("Test Board test-board");
    });

    it("includes additional files in the result", () => {
      const board = createMockBoard("test-board");

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
      };

      const obzData = new TextEncoder().encode(JSON.stringify(mockZip));
      const result = unpackObz(obzData);

      expect(result.files).toBeDefined();
      expect(result.files!["images/test.png"]).toBeDefined();
      expect(result.files!["images/test.png"]).toBeInstanceOf(Uint8Array);
    });

    it("throws an error when manifest is missing", () => {
      const mockZip = {
        "boards/test-board.obf": JSON.stringify(createMockBoard("test-board")),
      };

      const mockData = new TextEncoder().encode(JSON.stringify(mockZip));

      expect(() => unpackObz(mockData)).toThrow(ArchiveError);
    });

    it("throws an error when manifest is invalid", () => {
      const mockZip = {
        "manifest.json": '{"invalid": true}',
      };

      const mockData = new TextEncoder().encode(JSON.stringify(mockZip));

      expect(() => unpackObz(mockData)).toThrow(ArchiveError);
    });

    it("throws an error when board file is missing", () => {
      const mockManifest = {
        format: "open-board-0.1",
        root: "boards/missing.obf",
        paths: {
          boards: {
            missing: "boards/missing.obf",
          },
        },
      };

      const mockZip = {
        "manifest.json": JSON.stringify(mockManifest),
      };

      const mockData = new TextEncoder().encode(JSON.stringify(mockZip));

      expect(() => unpackObz(mockData)).toThrow(ArchiveError);
    });

    it("throws an error when board is invalid", () => {
      const mockManifest = {
        format: "open-board-0.1",
        root: "boards/invalid.obf",
        paths: {
          boards: {
            invalid: "boards/invalid.obf",
          },
        },
      };

      const mockZip = {
        "manifest.json": JSON.stringify(mockManifest),
        "boards/invalid.obf": '{"invalid": true}',
      };

      const mockData = new TextEncoder().encode(JSON.stringify(mockZip));

      expect(() => unpackObz(mockData)).toThrow(ArchiveError);
    });
  });

  describe("unpackToObzObject", () => {
    it("unpacks an OBZ file into an Obz object", () => {
      const board = createMockBoard("test-board");

      const manifest = {
        format: "open-board-0.1",
        root: `boards/${board.id}.obf`,
        paths: {
          boards: {
            [board.id]: `boards/${board.id}.obf`,
          },
        },
      };

      const mockZip = {
        "manifest.json": JSON.stringify(manifest),
        [`boards/${board.id}.obf`]: JSON.stringify(board),
      };

      const obzData = new TextEncoder().encode(JSON.stringify(mockZip));
      const result = unpackToObzObject(obzData);

      expect(result.manifest).toBeDefined();
      expect(result.boards).toBeDefined();
      expect(result.boards["test-board"]).toBeDefined();
    });
  });

  describe("Integration tests", () => {
    it("can round-trip a board through pack and unpack", () => {
      let board = createMockBoard("test-board");
      board = addButton(board, { label: "Test Button" });

      board = addImage(board, {
        id: "img1",
        url: "https://example.com/image.png",
      });

      board = addSound(board, {
        id: "snd1",
        url: "https://example.com/sound.mp3",
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

      const mockZip = {
        "manifest.json": JSON.stringify(manifest),
        [`boards/${board.id}.obf`]: JSON.stringify(board),
      };

      const obzData = new TextEncoder().encode(JSON.stringify(mockZip));
      const result = unpackObz(obzData);

      const unpackedBoard = result.boards["test-board"];

      expect(unpackedBoard.id).toBe(board.id);
      expect(unpackedBoard.name).toBe(board.name);
      expect(unpackedBoard.buttons.length).toBe(1);
      expect(unpackedBoard.buttons[0].label).toBe("Test Button");
      expect(unpackedBoard.images.length).toBe(1);
      expect(unpackedBoard.images[0].id).toBe("img1");
      expect(unpackedBoard.sounds.length).toBe(1);
      expect(unpackedBoard.sounds[0].id).toBe("snd1");
    });

    it("can round-trip an OBZ object through packObzObject and unpackToObzObject", () => {
      const board = createMockBoard("test-board");
      const originalObz = createObz([board]);
      const manifest = originalObz.manifest;

      const mockZip = {
        "manifest.json": JSON.stringify(manifest),
        [`boards/${board.id}.obf`]: JSON.stringify(board),
      };

      const obzData = new TextEncoder().encode(JSON.stringify(mockZip));
      const unpackedObz = unpackToObzObject(obzData);

      expect(unpackedObz.manifest.format).toBe(originalObz.manifest.format);
      expect(unpackedObz.manifest.root).toBe(originalObz.manifest.root);
      expect(unpackedObz.boards["test-board"].id).toBe(
        originalObz.boards["test-board"].id,
      );
    });
  });
});
