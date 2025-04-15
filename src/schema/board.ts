import { z } from "zod";
import { buttonSchema } from "./button";
import { idSchema, licenseSchema, OBF_FORMAT_VERSION } from "./common";
import { gridSchema } from "./grid";
import { imageSchema } from "./image";
import { soundSchema } from "./sound";

// String lists for localization
const stringsSchema = z
  .record(
    z.string(), // locale
    z.record(z.string(), z.string()), // key-value pairs
  )
  .optional();

// Board schema
export const boardSchema = z
  .object({
    // Core attributes
    format: z.literal(OBF_FORMAT_VERSION),
    id: idSchema,
    locale: z.string(),
    name: z.string(),

    // Optional attributes
    url: z.string().url().optional(),
    description_html: z.string().optional(),

    // Collections
    buttons: z.array(buttonSchema),
    images: z.array(imageSchema).optional().default([]),
    sounds: z.array(soundSchema).optional().default([]),

    // Layout
    grid: gridSchema,

    // Localization
    strings: stringsSchema,

    // Licensing
    license: licenseSchema,
  })
  .catchall(z.unknown());

export type Board = z.infer<typeof boardSchema>;
