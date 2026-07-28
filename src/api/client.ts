import { z } from 'zod';

import { ApiError } from '@/api/api-error';
import { apiResponseSchema } from '@/api/api-response';
import { appEnvironment } from '@/config/environment';
import { getAccessToken } from '@/features/auth/auth-token-store';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: string;
};

export type ApiResult<T> = {
  data: T;
  meta: Record<string, unknown>;
};

export async function apiRequestWithMeta<T extends z.ZodType>(
  path: string,
  dataSchema: T,
  options: RequestOptions = {},
): Promise<ApiResult<z.infer<T>>> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  const token = options.token ?? getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${appEnvironment.apiBaseUrl}${path}`, {
      credentials: 'include',
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError('CONNECTION_ERROR', 'No se pudo conectar con la API.');
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ApiError('INVALID_RESPONSE', 'La API devolvió una respuesta inválida.', response.status);
  }

  const parsed = apiResponseSchema(dataSchema).safeParse(json);
  if (!parsed.success) {
    throw new ApiError('INVALID_RESPONSE', 'El contrato de la API no es válido.', response.status);
  }

  const envelope = parsed.data as {
    ok: boolean;
    data: z.infer<T> | null;
    meta: Record<string, unknown> & { request_id?: string | null };
    error: { code: string; message: string } | null;
  };

  if (!envelope.ok && envelope.error) {
    throw new ApiError(
      envelope.error.code,
      envelope.error.message,
      response.status,
      envelope.meta.request_id,
    );
  }

  if (envelope.data === null) {
    throw new ApiError('INVALID_RESPONSE', 'La API no devolvió datos.', response.status);
  }

  return { data: envelope.data, meta: envelope.meta };
}

export async function apiRequest<T extends z.ZodType>(
  path: string,
  dataSchema: T,
  options: RequestOptions = {},
): Promise<z.infer<T>> {
  const result = await apiRequestWithMeta(path, dataSchema, options);
  return result.data;
}
