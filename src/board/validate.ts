import { z } from "zod";
import { ValidationError } from "../errors";
import type { Board } from "../schema/board";
import { boardSchema } from "../schema/board";

/**
 * Result of a board validation operation.
 */
export interface BoardValidationResult {
  success: boolean;
  error?: string;
  details?: z.ZodError;
}

/**
 * Validates a board against the OBF schema.
 *
 * @param board - The board to validate
 * @returns Validation result
 */
export function validateBoard(board: unknown): BoardValidationResult {
  try {
    boardSchema.parse(board);
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
 * Validates a board and throws an error if invalid.
 *
 * @param board - The board to validate
 * @throws ValidationError if the board is invalid
 */
export function validateBoardOrThrow(board: unknown): asserts board is Board {
  const result = validateBoard(board);
  if (!result.success) {
    throw new ValidationError(`Invalid board: ${result.error}`, result.details);
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
