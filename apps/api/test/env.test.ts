import { describe, expect, it } from 'vitest';
import { loadEnv } from '../src/env.js';

const base = { DATABASE_URL: 'postgresql://u:p@localhost:5433/db' };

describe('loadEnv', () => {
  it('uses local defaults', () => {
    const env = loadEnv(base);
    expect(env.API_PORT).toBe(3001);
    expect(env.API_HOST).toBe('127.0.0.1');
    expect(env.WEB_ORIGIN).toEqual(['http://localhost:5173']);
  });

  it('falls back to PORT when API_PORT is missing, as on Render', () => {
    expect(loadEnv({ ...base, PORT: '10000' }).API_PORT).toBe(10000);
    expect(loadEnv({ ...base, PORT: '10000', API_PORT: '4000' }).API_PORT).toBe(4000);
  });

  it('accepts several CORS origins and drops trailing slashes', () => {
    const env = loadEnv({ ...base, WEB_ORIGIN: 'https://tienda-pe.onrender.com/, http://localhost:5173' });
    expect(env.WEB_ORIGIN).toEqual(['https://tienda-pe.onrender.com', 'http://localhost:5173']);
  });

  it('fails with a Spanish message when DATABASE_URL is missing', () => {
    expect(() => loadEnv({})).toThrow(/DATABASE_URL es obligatoria/);
  });
});
