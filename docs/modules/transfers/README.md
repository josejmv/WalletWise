# Modulo Transfers

Transferencias de fondos entre cuentas propias.

---

## Descripcion

Permite mover dinero entre cuentas del usuario, con soporte para transferencias entre diferentes monedas.

---

## Modelo de Datos

| Campo           | Tipo     | Descripcion                  |
| --------------- | -------- | ---------------------------- |
| id              | UUID     | Identificador unico          |
| fromAccount     | Account  | Cuenta origen                |
| toAccount       | Account  | Cuenta destino               |
| amount          | Decimal  | Monto transferido            |
| currency        | Currency | Moneda de la transferencia   |
| exchangeRate    | Decimal? | Tasa si hay conversion       |
| convertedAmount | Decimal? | Monto convertido (si aplica) |
| date            | DateTime | Fecha de la transferencia    |
| description     | string?  | Descripcion opcional         |
| createdAt       | DateTime | Fecha de registro            |

---

## API Endpoints

### GET /api/transfers

Lista todas las transferencias.

**Query params:**

- `accountId`: Filtrar por cuenta (origen o destino)
- `startDate`: Fecha inicio
- `endDate`: Fecha fin
- `page`: Numero de pagina
- `limit`: Resultados por pagina

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "fromAccount": {
        "id": "uuid",
        "name": "Banco Principal",
        "currency": { "code": "USD" }
      },
      "toAccount": {
        "id": "uuid",
        "name": "Efectivo COP",
        "currency": { "code": "COP" }
      },
      "amount": 100.0,
      "currency": { "code": "USD" },
      "exchangeRate": 4155.0,
      "convertedAmount": 415500.0,
      "date": "2024-01-15",
      "description": "Retiro para gastos semanales"
    }
  ],
  "pagination": { "total": 45, "page": 1, "limit": 10 }
}
```

### POST /api/transfers

Crea una nueva transferencia.

**Body (misma moneda):**

```json
{
  "fromAccountId": "uuid",
  "toAccountId": "uuid",
  "amount": 500.0,
  "date": "2024-01-15",
  "description": "Ahorro mensual"
}
```

**Body (diferentes monedas):**

```json
{
  "fromAccountId": "uuid",
  "toAccountId": "uuid",
  "amount": 100.0,
  "exchangeRate": 4155.0,
  "date": "2024-01-15",
  "description": "Conversion USD a COP"
}
```

### GET /api/transfers/:id

Obtiene detalle de una transferencia.

### DELETE /api/transfers/:id

Elimina una transferencia (revierte los balances).

---

## Estructura de Archivos

```
app/
├── (dashboard)/
│   └── transfers/
│       ├── page.tsx              # Lista de transferencias
│       ├── new/
│       │   └── page.tsx          # Nueva transferencia
│       ├── [id]/
│       │   └── page.tsx          # Detalle
│       └── _components/
│           ├── transfer-list.tsx
│           ├── transfer-card.tsx
│           └── transfer-form.tsx
│
└── api/
    └── transfers/
        ├── route.ts
        ├── [id]/
        │   └── route.ts
        ├── service.ts
        ├── repository.ts
        ├── schema.ts
        └── types.ts
```

---

## Flujos de Negocio

### Transferencia Misma Moneda

```
fromAccount.currency === toAccount.currency

1. Validar que fromAccount.balance >= amount
2. fromAccount.balance -= amount
3. toAccount.balance += amount
4. Guardar transferencia
```

### Transferencia Entre Monedas

```
fromAccount.currency !== toAccount.currency

1. Obtener tasa de cambio (o usar la proporcionada)
2. Calcular monto convertido
3. Validar que fromAccount.balance >= amount
4. fromAccount.balance -= amount
5. toAccount.balance += convertedAmount
6. Guardar transferencia con tasa usada
```

### Ejemplo de Conversion

```typescript
// Transferencia de USD a COP
const fromAccount = { currency: "USD", balance: 1000 };
const toAccount = { currency: "COP", balance: 2000000 };
const amount = 100; // USD
const exchangeRate = 4155.0;

const convertedAmount = amount * exchangeRate; // 415,500 COP

// Resultado:
// fromAccount.balance = 900 USD
// toAccount.balance = 2,415,500 COP
```

### Reversion de Transferencia

Al eliminar una transferencia:

```
1. fromAccount.balance += amount original
2. toAccount.balance -= convertedAmount (o amount si misma moneda)
3. Eliminar registro de transferencia
```

---

## Caracteristicas Importantes

### No Afecta Ingresos/Gastos

Las transferencias son movimientos internos y NO se contabilizan como:

- Ingresos (no aumentan el patrimonio total)
- Gastos (no disminuyen el patrimonio total)

### Balance Total Constante

```
Antes: Cuenta A = $1000, Cuenta B = $500
       Total = $1500

Transferencia: A -> B de $200

Despues: Cuenta A = $800, Cuenta B = $700
         Total = $1500 (sin cambio)
```

---

## Validaciones

| Campo         | Regla                                  |
| ------------- | -------------------------------------- |
| fromAccountId | Requerido, debe existir y estar activa |
| toAccountId   | Requerido, debe existir y estar activa |
| amount        | Requerido, > 0                         |
| date          | Requerida                              |
| exchangeRate  | Requerido si monedas son diferentes    |
| -             | fromAccountId !== toAccountId          |
| -             | fromAccount.balance >= amount          |

---

## Ver tambien

- [Accounts](../accounts/README.md) - Cuentas de origen y destino
- [Exchange Rates](../exchange-rates/README.md) - Tasas de conversion
