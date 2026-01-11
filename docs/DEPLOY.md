# Guia de Despliegue - WalletWise

Esta guia cubre el despliegue completo de WalletWise en Vercel con una base de datos PostgreSQL gestionada.

## Indice

1. [Requisitos Previos](#requisitos-previos)
2. [Paso 1: Configurar Base de Datos (Neon)](#paso-1-configurar-base-de-datos-neon)
3. [Paso 2: Preparar Repositorio en GitHub](#paso-2-preparar-repositorio-en-github)
4. [Paso 3: Desplegar en Vercel](#paso-3-desplegar-en-vercel)
5. [Paso 4: Configurar Variables de Entorno](#paso-4-configurar-variables-de-entorno)
6. [Paso 5: Ejecutar Migraciones y Seed](#paso-5-ejecutar-migraciones-y-seed)
7. [Paso 6: Verificar Despliegue](#paso-6-verificar-despliegue)
8. [Mantenimiento](#mantenimiento)
9. [Costos Estimados](#costos-estimados)
10. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

- Cuenta de GitHub con el repositorio del proyecto
- Cuenta de Vercel (puedes crear una con tu cuenta de GitHub)
- Cuenta de Neon (o proveedor de PostgreSQL de tu preferencia)
- API Key de ExchangeRate-API (opcional, para tasas de cambio oficiales)

---

## Paso 1: Configurar Base de Datos (Neon)

Neon ofrece PostgreSQL serverless con un tier gratuito generoso (0.5 GB storage, 190 horas de computo/mes).

### 1.1 Crear Cuenta en Neon

1. Ve a [https://neon.tech](https://neon.tech)
2. Click en **"Sign Up"** o **"Start Free"**
3. Registrate con tu cuenta de GitHub (recomendado) o email
4. Confirma tu email si es necesario

### 1.2 Crear Proyecto

1. Una vez dentro del dashboard, click en **"New Project"**
2. Completa el formulario:
   - **Project name**: `walletwise` (o el nombre que prefieras)
   - **Postgres version**: `16` (para coincidir con tu docker-compose)
   - **Region**: Selecciona la mas cercana a ti (ej: `US East` o `Europe West`)
3. Click en **"Create Project"**

### 1.3 Obtener Connection String

1. Despues de crear el proyecto, veras la pantalla de **Connection Details**
2. Busca la seccion **"Connection string"**
3. Selecciona el formato **"Prisma"** en el dropdown
4. Copia el connection string, se vera algo asi:
   ```
   postgresql://username:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
   ```
5. **GUARDA ESTE STRING** - lo necesitaras en Vercel

### 1.4 (Opcional) Crear Base de Datos Dedicada

Por defecto Neon crea una BD llamada `neondb`. Si prefieres una dedicada:

1. En el sidebar izquierdo, click en **"Databases"**
2. Click en **"New Database"**
3. Nombre: `walletwise`
4. Click en **"Create"**
5. Actualiza tu connection string cambiando `/neondb` por `/walletwise`

---

## Paso 2: Preparar Repositorio en GitHub

### 2.1 Subir Codigo a GitHub

Si aun no tienes el repositorio en GitHub:

1. Ve a [https://github.com](https://github.com) y logueate
2. Click en el boton **"+"** (arriba derecha) > **"New repository"**
3. Completa:
   - **Repository name**: `walletwise` (o el nombre que prefieras)
   - **Visibility**: `Private` (recomendado para finanzas personales)
4. Click en **"Create repository"**
5. Sigue las instrucciones para subir tu codigo existente:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/walletwise.git
   git branch -M main
   git push -u origin main
   ```

### 2.2 Verificar Archivos Necesarios

Asegurate de que tu repositorio tenga:

- `package.json` con scripts de build
- `prisma/schema.prisma`
- `next.config.ts` o `next.config.js`
- `.gitignore` (que excluya `.env` y `node_modules`)

**IMPORTANTE**: NO subas archivos `.env` con credenciales reales.

---

## Paso 3: Desplegar en Vercel

### 3.1 Crear Cuenta en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Click en **"Sign Up"**
3. Selecciona **"Continue with GitHub"** (recomendado)
4. Autoriza Vercel para acceder a tu cuenta de GitHub

### 3.2 Importar Proyecto

1. En el dashboard de Vercel, click en **"Add New..."** > **"Project"**
2. Veras una lista de tus repositorios de GitHub
3. Busca y selecciona tu repositorio `walletwise`
4. Click en **"Import"**

### 3.3 Configurar Proyecto

En la pantalla de configuracion:

1. **Framework Preset**: Vercel detectara automaticamente `Next.js`
2. **Root Directory**: Dejalo vacio (`.`) a menos que tu app este en una subcarpeta
3. **Build Command**: Dejar por defecto (`next build`) o usar:
   ```
   prisma generate && next build
   ```
4. **Output Directory**: Dejar por defecto
5. **Install Command**: Dejar por defecto (`yarn install` o `npm install`)

### 3.4 NO DESPLEGAR TODAVIA

**IMPORTANTE**: Antes de hacer click en "Deploy", necesitas configurar las variables de entorno (siguiente seccion).

---

## Paso 4: Configurar Variables de Entorno

### 4.1 En la Pantalla de Importacion

Antes de desplegar, expande la seccion **"Environment Variables"**:

| Variable                    | Valor                                   | Entorno                          |
| --------------------------- | --------------------------------------- | -------------------------------- |
| `DATABASE_URL`              | Tu connection string de Neon (paso 1.3) | Production, Preview, Development |
| `EXCHANGE_RATE_API_KEY`     | Tu API key (o dejalo vacio por ahora)   | Production                       |
| `NEXT_PUBLIC_APP_NAME`      | `WalletWise`                            | Production                       |
| `NEXT_PUBLIC_BASE_CURRENCY` | `USD`                                   | Production                       |

### 4.2 Agregar Variables

Para cada variable:

1. En el campo **"Name"**, escribe el nombre de la variable
2. En el campo **"Value"**, pega el valor
3. Marca los checkboxes de entornos donde aplica (generalmente todos)
4. Click en **"Add"**

### 4.3 Ejemplo de DATABASE_URL

```
DATABASE_URL=postgresql://neondb_owner:abc123xyz@ep-cool-fire-123456.us-east-2.aws.neon.tech/walletwise?sslmode=require
```

### 4.4 Ahora Si, Desplegar

Una vez configuradas todas las variables:

1. Click en **"Deploy"**
2. Espera a que termine el build (2-5 minutos)
3. Si hay errores, revisa los logs en la pestana **"Build Logs"**

---

## Paso 5: Ejecutar Migraciones y Seed

Despues del primer despliegue, necesitas crear las tablas y datos iniciales.

### 5.1 Opcion A: Desde tu Maquina Local (Recomendado)

1. Crea un archivo `.env.production.local` en tu proyecto local:

   ```
   DATABASE_URL="tu_connection_string_de_neon"
   ```

2. Ejecuta las migraciones:

   ```bash
   npx prisma db push
   ```

3. Ejecuta el seed para datos iniciales:

   ```bash
   npx prisma db seed
   ```

4. Verifica que las tablas se crearon:
   ```bash
   npx prisma studio
   ```

### 5.2 Opcion B: Usando Neon SQL Editor

1. Ve al dashboard de Neon
2. Click en **"SQL Editor"** en el sidebar
3. Genera el SQL de tu schema:
   ```bash
   # En tu maquina local
   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql
   ```
4. Copia el contenido de `migration.sql` y ejecutalo en el SQL Editor de Neon

### 5.3 Verificar Datos

1. En Neon, ve a **"Tables"** en el sidebar
2. Deberias ver todas tus tablas: `accounts`, `currencies`, `expenses`, etc.
3. Verifica que las monedas y datos del seed esten presentes

---

## Paso 6: Verificar Despliegue

### 6.1 Acceder a tu Aplicacion

1. En Vercel, ve a tu proyecto
2. Click en el dominio generado (ej: `walletwise-xxx.vercel.app`)
3. Tu aplicacion deberia cargar correctamente

### 6.2 Verificar Funcionalidad

1. **Dashboard**: Debe cargar sin errores
2. **Cuentas**: Crea una cuenta de prueba
3. **Gastos/Ingresos**: Registra una transaccion
4. **Tasas de cambio**: Verifica que se muestren (si configuraste la API key)

### 6.3 Configurar Dominio Personalizado (Opcional)

1. En Vercel, ve a tu proyecto > **"Settings"** > **"Domains"**
2. Click en **"Add"**
3. Escribe tu dominio (ej: `finanzas.tudominio.com`)
4. Sigue las instrucciones para configurar DNS

---

## Mantenimiento

### Actualizar la Aplicacion

Cada vez que hagas push a la rama `main`:

1. Vercel detectara los cambios automaticamente
2. Iniciara un nuevo build
3. Si el build es exitoso, desplegara la nueva version
4. La version anterior se mantiene disponible para rollback

### Ejecutar Migraciones en Produccion

Cuando cambies el schema de Prisma:

1. Haz los cambios en `prisma/schema.prisma`
2. En tu maquina local con el `.env.production.local`:
   ```bash
   npx prisma db push
   ```
3. Commit y push los cambios
4. Vercel redesplegara automaticamente

### Backups de Base de Datos

Neon incluye backups automaticos en el tier gratuito:

1. Ve a tu proyecto en Neon
2. Click en **"Backups"** en el sidebar
3. Puedes ver el historial y restaurar a un punto anterior

### Monitoreo

En Vercel:

1. **Analytics**: Ve a tu proyecto > **"Analytics"** para ver metricas
2. **Logs**: Ve a **"Logs"** para ver errores en tiempo real
3. **Functions**: Ve cuanto tiempo tardan tus API routes

---

## Costos Estimados

### Tier Gratuito (Suficiente para uso personal)

| Servicio   | Limite Gratuito                    | Tu Uso Estimado |
| ---------- | ---------------------------------- | --------------- |
| **Vercel** | 100GB bandwidth, builds ilimitados | < 10GB/mes      |
| **Neon**   | 0.5GB storage, 190h compute/mes    | < 0.1GB, < 50h  |
| **Total**  | $0/mes                             | $0/mes          |

### Si Excedes los Limites

| Servicio   | Plan Pro                                  |
| ---------- | ----------------------------------------- |
| **Vercel** | $20/mes (1TB bandwidth)                   |
| **Neon**   | $19/mes (10GB storage, compute escalable) |

Para uso personal, el tier gratuito es mas que suficiente.

---

## Troubleshooting

### Error: "prisma generate" failed

**Solucion**: Asegurate de que el Build Command sea:

```
prisma generate && next build
```

### Error: "Can't reach database server"

**Posibles causas**:

1. Connection string incorrecto - verifica en Neon
2. Falta `?sslmode=require` al final del connection string
3. La IP de Vercel esta bloqueada - Neon no bloquea IPs por defecto

### Error: "Table does not exist"

**Solucion**: No has ejecutado las migraciones. Ve al Paso 5.

### La aplicacion carga pero no muestra datos

**Posibles causas**:

1. No ejecutaste el seed - ejecuta `npx prisma db seed`
2. Error en la conexion - revisa los logs en Vercel

### Build muy lento (> 10 minutos)

**Solucion**:

1. Verifica que `node_modules` este en `.gitignore`
2. Considera usar cache de Prisma:
   ```json
   // package.json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```

### Como ver los logs de errores

1. En Vercel, ve a tu proyecto
2. Click en **"Deployments"**
3. Selecciona el deployment con error
4. Click en **"Functions"** o **"Build Logs"**

---

## Alternativas de Base de Datos

Si prefieres otra opcion en lugar de Neon:

### Vercel Postgres (Powered by Neon)

1. En Vercel, ve a **"Storage"** > **"Create Database"**
2. Selecciona **"Postgres"**
3. La variable `DATABASE_URL` se configura automaticamente

**Pros**: Integracion directa con Vercel
**Contras**: Tier gratuito mas limitado que Neon directo

### Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea un proyecto
3. Ve a **"Settings"** > **"Database"** > **"Connection string"**

**Pros**: Incluye autenticacion, storage, y realtime
**Contras**: Proyecto se pausa despues de 1 semana de inactividad (tier gratuito)

### Railway

1. Ve a [https://railway.app](https://railway.app)
2. Crea un nuevo proyecto con PostgreSQL

**Pros**: Facil de usar, buen CLI
**Contras**: $5/mes minimo despues del trial

---

## Checklist Final

- [ ] Base de datos creada en Neon
- [ ] Connection string copiado
- [ ] Repositorio en GitHub
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Build exitoso
- [ ] Migraciones ejecutadas (`prisma db push`)
- [ ] Seed ejecutado (`prisma db seed`)
- [ ] Aplicacion funcionando correctamente
- [ ] (Opcional) Dominio personalizado configurado

---

_Ultima actualizacion: Enero 2026_
