# Arquitectura WalletWise

## Indice

1. [Vision General](#vision-general)
2. [Stack Tecnologico](#stack-tecnologico)
3. [Arquitectura Fractal](#arquitectura-fractal)
4. [Frontend](#frontend)
5. [Backend](#backend)
6. [Base de Datos](#base-de-datos)
7. [Estandares de Codigo](#estandares-de-codigo)
8. [Convenciones de Nombres](#convenciones-de-nombres)
9. [Git Workflow](#git-workflow)

---

## Vision General

WalletWise es un dashboard de finanzas personales con gestion de ingresos, gastos, cuentas y presupuestos. La arquitectura esta disenada para:

1. **Desarrollo unificado**: Frontend y backend en el mismo repositorio
2. **Type safety**: Tipos compartidos entre frontend y backend
3. **Escalabilidad**: Arquitectura fractal que permite crecer sin refactoring
4. **Multi-moneda**: Soporte nativo para USD, COP y VES

---

## Stack Tecnologico

| Categoria         | Tecnologia         | Version |
| ----------------- | ------------------ | ------- |
| **Frontend**      | Next.js            | 16      |
|                   | React              | 19      |
|                   | TypeScript         | 5.x     |
|                   | Tailwind CSS       | 4.x     |
|                   | TanStack Query     | 5.x     |
| **Backend**       | Next.js API Routes | 16      |
|                   | Prisma             | 6.x     |
|                   | Zod                | 3.x     |
| **Base de datos** | PostgreSQL         | 16      |
| **Contenedores**  | Docker Compose     | -       |

---

## Arquitectura Fractal

WalletWise utiliza una **arquitectura fractal** (auto-similar) donde cada modulo sigue la misma estructura interna independientemente de su ubicacion en el proyecto.

### Principios Fundamentales

| Principio                           | Descripcion                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------- |
| **Auto-Similitud**                  | Cada carpeta, sin importar su nivel de anidacion, sigue el mismo patron estructural |
| **Encapsulamiento**                 | Cada modulo es auto-contenido y puede funcionar de forma independiente              |
| **Flujo Unidireccional**            | Las dependencias fluyen en UNA sola direccion, sin ciclos                           |
| **Separacion de Responsabilidades** | Cada archivo tiene una unica responsabilidad bien definida                          |

### Estructura de Modulos API

Cada recurso en `app/api/` sigue este patron:

```
app/api/[resource]/
├── route.ts          # Handlers HTTP (GET, POST, PUT, DELETE)
├── service.ts        # Logica de negocio
├── repository.ts     # Acceso a datos (Prisma)
├── schema.ts         # Validacion con Zod
├── types.ts          # Interfaces TypeScript
└── [resourceId]/     # Rutas dinamicas
    ├── route.ts
    └── ...
```

### Responsabilidades por Archivo

| Archivo         | Responsabilidad                                                              |
| --------------- | ---------------------------------------------------------------------------- |
| `route.ts`      | Recibir requests HTTP, validar con schema, llamar service, retornar response |
| `service.ts`    | Implementar logica de negocio, orquestar repositorios, transformar datos     |
| `repository.ts` | Ejecutar queries Prisma, operaciones CRUD puras                              |
| `schema.ts`     | Definir schemas Zod para validacion de request bodies                        |
| `types.ts`      | Definir interfaces TypeScript para el dominio                                |

### Flujo de Dependencias

```
route.ts
    ↓ imports
service.ts ← schema.ts
    ↓ imports
repository.ts
    ↓ imports
types.ts
```

**Regla**: Nunca importar hacia arriba (ej: repository no importa de service).

### Estructura de lib/

Los modulos compartidos en `lib/` siguen el mismo patron fractal:

```
lib/
├── prisma.ts                # Cliente Prisma singleton
├── utils.ts                 # Utilidades generales
├── exchange-rate.ts         # Cliente API tasas de cambio
└── validations/             # Schemas Zod compartidos
    ├── index.ts
    ├── account.ts
    ├── expense.ts
    └── ...
```

### Patron de Barrel Files (index.ts)

Cada carpeta tiene un `index.ts` que re-exporta todo su contenido:

```typescript
// lib/validations/index.ts
export * from "./account";
export * from "./expense";
export * from "./income";
```

**Beneficios:**

1. **Imports limpios**: `import { accountSchema } from '@/lib/validations'`
2. **Encapsulamiento**: Oculta estructura interna
3. **Refactoring seguro**: Cambiar estructura sin romper imports externos

### Anti-Patrones a Evitar

```typescript
// ❌ MAL: Archivos gigantes
expenses.ts; // 500+ lineas

// ✅ BIEN: Dividir por responsabilidad
(expenses / route.ts, service.ts, repository.ts, schema.ts, types.ts);

// ❌ MAL: Imports profundos desde fuera
import { validateExpense } from "@/app/api/expenses/schema";

// ✅ BIEN: Usar barrel file o lib compartido
import { expenseSchema } from "@/lib/validations";
```

### Cuando Crear un Sub-Modulo

Crear una subcarpeta cuando:

1. El archivo tiene **mas de 200-300 lineas**
2. Hay **3+ funciones relacionadas** que podrian agruparse
3. El modulo tiene **responsabilidades claramente separables**
4. Necesitas **tipos especificos** para ese dominio

---

## Frontend

### Estructura de Carpetas

```
app/
├── (dashboard)/                    # Rutas del dashboard
│   ├── layout.tsx                  # Layout compartido
│   ├── page.tsx                    # Dashboard principal
│   ├── jobs/
│   │   └── page.tsx
│   ├── accounts/
│   │   └── page.tsx
│   ├── categories/
│   │   └── page.tsx
│   ├── exchange-rates/
│   │   └── page.tsx
│   ├── incomes/
│   │   └── page.tsx
│   ├── expenses/
│   │   └── page.tsx
│   ├── transfers/
│   │   └── page.tsx
│   ├── budgets/
│   │   └── page.tsx
│   └── reports/
│       └── page.tsx
│
├── api/                            # API Routes (Backend)
│
├── layout.tsx                      # Root layout
├── page.tsx                        # Landing/redirect
└── globals.css
```

### Estructura de Modulo Frontend (Fractal)

Cada modulo/pagina sigue una estructura consistente:

```
[modulo]/
├── page.tsx                        # Pagina principal (Server Component)
├── _components/                    # Componentes locales del modulo
│   └── [component-name]/
│       └── index.tsx
├── _requests/                      # Requests HTTP del modulo
│   └── [method]-[action]/
│       ├── service.ts              # Funcion fetch
│       ├── types.ts                # Tipos Request/Response
│       ├── formatter.ts            # Transformacion de datos (opcional)
│       └── use-[method]-[action].ts # Hook TanStack Query
├── _hooks/                         # Hooks locales
├── _utils/                         # Utilidades locales
├── _constants/                     # Constantes locales
└── (sub-module)/                   # Sub-modulos (misma estructura)
```

### Path Aliases

Configurados en `tsconfig.json`:

| Alias     | Ruta      | Uso                |
| --------- | --------- | ------------------ |
| `@/*`     | `./*`     | Imports generales  |
| `@/lib/*` | `./lib/*` | Utilidades backend |

### Server vs Client Components

**Server Components (default):**

- Paginas (`page.tsx`)
- Layouts (`layout.tsx`)
- Componentes sin interactividad

**Client Components (`'use client'`):**

- Formularios interactivos
- Hooks de estado/efectos
- Event handlers

```typescript
// Server Component (default)
export default async function DashboardPage() {
  const data = await fetchData(); // Fetch directo en servidor
  return <div>{data}</div>;
}

// Client Component
"use client";
import { useState } from "react";

export function ExpenseForm() {
  const [amount, setAmount] = useState("");
  // ...
}
```

---

## Backend

### Estructura de API Routes

```
app/api/
├── accounts/
│   ├── route.ts                # GET (list), POST (create)
│   └── [id]/
│       └── route.ts            # GET, PUT, DELETE by ID
│
├── budgets/
│   ├── route.ts
│   ├── [id]/
│   │   └── route.ts
│   └── [id]/contribute/
│       └── route.ts            # POST - agregar aporte
│
├── categories/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
│
├── dashboard/
│   ├── route.ts                # GET - datos consolidados
│   └── charts/
│       └── route.ts            # GET - datos para graficos
│
├── exchange-rates/
│   ├── route.ts                # GET - tasas actuales
│   ├── history/
│   │   └── route.ts            # GET - historial
│   └── refresh/
│       └── route.ts            # POST - actualizar desde API
│
├── expenses/
│   ├── route.ts
│   ├── [id]/
│   │   └── route.ts
│   └── recurring/
│       └── route.ts            # GET - gastos recurrentes
│
├── incomes/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
│
├── jobs/
│   ├── route.ts
│   ├── [id]/
│   │   └── route.ts
│   └── [id]/archive/
│       └── route.ts            # PATCH - archivar trabajo
│
├── reports/
│   ├── summary/
│   │   └── route.ts            # GET - resumen general
│   └── export/
│       └── route.ts            # GET - exportar CSV/PDF
│
└── transfers/
    ├── route.ts
    └── [id]/
        └── route.ts
```

### Ejemplo de Route Handler

```typescript
// app/api/expenses/route.ts
import { NextResponse } from "next/server";
import { getExpenses, createExpense } from "./service";
import { createExpenseSchema } from "./schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  const result = await getExpenses({ categoryId });
  return NextResponse.json({ success: true, data: result });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createExpenseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  const result = await createExpense(parsed.data);
  return NextResponse.json({ success: true, data: result }, { status: 201 });
}
```

### Formato de Respuestas API

```typescript
// Exito
{
  "success": true,
  "data": { ... },
  "meta": {           // Opcional, para paginacion
    "page": 1,
    "limit": 10,
    "total": 100
  }
}

// Error
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```

### Codigos de Estado HTTP

| Codigo | Uso                               |
| ------ | --------------------------------- |
| `200`  | OK - Solicitud exitosa            |
| `201`  | Created - Recurso creado          |
| `400`  | Bad Request - Datos invalidos     |
| `404`  | Not Found - Recurso no encontrado |
| `500`  | Internal Server Error             |

### Cliente Singleton Prisma

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

---

## Base de Datos

### Modelos Principales

| Modelo               | Descripcion                    |
| -------------------- | ------------------------------ |
| `Currency`           | Monedas soportadas (USD, COP)  |
| `ExchangeRate`       | Historial de tasas de cambio   |
| `AccountType`        | Tipos de cuenta                |
| `Account`            | Cuentas financieras            |
| `Job`                | Trabajos (fijos y freelance)   |
| `Category`           | Categorias jerarquicas         |
| `Income`             | Ingresos registrados           |
| `Expense`            | Gastos (unicos y recurrentes)  |
| `Transfer`           | Transferencias entre cuentas   |
| `Budget`             | Presupuestos y metas de ahorro |
| `BudgetContribution` | Aportes a presupuestos         |

### Comandos Prisma

```bash
yarn db:generate          # Generar cliente
yarn db:push              # Aplicar schema (dev)
yarn db:migrate           # Crear migracion
yarn db:seed              # Ejecutar seed
yarn db:studio            # Ver datos (UI)
yarn db:reset             # Resetear DB
```

---

## Estandares de Codigo

### TypeScript

**Configuracion estricta** (`strict: true` en tsconfig.json).

```typescript
// ✅ Preferir interfaces para objetos
interface Expense {
  id: string;
  amount: number;
  categoryId: string;
}

// ✅ Usar type para uniones
type ExpensePeriodicity = "weekly" | "monthly" | "yearly";

// ❌ Evitar any
function process(data: any) {}

// ✅ Usar unknown con type guards
function process(data: unknown) {
  if (typeof data === "object" && data !== null) {
    // ahora data es object
  }
}
```

### Orden de Imports

```typescript
// 1. React/Next
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. Librerias externas
import { useQuery } from "@tanstack/react-query";

// 3. Aliases del proyecto
import { prisma } from "@/lib/prisma";
import type { Expense } from "@/types";

// 4. Imports relativos
import { ExpenseForm } from "./_components/expense-form";
```

### React / Next.js

```typescript
// ✅ Componentes funcionales con tipos explicitos
interface ExpenseCardProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

export function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  return (
    <div>
      <span>{expense.amount}</span>
      <button onClick={() => onDelete(expense.id)}>Delete</button>
    </div>
  );
}

// ✅ Named exports para componentes
export function ExpenseCard() {}

// ✅ Default export solo para pages
export default function ExpensesPage() {}
```

### Hooks

```typescript
// ✅ Prefijo "use" para hooks
export function useExpenses() {}
export function useGetExpenses() {}

// ✅ Retornar objeto para multiples valores
export function useExpenses() {
  return { expenses, isLoading, createExpense, deleteExpense };
}
```

### TanStack Query

```typescript
// ✅ Estructura de hook para queries
export function useGetExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: ["expenses", filters],
    queryFn: () => fetchExpenses(filters),
  });
}

// ✅ Estructura de hook para mutations
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}
```

### Tailwind CSS

```typescript
// ✅ Orden de clases recomendado:
// 1. Layout (flex, grid, position)
// 2. Sizing (w, h, p, m)
// 3. Typography (text, font)
// 4. Visual (bg, border, shadow)
// 5. States (hover, focus)
// 6. Transitions

<div className="flex items-center justify-between w-full p-4 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition">

// ✅ Usar cn() para clases condicionales
import { cn } from '@/lib/utils';

<button className={cn(
  'px-4 py-2 rounded-lg font-medium transition',
  variant === 'primary' && 'bg-primary-600 text-white',
  disabled && 'opacity-50 cursor-not-allowed'
)}>
```

### Validacion con Zod

```typescript
import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a 0"),
  categoryId: z.string().uuid("Categoria invalida"),
  accountId: z.string().uuid("Cuenta invalida"),
  currencyId: z.string().uuid("Moneda invalida"),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  isRecurring: z.boolean().default(false),
  periodicity: z.enum(["weekly", "monthly", "yearly"]).optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
```

---

## Convenciones de Nombres

### Archivos y Carpetas

| Tipo               | Convencion       | Ejemplo                      |
| ------------------ | ---------------- | ---------------------------- |
| Carpetas           | kebab-case       | `exchange-rates/`            |
| Componentes        | kebab-case       | `expense-form/index.tsx`     |
| Hooks              | kebab-case + use | `use-get-expenses.ts`        |
| Privados (Next.js) | \_prefijo        | `_components/`, `_requests/` |
| Dinamicos          | [corchetes]      | `[id]/`                      |

### Codigo TypeScript

| Elemento    | Convencion       | Ejemplo          |
| ----------- | ---------------- | ---------------- |
| Variables   | camelCase        | `totalAmount`    |
| Constantes  | UPPER_SNAKE_CASE | `API_URL`        |
| Funciones   | camelCase        | `getExpenses()`  |
| Interfaces  | PascalCase       | `ExpenseFilters` |
| Componentes | PascalCase       | `ExpenseForm`    |
| Hooks       | camelCase + use  | `useExpenses()`  |

### Base de Datos (Prisma)

| Elemento       | Convencion                     | Ejemplo                        |
| -------------- | ------------------------------ | ------------------------------ |
| Modelos        | PascalCase                     | `Expense`                      |
| Campos         | camelCase                      | `officialRate`                 |
| Tablas (@@map) | snake_case                     | `exchange_rates`               |
| Enums          | PascalCase + snake_case values | `JobType { fixed, freelance }` |

### API

| Elemento     | Convencion | Ejemplo                    |
| ------------ | ---------- | -------------------------- |
| Endpoints    | kebab-case | `/api/exchange-rates`      |
| Query params | camelCase  | `?categoryId=xxx`          |
| JSON bodies  | camelCase  | `{ "officialRate": 4500 }` |

### Estructura \_requests/

```
_requests/
└── [method]-[action]/
    ├── service.ts
    ├── types.ts
    ├── formatter.ts (opcional)
    └── use-[method]-[action].ts
```

| Accion         | Carpeta           | Hook                    |
| -------------- | ----------------- | ----------------------- |
| GET expenses   | `get-expenses/`   | `use-get-expenses.ts`   |
| POST expense   | `post-expense/`   | `use-post-expense.ts`   |
| PUT expense    | `put-expense/`    | `use-put-expense.ts`    |
| DELETE expense | `delete-expense/` | `use-delete-expense.ts` |

---

## Git Workflow

### Estructura de Branches

```
main                    # Produccion
  └── develop           # Desarrollo
       ├── feature/*    # Nuevas funcionalidades
       ├── fix/*        # Correccion de bugs
       └── refactor/*   # Refactorizaciones
```

### Nomenclatura

```
tipo/descripcion-corta

# Ejemplos
feature/expense-form
fix/transfer-calculation
refactor/api-structure
```

### Tipos de Branches

| Tipo        | Uso                                  |
| ----------- | ------------------------------------ |
| `feature/`  | Nueva funcionalidad                  |
| `fix/`      | Correccion de bug                    |
| `refactor/` | Refactorizacion sin cambio funcional |
| `docs/`     | Cambios en documentacion             |
| `chore/`    | Tareas de mantenimiento              |

### Formato de Commits

```
tipo(scope): descripcion corta

[cuerpo opcional]
```

### Tipos de Commit

| Tipo       | Descripcion                |
| ---------- | -------------------------- |
| `feat`     | Nueva funcionalidad        |
| `fix`      | Correccion de bug          |
| `docs`     | Documentacion              |
| `style`    | Formato (no afecta logica) |
| `refactor` | Refactorizacion            |
| `test`     | Tests                      |
| `chore`    | Tareas de mantenimiento    |

### Ejemplos de Commits

```bash
feat(expenses): add recurring expense support
fix(transfers): handle different currencies
docs(readme): update installation steps
refactor(api): extract validation to schemas
chore(deps): update dependencies
```

### Reglas para Commits

1. **Descripcion en presente**: "add" no "added"
2. **Primera letra minuscula**: "add feature" no "Add feature"
3. **Sin punto al final**
4. **Maximo 72 caracteres** en la primera linea
5. **Scope opcional** pero recomendado

---

## Ver tambien

- [API Reference](./API.md)
- [Context](./CONTEXT.md)
- [Setup](./SETUP.md)
- [Modulos](./modules/)
