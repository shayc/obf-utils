import { afterEach, describe, expect, it, vi } from "vitest";
import { detectEnvironment, isBrowser, isNode } from "../env";

describe("Environment detection utilities", () => {
  const originalProcess = global.process;
  const originalWindow = global.window;
  const originalDocument = global.document;

  afterEach(() => {
    global.process = originalProcess;
    global.window = originalWindow;
    global.document = originalDocument;
    vi.resetAllMocks();
  });

  describe("detectEnvironment", () => {
    it('returns "node" when in Node.js environment', () => {
      global.process = {
        versions: {
          node: "22.0.0",
        },
      } as any;
      global.window = undefined as any;
      global.document = undefined as any;

      expect(detectEnvironment()).toBe("node");
    });

    it('returns "browser" when in browser environment', () => {
      global.process = undefined as any;
      global.window = {} as any;
      global.document = {} as any;

      expect(detectEnvironment()).toBe("browser");
    });

    it('defaults to "browser" when environment cannot be determined', () => {
      global.process = undefined as any;
      global.window = undefined as any;
      global.document = undefined as any;

      expect(detectEnvironment()).toBe("browser");
    });
  });

  describe("isBrowser", () => {
    it("returns true when in browser environment", () => {
      global.process = undefined as any;
      global.window = {} as any;
      global.document = {} as any;

      expect(isBrowser()).toBe(true);
    });

    it("returns false when in Node.js environment", () => {
      global.process = {
        versions: {
          node: "22.0.0",
        },
      } as any;
      global.window = undefined as any;
      global.document = undefined as any;

      expect(isBrowser()).toBe(false);
    });
  });

  describe("isNode", () => {
    it("returns true when in Node.js environment", () => {
      global.process = {
        versions: {
          node: "22.0.0",
        },
      } as any;
      global.window = undefined as any;
      global.document = undefined as any;

      expect(isNode()).toBe(true);
    });

    it("returns false when in browser environment", () => {
      global.process = undefined as any;
      global.window = {} as any;
      global.document = {} as any;

      expect(isNode()).toBe(false);
    });
  });
});
