# WalletWise - Graficos e Indicadores

> Documentacion del sistema de visualizacion de datos financieros

---

## Libreria de Graficos

| Libreria     | Version | Uso                                           |
| ------------ | ------- | --------------------------------------------- |
| **Recharts** | 2.x     | Graficos interactivos (lineas, barras, donut) |

### Instalacion

```bash
yarn add recharts
```

---

## Estructura de Componentes

```
components/
└── charts/
    ├── index.ts                    # Barrel exports
    ├── base/                       # Componentes base reutilizables
    │   ├── chart-container/
    │   ├── chart-tooltip/
    │   ├── chart-legend/
    │   └── chart-empty-state/
    ├── kpi/                        # Indicadores KPI
    │   ├── kpi-card/
    │   ├── kpi-grid/
    │   └── kpi-trend/
    ├── donut/                      # Graficos de dona
    │   └── expenses-by-category/
    ├── bar/                        # Graficos de barras
    │   ├── balance-by-account/
    │   ├── income-vs-expenses/
    │   └── budget-vs-actual/
    ├── line/                       # Graficos de linea
    │   ├── monthly-trend/
    │   └── balance-evolution/
    └── progress/                   # Indicadores de progreso
        ├── savings-goal-progress/
        └── budget-progress/
```

---

## Indicadores KPI (Key Performance Indicators)

### KPIs Principales

| KPI                   | Descripcion                              | Calculo                                    |
| --------------------- | ---------------------------------------- | ------------------------------------------ |
| **Balance Total**     | Suma de todas las cuentas en USD         | `SUM(accounts.balance * exchangeRate)`     |
| **Ingresos del Mes**  | Total de ingresos del mes actual         | `SUM(incomes.amountInBase)` del mes        |
| **Gastos del Mes**    | Total de gastos del mes actual           | `SUM(expenses.amountInBase)` del mes       |
| **Balance Neto**      | Diferencia ingresos - gastos             | `ingresos - gastos`                        |
| **Ahorro del Mes**    | Porcentaje ahorrado del ingreso          | `(ingresos - gastos) / ingresos * 100`     |
| **Progreso de Metas** | Porcentaje promedio de metas completadas | `AVG(budget.currentAmount / targetAmount)` |

### KPIs Secundarios

| KPI                       | Descripcion                         |
| ------------------------- | ----------------------------------- |
| **Gasto Promedio Diario** | Gastos del mes / dias transcurridos |
| **Proyeccion Mensual**    | Gasto promedio \* dias del mes      |
| **Gastos Recurrentes**    | Total de gastos automaticos del mes |
| **Ingresos Pendientes**   | Ingresos esperados sin recibir      |

### Componente KPI Card

```typescript
interface KPICardProps {
  title: string;
  value: number;
  currency?: string;
  trend?: {
    value: number; // Porcentaje de cambio
    direction: "up" | "down" | "neutral";
    label: string; // "vs mes anterior"
  };
  icon?: React.ReactNode;
  color?: "green" | "red" | "blue" | "yellow";
}
```

---

## Graficos del Dashboard

### 1. Gastos por Categoria (Donut Chart)

**Proposito**: Visualizar distribucion de gastos por categoria

```typescript
interface ExpensesByCategoryData {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}
```

**Caracteristicas**:

- Colores por categoria (definidos en DB)
- Tooltip con monto y porcentaje
- Centro con total de gastos
- Click para filtrar por categoria

### 2. Tendencia Mensual (Line Chart)

**Proposito**: Mostrar evolucion de ingresos vs gastos en el tiempo

```typescript
interface MonthlyTrendData {
  month: string; // "2024-01"
  monthLabel: string; // "Ene"
  income: number;
  expenses: number;
  balance: number;
}
```

**Caracteristicas**:

- Linea verde para ingresos
- Linea roja para gastos
- Area sombreada para balance
- Periodo: ultimos 6-12 meses
- Tooltip con detalles

### 3. Balance por Cuenta (Bar Chart)

