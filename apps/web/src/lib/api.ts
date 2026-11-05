import type {
  ApiError as ApiErrorBody,
  CartQuote,
  CartQuoteRequest,
  CategoryList,
  Health,
  ListProductsQuery,
  ProductDetail,
  ProductPage,
} from '@tienda/contracts';

const BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

/** An error answered by the API in the contract's Error format, or a network failure (status 0). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorBody['code'] | 'NETWORK_ERROR';
  readonly details: ApiErrorBody['details'];

  constructor(status: number, body: Omit<Partial<ApiErrorBody>, 'code'> & { code: ApiError['code'] }) {
    super(body.message ?? 'No pudimos conectar con la tienda. Revisa tu conexión e inténtalo de nuevo.');
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }

  get isNotFound() {
    return this.code === 'NOT_FOUND';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  signal?: AbortSignal;
  query?: Record<string, string | number | undefined>;
  okStatuses?: number[];
};

async function request<T>(
  path: string,
  { method = 'GET', body, signal, query, okStatuses = [200] }: RequestOptions = {},
): Promise<T> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) if (value !== undefined) params.set(key, String(value));
  const url = `${BASE_URL}${path}${params.size ? `?${params}` : ''}`;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(url, { method, signal, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new ApiError(0, { code: 'NETWORK_ERROR' });
  }

  if (okStatuses.includes(res.status)) return (await res.json()) as T;

  const errorBody = (await res.json().catch(() => null)) as Partial<ApiErrorBody> | null;
  throw new ApiError(res.status, {
    code: errorBody?.code ?? 'INTERNAL_ERROR',
    message: errorBody?.message ?? 'Ocurrió un error inesperado. Inténtalo de nuevo en unos minutos.',
    details: errorBody?.details,
  });
}

/** GET /health. The API answers 503 with the same body when the database is down. */
export const getHealth = (signal?: AbortSignal) => request<Health>('/health', { signal, okStatuses: [200, 503] });

export const listCategories = (signal?: AbortSignal) => request<CategoryList>('/categories', { signal });

export const listProducts = (query: ListProductsQuery, signal?: AbortSignal) =>
  request<ProductPage>('/products', { signal, query });

export const getProduct = (slug: string, signal?: AbortSignal) =>
  request<ProductDetail>(`/products/${encodeURIComponent(slug)}`, { signal });

/** Prices the cart with current prices and stock. Sends only slug and quantity. */
export const quoteCart = (items: CartQuoteRequest['items'], signal?: AbortSignal) =>
  request<CartQuote>('/cart/quote', { method: 'POST', body: { items }, signal });
