# Modulo Inventory

Inventario del hogar para seguimiento de productos y calculo automatico de presupuesto de mercado.

---

## Descripcion

Permite gestionar un inventario de productos basicos del hogar, rastreando cantidades actuales vs maximas para identificar productos que necesitan reposicion. Integra con el modulo de presupuestos para calcular automaticamente el costo del mercado mensual.

---

## Casos de Uso

1. **Control de despensa**: Saber que productos tengo y cuales necesito
2. **Lista de compras inteligente**: Generar automaticamente lista de productos faltantes
3. **Presupuesto de mercado**: Calcular el costo estimado de la proxima compra
4. **Historial de precios**: Rastrear cambios de precios en el tiempo

---

## Modelo de Datos

### InventoryCategory

Categorias para organizar productos del inventario.

| Campo       | Tipo     | Descripcion            |
| ----------- | -------- | ---------------------- |
| id          | UUID     | Identificador unico    |
| name        | string   | Nombre de la categoria |
| icon        | string?  | Icono identificador    |
| color       | string?  | Color hex para UI      |
| description | string?  | Descripcion opcional   |
| createdAt   | DateTime | Fecha de creacion      |
| updatedAt   | DateTime | Ultima actualizacion   |

**Categorias sugeridas:**

- Despensa (arroz, pasta, aceite, etc.)
- Lacteos y huevos
- Carnes y proteinas
- Frutas y verduras
- Bebidas
- Limpieza del hogar
- Higiene personal
- Congelados

### InventoryItem

Producto individual en el inventario.

| Campo           | Tipo              | Descripcion                                   |
| --------------- | ----------------- | --------------------------------------------- |
| id              | UUID              | Identificador unico                           |
| name            | string            | Nombre del producto                           |
| category        | InventoryCategory | Categoria del producto                        |
| currentQuantity | Decimal           | Cantidad actual en inventario                 |
| maxQuantity     | Decimal           | Cantidad maxima/deseada                       |
| minQuantity     | Decimal           | Cantidad minima antes de reponer (default: 0) |
| unit            | string            | Unidad de medida (unidades, kg, L, etc.)      |
| estimatedPrice  | Decimal           | Precio estimado por unidad                    |
| currency        | Currency          | Moneda del precio                             |
| isActive        | boolean           | Si el producto esta activo                    |
| notes           | string?           | Notas adicionales                             |
| createdAt       | DateTime          | Fecha de creacion                             |
| updatedAt       | DateTime          | Ultima actualizacion                          |

### InventoryPriceHistory

Historial de precios para rastrear cambios.

| Campo     | Tipo          | Descripcion                |
| --------- | ------------- | -------------------------- |
| id        | UUID          | Identificador unico        |
| item      | InventoryItem | Producto                   |
| price     | Decimal       | Precio registrado          |
| currency  | Currency      | Moneda                     |
| date      | DateTime      | Fecha del registro         |
| source    | string?       | Donde se compro (opcional) |
| createdAt | DateTime      | Fecha de registro          |

---

## Calculos

### Cantidad Faltante

```typescript
const missingQuantity = Math.max(0, item.maxQuantity - item.currentQuantity);
```

### Necesita Reposicion

```typescript
const needsRestock = item.currentQuantity <= item.minQuantity;
```

### Porcentaje de Stock

```typescript
const stockPercentage = (item.currentQuantity / item.maxQuantity) * 100;
```

### Costo Estimado de Reposicion

```typescript
const restockCost = missingQuantity * item.estimatedPrice;
```

### Presupuesto Total de Mercado

```typescript
const totalGroceryBudget = items
  .filter((item) => item.currentQuantity < item.maxQuantity)
  .reduce((sum, item) => {
    const missing = item.maxQuantity - item.currentQuantity;
    return sum + missing * item.estimatedPrice;
  }, 0);
```

---

## API Endpoints

### Categorias de Inventario

#### GET /api/inventory/categories

