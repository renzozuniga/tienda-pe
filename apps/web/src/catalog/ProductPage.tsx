import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { useDocumentTitle } from '../app/useDocumentTitle';
import { Badge, Button, EmptyState, Price, Skeleton, StockBadge } from '../components';
import l from '../layout.module.css';
import { ApiError } from '../lib/api';
import { productQuery } from '../lib/queries';
import s from './catalog.module.css';

export function ProductPage() {
  const { slug = '' } = useParams();
  const product = useQuery(productQuery(slug));
  useDocumentTitle(product.data?.name ?? (product.isError ? 'Producto no disponible' : undefined));

  const backTo = product.data ? `/?categoria=${product.data.category.slug}` : '/';

  return (
    <main className={l.page}>
      <Link to={backTo} className={s.back}>
        ← Volver al catálogo
      </Link>

      {product.isPending ? (
        <div className={s.detail} aria-busy="true">
          <p role="status" className="visually-hidden">
            Cargando producto…
          </p>
          <Skeleton height="2.5rem" width="80%" />
          <Skeleton height="2rem" width="8rem" />
          <Skeleton height="5rem" />
        </div>
      ) : product.isError ? (
        product.error instanceof ApiError && product.error.isNotFound ? (
          <EmptyState
            headingLevel={2}
            title="Este producto no está disponible"
            description="Puede que se haya agotado de forma definitiva o que el enlace esté mal escrito."
            action={<Link to="/">Ver el catálogo</Link>}
          />
        ) : (
          <EmptyState
            tone="danger"
            headingLevel={2}
            title="No pudimos cargar el producto"
            description={product.error.message}
            action={
              <Button variant="secondary" loading={product.isFetching} onClick={() => product.refetch()}>
                Reintentar
              </Button>
            }
          />
        )
      ) : (
        <article className={s.detail}>
          <header className={s.detailHead}>
            <Badge>{product.data.category.name}</Badge>
            <h1 className={s.detailTitle}>{product.data.name}</h1>
            <Price cents={product.data.priceCents} size="lg" taxNote />
            <StockBadge stock={product.data.stock} />
          </header>
          {product.data.description && <p className={s.description}>{product.data.description}</p>}
          <dl className={s.facts}>
            {product.data.origin && (
              <>
                <dt>Origen</dt>
                <dd>{product.data.origin}</dd>
              </>
            )}
            <dt>Categoría</dt>
            <dd>
              <Link to={backTo}>{product.data.category.name}</Link>
            </dd>
          </dl>
        </article>
      )}
    </main>
  );
}
