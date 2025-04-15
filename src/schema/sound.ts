import { z } from "zod";
import { idSchema } from "./common";
import { licenseSchema } from "./common";

// Sound schema
export const soundSchema = z
  .object({
    id: idSchema,

    // One of the following must be provided
    url: z.string().url().optional(),
    data_url: z.string().url().optional(),
    path: z.string().optional(),
    data: z.string().optional(),

    // Optional metadata
    content_type: z.string().optional(),
    duration: z.number().positive().optional(),
    license: licenseSchema,
  })
  .refine((sound) => sound.url || sound.data_url || sound.path || sound.data, {
    message: "Sound must have at least one of: url, data_url, path, or data",
  });

export type Sound = z.infer<typeof soundSchema>;
