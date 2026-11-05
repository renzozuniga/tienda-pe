import { screen } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { mockApi, renderRoute } from '../test-utils';

afterEach(() => vi.unstubAllGlobals());

describe('StatusPage', () => {
  it('shows the API and the database as operational', async () => {
    const api = mockApi({ '/health': () => ({ status: 200, body: { status: 'ok', db: 'ok', uptimeSeconds: 3 } }) });
    renderRoute('/estado');
    expect(await screen.findAllByText('operativa')).toHaveLength(2);
    expect(String(api.mock.calls[0]![0])).toBe('/api/health');
  });

  it('shows the database as down on a 503', async () => {
    mockApi({ '/health': () => ({ status: 503, body: { status: 'degraded', db: 'down', uptimeSeconds: 3 } }) });
    renderRoute('/estado');
    expect(await screen.findByText('sin conexión')).toBeInTheDocument();
    expect(screen.getByText('con problemas')).toBeInTheDocument();
  });

  it('shows an error when the API cannot be reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))),
    );
    renderRoute('/estado');
    expect(await screen.findByText(/No pudimos conectar con la API/)).toBeInTheDocument();
  });
});

describe('unknown pages', () => {
  it('show a not found page inside the store layout', async () => {
    renderRoute('/no-existe');
    expect(await screen.findByText('No encontramos esta página')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tienda PE' })).toBeInTheDocument();
  });
});