Lista todas las categorias.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Despensa",
      "icon": "package",
      "color": "#f59e0b",
      "itemCount": 15
    }
  ]
}
```

#### POST /api/inventory/categories

Crea una nueva categoria.

#### PUT /api/inventory/categories/:id

Actualiza una categoria.

#### DELETE /api/inventory/categories/:id

Elimina una categoria (solo si no tiene productos).

---

### Productos de Inventario

#### GET /api/inventory/items

Lista todos los productos.

**Query params:**

- `categoryId`: Filtrar por categoria
- `needsRestock`: `true` para solo productos que necesitan reposicion
- `isActive`: `true` | `false`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Arroz Diana 1kg",
      "category": { "id": "uuid", "name": "Despensa" },
      "currentQuantity": 1,
      "maxQuantity": 5,
      "minQuantity": 1,
      "unit": "unidades",
      "estimatedPrice": 3500,
      "currency": { "code": "COP" },
      "stockPercentage": 20,
      "needsRestock": true,
      "missingQuantity": 4,
      "restockCost": 14000
    }
  ],
  "meta": {
    "totalItems": 45,
    "needsRestockCount": 12,
    "totalRestockCost": 185000
  }
}
```

#### POST /api/inventory/items

Crea un nuevo producto.

**Body:**

```json
{
  "name": "Jabon de bano Dove",
  "categoryId": "uuid",
  "currentQuantity": 2,
  "maxQuantity": 6,
  "minQuantity": 1,
  "unit": "unidades",
  "estimatedPrice": 8500,
  "currencyId": "uuid",
  "notes": "Comprar en promocion"
}
```

#### GET /api/inventory/items/:id

Obtiene detalle del producto con historial de precios.

#### PUT /api/inventory/items/:id

Actualiza un producto.

#### DELETE /api/inventory/items/:id

Desactiva un producto (soft delete).

#### PATCH /api/inventory/items/:id/quantity

Actualiza solo la cantidad (para ajustes rapidos).

**Body:**

```json
{
  "currentQuantity": 3,
  "operation": "set" // o "add" o "subtract"
}
```

#### POST /api/inventory/items/:id/price

Registra un nuevo precio (actualiza historial).

**Body:**

```json
{
  "price": 9000,
  "source": "Exito"
}
```

---

### Lista de Mercado

#### GET /api/inventory/shopping-list

Genera lista de compras con productos que necesitan reposicion.

**Query params:**

- `categoryId`: Filtrar por categoria
- `maxBudget`: Limite de presupuesto (excluye items que excedan)

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Arroz Diana 1kg",
        "category": "Despensa",
        "currentQuantity": 1,
        "toBuy": 4,
        "unit": "unidades",
        "unitPrice": 3500,
        "totalPrice": 14000,
        "currency": "COP"
      }
    ],
    "summary": {
      "totalItems": 12,
      "totalCost": 185000,
      "currency": "COP",
      "byCategory": [
        { "category": "Despensa", "count": 5, "cost": 45000 },
        { "category": "Limpieza", "count": 4, "cost": 62000 }
      ]
    }
  }
}
```

#### POST /api/inventory/shopping-list/complete

Marca items como comprados (actualiza cantidades a maxQuantity).

**Body:**

```json
{
  "itemIds": ["uuid1", "uuid2"],
  "updatePrices": true,
  "prices": {
    "uuid1": 3800,
    "uuid2": 9200
  }
}
```

---

### Estadisticas

#### GET /api/inventory/stats

Obtiene estadisticas del inventario.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalItems": 45,
    "activeItems": 42,
    "totalValue": 650000,
    "needsRestockCount": 12,
    "stockHealth": 78,
    "estimatedMonthlyBudget": 185000,
    "currency": "COP",
    "byCategory": [
      {
        "category": "Despensa",
        "itemCount": 15,
        "stockHealth": 85,
        "value": 180000
      }
    ]
  }
}
```

---

## Integracion con Presupuestos

El modulo de inventario puede crear automaticamente un presupuesto de mercado:

### Crear Budget de Mercado

