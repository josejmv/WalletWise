# WalletWise - Versiones del Proyecto

> Historial de versiones y roadmap de desarrollo

---

## Estructura de Versiones

| Carpeta | Descripcion | Estado |
|---------|-------------|--------|
| [v1/](./v1/) | Single User Edition | Completado |
| [v2/](./v2/) | Multi-User Edition | Planificado |

---

## Version 1.x - Single User Edition

Dashboard de finanzas personales completo para un solo usuario.

| Version | Nombre | Estado |
|---------|--------|--------|
| [v1.md](./v1/v1.md) | Base + Mejoras v1.0-1.1 | Completado |
| [v1.2.0](./v1/v1.2.0.md) | Bugfixes & UX | Completado |
| [v1.3.0](./v1/v1.3.0.md) | Post-Testing Fixes | Completado |
| [v1.4.0](./v1/v1.4.0.md) | Features & Responsive | Completado |
| [v1.5.0](./v1/v1.5.0.md) | Calculator & Conversions | Completado |
| [v1.6.0](./v1/v1.6.0.md) | Polish & Improvements | Completado |

**Version Actual:** v1.6.0 (Completado)

---

## Version 2.x - Multi-User Edition (Planificado)

Transformacion a aplicacion multi-usuario con autenticacion y encriptacion E2E.

| Version | Nombre | Contenido | Estado |
|---------|--------|-----------|--------|
| [v2.0.0](./v2/v2.0.0.md) | CI/CD + Landing | Semantic versioning, landing page, legal | Planificado |
| [v2.1.0](./v2/v2.1.0.md) | Auth Base | Auth.js, email/password, Google OAuth | Planificado |
| [v2.2.0](./v2/v2.2.0.md) | Auth Avanzado | WebAuthn (Passkeys), 2FA TOTP | Planificado |
| [v2.3.0](./v2/v2.3.0.md) | Multi-Usuario | userId en entidades, migracion | Planificado |
| [v2.4.0](./v2/v2.4.0.md) | E2E Encryption | Encriptacion de datos sensibles | Planificado |
| [v2.5.0](./v2/v2.5.0.md) | Onboarding | Sistema de onboarding guiado | Planificado |
| [v2.6.0](./v2/v2.6.0.md) | Polish | Delete account, testing, QA | Planificado |

**Proxima Version:** v2.0.0 (Planificado)

---

## Versionado Semantico

Seguimos [SemVer](https://semver.org/):

- **MAJOR** (X.0.0): Cambios que rompen compatibilidad
- **MINOR** (0.X.0): Nuevas features retrocompatibles
- **PATCH** (0.0.X): Bugfixes retrocompatibles

---

## Historial de Releases

| Version | Tipo  | Fecha | Descripcion |
|---------|-------|-------|-------------|
| 1.0.0 | MAJOR | Diciembre 2025 | Version inicial single-user |
| 1.1.0 | MINOR | Diciembre 2025 | Crypto, tasas mejoradas, budgets |
| 1.2.0 | MINOR | Enero 2026 | Bugfixes, cache, tasas inversas |
| 1.3.0 | MINOR | Enero 2026 | Post-testing, historial, exportacion |
| 1.4.0 | MINOR | Enero 2026 | Ingresos extra, consumo, responsive |
| 1.5.0 | MINOR | Enero 2026 | Calculadora multi-moneda |
| 1.6.0 | MINOR | Enero 2026 | Sistema vueltos, mejoras UI |
| 2.0.0 | MAJOR | Pendiente | Multi-usuario + autenticacion |

---

## Estructura de Carpetas

```
docs/steps/
├── README.md           # Este archivo
├── v1/
│   ├── README.md       # Indice v1.x
│   ├── v1.md           # v1.0.0 - v1.1.0
│   ├── v1.2.0.md
│   ├── v1.3.0.md
│   ├── v1.4.0.md
│   ├── v1.5.0.md
│   └── v1.6.0.md
└── v2/
    ├── README.md       # Indice v2.x
    ├── v2.0.0.md       # CI/CD + Landing + Legal
    ├── v2.1.0.md       # Auth Base
    ├── v2.2.0.md       # Auth Avanzado
    ├── v2.3.0.md       # Multi-Usuario
    ├── v2.4.0.md       # E2E Encryption
    ├── v2.5.0.md       # Onboarding
    └── v2.6.0.md       # Delete Account + Polish
```

---

## Documentacion por Version

Cada archivo de version contiene:

1. **Descripcion** - Objetivo de la version
2. **Features** - Lista de funcionalidades incluidas
3. **Archivos** - Archivos nuevos/modificados
4. **Schema** - Cambios en base de datos
5. **Verificacion** - Checklist de pruebas
6. **Migracion** - Comandos de migracion

---

_Documentacion de versiones de WalletWise_
