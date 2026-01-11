# WalletWise - Versiones del Proyecto

> Historial de versiones y roadmap de desarrollo

---

## Versiones

| Version               | Nombre              | Estado      | Descripcion                               |
| --------------------- | ------------------- | ----------- | ----------------------------------------- |
| [v1.x](./v1.md)       | Single User Edition | Completado  | Dashboard de finanzas personales completo |
| [v1.2.0](./v1.2.0.md) | Bugfixes & UX       | Completado  | Correcciones y mejoras de UX              |
| [v2.0.0](./v2.0.0.md) | Multi-User Edition  | Planificado | Autenticacion y soporte multi-usuario     |

---

## Version Actual: v1.2.0 (Completado)

La version 1.x incluye todas las funcionalidades base mas las mejoras incrementales:

- Dashboard con KPIs y graficos
- Gestion de cuentas multi-moneda (fiat y crypto)
- Ingresos, gastos y transferencias
- Presupuestos con bloqueo de saldo
- Sistema de tasas de cambio (API oficial + Binance P2P)
- Inventario y lista de compras
- Reportes con export PDF/CSV
- Configuracion de usuario personalizable

---

## Proxima Version: v2.0.0

La version 2.0.0 agregara:

- Sistema de autenticacion (login/registro)
- Soporte multi-usuario
- Aislamiento de datos por usuario
- Landing page publica
- OAuth providers (Google, GitHub)

---

## Estructura de Documentacion

Cada archivo de version contiene:

1. **Descripcion** - Objetivo de la version
2. **Features** - Lista de funcionalidades incluidas
3. **Stack** - Tecnologias utilizadas
4. **Arquitectura** - Estructura de carpetas y modelos
5. **Endpoints** - APIs disponibles
6. **Componentes** - Componentes principales

---

## Versionado Semantico

Seguimos [SemVer](https://semver.org/):

- **MAJOR** (X.0.0): Cambios que rompen compatibilidad
- **MINOR** (0.X.0): Nuevas features retrocompatibles
- **PATCH** (0.0.X): Bugfixes retrocompatibles

### Historial

| Version | Tipo  | Descripcion                                   |
| ------- | ----- | --------------------------------------------- |
| 1.0.0   | MAJOR | Version inicial single-user                   |
| 1.1.0   | MINOR | Crypto, tasas mejoradas, budgets, settings    |
| 1.2.0   | MINOR | Bugfixes, cache, tasas inversas, UI mejorada  |
| 2.0.0   | MAJOR | Multi-usuario con autenticacion (planificado) |

---

_Documentacion de versiones de WalletWise_
