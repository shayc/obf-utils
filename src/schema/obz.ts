import { z } from "zod";
import { boardSchema } from "./board";
import { manifestSchema } from "./manifest";

// OBZ schema
export const obzSchema = z.object({
  manifest: manifestSchema,
  boards: z.record(z.string(), boardSchema),
  files: z.record(z.string(), z.instanceof(Uint8Array)).optional(),
});

export type Obz = z.infer<typeof obzSchema>;
