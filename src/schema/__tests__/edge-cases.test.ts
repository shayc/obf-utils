import { describe, expect, it } from "vitest";
import { boardSchema } from "../board";
import { buttonSchema } from "../button";
import { colorSchema } from "../common";
import { imageSchema } from "../image";
import { soundSchema } from "../sound";

describe("Schema edge cases", () => {
  describe("Proprietary symbol sets", () => {
    it("validates an image with a symbol set", () => {
      const image = {
        id: "symbol1",
        symbol: {
          set: "symbolstix",
          filename: "happy.png",
        },
      };

      const result = imageSchema.safeParse(image);
      expect(result.success).toBe(true);
    });

    it("requires both set and filename in symbol", () => {
      const image = {
        id: "symbol1",
        symbol: {
          set: "symbolstix",
          // Missing filename
        },
      };

      const result = imageSchema.safeParse(image);
      expect(result.success).toBe(false);
    });

    it("allows an image with both symbol and URL", () => {
      const image = {
        id: "symbol1",
        symbol: {
          set: "symbolstix",
          filename: "happy.png",
        },
        url: "https://example.com/fallback.png",
      };

      const result = imageSchema.safeParse(image);
      expect(result.success).toBe(true);
    });
  });

  describe("Absolute positioning", () => {
    it("validates a button with absolute positioning", () => {
      const button = {
        id: "button1",
        label: "Test",
        top: 0.1,
        left: 0.2,
        width: 0.3,
        height: 0.4,
      };

      const result = buttonSchema.safeParse(button);
      expect(result.success).toBe(true);
    });

    it("rejects a button with partial positioning", () => {
      const button = {
        id: "button1",
        label: "Test",
        top: 0.1,
        left: 0.2,
        // Missing width and height
      };

      const result = buttonSchema.safeParse(button);
      expect(result.success).toBe(false);
    });

    it("rejects a button with out-of-range positioning", () => {
      const button = {
        id: "button1",
        label: "Test",
        top: 0.1,
        left: 0.2,
        width: 1.5, // Greater than 1.0
        height: 0.4,
      };

      const result = buttonSchema.safeParse(button);
      expect(result.success).toBe(false);
    });

    it("rejects a button with negative positioning", () => {
      const button = {
        id: "button1",
        label: "Test",
        top: -0.1, // Negative value
        left: 0.2,
        width: 0.3,
        height: 0.4,
      };

      const result = buttonSchema.safeParse(button);
      expect(result.success).toBe(false);
    });
  });

  describe("String list localization", () => {
    it("validates a board with string lists", () => {
      const board = {
        format: "open-board-0.1",
        id: "board1",
        locale: "en",
        name: "Test Board",
        buttons: [],
        grid: {
          rows: 1,
          columns: 1,
          order: [[null]],
        },
        strings: {
          en: {
            hello: "Hello",
            goodbye: "Goodbye",
          },
          es: {
            hello: "Hola",
            goodbye: "Adiós",
          },
        },
      };

      const result = boardSchema.safeParse(board);
      expect(result.success).toBe(true);
    });

    it("validates a board with empty string lists", () => {
      const board = {
        format: "open-board-0.1",
        id: "board1",
        locale: "en",
        name: "Test Board",
        buttons: [],
        grid: {
          rows: 1,
          columns: 1,
          order: [[null]],
        },
        strings: {},
      };

      const result = boardSchema.safeParse(board);
      expect(result.success).toBe(true);
    });

    it("rejects invalid string list format", () => {
      const board = {
        format: "open-board-0.1",
        id: "board1",
        locale: "en",
        name: "Test Board",
        buttons: [],
        grid: {
          rows: 1,
          columns: 1,
          order: [[null]],
        },
        strings: {
          en: ["hello", "goodbye"], // Should be an object, not an array
        },
      };

      const result = boardSchema.safeParse(board);
      expect(result.success).toBe(false);
    });
  });

  describe("Extension fields", () => {
    it("allows extension fields on buttons", () => {
      const button = {
        id: "button1",
        label: "Test",
        ext_custom_field: "custom value",
        ext_app_specific: {
          nested: "value",
        },
      };

      const result = buttonSchema.safeParse(button);
      expect(result.success).toBe(true);
    });

    it("allows extension fields on boards", () => {
      const board = {
        format: "open-board-0.1",
        id: "board1",
        locale: "en",
        name: "Test Board",
        buttons: [],
        grid: {
          rows: 1,
          columns: 1,
          order: [[null]],
        },
        ext_app_version: "1.0.0",
        ext_custom_metadata: {
          author: "Test Author",
          created_at: "2023-01-01",
        },
      };

      const result = boardSchema.safeParse(board);
      expect(result.success).toBe(true);
    });
  });

  describe("Color validation", () => {
    it("validates RGB color format", () => {
      const color = "rgb(255, 0, 0)";
      const result = colorSchema.safeParse(color);
      expect(result.success).toBe(true);
    });

    it("validates RGBA color format", () => {
      const color = "rgba(255, 0, 0, 0.5)";
      const result = colorSchema.safeParse(color);
      expect(result.success).toBe(true);
    });

    it("rejects invalid RGB format", () => {
      const color = "rgb(255 0 0)"; // Missing commas
      const result = colorSchema.safeParse(color);
      expect(result.success).toBe(false);
    });

    it("rejects invalid RGBA format", () => {
      const color = "rgba(255, 0, 0, 1.5)"; // Alpha > 1.0
      const result = colorSchema.safeParse(color);
      expect(result.success).toBe(false);
    });

    it("rejects hex color format", () => {
      const color = "#FF0000";
      const result = colorSchema.safeParse(color);
      expect(result.success).toBe(false);
    });
  });

  describe("Multiple actions", () => {
    it("validates a button with multiple actions", () => {
      const button = {
        id: "button1",
        label: "Test",
        action: ":clear", // Primary action
        actions: [":clear", ":home"], // Multiple actions
      };

      const result = buttonSchema.safeParse(button);
      expect(result.success).toBe(true);
    });

    it("validates a button with spelling action", () => {
      const button = {
        id: "button1",
        label: "A",
        action: "+a", // Spelling action
      };

      const result = buttonSchema.safeParse(button);
      expect(result.success).toBe(true);
    });

    it("validates a button with custom extension action", () => {
      const button = {
        id: "button1",
        label: "Custom",
        action: ":ext_custom_action",
      };

      const result = buttonSchema.safeParse(button);
      expect(result.success).toBe(true);
    });
  });

  describe("Sound validation", () => {
    it("validates a sound with URL", () => {
      const sound = {
        id: "sound1",
        url: "https://example.com/sound.mp3",
      };

      const result = soundSchema.safeParse(sound);
      expect(result.success).toBe(true);
    });

    it("validates a sound with data URL", () => {
      const sound = {
        id: "sound1",
        data_url: "data:audio/mp3;base64,AAABBBCCC",
      };

      const result = soundSchema.safeParse(sound);
      expect(result.success).toBe(true);
    });

    it("validates a sound with path", () => {
      const sound = {
        id: "sound1",
        path: "sounds/hello.mp3",
      };

      const result = soundSchema.safeParse(sound);
      expect(result.success).toBe(true);
    });

    it("validates a sound with data", () => {
      const sound = {
        id: "sound1",
        data: "base64encodeddata",
      };

      const result = soundSchema.safeParse(sound);
      expect(result.success).toBe(true);
    });

    it("rejects a sound with no source", () => {
      const sound = {
        id: "sound1",
        // No url, data_url, path, or data
      };

      const result = soundSchema.safeParse(sound);
      expect(result.success).toBe(false);
    });
  });

  describe("Button vocalization", () => {
    it("validates a button with vocalization different from label", () => {
      const button = {
        id: "button1",
        label: "happy",
        vocalization: "I am happy",
      };

      const result = buttonSchema.safeParse(button);
      expect(result.success).toBe(true);
    });
  });

  describe("Load board linking", () => {
    it("validates a button with board linking via URL", () => {
      const button = {
        id: "button1",
        label: "Go to Board",
        load_board: {
          name: "Another Board",
          url: "https://example.com/boards/123",
          data_url: "https://example.com/api/boards/123",
        },
      };

      const result = buttonSchema.safeParse(button);
      expect(result.success).toBe(true);
    });

    it("validates a button with board linking via path", () => {
      const button = {
        id: "button1",
        label: "Go to Board",
        load_board: {
          id: "board2",
          name: "Another Board",
          path: "boards/board2.obf",
        },
      };

      const result = buttonSchema.safeParse(button);
      expect(result.success).toBe(true);
    });
  });
});
