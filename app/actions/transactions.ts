"use server";

import prisma from "@/lib/prisma";

export async function recordProduction(
  productId: string,
  quantity: number,
  confirmNegativeStock: boolean = false
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        bomItems: {
          include: {
            component: true,
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Check if we have enough stock
    const insufficientItems: Array<{
      componentName: string;
      current: number;
      needed: number;
    }> = [];

    for (const bomItem of product.bomItems) {
      const needed = bomItem.quantityPerUnit * quantity;
      if (bomItem.component.currentStock < needed) {
        insufficientItems.push({
          componentName: bomItem.component.name,
          current: bomItem.component.currentStock,
          needed,
        });
      }
    }

    if (insufficientItems.length > 0 && !confirmNegativeStock) {
      return {
        success: false,
        error: "Insufficient stock",
        insufficientItems,
      };
    }

    // Perform transaction
    const result = await prisma.$transaction(async (tx) => {
      const transactions = [];

      for (const bomItem of product.bomItems) {
        const quantityChange = -(bomItem.quantityPerUnit * quantity);
        const newStock = bomItem.component.currentStock + quantityChange;

        await tx.component.update({
          where: { id: bomItem.componentId },
          data: { currentStock: newStock },
        });

        const transaction = await tx.transaction.create({
          data: {
            componentId: bomItem.componentId,
            type: "PRODUCTION",
            quantityChange,
            resultingBalance: newStock,
            productId,
            productionQuantity: quantity,
            note: `Produced ${quantity} unit(s) of ${product.name}`,
          },
        });

        transactions.push(transaction);
      }

      return transactions;
    });

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Failed to record production" };
  }
}

export async function recordDamage(
  componentId: string,
  quantity: number,
  note: string,
  confirmNegativeStock: boolean = false
) {
  try {
    const component = await prisma.component.findUnique({
      where: { id: componentId },
    });

    if (!component) {
      return { success: false, error: "Component not found" };
    }

    const newStock = component.currentStock - quantity;

    if (newStock < 0 && !confirmNegativeStock) {
      return {
        success: false,
        error: "Would result in negative stock. Confirm to proceed.",
        currentStock: component.currentStock,
        requested: quantity,
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.component.update({
        where: { id: componentId },
        data: { currentStock: newStock },
      });

      const transaction = await tx.transaction.create({
        data: {
          componentId,
          type: "DAMAGE",
          quantityChange: -quantity,
          resultingBalance: newStock,
          note: note || "Damage/loss recorded",
        },
      });

      return transaction;
    });

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Failed to record damage" };
  }
}

export async function recordStockIn(
  componentId: string,
  quantity: number,
  note?: string
) {
  try {
    const component = await prisma.component.findUnique({
      where: { id: componentId },
    });

    if (!component) {
      return { success: false, error: "Component not found" };
    }

    const newStock = component.currentStock + quantity;

    const result = await prisma.$transaction(async (tx) => {
      await tx.component.update({
        where: { id: componentId },
        data: { currentStock: newStock },
      });

      const transaction = await tx.transaction.create({
        data: {
          componentId,
          type: "STOCK_IN",
          quantityChange: quantity,
          resultingBalance: newStock,
          note: note || "Stock received",
        },
      });

      return transaction;
    });

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Failed to record stock in" };
  }
}
