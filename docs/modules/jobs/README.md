# Modulo Jobs

Gestion de trabajos fijos y freelance con generacion automatica de ingresos.

---

## Descripcion

Permite registrar fuentes de ingreso, tanto trabajos con sueldo fijo periodico como proyectos freelance con pagos unicos.

---

## Tipos de Trabajo

### Trabajo Fijo (`fixed`)

| Campo       | Tipo     | Descripcion                 |
| ----------- | -------- | --------------------------- |
| name        | string   | Nombre del trabajo/empresa  |
| salary      | number   | Monto del sueldo            |
| currency    | Currency | Moneda del pago             |
| periodicity | enum     | `biweekly` \| `monthly`     |
| payDay      | number   | Dia del mes para pago       |
| account     | Account  | Cuenta destino de depositos |
| status      | enum     | `active` \| `archived`      |

### Trabajo Freelance (`freelance`)

| Campo           | Tipo     | Descripcion                 |
| --------------- | -------- | --------------------------- |
| name            | string   | Nombre del proyecto/cliente |
| agreedAmount    | number   | Monto acordado              |
| currency        | Currency | Moneda del pago             |
| expectedPayDate | date     | Fecha esperada de pago      |
| account         | Account  | Cuenta destino              |
| status          | enum     | `active` \| `archived`      |

---

## API Endpoints

### GET /api/jobs

Lista todos los trabajos.

**Query params:**

- `type`: `fixed` | `freelance` (opcional)
- `status`: `active` | `archived` (opcional)

### POST /api/jobs

Crea un nuevo trabajo.

**Body (fixed):**

```json
{
  "type": "fixed",
  "name": "Empresa ABC",
  "salary": 2500.0,
  "currencyId": "uuid",
  "periodicity": "monthly",
  "payDay": 30,
  "accountId": "uuid"
}
```

**Body (freelance):**

```json
{
  "type": "freelance",
  "name": "Proyecto Web Cliente X",
  "agreedAmount": 1500.0,
  "currencyId": "uuid",
  "expectedPayDate": "2024-02-15",
  "accountId": "uuid"
}
```

### PUT /api/jobs/:id

Actualiza un trabajo existente.

### DELETE /api/jobs/:id

Archiva un trabajo (soft delete).

### POST /api/jobs/:id/archive

Archiva un trabajo manualmente.

---

## Estructura de Archivos

```
app/
├── (dashboard)/
│   └── jobs/
│       ├── page.tsx              # Lista de trabajos
│       ├── new/
│       │   └── page.tsx          # Crear trabajo
│       ├── [id]/
│       │   └── page.tsx          # Detalle/editar
│       └── _components/
│           ├── job-list.tsx
│           ├── job-card.tsx
│           └── job-form.tsx
│
└── api/
    └── jobs/
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

### Generacion Automatica de Ingresos

Para trabajos fijos activos, el sistema genera automaticamente un ingreso cuando llega el dia de pago:

```
Si trabajo.type === 'fixed' && trabajo.status === 'active':
  Si hoy === trabajo.payDay (o ultimo dia del mes si payDay > dias del mes):
    Crear Income con:
      - amount: trabajo.salary
      - currency: trabajo.currency
      - account: trabajo.account
      - job: trabajo
      - date: hoy
```

### Estados del Trabajo

```
[active] ---(archivar)---> [archived]
```

- Los trabajos archivados no generan ingresos automaticos
- Se mantienen para historial y reportes

---

## Validaciones

| Campo           | Regla                         |
| --------------- | ----------------------------- |
| name            | Requerido, 2-100 caracteres   |
| salary          | Requerido para fixed, > 0     |
| agreedAmount    | Requerido para freelance, > 0 |
| payDay          | 1-31 para fixed               |
| expectedPayDate | Fecha valida para freelance   |
| accountId       | Debe existir y estar activa   |

---

## Ver tambien

- [Incomes](../incomes/README.md) - Ingresos generados
- [Accounts](../accounts/README.md) - Cuentas destino
