import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Price,
  QuantityStepper,
  Select,
  Skeleton,
  StockBadge,
} from '../components';
import l from '../layout.module.css';
import s from './DesignPage.module.css';

const COLORS = [
  '--color-bg',
  '--color-surface',
  '--color-surface-alt',
  '--color-border',
  '--color-text',
  '--color-text-secondary',
  '--color-text-muted',
  '--color-action',
  '--color-action-soft',
  '--color-success',
  '--color-warning',
  '--color-danger',
  '--color-info',
];

const TYPE = [
  ['--text-3xl', 'Tienda PE'],
  ['--text-2xl', 'Café de Chanchamayo'],
  ['--text-xl', 'Estado del servicio'],
  ['--text-lg', 'Granos andinos con precio justo'],
  ['--text-md', 'Entregas en Lima Metropolitana y el Callao.'],
  ['--text-sm', 'Costo de envío según tu distrito.'],
  ['--text-xs', 'IGV incluido'],
] as const;

const PRODUCTS = [
  { name: 'Café de Chanchamayo 500 g', origin: 'Junín', cents: 3890, stock: 40 },
  { name: 'Chocolate 70 % cacao', origin: 'Cusco', cents: 1250, stock: 3 },
  { name: 'Quinua blanca 1 kg', origin: 'Puno', cents: 1590, stock: 0 },
];

type Theme = 'system' | 'light' | 'dark';

function setTheme(theme: Theme) {
  if (theme === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
}

/** Living catalog of tokens and base components. Lives at /design. */
export function DesignPage() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(2);

  const pickTheme = (t: Theme) => {
    setTheme(t);
    setThemeState(t);
  };

  return (
    <main className={l.page}>
      <header className={l.header}>
        <span className={l.eyebrow}>Design system · MAO Systems</span>
        <h1 className={l.title}>Componentes de Tienda PE</h1>
        <p className={l.lead}>Tokens y componentes base. Las pantallas nuevas se construyen solo con estas piezas.</p>
        <div className={l.row} role="group" aria-label="Tema">
          {(['system', 'light', 'dark'] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={theme === t ? 'primary' : 'secondary'}
              aria-pressed={theme === t}
              onClick={() => pickTheme(t)}
            >
              {{ system: 'Sistema', light: 'Claro', dark: 'Oscuro' }[t]}
            </Button>
          ))}
        </div>
      </header>

      <section className={l.stack} aria-labelledby="colores">
        <h2 id="colores" className={l.sectionTitle}>
          Colores semánticos
        </h2>
        <div className={s.swatches}>
          {COLORS.map((token) => (
            <div key={token} className={s.swatch}>
              <span className={s.chip} style={{ background: `var(${token})` }} />
              <span className={s.swatchName}>{token}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={l.stack} aria-labelledby="tipografia">
        <h2 id="tipografia" className={l.sectionTitle}>
          Tipografía
        </h2>
        <div className={l.stack}>
          {TYPE.map(([token, sample]) => (
            <div key={token} className={s.typeRow}>
              <span className={s.typeToken}>{token}</span>
              <span style={{ fontSize: `var(${token})` }}>{sample}</span>
            </div>
          ))}
          <div className={s.typeRow}>
            <span className={s.typeToken}>--font-mono</span>
            <Price cents={123456} size="sm" />
          </div>
        </div>
      </section>

      <section className={l.stack} aria-labelledby="botones">
        <h2 id="botones" className={l.sectionTitle}>
          Button
        </h2>
        <div className={l.row}>
          <Button>Agregar al carrito</Button>
          <Button variant="secondary">Ver detalle</Button>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="danger">Quitar</Button>
          <Button disabled>Agotado</Button>
          <Button loading={loading} onClick={() => setLoading((v) => !v)}>
            {loading ? 'Enviando pedido…' : 'Probar carga'}
          </Button>
          <Button size="sm">Pequeño</Button>
        </div>
      </section>

      <section className={l.stack} aria-labelledby="campos">
        <h2 id="campos" className={l.sectionTitle}>
          Input y Select
        </h2>
        <div className={s.grid2}>
          <Input label="Nombre completo" placeholder="María Quispe" autoComplete="name" />
          <Input
            label="Celular"
            type="tel"
            inputMode="tel"
            placeholder="987 654 321"
            hint="Te escribiremos por WhatsApp para coordinar el pago."
          />
          <Input label="DNI" inputMode="numeric" defaultValue="1234" error="El DNI debe tener 8 dígitos." />
          <Select label="Distrito de entrega" defaultValue="">
            <option value="" disabled>
              Elige tu distrito
            </option>
            <option value="150122">Miraflores</option>
            <option value="150131">San Isidro</option>
            <option value="150140">Santiago de Surco</option>
            <option value="070101">Callao</option>
          </Select>
          <Input label="Referencia" disabled placeholder="No disponible" />
        </div>
      </section>

      <section className={l.stack} aria-labelledby="cantidad">
        <h2 id="cantidad" className={l.sectionTitle}>
          QuantityStepper
        </h2>
        <div className={l.row}>
          <QuantityStepper label="Café de Chanchamayo 500 g" value={qty} max={5} onChange={setQty} />
          <QuantityStepper label="Producto deshabilitado" value={1} max={1} onChange={() => {}} disabled />
        </div>
      </section>

      <section className={l.stack} aria-labelledby="badges">
        <h2 id="badges" className={l.sectionTitle}>
          Badge y StockBadge
        </h2>
        <div className={l.row}>
          <Badge>Neutral</Badge>
          <Badge tone="success" dot>
            Pagado
          </Badge>
          <Badge tone="warning" dot>
            Pendiente de pago
          </Badge>
          <Badge tone="danger" dot>
            Cancelado
          </Badge>
          <Badge tone="info" dot>
            Enviado
          </Badge>
        </div>
        <div className={l.row}>
          <StockBadge stock={40} />
          <StockBadge stock={3} />
          <StockBadge stock={1} />
          <StockBadge stock={0} />
        </div>
      </section>

      <section className={l.stack} aria-labelledby="producto">
        <h2 id="producto" className={l.sectionTitle}>
          Card, Price y composición
        </h2>
        <ul className={s.products}>
          {PRODUCTS.map((p) => (
            <Card as="li" key={p.name}>
              <div>
                <h3 className={s.productName}>{p.name}</h3>
                <p className={s.productMeta}>{p.origin}</p>
              </div>
              <StockBadge stock={p.stock} />
              <div className={s.productFoot}>
                <Price cents={p.cents} taxNote />
                <Button size="sm" disabled={p.stock === 0}>
                  {p.stock === 0 ? 'Agotado' : 'Agregar'}
                </Button>
              </div>
            </Card>
          ))}
        </ul>
      </section>

      <section className={l.stack} aria-labelledby="estados">
        <h2 id="estados" className={l.sectionTitle}>
          Estados: vacío, error y carga
        </h2>
        <div className={s.grid2}>
          <EmptyState
            title="Tu carrito está vacío"
            description="Agrega productos del catálogo para ver aquí el total en soles."
            action={<Button variant="secondary">Ver catálogo</Button>}
          />
          <EmptyState
            tone="danger"
            title="No pudimos cargar el catálogo"
            description="Revisa tu conexión e inténtalo de nuevo."
            action={<Button variant="secondary">Reintentar</Button>}
          />
          <Card aria-busy="true">
            <Skeleton height="1.25rem" width="70%" />
            <Skeleton variant="text" width="40%" />
            <Skeleton height="2.25rem" />
          </Card>
        </div>
      </section>
    </main>
  );
}
