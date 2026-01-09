# WalletWise - Contexto del Proyecto

> Punto de entrada para desarrollo con IA

---

## Descripcion

**WalletWise** es un dashboard de finanzas personales para gestionar ingresos, gastos, cuentas y presupuestos con soporte multi-moneda.

### Propuesta de Valor

- Gestion de trabajos fijos y freelance con ingresos automaticos
- Control de gastos unicos y recurrentes
- Sistema multi-moneda (USD, COP, VES) con tasas de cambio
- Comparacion de tasa oficial vs tasa del comercio
- Metas de ahorro y sobres (envelopes)
- Inventario del hogar con lista de compras inteligente
- Reportes exportables (CSV/PDF)

---

## Stack Tecnologico

| Capa              | Tecnologias                                    |
| ----------------- | ---------------------------------------------- |
| **Frontend**      | Next.js 16, React 19, TypeScript 5, Tailwind 4 |
| **Backend**       | Next.js API Routes, Prisma 6, Zod 3            |
| **Base de datos** | PostgreSQL 16                                  |
| **Contenedores**  | Docker Compose                                 |
| **Fetching**      | TanStack Query 5                               |

---

## Modulos

| Modulo         | Descripcion                             | Documentacion                              |
| -------------- | --------------------------------------- | ------------------------------------------ |
| **Dashboard**  | Vista principal con KPIs y graficos     | [Ver docs](./modules/dashboard/README.md)  |
| **Jobs**       | Trabajos fijos y freelance              | [Ver docs](./modules/jobs/README.md)       |
| **Accounts**   | Cuentas bancarias y billeteras          | [Ver docs](./modules/accounts/README.md)   |
| **Categories** | Categorias de gastos                    | [Ver docs](./modules/categories/README.md) |
| **Expenses**   | Gastos unicos y recurrentes             | [Ver docs](./modules/expenses/README.md)   |
| **Incomes**    | Registro de ingresos                    | [Ver docs](./modules/incomes/README.md)    |
| **Transfers**  | Transferencias entre cuentas            | [Ver docs](./modules/transfers/README.md)  |
| **Budgets**    | Presupuestos y metas de ahorro          | [Ver docs](./modules/budgets/README.md)    |
| **Inventory**  | Inventario del hogar y lista de mercado | [Ver docs](./modules/inventory/README.md)  |
| **Reports**    | Reportes y exportacion                  | [Ver docs](./modules/reports/README.md)    |

---

## Arquitectura

### Estructura de Carpetas

```
app/
├── (dashboard)/          # Rutas del dashboard
│   ├── jobs/
│   ├── accounts/
│   ├── categories/
│   ├── expenses/
│   ├── incomes/
│   ├── transfers/
│   ├── budgets/
│   ├── inventory/
│   └── reports/
└── api/                  # REST endpoints

lib/
├── prisma.ts             # Cliente Prisma singleton
├── utils.ts              # Utilidades (cn)
└── formatters.ts         # Formateo de moneda, fechas

prisma/
├── schema.prisma         # Schema de base de datos
└── seed.ts               # Datos iniciales
```

### Uso Personal

- Sin sistema de autenticacion
- Acceso directo al dashboard
- Datos almacenados localmente en PostgreSQL

---

## Documentacion Adicional

### Arquitectura y Estandares

| Documento                                      | Descripcion                                          |
| ---------------------------------------------- | ---------------------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)           | Frontend, Backend, DB, Git, Codigo, Naming           |
| [API.md](./API.md)                             | Referencia completa de todos los endpoints           |
| [CHARTS.md](./CHARTS.md)                       | Graficos, indicadores KPI y sistema de visualizacion |
| [DEVELOPMENT_ORDER.md](./DEVELOPMENT_ORDER.md) | Orden de desarrollo por dependencias                 |

---

## Modelos de Datos (Resumen)

### Core

| Modelo         | Descripcion                   |
| -------------- | ----------------------------- |
| `Currency`     | Monedas soportadas (USD, COP) |
| `ExchangeRate` | Historial de tasas de cambio  |
| `AccountType`  | Tipos de cuenta               |
| `Account`      | Cuentas financieras           |

### Trabajos e Ingresos

| Modelo   | Descripcion                |
| -------- | -------------------------- |
| `Job`    | Trabajos fijos y freelance |
| `Income` | Ingresos registrados       |

### Gastos

| Modelo     | Descripcion                 |
| ---------- | --------------------------- |
| `Category` | Categorias jerarquicas      |
| `Expense`  | Gastos unicos y recurrentes |

### Presupuestos

| Modelo               | Descripcion            |
| -------------------- | ---------------------- |
| `Budget`             | Metas y sobres         |
| `BudgetContribution` | Aportes a presupuestos |

### Inventario

| Modelo                  | Descripcion              |
| ----------------------- | ------------------------ |
| `InventoryCategory`     | Categorias de productos  |
| `InventoryItem`         | Productos del inventario |
| `InventoryPriceHistory` | Historial de precios     |

### Otros

| Modelo     | Descripcion               |
| ---------- | ------------------------- |
| `Transfer` | Movimientos entre cuentas |

---

## Convenciones Clave

### Sistema Multi-Moneda

- **Moneda base**: USD (todas las conversiones se hacen a USD)
- **Monedas soportadas**: USD, COP, VES
- **Tasas de cambio**: Actualizacion manual via Exchange Rate API

### Tasa Auxiliar

Permite comparar la tasa oficial del banco central con la tasa real del comercio:

```
diferencia = (monto / tasaComercio) - (monto / tasaOficial)

Si diferencia > 0: Ahorraste
Si diferencia < 0: Gastaste de mas
```

### Tipos de Trabajo

| Tipo        | Descripcion                          |
| ----------- | ------------------------------------ |
| `fixed`     | Sueldo periodico (quincenal/mensual) |
| `freelance` | Pago unico por proyecto              |

### Tipos de Presupuesto

| Tipo       | Descripcion                   |
| ---------- | ----------------------------- |
| `goal`     | Meta de ahorro con objetivo   |
| `envelope` | Dinero apartado de una cuenta |

### Gastos Recurrentes

- Netflix, Spotify, etc.
- Configuracion de periodicidad (semanal, mensual, anual)
- Seguimiento de proxima fecha de pago

---

## Variables de Entorno

```env
# Database
DATABASE_URL="postgresql://walletwise:password@localhost:5432/walletwise"

# Exchange Rate API
EXCHANGE_RATE_API_KEY="tu_api_key"

# App
NEXT_PUBLIC_APP_NAME="WalletWise"
NEXT_PUBLIC_BASE_CURRENCY="USD"
```

---

## Ver tambien

- [README.md](./README.md) - Indice principal de documentacion
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura y estandares
- [API.md](./API.md) - Referencia de APIs
- [SETUP.md](./SETUP.md) - Guia de instalacion

---

_Documento de contexto para desarrollo con IA_
