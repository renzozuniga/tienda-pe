import type { RouteObject } from 'react-router';
import { Layout } from './app/Layout';
import { NotFoundPage } from './app/NotFoundPage';
import { CartPage } from './cart/CartPage';
import { CatalogPage } from './catalog/CatalogPage';
import { ProductPage } from './catalog/ProductPage';
import { StatusPage } from './status/StatusPage';

/** Buyer-facing URLs are in Spanish; code and API routes stay in English. */
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'productos/:slug', element: <ProductPage /> },
      { path: 'carrito', element: <CartPage /> },
      { path: 'estado', element: <StatusPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    // Living catalog of the design system, outside the store layout and in its own chunk.
    path: 'design',
    lazy: async () => ({ Component: (await import('./pages/DesignPage')).DesignPage }),
  },
];
