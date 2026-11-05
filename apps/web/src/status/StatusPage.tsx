import { useDocumentTitle } from '../app/useDocumentTitle';
import { Card } from '../components';
import l from '../layout.module.css';
import { HealthStatus } from './HealthStatus';

export function StatusPage() {
  useDocumentTitle('Estado del servicio');
  return (
    <main className={l.page}>
      <header className={l.header}>
        <h1 className={l.title}>Estado del servicio</h1>
        <p className={l.lead}>Si algo no carga en la tienda, aquí puedes ver si la API y la base de datos responden.</p>
      </header>
      <Card as="section" aria-label="Estado actual">
        <HealthStatus />
      </Card>
    </main>
  );
}