**Proposito**: Comparar balances entre cuentas

```typescript
interface BalanceByAccountData {
  accountId: string;
  accountName: string;
  accountType: AccountType;
  balance: number;
  balanceInBase: number;
  currency: string;
}
```

**Caracteristicas**:

- Barras horizontales o verticales
- Agrupacion por tipo de cuenta
- Color por tipo (banco, efectivo, wallet)
- Conversion a moneda base

---

## Graficos Comparativos

### 4. Ingresos vs Gastos (Stacked Bar Chart)

**Proposito**: Comparar ingresos y gastos mes a mes

```typescript
interface IncomeVsExpensesData {
  period: string;
  periodLabel: string;
  income: number;
  expenses: number;
  savings: number;
}
```

**Caracteristicas**:

- Barras apiladas o agrupadas
- Toggle entre vista mensual/semanal
- Linea de tendencia opcional
- Indicador de meta de ahorro

### 5. Presupuesto vs Real (Grouped Bar Chart)

**Proposito**: Comparar gasto planificado vs ejecutado por categoria

```typescript
interface BudgetVsActualData {
  categoryId: string;
  categoryName: string;
  budgeted: number;
  actual: number;
  variance: number; // budgeted - actual
  variancePercent: number;
}
```

**Caracteristicas**:

- Barra azul: presupuestado
- Barra verde/roja: real (segun si esta dentro del presupuesto)
- Indicador de variacion
- Solo categorias con presupuesto asignado

### 6. Comparacion Mes a Mes (Multi-Line Chart)

**Proposito**: Comparar gastos del mes actual vs meses anteriores

```typescript
interface MonthComparisonData {
  day: number; // 1-31
  currentMonth: number;
  previousMonth: number;
  twoMonthsAgo?: number;
}
```

**Caracteristicas**:

- Linea solida: mes actual
- Linea punteada: mes anterior
- Eje X: dias del mes
- Acumulado progresivo

---

## Graficos de Progreso

### 7. Progreso de Meta de Ahorro (Progress Bar / Gauge)

**Proposito**: Visualizar avance hacia metas de ahorro

```typescript
interface SavingsGoalProgressData {
  budgetId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  percentage: number;
  currency: string;
  deadline?: Date;
  daysRemaining?: number;
}
```

**Caracteristicas**:

- Barra de progreso circular o lineal
- Porcentaje completado
- Monto restante
- Proyeccion de fecha de cumplimiento

### 8. Cumplimiento de Presupuesto (Progress Bars)

**Proposito**: Mostrar estado de presupuestos por categoria

```typescript
interface BudgetProgressData {
  categoryId: string;
  categoryName: string;
  icon: string;
  limit: number;
  spent: number;
  percentage: number;
  status: "safe" | "warning" | "danger"; // <80%, 80-100%, >100%
}
```

**Caracteristicas**:

- Color segun estado (verde, amarillo, rojo)
- Indicador de alerta cuando >80%
- Dias restantes del periodo
- Click para ver detalles

### 9. Tendencia de Gastos por Categoria (Area Chart)

**Proposito**: Ver evolucion de gastos en categorias principales

```typescript
interface CategoryTrendData {
  month: string;
  [categoryName: string]: number | string;
}
```

**Caracteristicas**:

- Areas apiladas por categoria
- Top 5 categorias + "Otros"
- Filtro de periodo
- Toggle entre absoluto y porcentaje

---

## Paleta de Colores

### Colores Semanticos

| Color    | Hex       | Uso                                  |
| -------- | --------- | ------------------------------------ |
| `green`  | `#22c55e` | Ingresos, ahorros, progreso positivo |
| `red`    | `#ef4444` | Gastos, alertas, balance negativo    |
| `blue`   | `#3b82f6` | Presupuesto, neutral, informativo    |
| `yellow` | `#eab308` | Advertencias, casi al limite         |
| `purple` | `#a855f7` | Transferencias, movimientos internos |
| `gray`   | `#6b7280` | Inactivo, sin datos                  |

