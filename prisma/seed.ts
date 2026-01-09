import { PrismaClient, AccountTypeEnum } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Currencies
  const currencies = [
    {
      code: "USD",
      name: "Dólar estadounidense",
      symbol: "$",
      isBase: true,
    },
    {
      code: "COP",
      name: "Peso colombiano",
      symbol: "COP$",
      isBase: false,
    },
    {
      code: "VES",
      name: "Bolívar venezolano",
      symbol: "Bs.",
      isBase: false,
    },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: {},
      create: currency,
    });
  }
  console.log("Currencies seeded");

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

  // Seed Default Categories
  const categories = [
    {
      name: "Vivienda",
      color: "#8B5CF6",
      icon: "home",
      children: ["Arriendo", "Servicios", "Condominio", "Mantenimiento"],
    },
    {
      name: "Alimentación",
      color: "#10B981",
      icon: "utensils",
      children: ["Mercado", "Restaurantes", "Delivery", "Snacks"],
    },
    {
      name: "Transporte",
      color: "#F59E0B",
      icon: "car",
      children: [
        "Gasolina",
        "Transporte público",
        "Uber/Taxi",
        "Mantenimiento vehículo",
      ],
    },
    {
      name: "Entretenimiento",
      color: "#EC4899",
      icon: "gamepad",
      children: ["Streaming", "Salidas", "Hobbies", "Videojuegos"],
    },
    {
      name: "Salud",
      color: "#EF4444",
      icon: "heart",
      children: [
        "Medicamentos",
        "Consultas médicas",
        "Gimnasio",
        "Seguro médico",
      ],
    },
    {
      name: "Educación",
      color: "#3B82F6",
      icon: "graduation-cap",
      children: ["Cursos", "Libros", "Suscripciones educativas"],
    },
    {
      name: "Ropa y accesorios",
      color: "#6366F1",
      icon: "shirt",
      children: ["Ropa", "Zapatos", "Accesorios"],
    },
    {
      name: "Tecnología",
      color: "#14B8A6",
      icon: "laptop",
      children: ["Hardware", "Software", "Suscripciones tech"],
    },
    {
      name: "Otros",
      color: "#6B7280",
      icon: "ellipsis",
      children: ["Regalos", "Donaciones", "Imprevistos"],
    },
  ];

  for (const category of categories) {
    const parent = await prisma.category.upsert({
      where: {
        id: category.name.toLowerCase().replace(/\s+/g, "-"),
      },
      update: {},
      create: {
        id: category.name.toLowerCase().replace(/\s+/g, "-"),
        name: category.name,
        color: category.color,
        icon: category.icon,
      },
    });

    for (const childName of category.children) {
      const childId = `${parent.id}-${childName.toLowerCase().replace(/\s+/g, "-")}`;
      await prisma.category.upsert({
        where: { id: childId },
        update: {},
        create: {
          id: childId,
          name: childName,
          parentId: parent.id,
          color: category.color,
        },
      });
    }
  }
  console.log("Categories seeded");

  // Seed Inventory Categories
  const inventoryCategories = [
    {
      name: "Despensa",
      icon: "package",
      color: "#F59E0B",
      description: "Productos de despensa y alimentos no perecederos",
    },
    {
      name: "Refrigerados",
      icon: "thermometer-snowflake",
      color: "#3B82F6",
      description: "Productos que requieren refrigeración",
    },
    {
      name: "Limpieza",
      icon: "spray-can",
      color: "#10B981",
      description: "Productos de limpieza del hogar",
    },
    {
      name: "Higiene personal",
      icon: "bath",
      color: "#EC4899",
      description: "Productos de higiene y cuidado personal",
    },
    {
      name: "Bebidas",
      icon: "glass-water",
      color: "#06B6D4",
      description: "Bebidas y líquidos",
    },
    {
      name: "Congelados",
      icon: "snowflake",
      color: "#6366F1",
      description: "Productos congelados",
    },
    {
      name: "Frutas y verduras",
      icon: "apple-whole",
      color: "#84CC16",
      description: "Frutas y verduras frescas",
    },
    {
      name: "Carnes y proteínas",
      icon: "drumstick-bite",
      color: "#EF4444",
      description: "Carnes, pollo, pescado y proteínas",
    },
    {
      name: "Panadería",
      icon: "bread-slice",
      color: "#D97706",
      description: "Pan, galletas y productos de panadería",
    },
    {
      name: "Mascotas",
      icon: "paw",
      color: "#8B5CF6",
      description: "Alimentos y productos para mascotas",
    },
  ];

  for (const inventoryCategory of inventoryCategories) {
    const categoryId = inventoryCategory.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

    await prisma.inventoryCategory.upsert({
      where: { name: inventoryCategory.name },
      update: {},
      create: {
        id: categoryId,
        ...inventoryCategory,
      },
    });
  }
  console.log("Inventory categories seeded");

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
