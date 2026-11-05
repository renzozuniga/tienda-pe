import { Link } from 'react-router';
import { EmptyState } from '../components';
import l from '../layout.module.css';
import { useDocumentTitle } from './useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Página no encontrada');
  return (
    <main className={l.page}>
      <EmptyState
        headingLevel={2}
        title="No encontramos esta página"
        description="Puede que el enlace esté mal escrito o que la página ya no exista."
        action={<Link to="/">Ir al catálogo</Link>}
      />
    </main>
  );
}
