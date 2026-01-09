# Modulo Reports

Generacion de reportes y exportacion de datos.

---

## Descripcion

Permite generar reportes financieros con diferentes periodos y filtros, exportables en formatos CSV y PDF.

---

## Tipos de Reporte

| Tipo                 | Descripcion                        |
| -------------------- | ---------------------------------- |
| Resumen General      | Vision completa del periodo        |
| Gastos por Categoria | Desglose de gastos                 |
| Ingresos por Trabajo | Desglose de ingresos               |
| Balance por Cuenta   | Estado de cuentas                  |
| Tendencias           | Comparativa entre periodos         |
| Gastos Recurrentes   | Lista de suscripciones y servicios |

---

## Formatos de Exportacion

| Formato | Extension | Uso                      |
| ------- | --------- | ------------------------ |
| CSV     | .csv      | Analisis en Excel/Sheets |
| PDF     | .pdf      | Archivo o impresion      |

---

## API Endpoints

### GET /api/reports/summary

Obtiene resumen general del periodo.

**Query params:**

- `startDate`: Fecha inicio (requerido)
- `endDate`: Fecha fin (requerido)

**Response:**

```json
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "summary": {
    "totalIncome": 5000.0,
    "totalExpenses": 2350.0,
    "netBalance": 2650.0,
    "savingsRate": 53.0
  },
  "byCategory": [
    { "category": "Alimentacion", "amount": 650.0, "percentage": 27.7 },
    { "category": "Vivienda", "amount": 800.0, "percentage": 34.0 }
  ],
  "byAccount": [
    { "account": "Banco Principal", "balance": 3500.0, "change": 450.0 }
  ],
  "topExpenses": [
    { "description": "Arriendo", "amount": 800.0, "date": "2024-01-05" }
  ]
}
```

### GET /api/reports/expenses

Reporte detallado de gastos.

**Query params:**

- `startDate`: Fecha inicio
- `endDate`: Fecha fin
- `categoryId`: Filtrar por categoria (opcional)
- `accountId`: Filtrar por cuenta (opcional)

### GET /api/reports/incomes

Reporte detallado de ingresos.

**Query params:**

- `startDate`: Fecha inicio
- `endDate`: Fecha fin
- `jobId`: Filtrar por trabajo (opcional)

### GET /api/reports/trends

Comparativa entre periodos.

**Query params:**

- `periods`: Numero de periodos a comparar (3, 6, 12)
- `groupBy`: `month` | `quarter`

**Response:**

```json
{
  "trends": [
    {
      "period": "2024-01",
      "income": 5000.0,
      "expenses": 2350.0,
      "savings": 2650.0
    },
    {
      "period": "2023-12",
      "income": 4800.0,
      "expenses": 2100.0,
      "savings": 2700.0
    }
  ],
  "averages": {
    "income": 4900.0,
    "expenses": 2225.0,
    "savings": 2675.0
  }
}
```

### GET /api/reports/export

Exporta reporte en formato especificado.

**Query params:**

- `type`: `summary` | `expenses` | `incomes` | `trends`
- `format`: `csv` | `pdf`
- `startDate`: Fecha inicio
- `endDate`: Fecha fin

**Response:**

```
Content-Type: text/csv | application/pdf
Content-Disposition: attachment; filename="reporte-gastos-2024-01.csv"
```

---

## Estructura de Archivos

```
app/
├── (dashboard)/
│   └── reports/
│       ├── page.tsx              # Generador de reportes
│       └── _components/
│           ├── report-filters.tsx
│           ├── summary-report.tsx
│           ├── expenses-report.tsx
│           ├── trends-chart.tsx
│           └── export-dropdown.tsx
│
└── api/
    └── reports/
        ├── route.ts
        ├── summary/
        │   └── route.ts
        ├── expenses/
        │   └── route.ts
        ├── incomes/
        │   └── route.ts
        ├── trends/
        │   └── route.ts
        ├── export/
        │   └── route.ts
        ├── service.ts
        ├── repository.ts
        └── types.ts
```

---

## Flujos de Negocio

### Generacion de Resumen

```typescript
async function generateSummary(startDate: Date, endDate: Date) {
  // 1. Obtener todos los ingresos del periodo
  const incomes = await getIncomes({ startDate, endDate });
  const totalIncome = incomes.reduce((sum, i) => sum + i.amountInBase, 0);

  // 2. Obtener todos los gastos del periodo
  const expenses = await getExpenses({ startDate, endDate });
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amountInBase, 0);

  // 3. Calcular metricas
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = (netBalance / totalIncome) * 100;

  // 4. Agrupar gastos por categoria
  const byCategory = groupByCategory(expenses);

  // 5. Obtener balance actual de cuentas
  const accounts = await getAccounts();

  return { summary, byCategory, byAccount: accounts };
}
```

### Exportacion CSV

```typescript
function generateCSV(data: ExpenseReport[]): string {
  const headers = ["Fecha", "Categoria", "Descripcion", "Monto", "Moneda"];
  const rows = data.map((e) => [
    formatDate(e.date),
    e.category.name,
    e.description || "",
    e.amount.toString(),
    e.currency.code,
  ]);

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}
```

### Exportacion PDF

```typescript
async function generatePDF(report: ReportData): Promise<Buffer> {
  // Usar libreria como jsPDF o puppeteer
  const doc = new PDFDocument();

  doc.text(`Reporte: ${report.period.start} - ${report.period.end}`);
  doc.text(`Total Ingresos: ${formatCurrency(report.summary.totalIncome)}`);
  doc.text(`Total Gastos: ${formatCurrency(report.summary.totalExpenses)}`);
  // ... mas contenido

  return doc.end();
}
```

---

## Periodos Predefinidos

| Periodo         | Descripcion                      |
| --------------- | -------------------------------- |
| Este mes        | Mes actual completo              |
| Mes anterior    | Mes pasado completo              |
| Ultimos 3 meses | Ultimos 90 dias                  |
| Este año        | Año actual desde enero           |
| Año anterior    | Año pasado completo              |
| Personalizado   | Fechas seleccionadas por usuario |

---

## Metricas Calculadas

| Metrica               | Formula                                  |
| --------------------- | ---------------------------------------- |
| Balance Neto          | `totalIncome - totalExpenses`            |
| Tasa de Ahorro        | `(netBalance / totalIncome) * 100`       |
| Gasto Promedio Diario | `totalExpenses / diasDelPeriodo`         |
| Ingreso Promedio      | `totalIncome / mesesDelPeriodo`          |
| Variacion vs Anterior | `((actual - anterior) / anterior) * 100` |

---

## Ver tambien

- [Dashboard](../dashboard/README.md) - KPIs en tiempo real
- [Expenses](../expenses/README.md) - Datos de gastos
- [Incomes](../incomes/README.md) - Datos de ingresos
