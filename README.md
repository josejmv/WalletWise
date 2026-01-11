# WalletWise

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://vercel.com/)
[![Neon](https://img.shields.io/badge/Database-Neon-00E599?logo=postgresql)](https://neon.tech/)

Dashboard de finanzas personales con soporte multi-moneda y criptomonedas.

## Features

- **Multi-Moneda**: USD, COP, VES + Cryptos (USDT, BTC, ETH, BNB, SOL)
- **Tasas de Cambio**: API oficial + Binance P2P con tasa custom
- **Ingresos y Gastos**: Transacciones con conversion automatica
- **Transferencias**: Entre cuentas y presupuestos
- **Presupuestos**: Goals y envelopes con bloqueo de saldo
- **Dashboard**: KPIs, graficos, quick actions
- **Reportes**: Export PDF, CSV, JSON
- **Backup/Restore**: Datos y configuracion

## Tech Stack

| Capa         | Tecnologia                       |
| ------------ | -------------------------------- |
| Frontend     | Next.js 16, React 19, TypeScript |
| Estilos      | Tailwind CSS 4, shadcn/ui        |
| Backend      | Next.js API Routes, Prisma 6     |
| Database     | PostgreSQL 16                    |
| Graficos     | Recharts                         |
| PDF          | jsPDF                            |
| **Deploy**   | Vercel (Frontend + Backend)      |
| **DB Cloud** | Neon (PostgreSQL Serverless)     |

## Quick Start

### Requisitos

- Node.js >= 20.x
- Docker >= 24.x
- Yarn >= 1.22.x

### Instalacion

```bash
# Clonar repositorio
git clone https://github.com/your-username/finanzas-jmv.git
cd finanzas-jmv

# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu API key de ExchangeRate-API

# Levantar PostgreSQL
docker-compose up -d

# Inicializar base de datos
yarn db:generate
yarn db:push
yarn db:seed

# Iniciar servidor de desarrollo
yarn dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Scripts Disponibles

```bash
# Desarrollo
yarn dev              # Servidor de desarrollo
yarn build            # Build de produccion
yarn start            # Servidor de produccion
yarn lint             # ESLint
yarn typecheck        # TypeScript check

# Base de Datos
yarn db:generate      # Generar cliente Prisma
yarn db:push          # Sincronizar schema
yarn db:migrate       # Crear migracion
yarn db:seed          # Seed inicial
yarn db:studio        # Prisma Studio
```

## Estructura del Proyecto

```
app/
├── dashboard/          # Rutas del dashboard
│   ├── accounts/       # Gestion de cuentas
│   ├── budgets/        # Presupuestos
│   ├── expenses/       # Gastos
│   ├── incomes/        # Ingresos
│   ├── transfers/      # Transferencias
│   ├── settings/       # Configuracion
│   └── ...
├── api/                # REST API
│   └── [modulo]/
│       ├── route.ts
│       ├── service.ts
│       └── repository.ts
└── ...

components/
├── ui/                 # shadcn/ui components
├── layout/             # Sidebar, Header
└── ...

lib/
├── prisma.ts           # Cliente Prisma
├── pagination.ts       # Utilidades paginacion
└── ...
```

## Variables de Entorno

```env
# Base de datos
DATABASE_URL="postgresql://walletwise:walletwise_secret@localhost:5432/walletwise"

# API de tasas de cambio
EXCHANGE_RATE_API_KEY="tu_api_key"

# Aplicacion
NEXT_PUBLIC_APP_NAME="WalletWise"
```

## Documentacion

La documentacion completa esta en la carpeta [docs/](./docs/):

- [README.md](./docs/README.md) - Indice principal
- [SETUP.md](./docs/SETUP.md) - Guia de instalacion local
- [DEPLOY.md](./docs/DEPLOY.md) - Guia de despliegue (Vercel + Neon)
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitectura
- [API.md](./docs/API.md) - Referencia de API
- [steps/v1.md](./docs/steps/v1.md) - Detalles de v1.x

## Roadmap

- [x] v1.0.0 - Dashboard single-user
- [x] v1.1.0 - Cryptos, tasas mejoradas, settings
- [ ] v2.0.0 - Multi-usuario con autenticacion

## Licencia

MIT

---

Desarrollado con Next.js y Prisma
