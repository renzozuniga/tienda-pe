import { QueryClient, infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { ApiError, getHealth, getProduct, listCategories, listProducts } from './api';

export const PAGE_SIZE = 12;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // The catalog changes rarely: a minute of freshness avoids refetching on every navigation.
        staleTime: 60_000,
        // Retry network and server errors once; a 4xx will not fix itself.
        retry: (failures, err) => !(err instanceof ApiError && err.status >= 400 && err.status < 500) && failures < 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export const healthQuery = () =>
  queryOptions({ queryKey: ['health'], queryFn: ({ signal }) => getHealth(signal), staleTime: 0 });

export const categoriesQuery = () =>
  queryOptions({ queryKey: ['categories'], queryFn: ({ signal }) => listCategories(signal) });

export const productsQuery = (category?: string) =>
  infiniteQueryOptions({
    queryKey: ['products', { category: category ?? null }],
    queryFn: ({ pageParam, signal }) => listProducts({ category, cursor: pageParam, limit: PAGE_SIZE }, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

export const productQuery = (slug: string) =>
  queryOptions({ queryKey: ['product', slug], queryFn: ({ signal }) => getProduct(slug, signal) });
