import { render, screen } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { App } from './App';

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('App', () => {
  it('muestra la API y la base de datos operativas', async () => {
    mockFetch(200, { status: 'ok', db: 'ok', uptimeSeconds: 3 });
    render(<App />);

    expect(await screen.findAllByText('operativa')).toHaveLength(2);
    expect(fetch).toHaveBeenCalledWith('/api/health', expect.anything());
  });

  it('avisa cuando la base de datos está caída (503)', async () => {
    mockFetch(503, { status: 'degraded', db: 'down', uptimeSeconds: 3 });
    render(<App />);

    expect(await screen.findByText('sin conexión')).toBeInTheDocument();
    expect(screen.getByText('con problemas')).toBeInTheDocument();
  });

  it('muestra un error si la API no responde', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
    render(<App />);

    expect(await screen.findByText(/No pudimos conectar con la API/)).toBeInTheDocument();
  });
});
