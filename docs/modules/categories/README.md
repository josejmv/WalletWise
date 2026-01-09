# Modulo Categories

Sistema jerarquico de categorias y subcategorias para clasificar gastos.

---

## Descripcion

Permite organizar los gastos en categorias padre con subcategorias anidadas para un mejor analisis y reportes.

---

## Estructura Jerarquica

```
Categoria Padre
├── Subcategoria 1
├── Subcategoria 2
└── Subcategoria 3
```

---

## Categorias Predefinidas (Seed)

| Categoria       | Subcategorias                                 |
| --------------- | --------------------------------------------- |
| Vivienda        | Arriendo, Servicios, Mantenimiento, Internet  |
| Alimentacion    | Mercado, Restaurantes, Domicilios             |
| Transporte      | Gasolina, Transporte publico, Parking, Peajes |
| Salud           | Medicamentos, Citas medicas, Seguros          |
| Entretenimiento | Streaming, Videojuegos, Salidas, Hobbies      |
| Educacion       | Cursos, Libros, Suscripciones                 |
| Ropa            | Vestimenta, Calzado, Accesorios               |
| Finanzas        | Comisiones, Intereses, Impuestos              |
| Otros           | Regalos, Donaciones, Varios                   |

---

## Modelo de Datos

| Campo       | Tipo       | Descripcion                              |
| ----------- | ---------- | ---------------------------------------- |
| id          | UUID       | Identificador unico                      |
| name        | string     | Nombre de la categoria                   |
| description | string?    | Descripcion opcional                     |
| color       | string?    | Color para UI (hex)                      |
| icon        | string?    | Icono (nombre o codigo)                  |
| parentId    | UUID?      | ID de categoria padre (null si es padre) |
| parent      | Category?  | Relacion a categoria padre               |
| children    | Category[] | Subcategorias                            |
| createdAt   | DateTime   | Fecha de creacion                        |

---

## API Endpoints

### GET /api/categories

Lista todas las categorias.

**Query params:**

- `parent`: `true` (solo padres) | `false` (solo hijos)
- `parentId`: Filtrar subcategorias de un padre

**Response (estructura jerarquica):**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Alimentacion",
      "color": "#22c55e",
      "icon": "utensils",
      "children": [
        { "id": "uuid", "name": "Mercado", "parentId": "uuid" },
        { "id": "uuid", "name": "Restaurantes", "parentId": "uuid" }
      ]
    }
  ]
}
```

### POST /api/categories

Crea una nueva categoria.

**Body (categoria padre):**

```json
{
  "name": "Mascotas",
  "color": "#f59e0b",
  "icon": "paw"
}
```

**Body (subcategoria):**

```json
{
  "name": "Comida mascota",
  "parentId": "uuid-categoria-mascotas"
}
```

### PUT /api/categories/:id

Actualiza una categoria.

### DELETE /api/categories/:id

Elimina una categoria (solo si no tiene gastos asociados).

---

## Estructura de Archivos

```
app/
├── (dashboard)/
│   └── categories/
│       ├── page.tsx              # Lista de categorias
│       ├── new/
│       │   └── page.tsx          # Crear categoria
│       ├── [id]/
│       │   └── page.tsx          # Detalle/editar
│       └── _components/
│           ├── category-tree.tsx
│           ├── category-card.tsx
│           └── category-form.tsx
│
└── api/
    └── categories/
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

### Eliminacion de Categorias

```
Si categoria tiene gastos asociados:
  → Error: No se puede eliminar

Si categoria es padre con subcategorias:
  → Error: Primero eliminar subcategorias

Si categoria no tiene dependencias:
  → Eliminar categoria
```

### Uso en Reportes

Las categorias padre se usan para agrupar gastos en graficos y reportes:

```typescript
// Gastos por categoria padre
const expensesByCategory = expenses.reduce((acc, expense) => {
  const parentCategory = expense.category.parent || expense.category;
  acc[parentCategory.name] = (acc[parentCategory.name] || 0) + expense.amount;
  return acc;
}, {});
```

---

## Validaciones

| Campo    | Regla                             |
| -------- | --------------------------------- |
| name     | Requerido, 2-50 caracteres, unico |
| parentId | Debe existir si se proporciona    |
| color    | Formato hex valido (#RRGGBB)      |

---

## Ver tambien

- [Expenses](../expenses/README.md) - Gastos categorizados
- [Reports](../reports/README.md) - Reportes por categoria
