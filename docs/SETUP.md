# Guia de Setup del Proyecto

Documentacion del flujo de instalacion y configuracion inicial del proyecto WalletWise.

---

## Requisitos Previos

| Software       | Version   |
| -------------- | --------- |
| Node.js        | >= 20.x   |
| Docker         | >= 24.x   |
| Docker Compose | >= 2.x    |
| Yarn           | >= 1.22.x |

---

## 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd finanzas-jmv
```

---

## 2. Instalar Dependencias

```bash
yarn install
```

---

## 3. Configurar Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Variables requeridas:

```env
# Base de datos
DATABASE_URL="postgresql://walletwise:walletwise_secret@localhost:5432/walletwise"
DB_PASSWORD="walletwise_secret"

# API Externa
EXCHANGE_RATE_API_KEY="tu_api_key_aqui"

# Aplicacion
NEXT_PUBLIC_APP_NAME="WalletWise"
NEXT_PUBLIC_BASE_CURRENCY="USD"
```

### Obtener API Key de Exchange Rate

1. Visitar [ExchangeRate-API](https://www.exchangerate-api.com/)
2. Registrarse para obtener una API key gratuita
3. Copiar la key al archivo `.env`

---

## 4. Levantar Servicios con Docker

```bash
docker-compose up -d
```

Esto levanta:

- **PostgreSQL** en puerto `5432`
- **Adminer** en puerto `8080` (UI para gestionar la DB)

### Verificar servicios

```bash
docker-compose ps
```

Deberias ver ambos servicios en estado `running`.

### Acceder a Adminer

Abrir `http://localhost:8080` en el navegador:

| Campo    | Valor             |
| -------- | ----------------- |
| Sistema  | PostgreSQL        |
| Servidor | db                |
| Usuario  | walletwise        |
| Password | walletwise_secret |
| Base     | walletwise        |

---

## 5. Inicializar Base de Datos

### Generar cliente Prisma

```bash
yarn db:generate
```

### Opcion A: Desarrollo (sin migraciones)

Usa `db push` para sincronizar el schema directamente:

```bash
yarn db:push
```

### Opcion B: Produccion (con migraciones)

Genera y aplica migraciones:

```bash
yarn db:migrate
```

---

## 6. Ejecutar el Seed

El seed crea los datos iniciales necesarios para que el sistema funcione:

```bash
yarn db:seed
```

### Datos creados por el seed:

| Tipo            | Cantidad | Descripcion                           |
| --------------- | -------- | ------------------------------------- |
| Monedas         | 3        | USD (base), COP, VES                  |
| Tipos de cuenta | 4        | Banco, Efectivo, Digital, Credito     |
| Categorias      | 9        | Vivienda, Alimentacion, Transporte... |
| Subcategorias   | 30+      | Arriendo, Mercado, Gasolina...        |

---

## 7. Iniciar el Servidor de Desarrollo

```bash
yarn dev
```

El servidor estara disponible en: `http://localhost:3000`

---

## Flujo Completo (Resumen)

```bash
# 1. Instalar dependencias
yarn install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu API key

# 3. Levantar Docker
docker-compose up -d

# 4. Generar cliente Prisma
yarn db:generate

# 5. Sincronizar schema
yarn db:push

# 6. Ejecutar seed
yarn db:seed

# 7. Iniciar servidor
yarn dev
```

---

## Resetear Base de Datos

Si necesitas empezar desde cero:

```bash
# Opcion 1: Eliminar y recrear contenedores
docker-compose down -v
docker-compose up -d
yarn db:push
yarn db:seed

# Opcion 2: Solo resetear datos (mantiene schema)
yarn db:reset
```

---

## Comandos Utiles

### Prisma

| Comando            | Descripcion                              |
| ------------------ | ---------------------------------------- |
| `yarn db:generate` | Regenera el cliente Prisma               |
| `yarn db:push`     | Sincroniza schema con la DB (desarrollo) |
| `yarn db:migrate`  | Crea y aplica migracion                  |
| `yarn db:seed`     | Ejecuta el archivo seed.ts               |
| `yarn db:studio`   | Abre interfaz visual de la DB            |
| `yarn db:reset`    | Resetea DB y aplica migraciones + seed   |

### Next.js

| Comando      | Descripcion                   |
| ------------ | ----------------------------- |
| `yarn dev`   | Inicia servidor de desarrollo |
| `yarn build` | Construye la aplicacion       |
| `yarn start` | Inicia servidor de produccion |
| `yarn lint`  | Ejecuta ESLint                |

### Docker

| Comando                  | Descripcion                     |
| ------------------------ | ------------------------------- |
| `docker-compose up -d`   | Levanta servicios en background |
| `docker-compose down`    | Detiene servicios               |
| `docker-compose down -v` | Detiene y elimina volumenes     |
| `docker-compose ps`      | Ver estado de servicios         |
| `docker-compose logs db` | Ver logs de PostgreSQL          |

---

## Solucion de Problemas

### Error: "relation does not exist"

La base de datos no tiene el schema. Ejecuta:

```bash
yarn db:push
```

### Error: "password authentication failed"

Verifica que Docker este corriendo y las credenciales en `.env` coincidan con `docker-compose.yml`.

### Error de conexion a la base de datos

Verifica que PostgreSQL este corriendo:

```bash
docker-compose ps
docker-compose logs db
```

### Seed falla por duplicados

El seed usa `upsert`, por lo que puede ejecutarse multiples veces sin problemas. Si hay errores, resetea:

```bash
yarn db:reset
```

### Puerto 5432 en uso

Otro proceso esta usando el puerto de PostgreSQL. Opciones:

1. Detener el proceso que usa el puerto
2. Cambiar el puerto en `docker-compose.yml`:
   ```yaml
   ports:
     - "5433:5432"
   ```
   Y actualizar `DATABASE_URL` en `.env`

### Puerto 3000 en uso

Otro proceso esta usando el puerto de Next.js. Opciones:

1. Detener el proceso
2. Usar otro puerto: `yarn dev -p 3001`

---

## Estructura de Archivos de Configuracion

```
finanzas-jmv/
├── .env                    # Variables de entorno (no commitear)
├── .env.example            # Template de variables
├── docker-compose.yml      # Configuracion de Docker
├── package.json            # Dependencias y scripts
├── tsconfig.json           # Configuracion TypeScript
├── next.config.ts          # Configuracion Next.js
├── tailwind.config.ts      # Configuracion Tailwind
└── prisma/
    ├── schema.prisma       # Definicion del schema
    └── seed.ts             # Script de seed
```

---

## Ver tambien

- [README](./README.md) - Indice principal de documentacion
- [CONTEXT](./CONTEXT.md) - Contexto del proyecto
- [ARCHITECTURE](./ARCHITECTURE.md) - Arquitectura del sistema
- [API](./API.md) - Referencia de endpoints
