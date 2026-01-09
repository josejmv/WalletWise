# Modulo Dashboard

Vista principal del sistema con metricas financieras, KPIs y graficos de resumen.

---

## Descripcion

El dashboard es la pagina de inicio que muestra un resumen completo del estado financiero del usuario, incluyendo balances, tendencias y alertas.

---

## Componentes Principales

### KPIs

| KPI                   | Descripcion                         |
| --------------------- | ----------------------------------- |
| Balance Total         | Suma de todas las cuentas en USD    |
| Ingresos del Mes      | Total de ingresos del mes actual    |
| Gastos del Mes        | Total de gastos del mes actual      |
| Balance Neto          | Ingresos - Gastos del mes           |
| Ahorro Acumulado      | Progreso de metas de ahorro         |
| Gastos vs Presupuesto | Porcentaje de presupuesto utilizado |

### Graficos

| Grafico              | Tipo   | Descripcion                         |
| -------------------- | ------ | ----------------------------------- |
| Gastos por Categoria | Donut  | Distribucion de gastos              |
| Tendencia Mensual    | Linea  | Evolucion de ingresos vs gastos     |
| Balance por Cuenta   | Barras | Comparativa de saldos entre cuentas |
| Proyeccion           | Area   | Estimacion basada en recurrentes    |

### Widgets

- Ultimas transacciones (5 mas recientes)
- Alertas de presupuesto
- Proximos pagos recurrentes
- Resumen de metas de ahorro

---

## API Endpoints

### GET /api/dashboard/summary

Obtiene el resumen general del dashboard.

**Response:**

```json
{
  "totalBalance": 5000.0,
  "totalBalanceByCurrency": {
    "USD": 3000.0,
    "COP": 8000000
  },
  "monthlyIncome": 2500.0,
  "monthlyExpenses": 1200.0,
  "netBalance": 1300.0,
  "savingsProgress": 45.5
}
```

### GET /api/dashboard/charts

Obtiene datos para los graficos.

**Query params:**

- `period`: `month` | `quarter` | `year`

**Response:**

```json
{
  "expensesByCategory": [
    { "category": "Alimentacion", "amount": 450.0, "percentage": 37.5 }
  ],
  "monthlyTrend": [{ "month": "2024-01", "income": 2500, "expenses": 1100 }],
  "balanceByAccount": [{ "account": "Banco Principal", "balance": 3000.0 }]
}
```

### GET /api/dashboard/alerts

Obtiene alertas activas.

**Response:**

```json
{
  "alerts": [
    {
      "type": "budget_warning",
      "message": "Alimentacion al 85% del presupuesto",
      "severity": "warning"
    }
  ]
}
```

---

## Estructura de Archivos

```
app/
├── (dashboard)/
│   └── page.tsx              # Pagina principal del dashboard
│
└── api/
    └── dashboard/
        ├── route.ts          # Handler principal
        ├── service.ts        # Logica de negocio
        ├── repository.ts     # Queries a la DB
        └── types.ts          # Tipos del modulo
```

---

## Logica de Negocio

### Calculo de Balance Total

```typescript
// Convierte todos los balances a USD usando la tasa actual
const totalInUSD = accounts.reduce((sum, account) => {
  const rate = getExchangeRate(account.currencyCode, "USD");
  return sum + account.balance * rate;
}, 0);
```

### Alertas de Presupuesto

| Porcentaje | Severidad | Accion          |
| ---------- | --------- | --------------- |
| >= 100%    | `error`   | Alerta roja     |
| >= 80%     | `warning` | Alerta amarilla |
| >= 60%     | `info`    | Indicador azul  |

---

## Ver tambien

- [Accounts](../accounts/README.md) - Cuentas del usuario
- [Expenses](../expenses/README.md) - Gastos registrados
- [Budgets](../budgets/README.md) - Presupuestos y metas
