# WalletWise - Orden de Desarrollo

> Guia de desarrollo ordenada por dependencias entre modulos

---

## Grafo de Dependencias

```
                    ┌─────────────────────────────────────────┐
                    │           NIVEL 4 - CONSUMIDORES        │
                    │         Dashboard  │  Reports           │
                    └──────────┬─────────┴────────┬───────────┘
                               │                  │
        ┌──────────────────────┴──────────────────┴──────────────────────┐
        │                     NIVEL 3 - TRANSACCIONES                    │
        │   Income  │  Expense  │  Transfer  │  BudgetContribution       │
        └─────┬─────┴─────┬─────┴──────┬─────┴────────┬──────────────────┘
              │           │            │              │
        ┌─────┴───────────┴────────────┴──────────────┴─────┐
        │              NIVEL 2 - ENTIDADES SECUNDARIAS      │
        │    Job    │    Budget    │   InventoryPriceHistory │
        └─────┬─────┴───────┬──────┴────────────┬───────────┘
              │             │                   │
        ┌─────┴─────────────┴───────────────────┴───────────┐
        │              NIVEL 1 - ENTIDADES PRIMARIAS        │
        │   Account   │   ExchangeRate   │   InventoryItem  │
        └──────┬──────┴─────────┬────────┴────────┬─────────┘
               │                │                 │
        ┌──────┴────────────────┴─────────────────┴─────────┐
        │              NIVEL 0 - RAICES (SIN DEPENDENCIAS)  │
        │ Currency │ AccountType │ Category │ InventoryCategory │
        └───────────────────────────────────────────────────┘
```

---

## Fases de Desarrollo

### FASE 0: Infraestructura Base

> Componentes UI reutilizables y configuracion

| #   | Tarea                                    | Justificacion               |
| --- | ---------------------------------------- | --------------------------- |
| 0.1 | Componentes UI base (Button, Input, etc) | Todos los modulos los usan  |
| 0.2 | Layout del Dashboard (Sidebar, Header)   | Estructura visual de la app |
| 0.3 | Componentes de formulario                | CRUD de todos los modulos   |
| 0.4 | Sistema de notificaciones/toasts         | Feedback al usuario         |

**Checklist:**

- [ ] Button (variantes: primary, secondary, danger, ghost)
- [ ] Input (text, number, currency)
- [ ] Select / Combobox
- [ ] Card
- [ ] Modal / Dialog
- [ ] Table
- [ ] DatePicker
- [ ] Toast / Notifications
- [ ] Loading states (Skeleton, Spinner)
- [ ] Empty states
- [ ] Layout con Sidebar
- [ ] Header con navegacion

---

### FASE 1: Nivel 0 - Modulos Raiz

> Sin dependencias, usados por todos los demas

| #   | Modulo                | Dependencias   | Usado por                                            | Prioridad   |
| --- | --------------------- | -------------- | ---------------------------------------------------- | ----------- |
| 1.1 | **Currency**          | Ninguna        | Account, Job, Income, Expense, Transfer, Budget, etc | **CRITICA** |
| 1.2 | **AccountType**       | Ninguna        | Account                                              | Alta        |
| 1.3 | **Category**          | Ninguna (self) | Expense                                              | Alta        |
| 1.4 | **InventoryCategory** | Ninguna        | InventoryItem                                        | Media       |

**Orden interno:**

```
1. Currency        → Base de todo el sistema multi-moneda
2. AccountType     → Necesario para Account
3. Category        → Independiente, puede ir en paralelo
4. InventoryCategory → Independiente, puede ir en paralelo
```

**Checklist:**

- [ ] Currency API (CRUD)
- [ ] Currency seed (USD, COP, VES)
- [ ] AccountType API (CRUD)
- [ ] AccountType seed (bank, cash, digital_wallet, credit_card)
- [ ] Category API (CRUD con jerarquia)
- [ ] Category seed (categorias predefinidas)
- [ ] InventoryCategory API (CRUD)
- [ ] InventoryCategory seed (Despensa, Limpieza, etc)

---

### FASE 2: Nivel 1 - Entidades Primarias

> Dependen de Nivel 0, son base para transacciones

| #   | Modulo            | Dependencias                | Usado por                           | Prioridad   |
| --- | ----------------- | --------------------------- | ----------------------------------- | ----------- |
| 2.1 | **Account**       | Currency, AccountType       | Job, Income, Expense, Transfer, etc | **CRITICA** |
| 2.2 | **ExchangeRate**  | Currency                    | Conversiones en toda la app         | Alta        |
| 2.3 | **InventoryItem** | InventoryCategory, Currency | InventoryPriceHistory, ShoppingList | Media       |

**Orden interno:**

```
1. Account         → Mas modulos dependen de el
2. ExchangeRate    → Necesario para conversiones
3. InventoryItem   → Independiente del flujo principal
```

**Checklist:**

- [ ] Account API (CRUD)
- [ ] Account UI (lista, formulario, detalle)
- [ ] ExchangeRate API (CRUD + refresh)
- [ ] ExchangeRate integracion con API externa
- [ ] ExchangeRate UI (conversor, historial)
- [ ] InventoryItem API (CRUD)
- [ ] InventoryItem UI (lista, formulario)
- [ ] Quick quantity update

---

### FASE 3: Nivel 2 - Entidades Secundarias

> Dependen de Nivel 1

| #   | Modulo                    | Dependencias            | Usado por           | Prioridad   |
| --- | ------------------------- | ----------------------- | ------------------- | ----------- |
| 3.1 | **Job**                   | Currency, Account       | Income              | **CRITICA** |
| 3.2 | **Budget**                | Currency, Account?      | BudgetContribution  | Alta        |
| 3.3 | **InventoryPriceHistory** | InventoryItem, Currency | Stats de inventario | Baja        |

