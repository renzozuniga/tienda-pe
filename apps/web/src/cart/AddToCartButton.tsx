import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components';
import s from './cart.module.css';
import { cart, MAX_QUANTITY, useCartItems } from './cartStore';

type Props = {
  slug: string;
  name: string;
  /** Stock shown to the buyer; the cart never asks for more. The quote re-checks it on the server. */
  stock: number;
  size?: 'md' | 'sm';
  /** Show the "ya tienes N" note and the link to the cart (detail page). */
  withNote?: boolean;
};

export function AddToCartButton({ slug, name, stock, size = 'md', withNote = false }: Props) {
  const inCart = useCartItems().find((i) => i.slug === slug)?.quantity ?? 0;
  const [message, setMessage] = useState('');
  const max = Math.min(stock, MAX_QUANTITY);

  if (stock <= 0) {
    return (
      // The StockBadge next to it already says "Agotado"; the button says what the buyer can't do.
      <Button size={size} variant="secondary" disabled>
        No disponible
      </Button>
    );
  }

  const atMax = inCart >= max;
  const add = () => {
    if (cart.add(slug, 1, max)) setMessage(`Agregaste ${name}. Tienes ${inCart + 1} en tu carrito.`);
  };

  return (
    <div className={s.add}>
      <Button
        size={size}
        onClick={add}
        disabled={atMax}
        // In a grid of cards every button reads the same; name the product for screen readers.
        aria-label={withNote ? undefined : `${atMax ? 'Máximo en tu carrito de' : 'Agregar al carrito'} ${name}`}
        aria-describedby={withNote ? `${slug}-cart-note` : undefined}
      >
        {atMax ? 'Máximo en tu carrito' : 'Agregar al carrito'}
      </Button>
      {/* Announces each addition to screen readers; visible only on the detail page. */}
      <p id={`${slug}-cart-note`} className={withNote ? s.addNote : 'visually-hidden'} role="status" aria-live="polite">
        {withNote && inCart > 0 ? (
          <>
            Tienes {inCart} en tu carrito · <Link to="/carrito">Ver carrito</Link>
          </>
        ) : (
          message
        )}
      </p>
    </div>
  );
}
