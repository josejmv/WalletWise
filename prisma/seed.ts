import { PrismaClient, AccountTypeEnum } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Currencies (Fiat + Crypto)
  // v1.3.0: Symbols equal to code for easier identification
  // v1.3.0: Only USDT as crypto (removed BTC, ETH, BNB, SOL)
  const currencies = [
    // Fiat - symbols = codes
    {
      code: "USD",
      name: "Dólar estadounidense",
      symbol: "USD",
      isBase: true,
    },
    {
      code: "COP",
      name: "Peso colombiano",
      symbol: "COP",
      isBase: false,
    },
    {
      code: "VES",
      name: "Bolívar venezolano",
      symbol: "VES",
      isBase: false,
    },
    // Crypto - only USDT
    {
      code: "USDT",
      name: "Tether",
      symbol: "USDT",
      isBase: false,
    },
  ];

  let usdCurrency = null;

  for (const currency of currencies) {
    const created = await prisma.currency.upsert({
      where: { code: currency.code },
      update: {},
      create: currency,
    });
    if (currency.code === "USD") {
      usdCurrency = created;
    }
  }
  console.log("Currencies seeded (Fiat + Crypto)");

  // Seed Account Types
  const accountTypes = [
    {
      name: "Cuenta bancaria",
      type: AccountTypeEnum.bank,
      description: "Cuenta de banco tradicional",
    },
    {
      name: "Efectivo",
      type: AccountTypeEnum.cash,
      description: "Dinero en efectivo",
    },
    {
      name: "Billetera digital",
      type: AccountTypeEnum.digital_wallet,
      description: "PayPal, Binance, Nequi, etc.",
    },
    {
      name: "Tarjeta de crédito",
      type: AccountTypeEnum.credit_card,
      description: "Tarjeta de crédito",
    },
  ];

  for (const accountType of accountTypes) {
    await prisma.accountType.upsert({
      where: { type: accountType.type },
      update: {},
      create: accountType,
    });
  }
  console.log("Account types seeded");

  // Seed Default UserConfig (single entry for now)
  if (usdCurrency) {
    const existingConfig = await prisma.userConfig.findFirst();
    if (!existingConfig) {
      const defaultSidebarConfig = {
        items: [
          { id: "dashboard", type: "item", pageId: "dashboard" },
          {
            id: "transactions",
            type: "group",
            label: "Transacciones",
            icon: "Receipt",
            isOpen: true,
            children: [
              { id: "incomes", type: "item", pageId: "incomes" },
              { id: "expenses", type: "item", pageId: "expenses" },
              { id: "transfers", type: "item", pageId: "transfers" },
              // v1.3.0: Transaction history page
              {
                id: "transaction-history",
                type: "item",
                pageId: "transaction-history",
              },
            ],
          },
          {
            id: "finances",
            type: "group",
            label: "Finanzas",
            icon: "Landmark",
            isOpen: true,
            children: [
              { id: "accounts", type: "item", pageId: "accounts" },
              { id: "budgets", type: "item", pageId: "budgets" },
              { id: "jobs", type: "item", pageId: "jobs" },
            ],
          },
          {
            id: "inventory",
            type: "group",
            label: "Inventario",
            icon: "Package",
            isOpen: false,
            children: [
              { id: "inventory-items", type: "item", pageId: "inventory" },
              {
                id: "inventory-categories",
                type: "item",
                pageId: "inventory-categories",
              },
              {
                id: "inventory-price-history",
                type: "item",
                pageId: "inventory-price-history",
              },
              { id: "shopping-list", type: "item", pageId: "shopping-list" },
            ],
          },
          {
            id: "configuration",
            type: "group",
            label: "Configuración",
            icon: "Settings2",
            isOpen: false,
            children: [
              { id: "currencies", type: "item", pageId: "currencies" },
              { id: "exchange-rates", type: "item", pageId: "exchange-rates" },
              { id: "categories", type: "item", pageId: "categories" },
            ],
          },
          { id: "reports", type: "item", pageId: "reports" },
        ],
      };

      await prisma.userConfig.create({
        data: {
          baseCurrencyId: usdCurrency.id,
          dateFormat: "DD/MM/YYYY",
          numberFormat: "es-CO",
          theme: "system",
          sidebarConfig: defaultSidebarConfig,
        },
      });
      console.log("UserConfig seeded");
    } else {
      console.log("UserConfig already exists, skipping");
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
