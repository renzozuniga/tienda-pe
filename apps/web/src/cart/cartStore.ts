import { useSyncExternalStore } from 'react';

/**
 * The cart lives in the browser and stores only slug and quantity (docs/spec.md: no accounts).
 * Prices and stock always come from POST /cart/quote, never from what is stored here.
 * Limits mirror the contract (CartQuoteRequest): 30 items, 1–20 units each.
 */
export const MAX_ITEMS = 30;
export const MAX_QUANTITY = 20;
const STORAGE_KEY = 'tienda-pe:cart:v1';

export type CartItem = { slug: string; quantity: number };

const listeners = new Set<() => void>();
let items: CartItem[] = load();

function clampQuantity(n: number) {
  return Math.max(1, Math.min(MAX_QUANTITY, Math.trunc(n)));
}

function load(): CartItem[] {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (i): i is CartItem =>
          typeof i?.slug === 'string' && /^[a-z0-9-]{1,120}$/.test(i.slug) && Number.isFinite(i?.quantity),
      )
      .slice(0, MAX_ITEMS)
      .map((i) => ({ slug: i.slug, quantity: clampQuantity(i.quantity) }));
  } catch {
    // Private mode or blocked storage: start empty, the cart still works for this visit.
    return [];
  }
}

function commit(next: CartItem[]) {
  items = next;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked: keep the in-memory cart.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep tabs in sync: another tab changed the cart.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      items = load();
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export const cart = {
  get: () => items,

  /** Adds units, up to `max` (the stock the buyer saw) and MAX_QUANTITY. Returns false if nothing changed. */
  add(slug: string, quantity = 1, max = MAX_QUANTITY): boolean {
    const limit = Math.min(max, MAX_QUANTITY);
    const current = items.find((i) => i.slug === slug);
    if (current) {
      const next = Math.min(limit, current.quantity + quantity);
      if (next === current.quantity) return false;
      commit(items.map((i) => (i.slug === slug ? { ...i, quantity: next } : i)));
      return true;
    }
    if (items.length >= MAX_ITEMS || limit < 1) return false;
    commit([...items, { slug, quantity: Math.min(limit, clampQuantity(quantity)) }]);
    return true;
  },

  setQuantity(slug: string, quantity: number) {
    commit(items.map((i) => (i.slug === slug ? { ...i, quantity: clampQuantity(quantity) } : i)));
  },

  remove(...slugs: string[]) {
    commit(items.filter((i) => !slugs.includes(i.slug)));
  },

  clear() {
    commit([]);
  },

  /** Test helper: reload from storage. */
  reload() {
    items = load();
    listeners.forEach((l) => l());
  },
};

export function useCartItems(): CartItem[] {
  return useSyncExternalStore(subscribe, cart.get, cart.get);
}

export function useCartCount(): number {
  return useCartItems().reduce((sum, i) => sum + i.quantity, 0);
}
