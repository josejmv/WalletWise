# Modulo Budgets

Presupuestos, metas de ahorro y sistema de sobres (envelopes).

---

## Descripcion

Permite establecer presupuestos por categoria, crear metas de ahorro con seguimiento de progreso, y apartar dinero en sobres virtuales.

---

## Tipos de Presupuesto

### Meta de Ahorro (`goal`)

Objetivo financiero con monto meta y seguimiento de aportes.

| Campo         | Tipo      | Descripcion                           |
| ------------- | --------- | ------------------------------------- |
| name          | string    | Nombre de la meta                     |
| targetAmount  | Decimal   | Monto objetivo                        |
| currentAmount | Decimal   | Monto acumulado                       |
| currency      | Currency  | Moneda de la meta                     |
| deadline      | DateTime? | Fecha limite (opcional)               |
| status        | enum      | `active` \| `completed` \| `archived` |

### Sobre (`envelope`)

Dinero apartado de una cuenta existente.

| Campo   | Tipo    | Descripcion               |
| ------- | ------- | ------------------------- |
| name    | string  | Nombre del sobre          |
| amount  | Decimal | Monto apartado            |
| account | Account | Cuenta de donde se aparta |
| status  | enum    | `active` \| `archived`    |

---

## Modelo de Datos

### Budget

| Campo         | Tipo      | Descripcion                      |
| ------------- | --------- | -------------------------------- |
| id            | UUID      | Identificador unico              |
| name          | string    | Nombre del presupuesto           |
| type          | enum      | `goal` \| `envelope`             |
| targetAmount  | Decimal?  | Monto objetivo (para goals)      |
| currentAmount | Decimal   | Monto actual                     |
| currency      | Currency  | Moneda                           |
| account       | Account?  | Cuenta asociada (para envelopes) |
| deadline      | DateTime? | Fecha limite                     |
| status        | enum      | Estado del presupuesto           |
| createdAt     | DateTime  | Fecha de creacion                |
| updatedAt     | DateTime  | Ultima actualizacion             |

### BudgetContribution

| Campo     | Tipo     | Descripcion          |
| --------- | -------- | -------------------- |
| id        | UUID     | Identificador unico  |
| budget    | Budget   | Presupuesto asociado |
| amount    | Decimal  | Monto del aporte     |
| date      | DateTime | Fecha del aporte     |
| note      | string?  | Nota opcional        |
| createdAt | DateTime | Fecha de registro    |

---

## API Endpoints

### GET /api/budgets

Lista todos los presupuestos.

**Query params:**

- `type`: `goal` | `envelope`
- `status`: `active` | `completed` | `archived`

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Vacaciones 2024",
      "type": "goal",
      "targetAmount": 3000.0,
      "currentAmount": 1350.0,
      "progress": 45.0,
      "currency": { "code": "USD" },
      "deadline": "2024-12-01",
      "status": "active"
    },
    {
      "id": "uuid",
      "name": "Fondo emergencia",
      "type": "envelope",
      "currentAmount": 500.0,
      "account": { "id": "uuid", "name": "Banco Principal" },
      "currency": { "code": "USD" },
      "status": "active"
    }
  ]
}
```

### POST /api/budgets

Crea un nuevo presupuesto.

**Body (goal):**

```json
{
  "name": "Laptop nueva",
  "type": "goal",
  "targetAmount": 1500.0,
  "currencyId": "uuid",
  "deadline": "2024-06-01"
}
```

**Body (envelope):**

```json
{
  "name": "Gastos medicos",
  "type": "envelope",
  "amount": 200.0,
  "accountId": "uuid"
}
```

### GET /api/budgets/:id

Obtiene detalle con historial de aportes.

### PUT /api/budgets/:id

Actualiza un presupuesto.

### DELETE /api/budgets/:id

Archiva un presupuesto.

### POST /api/budgets/:id/contribute

Agrega un aporte a una meta.

**Body:**

```json
{
  "amount": 150.0,
  "date": "2024-01-15",
  "note": "Aporte mensual"
}
```

### POST /api/budgets/:id/withdraw

Retira dinero de un sobre.

**Body:**

```json
{
  "amount": 50.0,
  "note": "Gasto medico"
}
```

---

## Estructura de Archivos

```
app/
├── (dashboard)/
│   └── budgets/
│       ├── page.tsx              # Lista de presupuestos
│       ├── new/
│       │   └── page.tsx          # Crear presupuesto
│       ├── [id]/
│       │   └── page.tsx          # Detalle con historial
│       └── _components/
│           ├── budget-list.tsx
│           ├── goal-card.tsx
│           ├── envelope-card.tsx
│           ├── budget-form.tsx
│           └── contribution-form.tsx
│
└── api/
    └── budgets/
        ├── route.ts
        ├── [id]/
        │   ├── route.ts
        │   ├── contribute/
        │   │   └── route.ts
        │   └── withdraw/
        │       └── route.ts
        ├── service.ts
        ├── repository.ts
        ├── schema.ts
        └── types.ts
```

---

## Flujos de Negocio

### Crear Meta de Ahorro

```
1. Crear Budget con type = 'goal'
2. currentAmount = 0
3. progress = 0%
4. status = 'active'
```

### Aportar a Meta

```
1. Validar que meta este activa
2. Crear BudgetContribution
3. budget.currentAmount += amount
4. Recalcular progreso: (currentAmount / targetAmount) * 100
5. Si progress >= 100%:
   - Cambiar status a 'completed'
   - Mostrar notificacion de logro
```

### Crear Sobre (Envelope)

```
1. Validar que cuenta tenga balance suficiente
2. Crear Budget con type = 'envelope'
3. account.balance -= amount (reserva virtual)
4. envelope.currentAmount = amount
```

### Retirar de Sobre

```
1. Validar que sobre tenga monto suficiente
2. envelope.currentAmount -= amount
3. account.balance += amount (libera reserva)
4. Si currentAmount === 0 y usuario quiere:
   - Archivar sobre
```

### Calculo de Balance Disponible

El dinero en sobres no cuenta como disponible:

```typescript
const balanceDisponible = account.balance - sumaEnvelopes(account);
```

---

## Estados del Presupuesto

### Meta (Goal)

```
[active] ---(completar 100%)---> [completed]
    |                                |
    +-------(archivar manual)--------+---> [archived]
```

### Sobre (Envelope)

```
[active] ---(archivar)---> [archived]
```

---

## Validaciones

| Campo        | Regla                          |
| ------------ | ------------------------------ |
| name         | Requerido, 2-100 caracteres    |
| type         | `goal` \| `envelope`           |
| targetAmount | Requerido para goals, > 0      |
| amount       | Requerido para envelopes, > 0  |
| accountId    | Requerido para envelopes       |
| deadline     | Fecha futura si se proporciona |

---

## Ver tambien

- [Accounts](../accounts/README.md) - Cuentas para sobres
- [Dashboard](../dashboard/README.md) - Progreso de metas
