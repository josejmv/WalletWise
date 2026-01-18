# WalletWise v2.x - Multi-User Edition

> Transformacion de WalletWise a aplicacion multi-usuario

**Estado General:** Planificado
**Tipo:** MAJOR Release

---

## Resumen

La version 2.x transforma WalletWise de una aplicacion single-user a una plataforma multi-usuario completa con:

- Sistema de autenticacion robusto
- Encriptacion de extremo a extremo
- Onboarding guiado
- Aislamiento completo de datos

---

## Versiones

| Version | Nombre | Contenido | Estado |
|---------|--------|-----------|--------|
| [v2.0.0](./v2.0.0.md) | CI/CD + Landing | Semantic versioning, landing page, paginas legales | Planificado |
| [v2.1.0](./v2.1.0.md) | Auth Base | Auth.js v5, email/password, Google OAuth | Planificado |
| [v2.2.0](./v2.2.0.md) | Auth Avanzado | WebAuthn (Passkeys), 2FA TOTP | Planificado |
| [v2.3.0](./v2.3.0.md) | Multi-Usuario | userId en entidades, migracion, aislamiento | Planificado |
| [v2.4.0](./v2.4.0.md) | E2E Encryption | Encriptacion de datos sensibles | Planificado |
| [v2.5.0](./v2.5.0.md) | Onboarding | Sistema de onboarding guiado | Planificado |
| [v2.6.0](./v2.6.0.md) | Polish | Delete account, testing, QA | Planificado |

---

## Decisiones Tecnicas

| Aspecto | Decision |
|---------|----------|
| Auth Provider | Auth.js v5 (NextAuth) |
| Login Methods | Email/password + Google OAuth + WebAuthn |
| 2FA | TOTP con Google Authenticator (opcional) |
| Encryption | AES-GCM 256-bit con PBKDF2 key derivation |
| Hosting | Vercel + Neon PostgreSQL |
| Monetizacion | Gratuito, sin planes de pago |

---

## Dependencias Nuevas (Acumuladas)

```json
{
  "dependencies": {
    "next-auth": "^5.0.0-beta.25",
    "@auth/prisma-adapter": "^2.7.4",
    "bcryptjs": "^2.4.3",
    "@simplewebauthn/browser": "^10.0.0",
    "@simplewebauthn/server": "^10.0.0",
    "otplib": "^12.0.1",
    "qrcode": "^1.5.4"
  },
  "devDependencies": {
    "semantic-release": "^23.0.0",
    "@semantic-release/changelog": "^6.0.3",
    "@semantic-release/git": "^10.0.1",
    "commitlint": "^18.6.0",
    "@commitlint/config-conventional": "^18.6.0",
    "husky": "^9.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/qrcode": "^1.5.5"
  }
}
```

---

## Variables de Entorno Nuevas

```env
# Auth.js
AUTH_SECRET=your-auth-secret-min-32-chars
AUTH_URL=http://localhost:3000

# Google OAuth
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# WebAuthn
WEBAUTHN_RP_ID=localhost
WEBAUTHN_RP_NAME=WalletWise
WEBAUTHN_ORIGIN=http://localhost:3000
```

---

## Modelos Prisma Nuevos

### User y Auth

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  password      String?
  name          String?
  image         String?

  // WebAuthn & 2FA
  authenticators   Authenticator[]
  webauthnEnabled  Boolean @default(false)
  totpSecret       String?
  totpEnabled      Boolean @default(false)

  // Encryption
  encryptionKeySalt    String?
  recoveryKeyEncrypted String?

  // Relations
  authAccounts  AuthAccount[]
  sessions      Session[]
  // ... app relations
}

model AuthAccount { ... }
model Session { ... }
model VerificationToken { ... }
model Authenticator { ... }
model OnboardingProgress { ... }
```

---

## Arquitectura de Seguridad

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTE                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Password │→ │ PBKDF2   │→ │ Master   │              │
│  │          │  │          │  │ Key      │              │
│  └──────────┘  └──────────┘  └────┬─────┘              │
│                                    │                     │
│  ┌──────────┐  ┌──────────┐  ┌────▼─────┐              │
│  │ Data     │→ │ AES-GCM  │→ │Encrypted │→ API        │
│  │ (plain)  │  │ Encrypt  │  │ Data     │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     SERVIDOR                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Auth.js  │  │ Prisma   │  │ Database │              │
│  │ Validate │→ │ Store    │→ │ (Neon)   │              │
│  │ Session  │  │ Encrypted│  │ Encrypted│              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  * El servidor NUNCA ve datos desencriptados            │
│  * Solo almacena ciphertext + IV                        │
└─────────────────────────────────────────────────────────┘
```

---

## Checklist de Seguridad

- [ ] Passwords hasheados con bcrypt (12 rounds)
- [ ] AUTH_SECRET de 32+ caracteres
- [ ] HTTPS en produccion
- [ ] Cookies: HttpOnly, Secure, SameSite=Lax
- [ ] Rate limiting en auth endpoints
- [ ] CSRF protection via Auth.js
- [ ] Headers de seguridad en next.config.ts
- [ ] Input validation con Zod
- [ ] E2E encryption funcionando
- [ ] Aislamiento de datos por usuario

---

## Orden de Implementacion

```
v2.0.0 ──┐
         │
         ▼
v2.1.0 ──┐
         │
         ▼
v2.2.0 ──┐
         │
         ▼
v2.3.0 ──┐  (Breaking: Schema changes)
         │
         ▼
v2.4.0 ──┐
         │
         ▼
v2.5.0 ──┐
         │
         ▼
v2.6.0 ──► Release Final
```

---

## Breaking Changes desde v1.x

| Area | Cambio |
|------|--------|
| Schema | Todas las entidades tienen userId |
| API | Todos los endpoints requieren autenticacion |
| Datos | Datos encriptados en cliente |
| Backups | Backups v1.x no son compatibles |

---

## Migracion de Datos

Los datos existentes de v1.x se migraran automaticamente:

1. Script asigna datos al primer usuario creado
2. Usuario debe configurar encryption despues
3. Backup recomendado antes de migrar

Ver [v2.3.0.md](./v2.3.0.md) para detalles de migracion.

---

_WalletWise v2.x - Multi-User Edition (Planificado)_
