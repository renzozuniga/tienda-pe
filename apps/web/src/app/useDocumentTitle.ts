import { useEffect } from 'react';

const SITE = 'Tienda PE';

/** Sets the tab title as "<title> · Tienda PE", or just the site name. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : SITE;
  }, [title]);
}
