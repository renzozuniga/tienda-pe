import type { Health } from '@tienda/contracts';
import { useEffect, useState } from 'react';
import { getHealth } from './lib/api';

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; health: Health }
  | { kind: 'error' };

const LABEL = { ok: 'operativa', down: 'sin conexión', degraded: 'con problemas' } as const;

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

  if (state.kind === 'loading') return <p role="status">Verificando el estado del servicio…</p>;
  if (state.kind === 'error') {
    return (
      <p role="status" data-state="error">
        No pudimos conectar con la API. ¿Está corriendo <code>pnpm dev</code>?
      </p>
    );
  }

  const { status, db } = state.health;
  return (
    <dl role="status" data-state={status} className="health">
      <dt>API</dt>
      <dd>{LABEL[status]}</dd>
      <dt>Base de datos</dt>
      <dd>{LABEL[db]}</dd>
    </dl>
  );
}
