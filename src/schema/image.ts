import { z } from "zod";
import { licenseSchema, idSchema } from "./common";

// Symbol schema for proprietary symbol sets
const symbolSchema = z
  .object({
    set: z.string(),
    filename: z.string(),
  })
  .optional();

// Image schema
export const imageSchema = z
  .object({
    id: idSchema,

    // One of the following must be provided
    url: z.string().url().optional(),
    data_url: z.string().url().optional(),
    path: z.string().optional(),
    data: z.string().optional(),
    symbol: symbolSchema,

    // Optional metadata
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    content_type: z.string().optional(),
    license: licenseSchema,
  })
  .refine(
    (image) =>
      image.url || image.data_url || image.path || image.data || image.symbol,
    {
      message:
        "Image must have at least one of: url, data_url, path, data, or symbol",
    },
  );

export type Image = z.infer<typeof imageSchema>;
