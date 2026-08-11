import { z } from 'zod';

export const companySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  display_name: z.string().min(1),
});

export const currentSessionSchema = z
  .object({
    authenticated: z.boolean(),
    expires_at: z.string().datetime({ offset: true }).nullable(),
    environment: z.string(),
    api_base_url: z.string(),
    auth_mode: z.string(),
    user_id: z.string().min(1),
    company_id: z.string().min(1).optional(),
    membership_id: z.string().min(1).optional(),
    company: companySchema.optional(),
  })
  .passthrough();

export const currentUserSchema = z
  .object({
    id: z.string().min(1),
    username: z.string().min(1),
    display_name: z.string().min(1),
    role: z.string().min(1),
    email: z.string().email().optional(),
    roles: z.array(z.string()).optional(),
    is_owner: z.boolean().optional(),
    company_id: z.string().min(1).optional(),
    membership_id: z.string().min(1).optional(),
    company: companySchema.optional(),
    permissions: z.array(z.string()),
    capabilities: z.record(z.string(), z.unknown()),
    branch_ids: z.array(z.union([z.string(), z.number()])),
    is_authenticated: z.boolean(),
  })
  .passthrough();

export const authResultSchema = z
  .object({
    session: currentSessionSchema,
    user: currentUserSchema,
    token_type: z.enum(['Bearer', 'Cookie']),
    expires_in: z.number().positive(),
    access_token: z.string().min(1).nullable(),
    refresh_token: z.string().min(1).nullable(),
  })
  .passthrough();

export const logoutResultSchema = z.object({
  logged_out: z.literal(true),
});

export type CurrentSession = z.infer<typeof currentSessionSchema>;
export type CurrentUser = z.infer<typeof currentUserSchema>;
export type AuthResult = z.infer<typeof authResultSchema>;
export type Company = z.infer<typeof companySchema>;
