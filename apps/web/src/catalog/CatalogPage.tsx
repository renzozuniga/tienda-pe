import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router';
import { useDocumentTitle } from '../app/useDocumentTitle';
import { Button, EmptyState } from '../components';
import l from '../layout.module.css';
import { categoriesQuery, PAGE_SIZE, productsQuery } from '../lib/queries';
import s from './catalog.module.css';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

const SKELETONS = Array.from({ length: 6 }, (_, i) => i);

export function CatalogPage() {
  const [params] = useSearchParams();
  const category = params.get('categoria') ?? undefined;

  const categories = useQuery(categoriesQuery());
  const products = useInfiniteQuery(productsQuery(category));
  const activeName = categories.data?.items.find((c) => c.slug === category)?.name;
  useDocumentTitle(activeName);

  const items = products.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <main className={l.page}>
      <header className={l.header}>
        <span className={l.eyebrow}>Catálogo</span>
        <h1 className={l.title}>{activeName ?? 'Productos peruanos'}</h1>
        <p className={l.lead}>Café, cacao, granos andinos y despensa. Precios en soles con IGV incluido.</p>
      </header>

      <nav aria-label="Categorías">
        <ul className={s.filters}>
          <li>
            <Link to="/" className={s.filter} aria-current={!category ? 'page' : undefined}>
              Todo
            </Link>
          </li>
          {categories.data?.items.map((c) => (
            <li key={c.slug}>
              <Link
                to={`/?categoria=${c.slug}`}
                className={s.filter}
                aria-current={category === c.slug ? 'page' : undefined}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="resultados" className={l.stack}>
        <h2 id="resultados" className="visually-hidden">
          Productos
        </h2>

        {products.isPending ? (
          <div aria-busy="true">
            <p role="status" className="visually-hidden">
              Cargando productos…
            </p>
            <ul className={s.grid}>
              {SKELETONS.map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </ul>
          </div>
        ) : products.isError ? (
          <EmptyState
            tone="danger"
            title="No pudimos cargar el catálogo"
            description={products.error.message}
            action={
              <Button variant="secondary" loading={products.isFetching} onClick={() => products.refetch()}>
                Reintentar
              </Button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="No hay productos en esta categoría"
            description="Pronto agregaremos más. Mientras tanto, revisa el resto del catálogo."
            action={<Link to="/">Ver todo el catálogo</Link>}
          />
        ) : (
          <>
            <ul className={s.grid}>
              {items.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </ul>
            <div className={s.more}>
              <span aria-live="polite">
                {items.length} {items.length === 1 ? 'producto' : 'productos'}
                {products.hasNextPage ? ` · mostrando de ${PAGE_SIZE} en ${PAGE_SIZE}` : ''}
              </span>
              {products.hasNextPage && (
                <Button
                  variant="secondary"
                  loading={products.isFetchingNextPage}
                  onClick={() => products.fetchNextPage()}
                >
                  {products.isFetchingNextPage ? 'Cargando…' : 'Ver más productos'}
                </Button>
              )}
              {products.isFetchNextPageError && (
                <span role="alert">No pudimos cargar más productos. Inténtalo de nuevo.</span>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
