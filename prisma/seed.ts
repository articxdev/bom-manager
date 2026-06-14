import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.transaction.deleteMany();
  await prisma.bomItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.component.deleteMany();

  // Create sample components
  const resistor = await prisma.component.create({
    data: {
      name: "10K Ohm Resistor",
      category: "Electronics",
      unit: "pcs",
      currentStock: 500,
      reorderThreshold: 100,
    },
  });

  const capacitor = await prisma.component.create({
    data: {
      name: "100µF Capacitor",
      category: "Electronics",
      unit: "pcs",
      currentStock: 250,
      reorderThreshold: 50,
    },
  });

  const ic = await prisma.component.create({
    data: {
      name: "ATmega328P Microcontroller",
      category: "Electronics",
      unit: "pcs",
      currentStock: 50,
      reorderThreshold: 20,
    },
  });

  const pcb = await prisma.component.create({
    data: {
      name: "PCB Board (Custom)",
      category: "PCB",
      unit: "pcs",
      currentStock: 30,
      reorderThreshold: 10,
    },
  });

  const wire = await prisma.component.create({
    data: {
      name: "22AWG Wire",
      category: "Materials",
      unit: "meter",
      currentStock: 1000,
      reorderThreshold: 200,
    },
  });

  console.log("✅ Created components:", {
    resistor: resistor.name,
    capacitor: capacitor.name,
    ic: ic.name,
    pcb: pcb.name,
    wire: wire.name,
  });

  // Create sample products
  const arduinoClone = await prisma.product.create({
    data: {
      name: "Arduino Clone",
      description: "DIY Arduino-compatible microcontroller board",
      bomItems: {
        create: [
          { componentId: ic.id, quantityPerUnit: 1 },
          { componentId: pcb.id, quantityPerUnit: 1 },
          { componentId: resistor.id, quantityPerUnit: 10 },
          { componentId: capacitor.id, quantityPerUnit: 2 },
          { componentId: wire.id, quantityPerUnit: 5 },
        ],
      },
    },
    include: { bomItems: true },
  });

  const sensorModule = await prisma.product.create({
    data: {
      name: "Temperature Sensor Module",
      description: "I2C temperature and humidity sensor",
      bomItems: {
        create: [
          { componentId: resistor.id, quantityPerUnit: 4 },
          { componentId: capacitor.id, quantityPerUnit: 1 },
          { componentId: wire.id, quantityPerUnit: 2 },
        ],
      },
    },
    include: { bomItems: true },
  });

  console.log("✅ Created products:", {
    arduino: arduinoClone.name,
    sensor: sensorModule.name,
  });

  // Create sample transactions
  const stockInTx = await prisma.transaction.create({
    data: {
      componentId: resistor.id,
      type: "STOCK_IN",
      quantityChange: 100,
      resultingBalance: 600,
      note: "New shipment received from supplier",
    },
  });

  const productionTx1 = await prisma.transaction.create({
    data: {
      componentId: ic.id,
      type: "PRODUCTION",
      quantityChange: -5,
      resultingBalance: 45,
      productId: arduinoClone.id,
      productionQuantity: 5,
      note: "Batch production run",
    },
  });

  const productionTx2 = await prisma.transaction.create({
    data: {
      componentId: pcb.id,
      type: "PRODUCTION",
      quantityChange: -5,
      resultingBalance: 25,
      productId: arduinoClone.id,
      productionQuantity: 5,
      note: "Batch production run",
    },
  });

  const damageTx = await prisma.transaction.create({
    data: {
      componentId: capacitor.id,
      type: "DAMAGE",
      quantityChange: -10,
      resultingBalance: 240,
      note: "10 units damaged during testing",
    },
  });

  console.log("✅ Created transactions:", {
    stockIn: stockInTx.id,
    production: productionTx1.id,
    damage: damageTx.id,
  });

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
