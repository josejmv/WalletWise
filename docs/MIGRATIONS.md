# Guia de Migraciones de Base de Datos - WalletWise

Esta guia explica como realizar migraciones de base de datos de forma segura con Prisma y Neon PostgreSQL, preservando todos tus datos existentes.

## Conceptos Importantes

### Diferencia entre `db push` y `migrate`

| Comando           | Uso                                                | Produccion     |
| ----------------- | -------------------------------------------------- | -------------- |
| `yarn db:push`    | Desarrollo rapido, sincroniza schema sin historial | NO recomendado |
| `yarn db:migrate` | Crea migraciones con historial, reversibles        | RECOMENDADO    |

**IMPORTANTE**: Si hasta ahora has usado `db:push`, necesitas inicializar el sistema de migraciones primero.

---

## Escenario 1: Primera vez usando migraciones (tienes datos existentes)

Si has estado usando `db:push` y tienes datos que quieres preservar:

### Paso 1: Hacer backup de la base de datos

```bash
# Opcion A: Usando el endpoint de backup de la app
curl http://localhost:3000/api/backup > backup_$(date +%Y%m%d).json

# Opcion B: Usando pg_dump (recomendado para produccion)
pg_dump "postgresql://user:pass@host/db?sslmode=require" > backup_$(date +%Y%m%d).sql
```

### Paso 2: Crear baseline de migracion

Esto marca el estado actual como la "linea base" sin ejecutar cambios:

```bash
# Genera el directorio de migraciones con el estado actual
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0_init/migration.sql

# Crea la carpeta de migracion
mkdir -p prisma/migrations/0_init

# Mueve el archivo
mv migration.sql prisma/migrations/0_init/

# Marca la migracion como aplicada (sin ejecutarla)
npx prisma migrate resolve --applied 0_init
```

### Paso 3: Verificar estado

```bash
npx prisma migrate status
```

Deberia mostrar que `0_init` esta aplicada.

---

## Escenario 2: Agregar nuevos cambios al schema

### Paso 1: Modificar el schema

Edita `prisma/schema.prisma` con tus cambios. Por ejemplo:

```prisma
model Income {
  id        String   @id @default(uuid())
  jobId     String?  // <- Cambio: ahora es opcional
  // ... resto del modelo
}
```

### Paso 2: Crear la migracion

```bash
# Crear migracion con nombre descriptivo
npx prisma migrate dev --name descripcion_del_cambio

# Ejemplos de nombres:
# npx prisma migrate dev --name add_optional_job_to_income
# npx prisma migrate dev --name add_price_history_table
# npx prisma migrate dev --name add_exchange_rate_source_enum
```

### Paso 3: Revisar el SQL generado

Prisma crea un archivo en `prisma/migrations/[timestamp]_[nombre]/migration.sql`. Revisalo antes de aplicar en produccion:

```sql
-- Ejemplo de migracion segura
ALTER TABLE "incomes" ALTER COLUMN "jobId" DROP NOT NULL;
```

### Paso 4: Aplicar en produccion

```bash
# En produccion, usa deploy (no dev)
npx prisma migrate deploy
```

---

## Escenario 3: Cambios que pueden perder datos

Algunos cambios son destructivos. Prisma te advertira:

### Cambios peligrosos:

- Eliminar columnas
- Cambiar tipos de datos incompatibles
- Eliminar tablas
- Renombrar columnas (Prisma las ve como eliminar + crear)

### Como manejarlos:

#### Opcion A: Migracion en dos pasos (recomendado)

```bash
# 1. Agregar nueva columna
npx prisma migrate dev --name add_new_column

# 2. Migrar datos manualmente
psql "connection_string" -c "UPDATE table SET new_col = old_col"

# 3. Eliminar columna vieja
npx prisma migrate dev --name remove_old_column
```

#### Opcion B: Editar la migracion manualmente

```bash
# 1. Crear migracion sin aplicar
npx prisma migrate dev --create-only --name rename_column

# 2. Editar el SQL generado
# Cambiar DROP + ADD por ALTER...RENAME

# 3. Aplicar
npx prisma migrate dev
```

---

## Comandos Utiles

```bash
# Ver estado de migraciones
npx prisma migrate status

# Resetear base de datos (BORRA TODOS LOS DATOS)
npx prisma migrate reset

# Generar cliente sin migrar
npx prisma generate

# Ver diferencias entre schema y BD
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma

# Marcar migracion como aplicada manualmente
npx prisma migrate resolve --applied nombre_migracion

# Marcar migracion como revertida
npx prisma migrate resolve --rolled-back nombre_migracion
```

---

## Flujo Recomendado para v1.4.0

Para esta version con los cambios de schema (jobId opcional en Income):

### 1. Backup primero

```bash
# Desde la app
curl http://localhost:3000/api/backup > backup_pre_v140.json
```

### 2. Si es primera migracion, crear baseline

```bash
# Solo si nunca has usado migrate
mkdir -p prisma/migrations/0_init
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
npx prisma migrate resolve --applied 0_init
```

### 3. Crear migracion para v1.4.0

```bash
npx prisma migrate dev --name v140_optional_job_in_income
```

### 4. Verificar el SQL

El archivo generado deberia contener algo como:

```sql
-- AlterTable
ALTER TABLE "incomes" ALTER COLUMN "jobId" DROP NOT NULL;
```

### 5. Aplicar en produccion

```bash
# En el servidor de produccion
npx prisma migrate deploy
```

---

## Restaurar desde Backup

### Desde JSON (backup de la app)

```bash
# Usar el endpoint de restore (si existe) o importar manualmente
curl -X POST http://localhost:3000/api/backup/restore -d @backup.json
```

### Desde SQL dump

```bash
# Restaurar dump completo
psql "postgresql://user:pass@host/db?sslmode=require" < backup.sql
```

---

## Mejores Practicas

1. **Siempre hacer backup antes de migrar**
2. **Probar migraciones en desarrollo primero**
3. **Revisar el SQL generado antes de aplicar**
4. **Usar nombres descriptivos para migraciones**
5. **No editar migraciones ya aplicadas en produccion**
6. **Mantener migraciones pequenas y atomicas**
7. **Documentar migraciones complejas con comentarios SQL**

---

## Troubleshooting

### "Migration failed to apply cleanly"

```bash
# Ver que fallo
npx prisma migrate status

# Si es seguro, marcar como aplicada
npx prisma migrate resolve --applied nombre_migracion

# Si necesitas revertir
npx prisma migrate resolve --rolled-back nombre_migracion
```

### "Drift detected"

La BD no coincide con las migraciones. Opciones:

```bash
# Opcion 1: Crear migracion para sincronizar
npx prisma migrate dev

# Opcion 2: Forzar sincronizacion (usa con cuidado)
npx prisma db push --accept-data-loss
```

### "Shadow database required"

En Neon, puedes usar una rama como shadow:

```bash
# En schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

O desactivar shadow database (menos seguro):

```bash
npx prisma migrate dev --skip-seed
```

---

## Neon-Specific

### Usar Branches para migraciones

1. Crear branch de desarrollo en Neon dashboard
2. Probar migraciones en el branch
3. Si todo funciona, aplicar en main

```bash
# .env.development
DATABASE_URL="postgresql://...@ep-dev-branch.../db"

# .env.production
DATABASE_URL="postgresql://...@ep-main-branch.../db"
```

### Pooling vs Direct

Para migraciones, usa conexion directa (no pooled):

```bash
# Para migraciones, usar URL sin pooling
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require"

# Para la app en runtime, usar pooling
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db?sslmode=require"
```

---

_Ultima actualizacion: v1.4.0_
