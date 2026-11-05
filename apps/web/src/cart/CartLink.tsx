import { Link } from 'react-router';
import s from './cart.module.css';
import { useCartCount } from './cartStore';

export function CartLink() {
  const count = useCartCount();
  const label = count === 0 ? 'Carrito vacío' : `Carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`;
  return (
    <Link to="/carrito" className={s.cartLink} aria-label={label}>
      Carrito
      {count > 0 && (
        <span className={s.count} aria-hidden="true">
          {count}
        </span>
      )}
    </Link>
  );
}
