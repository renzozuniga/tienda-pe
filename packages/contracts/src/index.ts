import type { components, paths } from './schema.js';

export type { components, paths };

/** Flattens intersections (allOf) into a plain object type, so contract checks compare like with like. */
type Simplify<T> = { [K in keyof T]: T[K] } & {};

type Schemas = components['schemas'];

export type Health = Schemas['Health'];
export type ApiError = Schemas['Error'];
export type Category = Schemas['Category'];
export type CategoryList = Schemas['CategoryList'];
export type ProductSummary = Schemas['ProductSummary'];
export type ProductDetail = Simplify<Schemas['ProductDetail']>;
export type ProductPage = Schemas['ProductPage'];
export type ListProductsQuery = NonNullable<paths['/products']['get']['parameters']['query']>;
