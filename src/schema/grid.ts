import { z } from "zod";

// Grid schema
export const gridSchema = z
  .object({
    rows: z.number().int().positive(),
    columns: z.number().int().positive(),
    order: z.array(z.array(z.string().or(z.null()))),
  })
  .refine(
    (grid) => {
      // Validate that the order array has the correct dimensions
      if (grid.order.length !== grid.rows) return false;

      for (const row of grid.order) {
        if (row.length !== grid.columns) return false;
      }

      return true;
    },
    { message: "Grid order dimensions must match rows and columns" },
  );

export type Grid = z.infer<typeof gridSchema>;
