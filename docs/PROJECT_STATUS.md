# WalletWise - Estado del Proyecto

> Resumen del progreso de desarrollo

---

## Version Actual

| Metrica      | Valor      |
| ------------ | ---------- |
| Version      | 1.2.0      |
| Estado       | Completado |
| Build Status | OK         |

---

## Funcionalidades Implementadas

### Core (v1.0.0)

- [x] Dashboard con KPIs y graficos
- [x] Gestion de cuentas (banco, efectivo, digital, credito)
- [x] Registro de ingresos con trabajos
- [x] Registro de gastos unicos y recurrentes
- [x] Transferencias entre cuentas
- [x] Presupuestos (goal y envelope)
- [x] Categorias jerarquicas
- [x] Inventario con historial de precios
- [x] Lista de compras
- [x] Backup/restore completo
- [x] Export PDF/CSV/JSON
- [x] Paginacion en listados

### Mejoras (v1.1.0)

- [x] Criptomonedas (USDT, BTC, ETH, BNB, SOL)
- [x] Tasas Binance P2P
- [x] Cooldown 6 horas en sync
- [x] Tasa custom en formularios
- [x] Sidebar con dropdowns
- [x] Dashboard mejorado (quick actions, widgets)
- [x] Budgets con bloqueo de saldo
- [x] Transfers account-budget
- [x] Vista cuentas con disponible/bloqueado
- [x] Settings (moneda base, formato fecha/numeros, tema)
- [x] Formatters centralizados (UserConfigContext)
- [x] Historial con tasas (columna + popover)

### Correcciones y UX (v1.2.0)

- [x] Cache e invalidacion de queries (dashboard, accounts, budgets)
- [x] Tasas de cambio mejoradas (sync todo, inversas automaticas, cooldown separado)
- [x] Conversiones a moneda base (KPIs, tendencias, reportes)
- [x] Formula de ahorro corregida (custom < oficial = ahorro)
- [x] Calculo disponible corregido (max 0)
- [x] Transacciones recientes con contribuciones/retiros budget
- [x] Tema persistente (sincronizado con BD, deteccion sistema)
- [x] InlineAccountModal (crear cuenta desde formularios)
- [x] Inputs de monto sin valor por defecto
- [x] Cuentas en formato tabla
- [x] Categorias expandibles
- [x] Inventario con categoria opcional
- [x] Shopping list multi-moneda

---

## Stack Tecnologico

| Tecnologia     | Version |
| -------------- | ------- |
| Next.js        | 16      |
| React          | 19      |
| TypeScript     | 5.x     |
| Tailwind CSS   | 4       |
| TanStack Query | 5.x     |
| Prisma         | 6       |
| PostgreSQL     | 16      |
| Recharts       | 2.x     |

---

## Estructura del Proyecto

```
app/
├── dashboard/              # Rutas del dashboard
│   ├── page.tsx            # Dashboard principal
│   ├── _components/        # Componentes del dashboard
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
        ├── [id]/route.ts
        ├── service.ts
        ├── repository.ts
        ├── schema.ts
        └── types.ts

lib/
├── prisma.ts
├── pagination.ts
├── export-utils.ts
├── binance-p2p.ts
├── currency-utils.ts       # NUEVO en v1.2.0
├── date-utils.ts
├── number-utils.ts
└── utils.ts

contexts/
└── user-config-context.tsx

components/
├── ui/
├── layout/
├── exchange-rate-display.tsx
├── rate-details-popover.tsx
├── inline-account-modal.tsx  # NUEVO en v1.2.0
└── backup-modal.tsx
```

---

## Proximos Pasos

Version 2.0.0 (planificada):

- Sistema de autenticacion
- Soporte multi-usuario
- Landing page publica
- OAuth providers

Ver [docs/steps/v2.0.0.md](./steps/v2.0.0.md) para detalles.

---

## Documentacion

| Documento                            | Descripcion              |
| ------------------------------------ | ------------------------ |
| [README.md](./README.md)             | Indice de documentacion  |
| [SETUP.md](./SETUP.md)               | Guia de instalacion      |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitectura             |
| [API.md](./API.md)                   | Referencia de endpoints  |
| [steps/v1.md](./steps/v1.md)         | Detalles de v1.0.0-1.1.0 |
| [steps/v1.2.0.md](./steps/v1.2.0.md) | Detalles de v1.2.0       |
| [steps/v2.0.0.md](./steps/v2.0.0.md) | Roadmap v2.0.0           |

---

## Comandos

```bash
# Desarrollo
yarn dev              # Servidor desarrollo
yarn build            # Build produccion
yarn lint             # Linter
yarn typecheck        # Verificar tipos

# Base de datos
yarn db:generate      # Generar cliente Prisma
yarn db:migrate       # Aplicar migraciones
yarn db:seed          # Datos iniciales
yarn db:studio        # Prisma Studio

# Docker
docker-compose up -d  # Levantar PostgreSQL
```

---

_WalletWise v1.2.0 - Estado del Proyecto_
