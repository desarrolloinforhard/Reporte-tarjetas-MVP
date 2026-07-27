import { z } from 'zod';

export const apiMetaSchema = z
  .object({
    api_contract_version: z.string().optional(),
    request_id: z.string().nullable().optional(),
  })
  .passthrough();

export const apiErrorPayloadSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export function apiResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.discriminatedUnion('ok', [
    z.object({
      ok: z.literal(true),
      data: dataSchema,
      meta: apiMetaSchema,
      error: z.null(),
    }),
    z.object({
      ok: z.literal(false),
      data: z.null(),
      meta: apiMetaSchema,
      error: apiErrorPayloadSchema,
    }),
  ]);
}
