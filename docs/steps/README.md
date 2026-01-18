# WalletWise - Versiones del Proyecto

> Historial de versiones y roadmap de desarrollo

---

## Versiones

| Version               | Nombre                   | Estado      | Descripcion                               |
| --------------------- | ------------------------ | ----------- | ----------------------------------------- |
| [v1.x](./v1.md)       | Single User Edition      | Completado  | Dashboard de finanzas personales completo |
| [v1.2.0](./v1.2.0.md) | Bugfixes & UX            | Completado  | Correcciones y mejoras de UX              |
| [v1.3.0](./v1.3.0.md) | Post-Testing Fixes       | Completado  | Correcciones post-testing y mejoras UX    |
| [v1.4.0](./v1.4.0.md) | Features & Responsive    | Completado  | Nuevas funcionalidades y diseño responsive |
| [v1.5.0](./v1.5.0.md) | Calculator & Conversions | Completado  | Calculadora con conversiones multi-moneda |
| [v1.6.0](./v1.6.0.md) | Polish & Improvements    | Completado  | Mejoras visuales, sistema de vueltos y fixes |
| [v2.0.0](./v2.0.0.md) | Multi-User Edition       | Planificado | Autenticacion y soporte multi-usuario     |

---

## Version Actual: v1.6.0 (Completado)

Mejoras visuales, sistema de vueltos y fixes:

- Sistema de vueltos multi-moneda para gastos e ingresos
- KPI cards con estilos visuales y colores por tipo
- Columna de equivalente en moneda base en cuentas
- Card "Total en Cuentas" con selector de moneda
- Grafica de gastos por categoria padre/singleton
- Gastos pendientes filtrados por mes actual
- Boton de actualizar precio en inventario
- Fixes de validacion, dark mode y cache de tasas

---

## Proxima Version: v2.0.0 (Planificado)

Transformacion a multi-usuario:

- Ver [docs/steps/v2.0.0.md](./v2.0.0.md) para detalles

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

| Version | Tipo  | Fecha          | Descripcion                                   |
| ------- | ----- | -------------- | --------------------------------------------- |
| 1.0.0   | MAJOR | Diciembre 2025 | Version inicial single-user                   |
| 1.1.0   | MINOR | Diciembre 2025 | Crypto, tasas mejoradas, budgets, settings    |
| 1.2.0   | MINOR | Enero 2026     | Bugfixes, cache, tasas inversas, UI mejorada  |
| 1.3.0   | MINOR | Enero 2026     | Post-testing fixes, historial, exportacion    |
| 1.4.0   | MINOR | Enero 2026     | Ingresos extra, consumo inventario, responsive|
| 1.5.0   | MINOR | Enero 2026     | Calculadora, conversiones intermedias         |
| 1.6.0   | MINOR | Enero 2026     | Sistema vueltos, mejoras UI, fixes            |
| 2.0.0   | MAJOR | Pendiente      | Multi-usuario con autenticacion (planificado) |

---

_Documentacion de versiones de WalletWise_
