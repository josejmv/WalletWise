# WalletWise v1.x - Single User Edition

> Dashboard de Finanzas Personales - Version Single User

**Estado General:** Completado
**Version Actual:** v1.6.0

---

## Resumen

La version 1.x es la version single-user de WalletWise, un dashboard completo de finanzas personales con soporte multi-moneda.

---

## Versiones

| Version | Nombre | Contenido | Estado |
|---------|--------|-----------|--------|
| [v1.md](./v1.md) | Base | Dashboard completo, todos los modulos | Completado |
| [v1.2.0](./v1.2.0.md) | Bugfixes & UX | Cache, tasas inversas, UI mejorada | Completado |
| [v1.3.0](./v1.3.0.md) | Post-Testing | Historial, exportacion, sidebar dinamico | Completado |
| [v1.4.0](./v1.4.0.md) | Features | Responsive, ingresos extra, consumo inventario | Completado |
| [v1.5.0](./v1.5.0.md) | Calculator | Calculadora multi-moneda | Completado |
| [v1.6.0](./v1.6.0.md) | Polish | Sistema vueltos, KPI cards, mejoras UI | Completado |

---

## Features Principales

### Modulos Core

| Modulo | Descripcion |
|--------|-------------|
| Dashboard | KPIs, graficos, transacciones recientes |
| Accounts | Cuentas bancarias, efectivo, billeteras, tarjetas |
| Jobs | Trabajos fijos y freelance |
| Incomes | Registro de ingresos con vueltos |
| Expenses | Gastos unicos y recurrentes con vueltos |
| Transfers | Transferencias entre cuentas y budgets |
| Budgets | Presupuestos goal y envelope con bloqueo |
| Categories | Categorias jerarquicas |
| Exchange Rates | Tasas API oficial + Binance P2P |
| Inventory | Items con historial de precios |
| Reports | Export PDF, CSV, JSON |
| Calculator | Calculadora con conversiones |

### Sistema Multi-Moneda

| Tipo | Monedas |
|------|---------|
| Fiat | USD, COP, VES |
| Crypto | USDT |

### Caracteristicas Especiales

- Tasas de cambio en tiempo real
- Tasas inversas automaticas
- Rutas de conversion intermedias
- Sistema de vueltos multi-moneda
- Sidebar personalizable
- Tema claro/oscuro/sistema
- Responsive mobile

---

## Stack Tecnologico

| Capa | Tecnologia |
|------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Estilos | Tailwind CSS 4 |
| Estado | TanStack Query |
| Backend | Next.js API Routes |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 |
| Graficos | Recharts |
| PDF | jsPDF |

---

## Limitaciones

| Limitacion | Descripcion |
|------------|-------------|
| Single User | Solo un usuario puede usar el sistema |
| Sin Auth | No hay login ni registro |
| Sin Encryption | Datos no encriptados |

Estas limitaciones se resuelven en [v2.x](../v2/README.md).

---

## Migracion a v2.x

Los datos de v1.x se pueden migrar a v2.x:

1. Se asignan a un usuario
2. Se encriptan en cliente

Ver [v2.3.0](../v2/v2.3.0.md) para detalles.

---

_WalletWise v1.6.0 - Single User Edition (Completado)_
