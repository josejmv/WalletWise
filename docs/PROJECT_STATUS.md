# WalletWise - Estado del Proyecto

> Resumen del progreso de desarrollo

---

## Version Actual

| Metrica      | Valor      |
| ------------ | ---------- |
| Version      | 1.6.0      |
| Estado       | Completado |
| Build Status | OK         |

---

## Proxima Version: v2.0.0 (Planificado)

Transformacion a multi-usuario con:

- CI/CD y semantic versioning automatizado
- Landing page profesional
- Paginas legales (Venezuela)
- Sistema de autenticacion (Auth.js v5)
- WebAuthn/Passkeys + 2FA TOTP
- Encriptacion E2E para datos sensibles
- Onboarding guiado
- Delete account con export

Ver [docs/steps/v2/](./steps/v2/) para detalles completos.

---

## Funcionalidades Implementadas (v1.x)

### Core (v1.0.0)

- [x] Dashboard con KPIs y graficos
- [x] Gestion de cuentas (banco, efectivo, digital, credito)
- [x] Registro de ingresos con trabajos
- [x] Registro de gastos unicos y recurrentes
- [x] Transferencias entre cuentas
- [x] Presupuestos (goal y envelope)
- [x] Categorias jerarquicas
- [x] Inventario con historial de precios
- [x] Lista de compras
- [x] Backup/restore completo
- [x] Export PDF/CSV/JSON
- [x] Paginacion en listados

### Mejoras (v1.1.0)

- [x] Criptomonedas (simplificado a solo USDT)
- [x] Tasas Binance P2P
- [x] Cooldown 6 horas en sync
- [x] Tasa custom en formularios
- [x] Sidebar con dropdowns
- [x] Dashboard mejorado (quick actions, widgets)
- [x] Budgets con bloqueo de saldo
- [x] Transfers account-budget
- [x] Vista cuentas con disponible/bloqueado
- [x] Settings (moneda base, formato fecha/numeros, tema)
- [x] Formatters centralizados (UserConfigContext)
- [x] Historial con tasas (columna + popover)

### Correcciones y UX (v1.2.0)

- [x] Cache e invalidacion de queries
- [x] Tasas de cambio mejoradas (sync todo, inversas, cooldown separado)
- [x] Conversiones a moneda base (KPIs, tendencias, reportes)
- [x] Formula de ahorro corregida
- [x] Calculo disponible corregido
- [x] Transacciones recientes con contribuciones/retiros budget
- [x] Tema persistente
- [x] InlineAccountModal
- [x] Cuentas en formato tabla
- [x] Categorias expandibles
- [x] Inventario con categoria opcional
- [x] Shopping list multi-moneda

### Post-Testing y UX (v1.3.0)

- [x] Solo USDT como cripto (simplificar)
- [x] USDT-USD tasa fija 1:1
- [x] Botones sync con cooldown visual y countdown
- [x] Fix inventario (categoryId null, preseleccion)
- [x] Fix modelo presupuestos (bloqueo sin mover dinero)
- [x] Account Types CRUD completo
- [x] Historial de precios mejorado con graficos
- [x] Shopping list: exportar PDF y WhatsApp
- [x] Nueva pagina historial de transacciones
- [x] Personalizacion sidebar (orden dinamico)

### Mejoras y Features (v1.4.0)

- [x] Ingresos extra sin trabajo asociado
- [x] DatePicker mejorado (flechas arriba)
- [x] Estado de carga entre paginas (NProgress)
- [x] Modal de consumo de inventario
- [x] Rutas de conversion alternativas (USD, USDT como intermediarios)
- [x] Responsive completo

### Calculadora y Conversiones (v1.5.0)

- [x] Nueva pagina calculadora con teclado numerico
- [x] Parser de expresiones matematicas (expr-eval)
- [x] Conversion multi-moneda en tiempo real
- [x] Selector de monedas destino con persistencia
- [x] Tasas calculadas via intermediarios

### Polish & Improvements (v1.6.0)

- [x] Sidebar con accordion exclusivo (scroll fix)
- [x] Dropdown categorias con scroll interno
- [x] Ahorro por tasas custom corregido
- [x] Colores pasteles en modo oscuro
- [x] Fondo gris #2a2a2a en modo oscuro
- [x] Comparacion de tasas en lista compacta
- [x] Balance por cuenta con conversion a USD
- [x] Sistema de vueltos para gastos e ingresos
- [x] Seleccion jerarquica de categorias
- [x] Dialogs con max-height y scroll interno
- [x] KPI cards con estilos y colores por tipo
- [x] Columna de equivalente en cuentas
- [x] Card Total con selector de moneda
- [x] Grafica por categorias padre
- [x] Boton actualizar precio en inventario
- [x] Gastos pendientes filtrados por mes actual

---

## Roadmap v2.x (Planificado)

| Version | Contenido | Estado |
|---------|-----------|--------|
| v2.0.0 | CI/CD + Landing + Legal | Planificado |
| v2.1.0 | Auth Base (email/password + Google) | Planificado |
| v2.2.0 | Auth Avanzado (WebAuthn + 2FA) | Planificado |
| v2.3.0 | Multi-Usuario (migracion) | Planificado |
| v2.4.0 | E2E Encryption | Planificado |
| v2.5.0 | Onboarding | Planificado |
| v2.6.0 | Delete Account + Polish | Planificado |

---

## Stack Tecnologico

| Tecnologia     | Version |
| -------------- | ------- |
| Next.js        | 16      |
| React          | 19      |
| TypeScript     | 5.x     |
| Tailwind CSS   | 4       |
| TanStack Query | 5.x     |
| Prisma         | 6       |
| PostgreSQL     | 16      |
| Recharts       | 2.x     |

---

## Estructura del Proyecto

```
app/
├── dashboard/              # Rutas del dashboard
│   ├── page.tsx            # Dashboard principal
│   ├── _components/        # Componentes del dashboard
│   ├── accounts/
│   ├── budgets/
│   ├── calculator/
│   ├── categories/
│   ├── currencies/
│   ├── exchange-rates/
│   ├── expenses/
│   ├── incomes/
│   ├── inventory/
│   ├── jobs/
│   ├── reports/
│   ├── settings/
│   ├── transactions/
│   └── transfers/
└── api/                    # REST endpoints
```

---

## Documentacion

| Documento | Descripcion |
| --------- | ----------- |
| [README.md](./README.md) | Indice de documentacion |
| [SETUP.md](./SETUP.md) | Guia de instalacion |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitectura |
| [API.md](./API.md) | Referencia de endpoints |
| [steps/v1/](./steps/v1/) | Documentacion v1.x |
| [steps/v2/](./steps/v2/) | Documentacion v2.x |

---

## Comandos

```bash
# Desarrollo
yarn dev              # Servidor desarrollo
yarn build            # Build produccion
yarn lint             # Linter

# Base de datos
yarn db:generate      # Generar cliente Prisma
yarn db:migrate       # Aplicar migraciones
yarn db:seed          # Datos iniciales
yarn db:studio        # Prisma Studio
```

---

_WalletWise v1.6.0 - Estado del Proyecto (Actualizado 2026-01-18)_