```typescript
// Al generar lista de compras, se puede crear un budget
const shoppingList = await getShoppingList();

const marketBudget = await createBudget({
  name: `Mercado ${currentMonth}`,
  type: "goal",
  targetAmount: shoppingList.summary.totalCost,
  currencyId: "cop-currency-id",
  deadline: endOfMonth(),
});
```

### Flujo Recomendado

```
1. Revisar inventario → Items con stock bajo
2. Generar lista de compras → Calcula costo total
3. Crear budget de mercado → Meta con el costo calculado
4. Realizar compra → Marcar items como comprados
5. Budget completado → Actualizar cantidades en inventario
```

---

## Estructura de Archivos

```
app/
├── (dashboard)/
│   └── inventory/
│       ├── page.tsx                  # Vista principal del inventario
│       ├── categories/
│       │   └── page.tsx              # Gestionar categorias
│       ├── items/
│       │   ├── page.tsx              # Lista de productos
│       │   ├── new/
│       │   │   └── page.tsx          # Crear producto
│       │   └── [id]/
│       │       └── page.tsx          # Detalle/editar producto
│       ├── shopping-list/
│       │   └── page.tsx              # Lista de compras
│       └── _components/
│           ├── inventory-grid/
│           ├── item-card/
│           ├── item-form/
│           ├── category-list/
│           ├── shopping-list-table/
│           ├── stock-indicator/
│           └── quick-quantity-update/
│
└── api/
    └── inventory/
        ├── categories/
        │   ├── route.ts
        │   └── [id]/
        │       └── route.ts
        ├── items/
        │   ├── route.ts
        │   └── [id]/
        │       ├── route.ts
        │       ├── quantity/
        │       │   └── route.ts
        │       └── price/
        │           └── route.ts
        ├── shopping-list/
        │   ├── route.ts
        │   └── complete/
        │       └── route.ts
        ├── stats/
        │   └── route.ts
        ├── service.ts
        ├── repository.ts
        ├── schema.ts
        └── types.ts
```

---

## Componentes UI

### StockIndicator

Indicador visual del nivel de stock.

```typescript
interface StockIndicatorProps {
  currentQuantity: number;
  maxQuantity: number;
  minQuantity: number;
}

// Colores:
// Verde: > 50% stock
// Amarillo: 25-50% stock
// Rojo: < 25% o <= minQuantity
```

### QuickQuantityUpdate

Control rapido para actualizar cantidad (+1, -1, input directo).

### ItemCard

Tarjeta de producto con:

- Nombre y categoria
- Indicador de stock
- Precio estimado
- Acciones rapidas (editar cantidad, ver detalle)

### ShoppingListTable

Tabla de lista de compras con:

- Checkboxes para marcar items
- Input de precio real
- Total calculado
- Accion de completar compra

---

## Validaciones

| Campo           | Regla                            |
| --------------- | -------------------------------- |
| name            | Requerido, 2-100 caracteres      |
| categoryId      | UUID valido, categoria existente |
| currentQuantity | >= 0                             |
| maxQuantity     | > 0, > minQuantity               |
| minQuantity     | >= 0, < maxQuantity              |
| unit            | Requerido, valores predefinidos  |
| estimatedPrice  | > 0                              |
| currencyId      | UUID valido                      |

### Unidades Permitidas

- `unidades` - Productos contables
- `kg` - Kilogramos
- `g` - Gramos
- `L` - Litros
- `mL` - Mililitros
- `paquetes` - Paquetes/bolsas

---

## Estados del Stock

```
[full]     currentQuantity >= maxQuantity (100%+)
[good]     currentQuantity > maxQuantity * 0.5 (50-99%)
[low]      currentQuantity > minQuantity (25-50%)
[critical] currentQuantity <= minQuantity (0-25%)
[empty]    currentQuantity === 0
```

---

## Ver tambien

- [Budgets](../budgets/README.md) - Crear presupuesto de mercado
- [Expenses](../expenses/README.md) - Registrar gasto de mercado
- [Dashboard](../dashboard/README.md) - Widget de inventario
