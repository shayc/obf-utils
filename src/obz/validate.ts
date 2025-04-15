import { z } from "zod";
import { ValidationError } from "../errors";
import type { Manifest } from "../schema/manifest";
import { manifestSchema } from "../schema/manifest";
import type { Obz } from "../schema/obz";
import { obzSchema } from "../schema/obz";

/**
 * Result of an OBZ validation operation.
 */
export interface ObzValidationResult {
  success: boolean;
  error?: string;
  details?: z.ZodError;
}

/**
 * Validates a manifest against the OBF schema.
 *
 * @param manifest - The manifest to validate
 * @returns Validation result
 */
export function validateManifest(manifest: unknown): ObzValidationResult {
  try {
    manifestSchema.parse(manifest);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: formatZodError(error),
        details: error,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Validates a manifest and throws an error if invalid.
 *
 * @param manifest - The manifest to validate
 * @throws ValidationError if the manifest is invalid
 */
export function validateManifestOrThrow(
  manifest: unknown,
): asserts manifest is Manifest {
  const result = validateManifest(manifest);
  if (!result.success) {
    throw new ValidationError(
      `Invalid manifest: ${result.error}`,
      result.details,
    );
  }
}

/**
 * Validates an OBZ against the OBF schema.
 *
 * @param obz - The OBZ to validate
 * @returns Validation result
 */
export function validateObz(obz: unknown): ObzValidationResult {
  try {
    obzSchema.parse(obz);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: formatZodError(error),
        details: error,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Validates an OBZ and throws an error if invalid.
 *
 * @param obz - The OBZ to validate
 * @throws ValidationError if the OBZ is invalid
 */
export function validateObzOrThrow(obz: unknown): asserts obz is Obz {
  const result = validateObz(obz);
  if (!result.success) {
    throw new ValidationError(`Invalid OBZ: ${result.error}`, result.details);
  }
}

/**
 * Result of an OBZ ID uniqueness validation.
 */
export interface ObzIdUniquenessResult {
  success: boolean;
  error?: string;
  details?: {
    duplicates: Array<{
      id: string;
      locations: string[];
    }>;
  };
}

/**
 * Validates that all IDs in an OBZ file are unique across all resources.
 *
 * @param obz - The OBZ to validate
 * @returns Validation result
 */
export function validateObzIdUniqueness(obz: Obz): ObzIdUniquenessResult {
  try {
    const idMap = new Map<string, string[]>();

    for (const [boardId, board] of Object.entries(obz.boards)) {
      addToIdMap(idMap, board.id, `board:${boardId}`);

      for (const button of board.buttons) {
        addToIdMap(idMap, button.id, `button:${boardId}:${button.id}`);
      }

      for (const image of board.images) {
        addToIdMap(idMap, image.id, `image:${boardId}:${image.id}`);
      }

      if (board.sounds) {
        for (const sound of board.sounds) {
          addToIdMap(idMap, sound.id, `sound:${boardId}:${sound.id}`);
        }
      }
    }

    const duplicates = Array.from(idMap.entries())
      .filter(([_, locations]) => locations.length > 1)
      .map(([id, locations]) => ({ id, locations }));

    if (duplicates.length > 0) {
      return {
        success: false,
        error: `Found ${duplicates.length} duplicate IDs in OBZ: ${duplicates
          .map((d) => d.id)
          .join(", ")}`,
        details: { duplicates },
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Helper function to add an ID to the ID map.
 *
 * @param idMap - The ID map
 * @param id - The ID to add
 * @param location - The location of the ID
 */
function addToIdMap(
  idMap: Map<string, string[]>,
  id: string,
  location: string,
): void {
  if (!idMap.has(id)) {
    idMap.set(id, [location]);
  } else {
    idMap.get(id)!.push(location);
  }
}

/**
 * Formats a Zod error into a readable string.
 *
 * @param error - The Zod error
 * @returns Formatted error message
 */
function formatZodError(error: z.ZodError): string {
  return error.errors
    .map((err) => {
      const path = err.path.join(".");
      return `${path ? path + ": " : ""}${err.message}`;
    })
    .join("; ");
}
