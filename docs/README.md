# WalletWise - Documentacion

> Documentacion tecnica para WalletWise - Dashboard de finanzas personales

---

## Indice Principal

### Estado del Proyecto

| Documento                                | Descripcion                   |
| ---------------------------------------- | ----------------------------- |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Estado actual del proyecto    |
| [steps/](./steps/)                       | Versiones (v1.x, v2.0.0, etc) |

### Contexto y Configuracion

| Documento                  | Descripcion                         |
| -------------------------- | ----------------------------------- |
| [CONTEXT.md](./CONTEXT.md) | Contexto general, modelos y stack   |
| [SETUP.md](./SETUP.md)     | Guia de instalacion y configuracion |

### Arquitectura y Estandares

| Documento                            | Descripcion                       |
| ------------------------------------ | --------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Frontend, Backend, DB, Estandares |
| [API.md](./API.md)                   | Referencia completa de endpoints  |
| [CHARTS.md](./CHARTS.md)             | Sistema de graficos e indicadores |

### Modulos del Sistema

| Modulo         | Descripcion                         | Documentacion                                |
| -------------- | ----------------------------------- | -------------------------------------------- |
| Dashboard      | Vista principal con metricas y KPIs | [README](./modules/dashboard/README.md)      |
| Jobs           | Gestion de trabajos e ingresos      | [README](./modules/jobs/README.md)           |
| Accounts       | Cuentas bancarias y billeteras      | [README](./modules/accounts/README.md)       |
| Categories     | Categorias de gastos                | [README](./modules/categories/README.md)     |
| Exchange Rates | Tasas de cambio multi-moneda        | [README](./modules/exchange-rates/README.md) |
| Incomes        | Registro de ingresos                | [README](./modules/incomes/README.md)        |
| Expenses       | Gastos unicos y recurrentes         | [README](./modules/expenses/README.md)       |
| Transfers      | Transferencias entre cuentas        | [README](./modules/transfers/README.md)      |
| Budgets        | Presupuestos y metas de ahorro      | [README](./modules/budgets/README.md)        |
| Reports        | Reportes y exportacion              | [README](./modules/reports/README.md)        |
| Inventory      | Gestion de inventario               | [README](./modules/inventory/README.md)      |

---

## Quick Start

```bash
# Levantar servicios (PostgreSQL)
docker-compose up -d

# Instalar dependencias
yarn install

# Generar cliente Prisma
yarn db:generate

# Aplicar schema de base de datos
yarn db:push

# Seed de datos iniciales
yarn db:seed

# Iniciar servidor de desarrollo
yarn dev
```

---

## Stack Tecnologico

| Capa            | Tecnologia                       |
| --------------- | -------------------------------- |
| Frontend        | Next.js 16, React 19, TypeScript |
| Estilos         | Tailwind CSS 4                   |
| Estado/Fetching | TanStack Query                   |
| Backend         | Next.js API Routes               |
| ORM             | Prisma 6                         |
| Base de Datos   | PostgreSQL 16                    |
| Graficos        | Recharts                         |
| Contenedores    | Docker Compose                   |

---

## Estructura del Proyecto

```
app/
├── dashboard/              # Rutas del dashboard
│   ├── page.tsx            # Dashboard principal
│   ├── _components/        # Componentes dashboard
│   ├── accounts/
│   ├── budgets/
│   ├── categories/
│   ├── currencies/
│   ├── exchange-rates/
│   ├── expenses/
│   ├── incomes/
│   ├── inventory/
│   ├── jobs/
│   ├── reports/
│   ├── settings/
│   └── transfers/
└── api/                    # REST endpoints
    └── [modulo]/
        ├── route.ts
        ├── service.ts
        ├── repository.ts
        └── types.ts

lib/
├── prisma.ts
├── pagination.ts
├── export-utils.ts
├── binance-p2p.ts
└── utils.ts

contexts/
└── user-config-context.tsx

components/
├── ui/
├── layout/
└── ...
```

---

## Sistema Multi-Moneda

### Monedas Fiat

| Moneda | Codigo | Rol                     |
| ------ | ------ | ----------------------- |
| USD    | USD    | Moneda base del sistema |
| COP    | COP    | Peso colombiano         |
| VES    | VES    | Bolivar venezolano      |

### Criptomonedas

| Moneda   | Codigo |
| -------- | ------ |
| Tether   | USDT   |
| Bitcoin  | BTC    |
| Ethereum | ETH    |
| Binance  | BNB    |
| Solana   | SOL    |

### Fuentes de Tasas

- **API Oficial**: ExchangeRate-API para fiat
- **Binance P2P**: Para cryptos y pares adicionales
- **Manual**: Tasa custom ingresada por usuario

---

## Convenciones Clave

### Tipos de Cuenta

| Tipo             | Descripcion                  |
| ---------------- | ---------------------------- |
| `bank`           | Cuenta bancaria tradicional  |
| `cash`           | Efectivo en mano             |
| `digital_wallet` | PayPal, Binance, Nequi, etc. |
| `credit_card`    | Tarjeta de credito           |

### Tipos de Trabajo

| Tipo        | Descripcion                       |
| ----------- | --------------------------------- |
| `fixed`     | Trabajo fijo con sueldo periodico |
| `freelance` | Proyecto freelance con pago unico |

### Tipos de Budget

| Tipo       | Descripcion                     |
| ---------- | ------------------------------- |
| `goal`     | Meta de ahorro con deadline     |
| `envelope` | Sobre virtual que bloquea saldo |

### Tipos de Transfer

| Tipo                 | Descripcion          |
| -------------------- | -------------------- |
| `account_to_account` | Entre cuentas        |
| `account_to_budget`  | Cuenta a presupuesto |
| `budget_to_account`  | Presupuesto a cuenta |

---

## Ver tambien

- [CONTEXT.md](./CONTEXT.md) - Contexto detallado del proyecto
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura y estandares
- [API.md](./API.md) - Referencia de APIs
- [SETUP.md](./SETUP.md) - Guia de instalacion
- [steps/v1.md](./steps/v1.md) - Detalles de version 1.x
