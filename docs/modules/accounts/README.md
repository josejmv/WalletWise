# Modulo Accounts

Gestion de cuentas bancarias, efectivo y billeteras digitales.

---

## Descripcion

Permite registrar y gestionar todas las cuentas financieras del usuario, cada una con su moneda base y balance actual.

---

## Tipos de Cuenta

| Tipo              | Codigo           | Descripcion                  |
| ----------------- | ---------------- | ---------------------------- |
| Banco             | `bank`           | Cuenta bancaria tradicional  |
| Efectivo          | `cash`           | Dinero en efectivo           |
| Billetera Digital | `digital_wallet` | PayPal, Binance, Nequi, etc. |
| Tarjeta Credito   | `credit_card`    | Tarjeta de credito           |

---

## Modelo de Datos

| Campo       | Tipo        | Descripcion              |
| ----------- | ----------- | ------------------------ |
| id          | UUID        | Identificador unico      |
| name        | string      | Nombre de la cuenta      |
| type        | AccountType | Tipo de cuenta           |
| currency    | Currency    | Moneda base de la cuenta |
| balance     | Decimal     | Saldo actual             |
| description | string?     | Descripcion opcional     |
| isActive    | boolean     | Si la cuenta esta activa |
| createdAt   | DateTime    | Fecha de creacion        |
| updatedAt   | DateTime    | Ultima actualizacion     |

---

## API Endpoints

### GET /api/accounts

Lista todas las cuentas.

**Query params:**

- `type`: Filtrar por tipo
- `isActive`: `true` | `false`
- `currencyId`: Filtrar por moneda

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Banco Principal",
      "type": { "code": "bank", "name": "Cuenta Bancaria" },
      "currency": { "code": "USD", "symbol": "$" },
      "balance": 3500.0,
      "isActive": true
    }
  ]
}
```

### POST /api/accounts

Crea una nueva cuenta.

**Body:**

```json
{
  "name": "Cuenta Nequi",
  "typeId": "uuid",
  "currencyId": "uuid",
  "balance": 500000,
  "description": "Billetera para gastos diarios"
}
```

### GET /api/accounts/:id

Obtiene detalle de una cuenta con historial de movimientos.

### PUT /api/accounts/:id

Actualiza una cuenta.

### DELETE /api/accounts/:id

Desactiva una cuenta (soft delete).

### GET /api/accounts/:id/transactions

Obtiene movimientos de la cuenta (ingresos, gastos, transferencias).

---

## Estructura de Archivos

```
app/
├── (dashboard)/
│   └── accounts/
│       ├── page.tsx              # Lista de cuentas
│       ├── new/
│       │   └── page.tsx          # Crear cuenta
│       ├── [id]/
│       │   └── page.tsx          # Detalle/editar
│       └── _components/
│           ├── account-list.tsx
│           ├── account-card.tsx
│           └── account-form.tsx
│
└── api/
    └── accounts/
        ├── route.ts
        ├── [id]/
        │   └── route.ts
        ├── service.ts
        ├── repository.ts
        ├── schema.ts
        └── types.ts
```

---

## Logica de Negocio

### Actualizacion de Balance

El balance de una cuenta se actualiza automaticamente cuando:

| Operacion         | Efecto en Balance   |
| ----------------- | ------------------- |
| Ingreso recibido  | `balance += amount` |
| Gasto registrado  | `balance -= amount` |
| Transferencia OUT | `balance -= amount` |
| Transferencia IN  | `balance += amount` |

### Conversion a Moneda Base

Para mostrar totales en el dashboard:

```typescript
const balanceInUSD = account.balance * getExchangeRate(account.currency, "USD");
```

---

## Validaciones

| Campo      | Regla                      |
| ---------- | -------------------------- |
| name       | Requerido, 2-50 caracteres |
| typeId     | Debe existir               |
| currencyId | Debe existir               |
| balance    | >= 0 (excepto credit_card) |

---

## Relaciones

- **AccountType**: Tipo de la cuenta
- **Currency**: Moneda base
- **Income[]**: Ingresos depositados
- **Expense[]**: Gastos cargados
- **Transfer[]**: Transferencias (origen y destino)
- **Job[]**: Trabajos que depositan aqui

---

## Ver tambien

- [Transfers](../transfers/README.md) - Movimientos entre cuentas
- [Incomes](../incomes/README.md) - Depositos a cuentas
- [Expenses](../expenses/README.md) - Cargos a cuentas
