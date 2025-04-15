export const OBF_FORMAT_VERSION = "open-board-0.1";
import { z } from "zod";

// Common regex patterns
export const rgbColorRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
export const rgbaColorRegex =
  /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(?:0|0?\.\d+|1(?:\.0)?)\s*\)$/;

// Common schema components
export const colorSchema = z
  .string()
  .regex(rgbColorRegex)
  .or(z.string().regex(rgbaColorRegex));

// Extension fields (prefixed with ext_)
export const extensionsSchema = z
  .record(z.string().startsWith("ext_"), z.unknown())
  .optional();

// License schema
export const licenseSchema = z
  .object({
    type: z.string(),
    copyright_notice_url: z.string().url().optional(),
    source_url: z.string().url().optional(),
    author_name: z.string().optional(),
    author_url: z.string().url().optional(),
    author_email: z.string().email().optional(),
  })
  .optional();
