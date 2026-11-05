import type { ProductSummary } from '@tienda/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Card, Price, Skeleton, StockBadge } from '../components';
import { productQuery } from '../lib/queries';
import { AddToCartButton } from '../cart/AddToCartButton';
import s from './catalog.module.css';

export function ProductCard({ product }: { product: ProductSummary }) {
  const queryClient = useQueryClient();
  // Start loading the detail as soon as the buyer shows intent, so the next page opens instantly.
  const prefetch = () => void queryClient.prefetchQuery(productQuery(product.slug));

  return (
    <Card as="li" className={s.card}>
      <div>
        <h3 className={s.name}>
          <Link to={`/productos/${product.slug}`} onMouseEnter={prefetch} onFocus={prefetch}>
            {product.name}
          </Link>
        </h3>
        <p className={s.meta}>{[product.origin, product.category.name].filter(Boolean).join(' · ')}</p>
      </div>
      <StockBadge stock={product.stock} />
      <div className={s.foot}>
        <Price cents={product.priceCents} taxNote />
        <div className={s.cardAction}>
          <AddToCartButton slug={product.slug} name={product.name} stock={product.stock} size="sm" />
        </div>
      </div>
    </Card>
  );
}

/** Same footprint as ProductCard, so the grid does not shift when the products arrive (CLS). */
export function ProductCardSkeleton() {
  return (
    <Card as="li" className={s.card} aria-hidden="true">
      <div>
        <Skeleton height="1.25rem" width="85%" />
        <Skeleton variant="text" width="45%" />
      </div>
      <Skeleton height="1.5rem" width="7rem" />
      <Skeleton height="2.5rem" width="6rem" />
    </Card>
  );
}
