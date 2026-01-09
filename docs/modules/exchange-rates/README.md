# Modulo Exchange Rates

Gestion de tasas de cambio multi-moneda con integracion a API externa.

---

## Descripcion

Permite visualizar, actualizar y mantener historial de tasas de cambio entre las monedas soportadas (USD, COP, VES).

---

## Monedas Soportadas

| Moneda | Codigo | Rol                     |
| ------ | ------ | ----------------------- |
| USD    | USD    | Moneda base del sistema |
| COP    | COP    | Peso colombiano         |
| VES    | VES    | Bolivar venezolano      |

---

## Modelo de Datos

### Currency

| Campo     | Tipo     | Descripcion             |
| --------- | -------- | ----------------------- |
| id        | UUID     | Identificador unico     |
| code      | string   | Codigo ISO (USD, COP)   |
| name      | string   | Nombre completo         |
| symbol    | string   | Simbolo ($, Bs)         |
| isBase    | boolean  | Si es moneda base (USD) |
| createdAt | DateTime | Fecha de creacion       |

### ExchangeRate

| Campo        | Tipo     | Descripcion          |
| ------------ | -------- | -------------------- |
| id           | UUID     | Identificador unico  |
| fromCurrency | Currency | Moneda origen        |
| toCurrency   | Currency | Moneda destino       |
| rate         | Decimal  | Tasa de cambio       |
| date         | DateTime | Fecha de la tasa     |
| source       | string   | Fuente (api, manual) |
| createdAt    | DateTime | Fecha de registro    |

---

## API Endpoints

### GET /api/exchange-rates

Obtiene tasas de cambio actuales.

**Response:**

```json
{
  "data": [
    {
      "from": "USD",
      "to": "COP",
      "rate": 4150.5,
      "date": "2024-01-15T10:00:00Z",
      "source": "api"
    },
    {
      "from": "USD",
      "to": "VES",
      "rate": 36.5,
      "date": "2024-01-15T10:00:00Z",
      "source": "api"
    }
  ],
  "lastUpdate": "2024-01-15T10:00:00Z"
}
```

### POST /api/exchange-rates/refresh

Actualiza tasas desde la API externa.

**Response:**

```json
{
  "message": "Tasas actualizadas correctamente",
  "rates": [
    { "from": "USD", "to": "COP", "rate": 4155.0 },
    { "from": "USD", "to": "VES", "rate": 36.8 }
  ],
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

### GET /api/exchange-rates/history

Obtiene historial de tasas.

**Query params:**

- `from`: Codigo moneda origen
- `to`: Codigo moneda destino
- `startDate`: Fecha inicio
- `endDate`: Fecha fin

**Response:**

```json
{
  "data": [
    { "date": "2024-01-15", "rate": 4155.0 },
    { "date": "2024-01-14", "rate": 4150.5 },
    { "date": "2024-01-13", "rate": 4148.0 }
  ]
}
```

### POST /api/exchange-rates/convert

Convierte un monto entre monedas.

**Body:**

```json
{
  "amount": 100,
  "from": "USD",
  "to": "COP"
}
```

**Response:**

```json
{
  "originalAmount": 100,
  "convertedAmount": 415500,
  "rate": 4155.0,
  "from": "USD",
  "to": "COP"
}
```

---

## Estructura de Archivos

```
app/
├── (dashboard)/
│   └── exchange-rates/
│       ├── page.tsx              # Vista de tasas actuales
│       └── _components/
│           ├── rate-display.tsx
│           ├── rate-history.tsx
│           └── converter.tsx
│
└── api/
    └── exchange-rates/
        ├── route.ts
        ├── refresh/
        │   └── route.ts
        ├── history/
        │   └── route.ts
        ├── convert/
        │   └── route.ts
        ├── service.ts
        ├── repository.ts
        └── types.ts
```

---

## Integracion con Exchange Rate API

### Configuracion

```env
EXCHANGE_RATE_API_KEY=tu_api_key
```

### Flujo de Actualizacion

```
1. Usuario clickea "Actualizar tasas"
2. Frontend llama POST /api/exchange-rates/refresh
3. Backend consulta Exchange Rate API
4. Se guardan nuevas tasas con fecha actual
5. Se retorna respuesta con tasas actualizadas
```

### Ejemplo de llamada a API externa

```typescript
const response = await fetch(
  `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`,
);
const data = await response.json();
// data.conversion_rates.COP = 4155.00
// data.conversion_rates.VES = 36.80
```

---

## Tasa Auxiliar vs Oficial

El sistema permite registrar una tasa auxiliar por transaccion para comparar con la tasa del comercio:

```
tasaOficial = 4155.00 (de la API)
tasaComercio = 4100.00 (del comercio local)

monto = 100 USD

valorOficial = 100 * 4155 = 415,500 COP
valorComercio = 100 * 4100 = 410,000 COP

diferencia = valorOficial - valorComercio = 5,500 COP (ahorro)
```

---

## Ver tambien

- [Expenses](../expenses/README.md) - Gastos con conversion
- [Incomes](../incomes/README.md) - Ingresos con conversion
- [Dashboard](../dashboard/README.md) - Totales convertidos
