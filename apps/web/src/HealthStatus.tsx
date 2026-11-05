import type { Health } from '@tienda/contracts';
import { useEffect, useState } from 'react';
import { Badge, EmptyState, Skeleton } from './components';
import { getHealth } from './lib/api';
import l from './layout.module.css';

type State = { kind: 'loading' } | { kind: 'ready'; health: Health } | { kind: 'error' };

const VIEW = {
  ok: { label: 'operativa', tone: 'success' },
  degraded: { label: 'con problemas', tone: 'warning' },
  down: { label: 'sin conexión', tone: 'danger' },
} as const;

export function HealthStatus() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    const ctrl = new AbortController();
    getHealth(ctrl.signal)
      .then((health) => setState({ kind: 'ready', health }))
      .catch((err: unknown) => {
        if (!ctrl.signal.aborted) {
          console.error(err);
          setState({ kind: 'error' });
        }
      });
    return () => ctrl.abort();
  }, []);

  if (state.kind === 'loading') {
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

  if (state.kind === 'error') {
    return (
      <EmptyState
        tone="danger"
        title="Sin conexión con la API"
        description="No pudimos conectar con la API. Revisa que pnpm dev esté corriendo y vuelve a cargar la página."
      />
    );
  }

  const { status, db } = state.health;
  return (
    <dl role="status" className={l.status}>
      <dt>API</dt>
      <dd>
        <Badge tone={VIEW[status].tone} dot>
          {VIEW[status].label}
        </Badge>
      </dd>
      <dt>Base de datos</dt>
      <dd>
        <Badge tone={VIEW[db].tone} dot>
          {VIEW[db].label}
        </Badge>
      </dd>
    </dl>
  );
}