**Orden interno:**

```
1. Job             → Necesario para Income
2. Budget          → Independiente del flujo de ingresos/gastos
3. InventoryPriceHistory → Complementario
```

**Checklist:**

- [ ] Job API (CRUD + archive)
- [ ] Job UI (lista, formulario, detalle)
- [ ] Job tipos (fixed, freelance)
- [ ] Budget API (CRUD)
- [ ] Budget UI (goals, envelopes)
- [ ] Budget progress indicators
- [ ] InventoryPriceHistory API

---

### FASE 4: Nivel 3 - Transacciones

> El core de la aplicacion financiera

| #   | Modulo                 | Dependencias                | Prioridad   |
| --- | ---------------------- | --------------------------- | ----------- |
| 4.1 | **Income**             | Job, Account, Currency      | **CRITICA** |
| 4.2 | **Expense**            | Category, Account, Currency | **CRITICA** |
| 4.3 | **Transfer**           | Account (x2), Currency      | Alta        |
| 4.4 | **BudgetContribution** | Budget                      | Media       |

**Orden interno:**

```
1. Income          → Flujo de dinero entrante
2. Expense         → Flujo de dinero saliente
3. Transfer        → Movimientos internos
4. BudgetContribution → Aportes a metas
```

**Checklist:**

- [ ] Income API (CRUD)
- [ ] Income UI (lista, formulario)
- [ ] Income auto-generation desde Job
- [ ] Expense API (CRUD)
- [ ] Expense UI (lista, formulario)
- [ ] Expense recurrentes (auto-generation)
- [ ] Expense tasa auxiliar
- [ ] Transfer API (CRUD)
- [ ] Transfer UI (formulario con conversion)
- [ ] BudgetContribution API (contribute, withdraw)
- [ ] BudgetContribution UI

---

### FASE 5: Nivel 4 - Agregadores

> Consumen datos de todos los modulos

| #   | Modulo               | Consume de                       | Prioridad |
| --- | -------------------- | -------------------------------- | --------- |
| 5.1 | **Dashboard + KPIs** | Todos                            | Alta      |
| 5.2 | **Graficos**         | Income, Expense, Budget, Account | Alta      |
| 5.3 | **Shopping List**    | InventoryItem                    | Media     |
| 5.4 | **Reports**          | Todos                            | Media     |

**Checklist:**

- [ ] Dashboard API (KPIs endpoint)
- [ ] KPI Cards (balance, ingresos, gastos, ahorro)
- [ ] Donut Chart (gastos por categoria)
- [ ] Line Chart (tendencia mensual)
- [ ] Bar Chart (balance por cuenta)
- [ ] Progress indicators (budgets, goals)
- [ ] Shopping List API
- [ ] Shopping List UI (generar, completar)
- [ ] Reports API (summary, export)
- [ ] Export CSV
- [ ] Export PDF

---

## Resumen Visual

```
FASE 0 - INFRAESTRUCTURA
  └─ 0.1 Componentes UI base
  └─ 0.2 Layout Dashboard
  └─ 0.3 Componentes de formulario
  └─ 0.4 Sistema de notificaciones

FASE 1 - RAICES
  └─ 1.1 Currency (+ seed inicial)
  └─ 1.2 AccountType (+ seed inicial)
  └─ 1.3 Category (+ seed con categorias predefinidas)
  └─ 1.4 InventoryCategory

FASE 2 - ENTIDADES PRIMARIAS
  └─ 2.1 Account (CRUD completo)
  └─ 2.2 ExchangeRate (+ integracion API externa)
  └─ 2.3 InventoryItem

FASE 3 - ENTIDADES SECUNDARIAS
  └─ 3.1 Job (fijos y freelance)
  └─ 3.2 Budget (goals y envelopes)
  └─ 3.3 InventoryPriceHistory

FASE 4 - TRANSACCIONES
  └─ 4.1 Income (manual y automatico)
  └─ 4.2 Expense (unico y recurrente)
  └─ 4.3 Transfer
  └─ 4.4 BudgetContribution

FASE 5 - AGREGADORES
  └─ 5.1 Dashboard + KPIs
  └─ 5.2 Graficos (Recharts)
  └─ 5.3 Shopping List (lista de mercado)
  └─ 5.4 Reports (exportacion CSV/PDF)
```

---

## Notas de Implementacion

### Por cada modulo (API)

Seguir la arquitectura fractal:

```
app/api/[modulo]/
├── route.ts        # GET (list), POST (create)
├── [id]/
│   └── route.ts    # GET (one), PUT (update), DELETE
├── service.ts      # Logica de negocio
├── repository.ts   # Queries Prisma
├── schema.ts       # Validacion Zod
└── types.ts        # Interfaces TypeScript
```

### Por cada modulo (Frontend)

```
app/(dashboard)/[modulo]/
├── page.tsx           # Lista principal
├── new/
│   └── page.tsx       # Crear nuevo
├── [id]/
│   └── page.tsx       # Detalle/Editar
└── _components/       # Componentes locales
    ├── [modulo]-list/
    ├── [modulo]-form/
    └── [modulo]-card/
```

---

## Ver tambien

- [CONTEXT.md](./CONTEXT.md) - Contexto del proyecto
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura y estandares
- [API.md](./API.md) - Referencia de APIs
- [CHARTS.md](./CHARTS.md) - Sistema de graficos

---

_Documento de orden de desarrollo para WalletWise_
