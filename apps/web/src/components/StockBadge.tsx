import { stockStatus, type StockStatus } from '../lib/stock';
import { Badge, type BadgeTone } from './Badge';

const VIEW: Record<StockStatus, { tone: BadgeTone; label: (stock: number) => string }> = {
  in_stock: { tone: 'success', label: (n) => `${n} en stock` },
  low_stock: { tone: 'warning', label: (n) => (n === 1 ? 'Queda 1' : `Quedan ${n}`) },
  sold_out: { tone: 'danger', label: () => 'Agotado' },
};

export function StockBadge({ stock }: { stock: number }) {
  const view = VIEW[stockStatus(stock)];
  return (
    <Badge tone={view.tone} dot>
      {view.label(stock)}
    </Badge>
  );
}
