import {
  PrismaClient,
  AccountTypeEnum,
  ExchangeRateSource,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Currencies (Fiat + Crypto)
  // Symbols equal to code for easier identification
  // Only USDT as crypto (removed BTC, ETH, BNB, SOL)
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

  // Store currencies by code for easy access
  const currencyMap: Record<string, { id: string; code: string }> = {};

  for (const currency of currencies) {
    const created = await prisma.currency.upsert({
      where: { code: currency.code },
      update: {},
      create: currency,
    });
    currencyMap[currency.code] = created;
  }
  console.log("Currencies seeded (Fiat + Crypto)");

  // Seed initial exchange rates for development
  // Rates updated 2026-01-18 - will be updated by sync in production
  const USD_COP = 4150.0;
  const USD_VES = 58.0;
  const USDT_COP = 4100.0;
  const USDT_VES = 57.0;

  const initialRates = [
    // USD pairs (official source)
    {
      from: "USD",
      to: "COP",
      rate: USD_COP,
      source: ExchangeRateSource.official,
    },
    {
      from: "USD",
      to: "VES",
      rate: USD_VES,
      source: ExchangeRateSource.official,
    },
    // Inverse rates
    {
      from: "COP",
      to: "USD",
      rate: 1 / USD_COP,
      source: ExchangeRateSource.official,
    },
    {
      from: "VES",
      to: "USD",
      rate: 1 / USD_VES,
      source: ExchangeRateSource.official,
    },
    // Cross rate COP-VES
    {
      from: "COP",
      to: "VES",
      rate: USD_VES / USD_COP,
      source: ExchangeRateSource.official,
    },
    {
      from: "VES",
      to: "COP",
      rate: USD_COP / USD_VES,
      source: ExchangeRateSource.official,
    },
    // USDT pairs (fixed 1:1 with USD, binance for others)
    { from: "USDT", to: "USD", rate: 1.0, source: ExchangeRateSource.binance },
    { from: "USD", to: "USDT", rate: 1.0, source: ExchangeRateSource.binance },
    {
      from: "USDT",
      to: "COP",
      rate: USDT_COP,
      source: ExchangeRateSource.binance,
    },
    {
      from: "USDT",
      to: "VES",
      rate: USDT_VES,
      source: ExchangeRateSource.binance,
    },
    // Inverse USDT rates
    {
      from: "COP",
      to: "USDT",
      rate: 1 / USDT_COP,
      source: ExchangeRateSource.binance,
    },
    {
      from: "VES",
      to: "USDT",
      rate: 1 / USDT_VES,
      source: ExchangeRateSource.binance,
    },
  ];

  for (const rate of initialRates) {
    const fromCurrency = currencyMap[rate.from];
    const toCurrency = currencyMap[rate.to];

    if (fromCurrency && toCurrency) {
      await prisma.exchangeRate.create({
        data: {
          fromCurrencyId: fromCurrency.id,
          toCurrencyId: toCurrency.id,
          rate: rate.rate,
          source: rate.source,
          fetchedAt: new Date(),
        },
      });
    }
  }
  console.log("Exchange rates seeded (initial development rates)");

  const usdCurrency = currencyMap["USD"];

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

  // Seed Expense Categories (hierarchical)
  // Parent categories with their children
  const expenseCategories = [
    // Transporte
    {
      name: "Transporte",
      color: "#00ff00",
      icon: "🛤",
      children: ["Autobús", "Taxi"],
    },
    // Saldo móvil (no children)
    {
      name: "Saldo móvil",
      color: "#3b82f6",
      icon: "📲",
      children: [],
    },
    // Entretenimiento
    {
      name: "Entretenimiento",
      color: "#ffff00",
      icon: "🎬",
      children: ["Suscripción", "Juego/Pelicula"],
    },
    // Ropa/Cosméticos
    {
      name: "Ropa/Cosméticos",
      color: "#00ffff",
      icon: "👕",
      children: ["Tops", "Pantalon", "Ropa interior", "Calsados", "Accesorios", "Skincare"],
    },
    // Salud
    {
      name: "Salud",
      color: "#ff00ff",
      icon: "⛑️",
      children: ["Peluquería", "Remedios/pastillas", "Gimnasio", "Seguro", "Manicura / Pedicura"],
    },
    // Mascota
    {
      name: "Mascota",
      color: "#5c5c5c",
      icon: "🐺",
      children: ["Guardería", "Comida", "Aseo", "Salud", "Juguetes", "Accesorios", "Parque"],
    },
    // Hogar
    {
      name: "Hogar",
      color: "#ffffff",
      icon: "🏠",
      children: ["Cocina", "Sala", "Habitación", "Baño", "Oficina"],
    },
    // Comida
    {
      name: "Comida",
      color: "#e20303",
      icon: "🍔",
      children: ["Desayuno", "Almuerzo", "Merienda", "Bebidas", "Snaks", "Cena"],
    },
    // Educación
    {
      name: "Educación",
      color: "#001eff",
      icon: "📚",
      children: ["Cursos online", "Universidad"],
    },
    // Mantenimiento del Hogar
    {
      name: "Mantenimiento del Hogar",
      color: "#013702",
      icon: "🏢",
      children: ["Internet", "Gas", "Reparaciones", "Alquiler", "Aseo y Limpieza", "Condominio", "Mercado"],
    },
    // Viajes
    {
      name: "Viajes",
      color: "#5f0066",
      icon: "🛫",
      children: ["Vuelos", "Airbnb", "Transporte", "Comida", "Compras", "Entretenimiento", "Salud"],
    },
    // Otros (no children)
    {
      name: "Otros",
      color: "#5c2c00",
      icon: "😶",
      children: [],
    },
    // Comisión (no children)
    {
      name: "Comisión",
      color: "#c2bb00",
      icon: "💸",
      children: [],
    },
    // Delivery (no children)
    {
      name: "Delivery",
      color: "#ffa333",
      icon: "🛵",
      children: [],
    },
  ];

  // Create parent categories first
  const categoryMap: Record<string, string> = {};
  for (const cat of expenseCategories) {
    const created = await prisma.category.upsert({
      where: { id: categoryMap[cat.name] || "non-existent-id" },
      update: { name: cat.name, color: cat.color, icon: cat.icon },
      create: { name: cat.name, color: cat.color, icon: cat.icon },
    });
    categoryMap[cat.name] = created.id;
  }

  // Create child categories with parent relationship
  for (const cat of expenseCategories) {
    const parentId = categoryMap[cat.name];
    for (const childName of cat.children) {
      await prisma.category.create({
        data: {
          name: childName,
          color: cat.color,
          icon: "",
          parentId: parentId,
        },
      });
    }
  }
  console.log("Expense categories seeded (hierarchical)");

  // Seed Inventory Categories
  const inventoryCategories = [
    { name: "Despensa" },
    { name: "Proteina" },
    { name: "Charcuteria" },
    { name: "Aseo Personal" },
    { name: "Hogar" },
    { name: "Mascota" },
    { name: "Frutas/Verduras" },
    { name: "Chucherias" },
  ];

  for (const invCat of inventoryCategories) {
    await prisma.inventoryCategory.upsert({
      where: { name: invCat.name },
      update: {},
      create: invCat,
    });
  }
  console.log("Inventory categories seeded");

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
              // Transaction history page
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
          { id: "calculator", type: "item", pageId: "calculator" },
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
