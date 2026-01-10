# WalletWise - Documentacion

> Documentacion tecnica para el proyecto WalletWise - Dashboard de finanzas personales

---

## Indice Principal

### Estado del Proyecto

| Documento                                | Descripcion                                   |
| ---------------------------------------- | --------------------------------------------- |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Resumen de lo completado y pendientes futuros |
| [steps/](./steps/)                       | Versiones del proyecto (v1.0.0, v2.0.0, etc)  |

### Contexto y Configuracion

| Documento                  | Descripcion                         |
| -------------------------- | ----------------------------------- |
| [CONTEXT.md](./CONTEXT.md) | Contexto general, modelos y stack   |
| [SETUP.md](./SETUP.md)     | Guia de instalacion y configuracion |

### Arquitectura y Estandares

| Documento                            | Descripcion                                  |
| ------------------------------------ | -------------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Frontend, Backend, Base de Datos, Estandares |
| [API.md](./API.md)                   | Referencia completa de todos los endpoints   |

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
yarn db:migrate

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
| Contenedores    | Docker Compose                   |

---

## Estructura del Proyecto

```
app/
├── (dashboard)/          # Rutas del dashboard
│   ├── page.tsx          # Dashboard principal
│   ├── jobs/
│   ├── accounts/
│   ├── categories/
│   ├── exchange-rates/
│   ├── incomes/
│   ├── expenses/
│   ├── transfers/
│   ├── budgets/
│   └── reports/
└── api/                  # REST endpoints
    ├── accounts/
    ├── budgets/
    ├── categories/
    ├── dashboard/
    ├── exchange-rates/
    ├── expenses/
    ├── incomes/
    ├── jobs/
    ├── reports/
    └── transfers/

lib/
├── prisma.ts             # Cliente Prisma singleton

prisma/
├── schema.prisma         # Definicion del schema
└── seed.ts               # Datos iniciales

docs/                     # Documentacion
```

---

## Sistema Multi-Moneda

| Moneda | Codigo | Rol                     |
| ------ | ------ | ----------------------- |
| USD    | USD    | Moneda base del sistema |
| COP    | COP    | Peso colombiano         |
| VES    | VES    | Bolivar venezolano      |

**Caracteristicas:**

- Conversion automatica a moneda base
- Tasa de cambio oficial via Exchange Rate API
- Tasa auxiliar por transaccion para comparar con comercios
- Calculo de diferencia (ahorro/gasto extra)

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

### Periodicidad

| Tipo       | Descripcion                          |
| ---------- | ------------------------------------ |
| `biweekly` | Quincenal (dias 15 y ultimo del mes) |
| `monthly`  | Mensual (dia configurado)            |
| `weekly`   | Semanal                              |
| `yearly`   | Anual                                |

---

## Ver tambien

- [CONTEXT.md](./CONTEXT.md) - Contexto detallado del proyecto
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura y estandares
- [API.md](./API.md) - Referencia de APIs
- [SETUP.md](./SETUP.md) - Guia de instalacion
