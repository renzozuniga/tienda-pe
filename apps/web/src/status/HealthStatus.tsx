import { useQuery } from '@tanstack/react-query';
import { Badge, Button, EmptyState, Skeleton } from '../components';
import l from '../layout.module.css';
import { healthQuery } from '../lib/queries';

const VIEW = {
  ok: { label: 'operativa', tone: 'success' },
  degraded: { label: 'con problemas', tone: 'warning' },
  down: { label: 'sin conexión', tone: 'danger' },
} as const;

export function HealthStatus() {
  const { data, isPending, isError, refetch, isFetching } = useQuery(healthQuery());

  if (isPending) {
    return (
      <div className={l.stack} aria-busy="true">
        <p role="status" className="visually-hidden">
          Verificando el estado del servicio…
        </p>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        tone="danger"
        title="Sin conexión con la API"
        description="No pudimos conectar con la API. Revisa que pnpm dev esté corriendo y vuelve a intentarlo."
        action={
          <Button variant="secondary" loading={isFetching} onClick={() => refetch()}>
            Reintentar
          </Button>
        }
      />
    );
  }

  return (
    <dl role="status" className={l.status}>
      <dt>API</dt>
      <dd>
        <Badge tone={VIEW[data.status].tone} dot>
          {VIEW[data.status].label}
        </Badge>
      </dd>
      <dt>Base de datos</dt>
      <dd>
        <Badge tone={VIEW[data.db].tone} dot>
          {VIEW[data.db].label}
        </Badge>
      </dd>
    </dl>
  );
}
