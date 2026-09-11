import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodEffects } from "zod";

type Schema = AnyZodObject | ZodEffects<AnyZodObject>;

export function validate(schema: Schema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    }) as { body?: unknown; query?: unknown; params?: unknown };

    if (result.body !== undefined) req.body = result.body;
    if (result.params !== undefined) req.params = result.params as typeof req.params;
    next();
  };
}
