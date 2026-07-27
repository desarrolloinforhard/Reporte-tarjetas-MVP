import { z } from 'zod';

import { apiRequest } from '@/api/client';

const healthSchema = z
  .object({
    status: z.string(),
    database: z
      .object({
        connected: z.boolean(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type Health = z.infer<typeof healthSchema>;

export function getHealth(): Promise<Health> {
  return apiRequest('/health', healthSchema);
}
