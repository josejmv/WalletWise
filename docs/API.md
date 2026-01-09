# API Reference - WalletWise

Documentacion completa de todos los endpoints REST.

## Indice

1. [Formato de Respuestas](#formato-de-respuestas)
2. [Cuentas](#cuentas)
3. [Categorias](#categorias)
4. [Trabajos](#trabajos)
5. [Ingresos](#ingresos)
6. [Gastos](#gastos)
7. [Transferencias](#transferencias)
8. [Presupuestos](#presupuestos)
9. [Tasas de Cambio](#tasas-de-cambio)
10. [Dashboard](#dashboard)
11. [Reportes](#reportes)

---

## Formato de Respuestas

### Exito

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Error

```json
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```

### Codigos HTTP

| Codigo | Uso                               |
| ------ | --------------------------------- |
| `200`  | OK - Solicitud exitosa            |
| `201`  | Created - Recurso creado          |
| `400`  | Bad Request - Datos invalidos     |
| `404`  | Not Found - Recurso no encontrado |
| `500`  | Internal Server Error             |

---

## Cuentas

### Endpoints

| Metodo | Endpoint            | Descripcion               |
| ------ | ------------------- | ------------------------- |
| GET    | `/api/accounts`     | Listar todas las cuentas  |
| POST   | `/api/accounts`     | Crear nueva cuenta        |
| GET    | `/api/accounts/:id` | Obtener cuenta especifica |
| PUT    | `/api/accounts/:id` | Actualizar cuenta         |
| DELETE | `/api/accounts/:id` | Eliminar cuenta           |

### POST /api/accounts

**Request:**

```json
{
  "name": "Banco de Venezuela",
  "accountTypeId": "uuid-tipo-cuenta",
  "currencyId": "uuid-moneda",
  "balance": 1500.0
}
```

| Campo         | Tipo    | Requerido | Descripcion              |
| ------------- | ------- | --------- | ------------------------ |
| name          | string  | Si        | Nombre de la cuenta      |
| accountTypeId | uuid    | Si        | ID del tipo de cuenta    |
| currencyId    | uuid    | Si        | ID de la moneda          |
| balance       | decimal | No        | Balance inicial (def: 0) |

### Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Banco de Venezuela",
    "balance": 1500.0,
    "isActive": true,
    "accountType": {
      "id": "uuid",
      "name": "Cuenta bancaria",
      "type": "bank"
    },
    "currency": {
      "id": "uuid",
      "code": "VES",
      "symbol": "Bs."
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Categorias

### Endpoints

| Metodo | Endpoint              | Descripcion               |
| ------ | --------------------- | ------------------------- |
| GET    | `/api/categories`     | Listar categorias (arbol) |
| POST   | `/api/categories`     | Crear categoria           |
| GET    | `/api/categories/:id` | Obtener categoria         |
| PUT    | `/api/categories/:id` | Actualizar categoria      |
| DELETE | `/api/categories/:id` | Eliminar categoria        |

### POST /api/categories

**Request:**

```json
{
  "name": "Mercado",
  "parentId": "uuid-categoria-padre",
  "color": "#10B981",
  "icon": "shopping-cart"
}
```

| Campo    | Tipo   | Requerido | Descripcion                    |
| -------- | ------ | --------- | ------------------------------ |
| name     | string | Si        | Nombre de la categoria         |
| parentId | uuid   | No        | ID de categoria padre (si sub) |
| color    | string | No        | Color hex para UI              |
| icon     | string | No        | Identificador de icono         |

### GET /api/categories (Response)

Retorna arbol de categorias:

```json
{
  "success": true,
  "data": [
    {
      "id": "alimentacion",
      "name": "Alimentacion",
      "color": "#10B981",
      "icon": "utensils",
      "children": [
        {
          "id": "alimentacion-mercado",
          "name": "Mercado",
          "parentId": "alimentacion"
        },
        {
          "id": "alimentacion-restaurantes",
          "name": "Restaurantes",
          "parentId": "alimentacion"
        }
      ]
    }
  ]
}
```

---

## Trabajos

### Endpoints

| Metodo | Endpoint                | Descripcion        |
| ------ | ----------------------- | ------------------ |
| GET    | `/api/jobs`             | Listar trabajos    |
| POST   | `/api/jobs`             | Crear trabajo      |
| GET    | `/api/jobs/:id`         | Obtener trabajo    |
| PUT    | `/api/jobs/:id`         | Actualizar trabajo |
| PATCH  | `/api/jobs/:id/archive` | Archivar trabajo   |
| DELETE | `/api/jobs/:id`         | Eliminar trabajo   |

### POST /api/jobs

**Trabajo Fijo:**

```json
{
  "name": "Empresa ABC",
  "type": "fixed",
  "salary": 1500.0,
  "currencyId": "uuid-moneda",
  "accountId": "uuid-cuenta",
  "periodicity": "monthly",
  "payDay": 15
}
```

**Trabajo Freelance:**

```json
{
  "name": "Proyecto Web",
  "type": "freelance",
  "salary": 500.0,
  "currencyId": "uuid-moneda",
  "accountId": "uuid-cuenta",
  "periodicity": "one_time"
}
```

| Campo       | Tipo    | Requerido | Descripcion                       |
| ----------- | ------- | --------- | --------------------------------- |
| name        | string  | Si        | Nombre del trabajo                |
| type        | enum    | Si        | `fixed` o `freelance`             |
| salary      | decimal | Si        | Monto del sueldo/pago             |
| currencyId  | uuid    | Si        | ID de la moneda                   |
| accountId   | uuid    | Si        | ID de la cuenta destino           |
| periodicity | enum    | Si        | `biweekly`, `monthly`, `one_time` |
| payDay      | int     | No        | Dia del mes (1-31) para fijos     |
| startDate   | date    | No        | Fecha de inicio                   |
| endDate     | date    | No        | Fecha de fin (para freelance)     |

### PATCH /api/jobs/:id/archive

Archiva un trabajo (cambia status a `archived`).

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Empresa ABC",
    "status": "archived"
  }
}
```

---

## Ingresos

### Endpoints

| Metodo | Endpoint           | Descripcion        |
| ------ | ------------------ | ------------------ |
| GET    | `/api/incomes`     | Listar ingresos    |
| POST   | `/api/incomes`     | Crear ingreso      |
| GET    | `/api/incomes/:id` | Obtener ingreso    |
| PUT    | `/api/incomes/:id` | Actualizar ingreso |
| DELETE | `/api/incomes/:id` | Eliminar ingreso   |

### POST /api/incomes

```json
{
  "jobId": "uuid-trabajo",
  "accountId": "uuid-cuenta",
  "amount": 1500.0,
  "currencyId": "uuid-moneda",
  "date": "2024-01-15",
  "description": "Pago quincenal enero"
}
```

| Campo       | Tipo    | Requerido | Descripcion          |
| ----------- | ------- | --------- | -------------------- |
| jobId       | uuid    | Si        | ID del trabajo       |
| accountId   | uuid    | Si        | ID de la cuenta      |
| amount      | decimal | Si        | Monto del ingreso    |
| currencyId  | uuid    | Si        | ID de la moneda      |
| date        | date    | No        | Fecha (def: hoy)     |
| description | string  | No        | Descripcion opcional |

### GET /api/incomes (Query Params)

| Param     | Tipo | Descripcion                |
| --------- | ---- | -------------------------- |
| jobId     | uuid | Filtrar por trabajo        |
| accountId | uuid | Filtrar por cuenta         |
| startDate | date | Fecha inicio del rango     |
| endDate   | date | Fecha fin del rango        |
| page      | int  | Pagina (def: 1)            |
| limit     | int  | Items por pagina (def: 20) |

---

## Gastos

### Endpoints

| Metodo | Endpoint                  | Descripcion               |
| ------ | ------------------------- | ------------------------- |
| GET    | `/api/expenses`           | Listar gastos             |
| POST   | `/api/expenses`           | Crear gasto               |
| GET    | `/api/expenses/:id`       | Obtener gasto             |
| PUT    | `/api/expenses/:id`       | Actualizar gasto          |
| DELETE | `/api/expenses/:id`       | Eliminar gasto            |
| GET    | `/api/expenses/recurring` | Listar gastos recurrentes |

### POST /api/expenses

**Gasto Unico:**

```json
{
  "categoryId": "uuid-categoria",
  "accountId": "uuid-cuenta",
  "amount": 150.0,
  "currencyId": "uuid-moneda",
  "officialRate": 36.5,
  "customRate": 38.0,
  "date": "2024-01-15",
  "description": "Compra supermercado"
}
```

**Gasto Recurrente:**

```json
{
  "categoryId": "uuid-categoria",
  "accountId": "uuid-cuenta",
  "amount": 15.99,
  "currencyId": "uuid-moneda",
  "isRecurring": true,
  "periodicity": "monthly",
  "nextDueDate": "2024-02-01",
  "description": "Netflix"
}
```

| Campo        | Tipo    | Requerido | Descripcion                      |
| ------------ | ------- | --------- | -------------------------------- |
| categoryId   | uuid    | Si        | ID de la categoria               |
| accountId    | uuid    | Si        | ID de la cuenta                  |
| amount       | decimal | Si        | Monto del gasto                  |
| currencyId   | uuid    | Si        | ID de la moneda                  |
| officialRate | decimal | No        | Tasa oficial (API)               |
| customRate   | decimal | No        | Tasa auxiliar del comercio       |
| isRecurring  | boolean | No        | Si es recurrente (def: false)    |
| periodicity  | enum    | No        | `weekly`, `monthly`, `yearly`    |
| nextDueDate  | date    | No        | Proxima fecha (para recurrentes) |
| date         | date    | No        | Fecha del gasto (def: hoy)       |
| description  | string  | No        | Descripcion opcional             |

### Calculo de Diferencia de Tasas

Cuando se proveen `officialRate` y `customRate`, el sistema calcula:

```
diferencia = (amount / customRate) - (amount / officialRate)

Si diferencia > 0: Ahorro
Si diferencia < 0: Gasto extra
```

**Response incluye:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 150.0,
    "officialRate": 36.5,
    "customRate": 38.0,
    "amountInBase": 4.11,
    "amountWithCustomRate": 3.95,
    "rateDifference": 0.16,
    "savedOrExtra": "saved"
  }
}
```

---

## Transferencias

### Endpoints

| Metodo | Endpoint             | Descripcion            |
| ------ | -------------------- | ---------------------- |
| GET    | `/api/transfers`     | Listar transferencias  |
| POST   | `/api/transfers`     | Crear transferencia    |
| GET    | `/api/transfers/:id` | Obtener transferencia  |
| DELETE | `/api/transfers/:id` | Eliminar transferencia |

### POST /api/transfers

**Misma moneda:**

```json
{
  "fromAccountId": "uuid-cuenta-origen",
  "toAccountId": "uuid-cuenta-destino",
  "amount": 500.0,
  "currencyId": "uuid-moneda",
  "date": "2024-01-15",
  "description": "Traspaso a ahorro"
}
```

**Diferente moneda:**

```json
{
  "fromAccountId": "uuid-cuenta-usd",
  "toAccountId": "uuid-cuenta-ves",
  "amount": 100.0,
  "currencyId": "uuid-usd",
  "exchangeRate": 36.5,
  "date": "2024-01-15",
  "description": "Cambio de dolares"
}
```

| Campo         | Tipo    | Requerido | Descripcion                |
| ------------- | ------- | --------- | -------------------------- |
| fromAccountId | uuid    | Si        | ID de cuenta origen        |
| toAccountId   | uuid    | Si        | ID de cuenta destino       |
| amount        | decimal | Si        | Monto a transferir         |
| currencyId    | uuid    | Si        | ID de la moneda            |
| exchangeRate  | decimal | No        | Tasa si diferentes monedas |
| date          | date    | No        | Fecha (def: hoy)           |
| description   | string  | No        | Descripcion opcional       |

---

## Presupuestos

### Endpoints

| Metodo | Endpoint                      | Descripcion            |
| ------ | ----------------------------- | ---------------------- |
| GET    | `/api/budgets`                | Listar presupuestos    |
| POST   | `/api/budgets`                | Crear presupuesto      |
| GET    | `/api/budgets/:id`            | Obtener presupuesto    |
| PUT    | `/api/budgets/:id`            | Actualizar presupuesto |
| POST   | `/api/budgets/:id/contribute` | Agregar aporte         |
| DELETE | `/api/budgets/:id`            | Eliminar presupuesto   |

### POST /api/budgets

**Meta de Ahorro:**

```json
{
  "name": "Vacaciones 2024",
  "type": "goal",
  "targetAmount": 2000.0,
  "currencyId": "uuid-moneda",
  "deadline": "2024-12-01"
}
```

**Sobre (Envelope):**

```json
{
  "name": "Fondo Emergencia",
  "type": "envelope",
  "targetAmount": 1000.0,
  "currencyId": "uuid-moneda",
  "accountId": "uuid-cuenta"
}
```

| Campo        | Tipo    | Requerido | Descripcion                   |
| ------------ | ------- | --------- | ----------------------------- |
| name         | string  | Si        | Nombre del presupuesto        |
| type         | enum    | Si        | `goal` o `envelope`           |
| targetAmount | decimal | Si        | Monto objetivo                |
| currencyId   | uuid    | Si        | ID de la moneda               |
| accountId    | uuid    | No        | ID de cuenta (solo envelopes) |
| deadline     | date    | No        | Fecha limite                  |

### POST /api/budgets/:id/contribute

```json
{
  "amount": 200.0,
  "description": "Aporte enero"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "budget": {
      "id": "uuid",
      "name": "Vacaciones 2024",
      "targetAmount": 2000.0,
      "currentAmount": 200.0,
      "progress": 10.0
    },
    "contribution": {
      "id": "uuid",
      "amount": 200.0,
      "date": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## Tasas de Cambio

### Endpoints

| Metodo | Endpoint                      | Descripcion                  |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/api/exchange-rates`         | Obtener tasas actuales       |
| GET    | `/api/exchange-rates/history` | Historial de tasas           |
| POST   | `/api/exchange-rates/refresh` | Actualizar desde API externa |

### GET /api/exchange-rates

**Response:**

```json
{
  "success": true,
  "data": {
    "base": "USD",
    "rates": [
      {
        "currency": "COP",
        "rate": 4150.5,
        "fetchedAt": "2024-01-15T10:30:00Z"
      },
      {
        "currency": "VES",
        "rate": 36.5,
        "fetchedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### POST /api/exchange-rates/refresh

Actualiza las tasas desde la API externa (ExchangeRate-API).

**Response:**

```json
{
  "success": true,
  "data": {
    "updated": true,
    "rates": {
      "COP": 4155.25,
      "VES": 36.75
    },
    "fetchedAt": "2024-01-15T14:00:00Z"
  }
}
```

### GET /api/exchange-rates/history

| Param     | Tipo | Descripcion              |
| --------- | ---- | ------------------------ |
| currency  | str  | Filtrar por moneda (COP) |
| startDate | date | Fecha inicio             |
| endDate   | date | Fecha fin                |
| limit     | int  | Items (def: 30)          |

---

## Dashboard

### Endpoints

| Metodo | Endpoint                | Descripcion                      |
| ------ | ----------------------- | -------------------------------- |
| GET    | `/api/dashboard`        | Datos consolidados del dashboard |
| GET    | `/api/dashboard/charts` | Datos para graficos              |

### GET /api/dashboard

**Response:**

```json
{
  "success": true,
  "data": {
    "totalBalance": 5250.75,
    "baseCurrency": "USD",
    "month": {
      "incomes": 3000.0,
      "expenses": 1850.25,
      "balance": 1149.75,
      "incomesChange": 5.2,
      "expensesChange": -3.1
    },
    "accounts": [
      {
        "id": "uuid",
        "name": "Banco Principal",
        "balance": 3500.0,
        "currency": "USD"
      }
    ],
    "recentTransactions": [
      {
        "id": "uuid",
        "type": "expense",
        "amount": 150.0,
        "category": "Alimentacion",
        "date": "2024-01-15"
      }
    ],
    "budgetAlerts": [
      {
        "id": "uuid",
        "name": "Entretenimiento",
        "used": 85.0,
        "limit": 100.0,
        "percentage": 85
      }
    ]
  }
}
```

### GET /api/dashboard/charts

| Param  | Tipo | Descripcion                          |
| ------ | ---- | ------------------------------------ |
| period | str  | `week`, `month`, `year` (def: month) |

**Response:**

```json
{
  "success": true,
  "data": {
    "expensesByCategory": [
      { "category": "Alimentacion", "amount": 450.0, "percentage": 35 },
      { "category": "Transporte", "amount": 200.0, "percentage": 15 }
    ],
    "incomeVsExpenses": [
      { "date": "2024-01-01", "income": 0, "expense": 50.0 },
      { "date": "2024-01-15", "income": 1500.0, "expense": 200.0 }
    ],
    "monthlyTrend": [
      { "month": "Oct", "income": 2800, "expense": 2100 },
      { "month": "Nov", "income": 2900, "expense": 2000 },
      { "month": "Dec", "income": 3000, "expense": 1850 }
    ]
  }
}
```

---

## Reportes

### Endpoints

| Metodo | Endpoint               | Descripcion                |
| ------ | ---------------------- | -------------------------- |
| GET    | `/api/reports/summary` | Resumen general            |
| GET    | `/api/reports/export`  | Exportar reporte (CSV/PDF) |

### GET /api/reports/summary

| Param     | Tipo | Descripcion              |
| --------- | ---- | ------------------------ |
| startDate | date | Fecha inicio (requerido) |
| endDate   | date | Fecha fin (requerido)    |

**Response:**

```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "summary": {
      "totalIncome": 3000.0,
      "totalExpenses": 1850.25,
      "netBalance": 1149.75,
      "savingsRate": 38.3
    },
    "byCategory": [
      {
        "category": "Alimentacion",
        "amount": 450.0,
        "transactions": 15
      }
    ],
    "byAccount": [
      {
        "account": "Banco Principal",
        "income": 3000.0,
        "expense": 1200.0
      }
    ]
  }
}
```

### GET /api/reports/export

| Param     | Tipo | Descripcion               |
| --------- | ---- | ------------------------- |
| format    | str  | `csv` o `pdf` (requerido) |
| startDate | date | Fecha inicio (requerido)  |
| endDate   | date | Fecha fin (requerido)     |
| type      | str  | `transactions`, `summary` |

**Response:**

Para CSV: Descarga archivo `report_2024-01.csv`
Para PDF: Descarga archivo `report_2024-01.pdf`

---

## Ver tambien

- [Arquitectura](./ARCHITECTURE.md)
- [Context](./CONTEXT.md)
- [Setup](./SETUP.md)
- [Modulos](./modules/)