### Colores para Graficos (Serie)

```typescript
const CHART_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
];
```

---

## API Endpoints para Graficos

### Dashboard Charts

| Endpoint                                     | Metodo | Descripcion                    |
| -------------------------------------------- | ------ | ------------------------------ |
| `/api/dashboard/kpis`                        | GET    | Obtener todos los KPIs         |
| `/api/dashboard/charts/expenses-by-category` | GET    | Gastos agrupados por categoria |
| `/api/dashboard/charts/monthly-trend`        | GET    | Tendencia mensual (6-12 meses) |
| `/api/dashboard/charts/balance-by-account`   | GET    | Balance por cuenta             |
| `/api/dashboard/charts/income-vs-expenses`   | GET    | Comparacion ingresos/gastos    |
| `/api/dashboard/charts/budget-progress`      | GET    | Progreso de presupuestos       |
| `/api/dashboard/charts/savings-progress`     | GET    | Progreso de metas de ahorro    |

### Query Parameters Comunes

| Parametro   | Tipo     | Descripcion                        |
| ----------- | -------- | ---------------------------------- |
| `period`    | string   | `week`, `month`, `quarter`, `year` |
| `startDate` | ISO date | Fecha inicio personalizada         |
| `endDate`   | ISO date | Fecha fin personalizada            |
| `currency`  | string   | Moneda para mostrar (default: USD) |

### Response Format

```typescript
interface ChartResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    period: string;
    startDate: string;
    endDate: string;
    currency: string;
  };
}
```

---

## Hooks de TanStack Query

### Patron de Implementacion

```typescript
// use-get-kpis.ts
export function useGetKPIs(period?: string) {
  return useQuery({
    queryKey: ["dashboard", "kpis", period],
    queryFn: () => fetchKPIs(period),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// use-get-expenses-by-category.ts
export function useGetExpensesByCategory(params: ChartParams) {
  return useQuery({
    queryKey: ["dashboard", "charts", "expenses-by-category", params],
    queryFn: () => fetchExpensesByCategory(params),
  });
}
```

---

## Componentes Base

### ChartContainer

Wrapper con loading, error y empty states.

```typescript
interface ChartContainerProps {
  title: string;
  subtitle?: string;
  isLoading: boolean;
  isEmpty: boolean;
  error?: Error | null;
  actions?: React.ReactNode; // Filtros, export, etc.
  children: React.ReactNode;
}
```

### ChartTooltip

Tooltip customizado con formato de moneda.

```typescript
interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
  currency?: string;
  formatValue?: (value: number) => string;
}
```

---

## Responsive Design

| Breakpoint | Comportamiento                           |
| ---------- | ---------------------------------------- |
| `mobile`   | Graficos apilados, KPIs en 2 columnas    |
| `tablet`   | Graficos en grid 2x2, KPIs en 3 columnas |
| `desktop`  | Layout completo, graficos lado a lado    |

### Alturas Recomendadas

| Tipo de Grafico | Mobile | Tablet | Desktop |
| --------------- | ------ | ------ | ------- |
| KPI Card        | 80px   | 100px  | 120px   |
| Donut Chart     | 250px  | 300px  | 350px   |
| Bar Chart       | 200px  | 250px  | 300px   |
| Line Chart      | 200px  | 280px  | 350px   |
| Progress Bar    | 40px   | 40px   | 48px    |

---

## Accesibilidad

- Labels ARIA en todos los graficos
- Colores con suficiente contraste
- Tooltips accesibles via teclado
- Datos tabulares como alternativa
- Descripciones para lectores de pantalla

---

## Ver tambien

- [CONTEXT.md](./CONTEXT.md) - Contexto del proyecto
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura y estandares
- [API.md](./API.md) - Referencia de APIs
- [modules/dashboard/README.md](./modules/dashboard/README.md) - Documentacion del dashboard

---

_Documento de graficos e indicadores para WalletWise_
