# [1.3.0](https://github.com/josejmv/WalletWise/compare/v1.2.1...v1.3.0) (2026-01-19)


### Bug Fixes

* **auth:** redirect to login when session expires on back navigation ([8fe5f6f](https://github.com/josejmv/WalletWise/commit/8fe5f6ff2ef6eb117c1bf7be5b0ca0380e621fcd))
* **auth:** require 2fa verification on every login ([93e681a](https://github.com/josejmv/WalletWise/commit/93e681a0e8270a662b88f713a54922f0ac54acd3))


### Features

* **auth:** add set password for oauth accounts and improve webauthn errors ([43a6495](https://github.com/josejmv/WalletWise/commit/43a6495532b7d428675f152cbb1aaefdee285180))

## [1.2.1](https://github.com/josejmv/WalletWise/compare/v1.2.0...v1.2.1) (2026-01-19)


### Bug Fixes

* **auth:** fix double json parse in webauthn authenticate ([dd48afb](https://github.com/josejmv/WalletWise/commit/dd48afb5a3f4958c960761e7de21977cc32c3bb5))

# [1.2.0](https://github.com/josejmv/WalletWise/compare/v1.1.0...v1.2.0) (2026-01-19)


### Bug Fixes

* **scripts:** handle UserConfig unique constraint in migration ([08bcaf7](https://github.com/josejmv/WalletWise/commit/08bcaf70451d7d401139fb0f6d98f8e7fc83b4f6))


### Features

* **auth:** add webauthn login and 2fa verification flow ([36c0a78](https://github.com/josejmv/WalletWise/commit/36c0a7801787c99ba89983d5fd53f5e713dcea8e))

# [1.1.0](https://github.com/josejmv/WalletWise/compare/v1.0.0...v1.1.0) (2026-01-19)


### Bug Fixes

* **auth:** convert session_state JsonValue to string for prisma ([fedb9d2](https://github.com/josejmv/WalletWise/commit/fedb9d288b1ec342b9c58e44ff99a3721655f5a3))
* **auth:** fix getAccount return type for AdapterAccount compatibility ([35f87b1](https://github.com/josejmv/WalletWise/commit/35f87b1c312f8e05bc7d1dd719f987a2fc656570))
* **auth:** resolve typescript errors in auth and multi-user modules ([c25fac1](https://github.com/josejmv/WalletWise/commit/c25fac1a011cf5041e61c863f06f454dce3822b0))
* **auth:** simplify custom adapter with proper Adapter type ([7d86b09](https://github.com/josejmv/WalletWise/commit/7d86b093d477b8b166ff81213725d812131484d4))


### Features

* **auth:** add multi-user support with nextauth, 2fa and webauthn ([df21b3e](https://github.com/josejmv/WalletWise/commit/df21b3e41a66bcbabb9fd4f5f33ab6f0c7004d49))
* **landing:** add landing page with hero, features, security, FAQ, CTA, and footer ([269fa7d](https://github.com/josejmv/WalletWise/commit/269fa7d0178c06d0905daa9e28eb255481e2bb0c))
* **legal:** add privacy, terms, and confidentiality pages ([1cc0eaf](https://github.com/josejmv/WalletWise/commit/1cc0eaf0e49f6d20650c3ad561f1f4d011030e54))

# 1.0.0 (2026-01-19)


### Bug Fixes

* **backup:** handle ID mapping for seed conflicts and FK ordering ([8a78639](https://github.com/josejmv/WalletWise/commit/8a786392320bff42778c3f0337fd662c3ab9ed6d))
* **backup:** remove non-existent isPaid field and fix required currencyId ([ad26a89](https://github.com/josejmv/WalletWise/commit/ad26a8984d2c2d826989f0bc096bddda7dbe3ac8))
* **backup:** use undefined instead of null for optional prisma fields ([8c653d4](https://github.com/josejmv/WalletWise/commit/8c653d4ce16e138f47dc76282c7d387e0f7fc404))
* **change-system:** fix all undefined watchedChangeAmount usages ([6a8aad4](https://github.com/josejmv/WalletWise/commit/6a8aad4a6ece435a3fa8a38429db10df0db4cea9))
* **change-system:** fix undefined watchedChangeAmount and update docs ([66cabc9](https://github.com/josejmv/WalletWise/commit/66cabc9a5ada86c9e6401fc3e58b19e3bf9d9c15))
* **change-system:** handle empty string in optional UUID fields ([b41374d](https://github.com/josejmv/WalletWise/commit/b41374dbf8d8a6b82ce7b2d85dd7215e299c2178))
* **ci:** disable husky hooks in release workflow ([74278ae](https://github.com/josejmv/WalletWise/commit/74278ae66d2aa37f9c84c8a2b944f61e0ace05d4))


### Features

* **accounts:** add equivalent balance column in base currency ([e7a8594](https://github.com/josejmv/WalletWise/commit/e7a8594e30651fed3b966ebbb7b09b4e8ed08cb4))
* **accounts:** add total in accounts card with currency selector ([721d8e7](https://github.com/josejmv/WalletWise/commit/721d8e7460f6ef62055da3c0d6664f59eb2bd5ef))
* **api:** add aggregator modules for Fase 5 - dashboard, shopping-list, reports ([65b500d](https://github.com/josejmv/WalletWise/commit/65b500d58f8a2399647a69b68d99bf27cdd68413))
* **api:** add primary entities for Fase 2 - accounts, exchange-rates, inventory-items ([f523aba](https://github.com/josejmv/WalletWise/commit/f523aba2b0c8e6e77fe0e310cf4d11535ce26c50))
* **api:** add root modules for Fase 1 - currencies, account-types, categories ([dadbcd6](https://github.com/josejmv/WalletWise/commit/dadbcd65a61c91d681e95cfd355a9439bcb39340))
* **api:** add secondary entities for Fase 3 - jobs, budgets, inventory-price-history ([0ca725a](https://github.com/josejmv/WalletWise/commit/0ca725a3dd2df25bccb7dc06f1c9a8e93cf7f00a))
* **api:** add transaction modules for Fase 4 - incomes, expenses, transfers ([3fc6427](https://github.com/josejmv/WalletWise/commit/3fc64279ffc3c3a4d1d3d1169faf7c8b8ed33a53))
* **budgets:** implement budget account blocking and improved accounts view ([e3d8638](https://github.com/josejmv/WalletWise/commit/e3d863828db62125b26fb512a1a9712a6c949d16))
* **change-system:** implement multi-currency change/refund system ([8c2ea96](https://github.com/josejmv/WalletWise/commit/8c2ea96ff73ad0140a0d7fc8d6ec1074026bb726))
* **core:** add pagination, backup, recurring expenses, and pdf export ([65fbd05](https://github.com/josejmv/WalletWise/commit/65fbd050fce360385b7936c9941482488db05a8b))
* **core:** add project setup, charts docs, and inventory module ([98c5ada](https://github.com/josejmv/WalletWise/commit/98c5ada1a70199e521727658239e4901398374db))
* **currency:** add exchange rate conversion to account balances ([4ac357e](https://github.com/josejmv/WalletWise/commit/4ac357e1a3e6c929acdb48c59a5af2a78a765efa))
* **dashboard:** add CRUD forms for all modules ([fc995eb](https://github.com/josejmv/WalletWise/commit/fc995eb356804ab6c0e7881929bc8f5edd98f798))
* **dashboard:** add quick actions, exchange rate widgets, and sidebar improvements ([186a4c9](https://github.com/josejmv/WalletWise/commit/186a4c9c3c9a689eb156a188be909717bf112e08))
* **dashboard:** implement dashboard layout and core components ([ba49ab6](https://github.com/josejmv/WalletWise/commit/ba49ab6aba8c80c8bc9f31eb2fa62e65024f1a1e))
* **dashboard:** style KPI cards and fix exchange rate cache ([265d2ca](https://github.com/josejmv/WalletWise/commit/265d2cac4021d5fa5a7664745f4e76f45b170301))
* **exchange-rates:** add exchange rate system with Binance P2P and form integration ([55ebf0a](https://github.com/josejmv/WalletWise/commit/55ebf0a41187cdd3c361b9143d8649540fc0da7e))
* **formatting:** add user config context for centralized formatting ([49d360f](https://github.com/josejmv/WalletWise/commit/49d360f40d75d88df36a2f410a6a4b275f6f3c25))
* **frontend:** add dashboard and all module pages ([5a1f50f](https://github.com/josejmv/WalletWise/commit/5a1f50f84af41c9a2cb92b95c834d9b0dc2e3d01))
* **history:** add exchange rate columns to transaction history ([b83dbc0](https://github.com/josejmv/WalletWise/commit/b83dbc00401d3132395da0cb27d0acd8fc9d53a2))
* **inventory:** add price history, currency conversion, and inline account creation ([e0253d6](https://github.com/josejmv/WalletWise/commit/e0253d6e2e59556670c193416a2091b499f66992))
* **inventory:** add price update button with history tracking ([230352b](https://github.com/josejmv/WalletWise/commit/230352b5d1c655f906688fe2c5f0b43f37dec36c))
* **responsive:** add mobile sidebar and responsive table layouts ([6467f07](https://github.com/josejmv/WalletWise/commit/6467f0729434f90f561fb5050962a2f6ce776687))
* **seed:** update exchange rates and add hierarchical expense and inventory categories ([1e01d8a](https://github.com/josejmv/WalletWise/commit/1e01d8a12d44599e5013d95bac87b88e63b99308))
* **settings:** implement user config system and settings page ([9fcff41](https://github.com/josejmv/WalletWise/commit/9fcff41c74a03ae479150662c0285bc6cf9c6283))
* **ui:** add shadcn/ui components and dashboard layout for Fase 0 ([6880b35](https://github.com/josejmv/WalletWise/commit/6880b356337018a211472bf9052d643af22ad5d2))
* **v1.3.0:** post-testing corrections and UX improvements ([7366ef4](https://github.com/josejmv/WalletWise/commit/7366ef4e5543ee2d95d98ff9ac7a9ab03cc017fc))
* **v1.4.0:** add extra incomes, consume modal, and conversion routes ([28a5f81](https://github.com/josejmv/WalletWise/commit/28a5f8158496a19f7f1b3fbb7d36fb4982ecaec1))
* **v1.5.0:** add calculator with currency conversion and intermediate routes ([c9baa36](https://github.com/josejmv/WalletWise/commit/c9baa36718e444de23a161f6e4db1bedf79e0ffa))
* **v1.6.0:** polish and improvements with bug fixes and new features ([1b26748](https://github.com/josejmv/WalletWise/commit/1b26748a26ef7a238966edd4b40323ea80ad417c))

# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/).
