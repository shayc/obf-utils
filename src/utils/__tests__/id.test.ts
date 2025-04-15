import { describe, expect, it } from "vitest";
import { generateId, generateUniqueId, isIdUsed } from "../id";

describe("ID utilities", () => {
  describe("generateId", () => {
    it("returns a string", () => {
      expect(typeof generateId()).toBe("string");
    });

    it("returns a non-empty string", () => {
      expect(generateId().length).toBeGreaterThan(0);
    });

    it("returns different values on successive calls", () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
    });

    it("returns a UUID-like string", () => {
      const id = generateId();

      // UUID format: 8-4-4-4-12 (hyphens separate groups of hex chars)
      expect(id).toMatch(/^[0-9a-f-]+$/i);
    });
  });

  describe("isIdUsed", () => {
    it("returns true when ID exists in collection", () => {
      const collection = [{ id: "test-id" }, { id: "other-id" }];
      expect(isIdUsed("test-id", collection)).toBe(true);
    });

    it("returns false when ID does not exist in collection", () => {
      const collection = [{ id: "other-id" }];
      expect(isIdUsed("test-id", collection)).toBe(false);
    });

    it("returns false for empty collection", () => {
      expect(isIdUsed("test-id", [])).toBe(false);
    });

    it("handles case-sensitive IDs correctly", () => {
      const collection = [{ id: "Test-ID" }];
      expect(isIdUsed("test-id", collection)).toBe(false);
    });
  });

  describe("generateUniqueId", () => {
    it("returns a string", () => {
      expect(typeof generateUniqueId([])).toBe("string");
    });

    it("returns an ID not in the collection", () => {
      const collection = [{ id: "test-id-1" }, { id: "test-id-2" }];
      const result = generateUniqueId(collection);
      expect(isIdUsed(result, collection)).toBe(false);
    });

    it("works with empty collections", () => {
      expect(typeof generateUniqueId([])).toBe("string");
    });

    it("tries again if first generated ID is already used", () => {
      const collection = [{ id: "test-id" }];

      const result = generateUniqueId(collection);

      expect(result).not.toBe("test-id");
      expect(isIdUsed(result, collection)).toBe(false);
    });
  });
});
