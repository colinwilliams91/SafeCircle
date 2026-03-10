import { env } from '../env'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null

export async function postJson<TResponse>(
  path: string,
  body: Json,
  init?: Omit<RequestInit, 'method' | 'body'>,
): Promise<TResponse> {
  const url = new URL(path.replace(/^\//, ''), env.apiBaseUrl.replace(/\/$/, '') + '/')
  const res = await fetch(url.toString(), {
    ...init,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  })

  let parsed: unknown = null
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    parsed = await res.json().catch(() => null)
  } else {
    parsed = await res.text().catch(() => null)
  }

  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.status}`, res.status, parsed)
  }
  return parsed as TResponse
}

export async function getJson<TResponse>(
  path: string,
  init?: Omit<RequestInit, 'method'>,
): Promise<TResponse> {
  const url = new URL(path.replace(/^\//, ''), env.apiBaseUrl.replace(/\/$/, '') + '/')
  const res = await fetch(url.toString(), {
    ...init,
    method: 'GET',
    headers: {
      ...(init?.headers ?? {}),
    },
  })

  let parsed: unknown = null
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    parsed = await res.json().catch(() => null)
  } else {
    parsed = await res.text().catch(() => null)
  }

  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.status}`, res.status, parsed)
  }
  return parsed as TResponse
}

