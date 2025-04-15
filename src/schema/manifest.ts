import { z } from "zod";
import { OBF_FORMAT_VERSION } from "./common";

// Paths schema for mapping IDs to file paths
const pathsSchema = z.object({
  boards: z.record(z.string(), z.string()).optional(),
  images: z.record(z.string(), z.string()).optional(),
  sounds: z.record(z.string(), z.string()).optional(),
});

// Manifest schema
export const manifestSchema = z.object({
  format: z.literal(OBF_FORMAT_VERSION),
  root: z.string(),
  paths: pathsSchema,
});

export type Manifest = z.infer<typeof manifestSchema>;
