import type { CartLine } from '@tienda/contracts';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useDocumentTitle } from '../app/useDocumentTitle';
import { Button, Card, EmptyState, Price, QuantityStepper, Skeleton } from '../components';
import l from '../layout.module.css';
import { cartQuoteQuery } from '../lib/queries';
import s from './cart.module.css';
import { type CartAdjustments, cartAdjustments } from './adjustments';
import { cart, MAX_QUANTITY, useCartItems } from './cartStore';

export function CartPage() {
  useDocumentTitle('Tu carrito');
  const items = useCartItems();
  const quote = useQuery(cartQuoteQuery(items));
  // Sold-out, retired and short-stock lines are fixed in the stored cart, and the buyer is told why.
  const adjustments = quote.data ? cartAdjustments(quote.data) : null;
  const signature = adjustments?.notices.length ? JSON.stringify(adjustments) : '';
  const [seenSignature, setSeenSignature] = useState('');
  const [notices, setNotices] = useState<string[]>([]);
  if (signature && signature !== seenSignature) {
    // Adjusting state while rendering: React's pattern for deriving state from new data.
    setSeenSignature(signature);
    setNotices((prev) => [...new Set([...prev, ...adjustments!.notices])]);
  }
  useEffect(() => {
    if (!signature) return;
    const { remove, lower } = JSON.parse(signature) as CartAdjustments;
    for (const { slug, quantity } of lower) cart.setQuantity(slug, quantity);
    if (remove.length) cart.remove(...remove);
  }, [signature]);

  return (
    <main className={l.page}>
      <header className={l.header}>
        <h1 className={l.title}>Tu carrito</h1>
      </header>

      {notices.length > 0 && (
        <ul className={s.notice} role="status">
          {notices.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}

      {items.length === 0 ? (
        <EmptyState
          headingLevel={2}
          title="Tu carrito está vacío"
          description="Agrega productos del catálogo para ver aquí el total en soles."
          action={<Link to="/">Ver el catálogo</Link>}
        />
      ) : quote.isPending ? (
        <div className={s.layout} aria-busy="true">
          <p role="status" className="visually-hidden">
            Calculando tu carrito…
          </p>
          <Card>
            <Skeleton height="1.25rem" width="70%" />
            <Skeleton height="2.25rem" width="9rem" />
          </Card>
          <Card>
            <Skeleton height="1.5rem" width="50%" />
            <Skeleton height="2rem" />
          </Card>
        </div>
      ) : quote.isError ? (
        <EmptyState
          tone="danger"
          headingLevel={2}
          title="No pudimos calcular tu carrito"
          description={quote.error.message}
          action={
            <Button variant="secondary" loading={quote.isFetching} onClick={() => quote.refetch()}>
              Reintentar
            </Button>
          }
        />
      ) : (
        <div className={s.layout}>
          <section aria-labelledby="productos">
            <h2 id="productos" className="visually-hidden">
              Productos en tu carrito
            </h2>
            <ul className={s.lines}>
              {quote.data.lines
                .filter((line) => line.status !== 'sold_out')
                .map((line) => (
                  <CartLineItem key={line.product.slug} line={line} />
                ))}
            </ul>
          </section>

          <Card as="section" aria-labelledby="resumen" className={s.summary}>
            <h2 id="resumen" className={l.sectionTitle}>
              Resumen
            </h2>
            <dl className={s.summaryRows}>
              <dt>Productos</dt>
              <dd>{quote.data.itemCount}</dd>
              <dt>Subtotal</dt>
              <dd>
                <Price cents={quote.data.subtotalCents} size="md" />
              </dd>
            </dl>
            <p className={s.updating} aria-live="polite">
              {quote.isFetching ? 'Actualizando precios y stock…' : ''}
            </p>
            <p className={s.note}>
              Precios con IGV incluido. El costo de envío depende de tu distrito y se suma al hacer el pedido.
            </p>
            <p className={s.note}>El pedido en línea llega en la próxima versión de la tienda.</p>
          </Card>
        </div>
      )}
    </main>
  );
}

function CartLineItem({ line }: { line: CartLine }) {
  const { product, quantity, lineTotalCents } = line;
  const max = Math.max(1, Math.min(product.stock, MAX_QUANTITY));

  return (
    <Card as="li" padding="compact" className={s.line}>
      <div>
        <p className={s.lineName}>
          <Link to={`/productos/${product.slug}`}>{product.name}</Link>
        </p>
        <p className={s.lineMeta}>
          <Price cents={product.priceCents} size="sm" /> c/u
        </p>
      </div>
      <div className={s.lineTotal}>
        <Price cents={lineTotalCents} size="md" />
      </div>
      <div className={s.lineControls}>
        <QuantityStepper
          label={product.name}
          value={quantity}
          max={max}
          onChange={(q) => cart.setQuantity(product.slug, q)}
        />
        <Button size="sm" variant="ghost" onClick={() => cart.remove(product.slug)}>
          Quitar
        </Button>
      </div>
    </Card>
  );
}
