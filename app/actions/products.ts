"use server";

import prisma from "@/lib/prisma";
import { ProductInput, BOMItemInput } from "@/lib/schemas";

export async function createProduct(
  productData: ProductInput,
  bomItems: BOMItemInput[],
  enteredBy?: string
) {
  try {
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description || undefined,
        enteredBy,
        bomItems: {
          create: bomItems,
        },
      },
      include: { bomItems: { include: { component: true } } },
    });
    return { success: true, data: product };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Product name already exists" };
    }
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(
  id: string,
  productData: ProductInput,
  bomItems: BOMItemInput[],
  enteredBy?: string
) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: productData.name,
        description: productData.description || undefined,
        enteredBy,
        bomItems: {
          deleteMany: {},
          create: bomItems,
        },
      },
      include: { bomItems: { include: { component: true } } },
    });
    return { success: true, data: product };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Product name already exists" };
    }
    return { success: false, error: "Failed to update product" };
  }
}

export async function getProducts(search?: string) {
  try {
    const products = await prisma.product.findMany({
      where: search
        ? { name: { contains: search } }
        : undefined,
      include: {
        bomItems: {
          include: {
            component: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Fetch all production transactions to calculate total generated for each product
    const productionTransactions = await prisma.transaction.findMany({
      where: {
        type: "PRODUCTION",
        reversedByTransaction: null,
      },
      select: {
        productId: true,
        productionQuantity: true,
        createdAt: true,
      },
    });

    // Group to find unique production runs
    const runsMap = new Map<string, number>();
    for (const tx of productionTransactions) {
      if (!tx.productId || tx.productionQuantity === null) continue;
      const key = `${tx.productId}_${tx.createdAt.toISOString()}`;
      if (!runsMap.has(key)) {
        runsMap.set(key, tx.productionQuantity);
      }
    }

    // Calculate sum for each product
    const productGenerations = new Map<string, number>();
    for (const [key, qty] of runsMap.entries()) {
      const productId = key.split("_")[0];
      productGenerations.set(productId, (productGenerations.get(productId) || 0) + qty);
    }

    // Map onto products
    const productsWithStats = products.map((p) => ({
      ...p,
      totalGenerated: productGenerations.get(p.id) || 0,
    }));

    return { success: true, data: productsWithStats };
  } catch (error) {
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
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

    // Fetch production transactions for this product
    const productionTransactions = await prisma.transaction.findMany({
      where: {
        productId: id,
        type: "PRODUCTION",
        reversedByTransaction: null,
      },
      select: {
        productionQuantity: true,
        createdAt: true,
      },
    });

    const runsMap = new Map<string, number>();
    for (const tx of productionTransactions) {
      if (tx.productionQuantity === null) continue;
      const key = tx.createdAt.toISOString();
      if (!runsMap.has(key)) {
        runsMap.set(key, tx.productionQuantity);
      }
    }

    const totalGenerated = Array.from(runsMap.values()).reduce((sum, qty) => sum + qty, 0);

    return {
      success: true,
      data: {
        ...product,
        totalGenerated,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete product" };
  }
}

export async function calculateProductionCapacity(productId: string, desiredQuantity: number) {
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

    // Calculate max units we can produce
    let maxUnits = Infinity;
    const limitingComponents: Array<{
      componentName: string;
      available: number;
      needed: number;
      quantityPerUnit: number;
    }> = [];

    for (const bomItem of product.bomItems) {
      const maxFromComponent = bomItem.component.currentStock / bomItem.quantityPerUnit;
      if (maxFromComponent < maxUnits) {
        maxUnits = Math.floor(maxFromComponent);
      }
      if (maxFromComponent < desiredQuantity) {
        limitingComponents.push({
          componentName: bomItem.component.name,
          available: bomItem.component.currentStock,
          needed: desiredQuantity * bomItem.quantityPerUnit,
          quantityPerUnit: bomItem.quantityPerUnit,
        });
      }
    }

    return {
      success: true,
      data: {
        maxUnits: maxUnits === Infinity ? 0 : maxUnits,
        canProduce: maxUnits >= desiredQuantity,
        limitingComponents,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to calculate capacity" };
  }
}
