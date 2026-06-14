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
    return { success: true, data: products };
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
    return { success: true, data: product };
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
