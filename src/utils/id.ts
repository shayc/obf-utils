/**
 * Generates a unique ID for use in OBF objects.
 *
 * @returns A unique string ID
 */
export function generateId(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
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
