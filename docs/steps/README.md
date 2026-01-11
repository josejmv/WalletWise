# WalletWise - Versiones del Proyecto

> Historial de versiones y roadmap de desarrollo

---

## Versiones

| Version               | Nombre              | Estado        | Descripcion                               |
| --------------------- | ------------------- | ------------- | ----------------------------------------- |
| [v1.x](./v1.md)       | Single User Edition | Completado    | Dashboard de finanzas personales completo |
| [v1.2.0](./v1.2.0.md) | Bugfixes & UX       | Completado    | Correcciones y mejoras de UX              |
| [v1.3.0](./v1.3.0.md) | Post-Testing Fixes  | En Desarrollo | Correcciones post-testing y mejoras UX    |
| [v2.0.0](./v2.0.0.md) | Multi-User Edition  | Planificado   | Autenticacion y soporte multi-usuario     |

---

## Version Actual: v1.3.0 (En Desarrollo)

Correcciones post-testing y mejoras de UX:

- Simplificacion de criptomonedas (solo USDT)
- Fix modelo de presupuestos (bloqueo sin mover dinero)
- Fix conversiones con tasas custom
- Formularios mejorados (selects preseleccionados, inputs sin default)
- CRUD completo de tipos de cuenta
- Nueva pagina de historial de transacciones
- Exportacion shopping list (PDF, WhatsApp)
- Personalizacion del sidebar

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
| 1.3.0   | MINOR | Post-testing fixes, historial, exportacion    |
| 2.0.0   | MAJOR | Multi-usuario con autenticacion (planificado) |

---

_Documentacion de versiones de WalletWise_
