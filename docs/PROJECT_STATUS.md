# WalletWise - Estado del Proyecto

> Resumen del progreso de desarrollo

---

## Version Actual

| Metrica      | Valor      |
| ------------ | ---------- |
| Version      | 1.5.0      |
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

- [x] Criptomonedas (simplificado a solo USDT)
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

### Post-Testing y UX (v1.3.0) - Completado

- [x] Solo USDT como cripto (simplificar)
- [x] USDT-USD tasa fija 1:1
- [x] Botones sync con cooldown visual y countdown
- [x] Fix inventario (categoryId null, preseleccion)
- [x] Fix modelo presupuestos (bloqueo sin mover dinero)
- [x] targetAmount opcional en budgets
- [x] Conversiones con tasas custom (lib/currency-utils.ts)
- [x] Account Types CRUD completo con mover cuentas al eliminar
- [x] Historial de precios mejorado con graficos
- [x] Shopping list: exportar PDF y WhatsApp
- [x] Nueva pagina historial de transacciones con filtros
- [x] Dashboard: fix donut dark mode
- [x] Dashboard: orden transacciones + selector
- [x] Personalizacion sidebar (orden dinamico)

### Mejoras y Features (v1.4.0) - Completado

- [x] Ingresos extra sin trabajo asociado (jobId opcional)
- [x] DatePicker mejorado (flechas arriba)
- [x] Fix validacion budget targetAmount
- [x] Estado de carga entre paginas (NProgress)
- [x] Modal de consumo de inventario
- [x] Rutas de conversion alternativas (USD, USDT como intermediarios)
- [x] Responsive completo (mobile sidebar, tablas adaptativas)

### Calculadora y Conversiones (v1.5.0) - Completado

- [x] Nueva pagina calculadora con teclado numerico
- [x] Parser de expresiones matematicas (expr-eval)
- [x] Conversion multi-moneda en tiempo real
- [x] Selector de monedas destino con persistencia
- [x] Tasas calculadas via intermediarios (exchange-rates page)
- [x] Mostrar categoria padre en gastos y historial
- [x] Calculadora agregada al sidebar

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
│   ├── calculator/         # NUEVO en v1.5.0
│   ├── categories/
│   ├── currencies/
│   ├── exchange-rates/
│   ├── expenses/
│   ├── incomes/
│   ├── inventory/
│   ├── jobs/
│   ├── reports/
│   ├── settings/
│   ├── transactions/       # NUEVO en v1.3.0
│   │   └── history/
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
├── calculator.ts           # NUEVO en v1.5.0
├── currency-utils.ts       # Mejorado en v1.4.0
├── date-utils.ts
├── number-utils.ts
└── utils.ts

contexts/
└── user-config-context.tsx

components/
├── ui/
│   └── sheet.tsx           # NUEVO en v1.4.0 (responsive)
├── layout/
│   ├── mobile-sidebar.tsx  # NUEVO en v1.4.0
│   └── progress-provider.tsx # NUEVO en v1.4.0
├── inventory/
│   └── consume-modal.tsx   # NUEVO en v1.4.0
├── exchange-rate-display.tsx
├── rate-details-popover.tsx
├── inline-account-modal.tsx
└── backup-modal.tsx
```

---

## Proximos Pasos

Version 1.6.0 (planificada):

- Mejoras menores y correcciones pendientes
- Ver [docs/steps/v1.6.0.md](./steps/v1.6.0.md) para detalles

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
| [MIGRATIONS.md](./MIGRATIONS.md)     | Guia de migraciones DB   |
| [steps/v1.md](./steps/v1.md)         | Detalles de v1.0.0-1.1.0 |
| [steps/v1.2.0.md](./steps/v1.2.0.md) | Detalles de v1.2.0       |
| [steps/v1.3.0.md](./steps/v1.3.0.md) | Detalles de v1.3.0       |
| [steps/v1.4.0.md](./steps/v1.4.0.md) | Detalles de v1.4.0       |
| [steps/v1.5.0.md](./steps/v1.5.0.md) | Detalles de v1.5.0       |
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

_WalletWise v1.5.0 - Estado del Proyecto (Completado)_
