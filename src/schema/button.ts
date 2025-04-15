import { z } from "zod";
import { colorSchema } from "./common";

// Load board schema for linking to other boards
const loadBoardSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  data_url: z.string().url().optional(),
  url: z.string().url().optional(),
  path: z.string().optional(),
});

// Button schema
export const buttonSchema = z
  .object({
    id: z.string(),

    // Content
    label: z.string().optional(),
    vocalization: z.string().optional(),

    // Appearance
    image_id: z.string().optional(),
    sound_id: z.string().optional(),
    background_color: colorSchema.optional(),
    border_color: colorSchema.optional(),

    // Actions
    action: z.string().optional(),
    actions: z.array(z.string()).optional(),

    // Linking
    load_board: loadBoardSchema.optional(),

    // Absolute positioning (optional)
    top: z.number().min(0).max(1).optional(),
    left: z.number().min(0).max(1).optional(),
    width: z.number().min(0).max(1).optional(),
    height: z.number().min(0).max(1).optional(),
  })
  .refine(
    (button) => {
      // If any positioning property is defined, all must be defined
      const hasPosition =
        button.top !== undefined ||
        button.left !== undefined ||
        button.width !== undefined ||
        button.height !== undefined;

      if (!hasPosition) return true;

      return (
        button.top !== undefined &&
        button.left !== undefined &&
        button.width !== undefined &&
        button.height !== undefined
      );
    },
    {
      message:
        "If any positioning property is defined, all must be defined (top, left, width, height)",
    },
  );

export type Button = z.infer<typeof buttonSchema>;
