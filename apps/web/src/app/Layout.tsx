import { Link, Outlet, ScrollRestoration } from 'react-router';
import s from './Layout.module.css';

export function Layout() {
  return (
    <div className={s.shell}>
      <a className={s.skip} href="#contenido">
        Saltar al contenido
      </a>
      <header className={s.header}>
        <div className={s.headerInner}>
          <Link to="/" className={s.brand}>
            Tienda PE
          </Link>
          <span className={s.tagline}>Productos peruanos · precios en soles con IGV</span>
        </div>
      </header>
      <div id="contenido">
        <Outlet />
      </div>
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <span>Entregas en Lima Metropolitana y el Callao.</span>
          <Link to="/estado">Estado del servicio</Link>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
