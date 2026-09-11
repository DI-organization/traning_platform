import { z } from "zod";

/**
 * HTML forms submit empty optional fields as "", not undefined — plain
 * `z.string().url().optional()` rejects "" because it's still a string.
 * This treats a blank string the same as an absent field.
 */
export const optionalUrl = () =>
  z
    .literal("")
    .transform(() => undefined)
    .or(z.string().url().optional());
