/**
 * Environment types supported by the library.
 */
export type Environment = "browser" | "node";

/**
 * Detects the current JavaScript environment.
 *
 * @returns The detected environment ('browser' or 'node')
 */
export function detectEnvironment(): Environment {
  if (isNode()) {
    return "node";
  }

  if (isBrowser()) {
    return "browser";
  }

  // Default to browser if we can't determine
  return "browser";
}

/**
 * Checks if the current environment is a browser.
 *
 * @returns True if running in a browser
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Checks if the current environment is Node.js.
 *
 * @returns True if running in Node.js
 */
export function isNode(): boolean {
  return (
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null
  );
}
