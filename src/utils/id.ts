import { randomUUID } from "crypto";
import { isBrowser, isNode } from "./env";

/**
 * Generates a unique ID for use in OBF objects.
 * Uses crypto.randomUUID() in Node.js and Web Crypto API in browsers.
 *
 * @returns A unique string ID
 */
export function generateId(): string {
  if (isNode()) {
    return randomUUID();
  }

  if (isBrowser() && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  // Fallback for environments without Crypto API
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Checks if an ID is already used in a collection of objects.
 *
 * @param id - The ID to check
 * @param collection - Array of objects with id property
 * @returns True if the ID is already used, false otherwise
 */
export function isIdUsed(id: string, collection: { id: string }[]): boolean {
  return collection.some((item) => item.id === id);
}

/**
 * Generates a unique ID that is not already used in a collection.
 *
 * @param collection - Array of objects with id property
 * @returns A unique string ID
 */
export function generateUniqueId(collection: { id: string }[]): string {
  let id = generateId();

  while (isIdUsed(id, collection)) {
    id = generateId();
  }

  return id;
}
