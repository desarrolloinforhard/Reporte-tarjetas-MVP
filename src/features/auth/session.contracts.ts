import { z } from 'zod';

export const currentSessionSchema = z
  .object({
    authenticated: z.boolean(),
    expires_at: z.string().datetime({ offset: true }).nullable(),
    environment: z.string(),
    api_base_url: z.string(),
    auth_mode: z.string(),
    user_id: z.string().min(1),
  })
  .passthrough();

export const currentUserSchema = z
  .object({
    id: z.string().min(1),
    username: z.string().min(1),
    display_name: z.string().min(1),
    role: z.string().min(1),
    permissions: z.array(z.string()),
    capabilities: z.record(z.string(), z.unknown()),
    branch_ids: z.array(z.union([z.string(), z.number()])),
    is_authenticated: z.boolean(),
  })
  .passthrough();

export type CurrentSession = z.infer<typeof currentSessionSchema>;
export type CurrentUser = z.infer<typeof currentUserSchema>;
