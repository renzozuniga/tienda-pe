import { HealthStatus } from './HealthStatus';
import { formatPEN } from './lib/money';

export function App() {
  return (
    <main className="page">
      <h1>Tienda PE</h1>
      <p className="lead">
        Productos peruanos con precios en soles. Ejemplo de precio: <strong>{formatPEN(3890)}</strong>
      </p>
      <section aria-labelledby="estado">
        <h2 id="estado">Estado del servicio</h2>
        <HealthStatus />
      </section>
    </main>
  );
}
