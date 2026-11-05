import { Card, Price } from './components';
import { HealthStatus } from './HealthStatus';
import l from './layout.module.css';

export function App() {
  return (
    <main className={l.page}>
      <header className={l.header}>
        <span className={l.eyebrow}>Productos peruanos</span>
        <h1 className={l.title}>Tienda PE</h1>
        <p className={l.lead}>
          Café, cacao y granos andinos con precios en soles. Ejemplo de precio: <Price cents={3890} size="sm" />
        </p>
      </header>
      <Card as="section" aria-labelledby="estado">
        <h2 id="estado" className={l.sectionTitle}>
          Estado del servicio
        </h2>
        <HealthStatus />
      </Card>
    </main>
  );
}
