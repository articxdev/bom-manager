"use server";

import prisma from "@/lib/prisma";
import { ComponentInput, ManualAdjustmentInput } from "@/lib/schemas";

export async function createComponent(data: ComponentInput) {
  try {
    const component = await prisma.component.create({
      data: {
        name: data.name,
        category: data.category,
        unit: data.unit,
        currentStock: data.currentStock,
        reorderThreshold: data.reorderThreshold,
      },
    });
    return { success: true, data: component };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Component name already exists" };
    }
    return { success: false, error: "Failed to create component" };
  }
}

export async function updateComponent(id: string, data: Partial<ComponentInput>) {
  try {
    const component = await prisma.component.update({
      where: { id },
      data,
    });
    return { success: true, data: component };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Component name already exists" };
    }
    return { success: false, error: "Failed to update component" };
  }
}

export async function getComponents(
  search?: string,
  category?: string,
) {
  try {
    const components = await prisma.component.findMany({
      where: {
        AND: [
          search ? { name: { contains: search, mode: "insensitive" } } : {},
          category ? { category } : {},
        ],
      },
      orderBy: { name: "asc" },
      include: {
        bomItems: {
          include: {
            product: true,
          },
        },
      },
    });
    return { success: true, data: components };
  } catch (error) {
    return { success: false, error: "Failed to fetch components" };
  }
}

export async function getComponent(id: string) {
  try {
    const component = await prisma.component.findUnique({
      where: { id },
      include: {
        bomItems: {
          include: {
            product: true,
          },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
    return { success: true, data: component };
  } catch (error) {
    return { success: false, error: "Failed to fetch component" };
  }
}

export async function adjustComponentStock(
  id: string,
  adjustment: ManualAdjustmentInput
) {
  try {
    const component = await prisma.component.findUnique({
      where: { id },
    });

    if (!component) {
      return { success: false, error: "Component not found" };
    }

    const newStock = component.currentStock + adjustment.quantityChange;

    if (newStock < 0) {
      return { success: false, error: "Adjustment would result in negative stock" };
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.component.update({
        where: { id },
        data: { currentStock: newStock },
      });

      await tx.transaction.create({
        data: {
          componentId: id,
          type: "MANUAL_ADJUST",
          quantityChange: adjustment.quantityChange,
          resultingBalance: newStock,
          note: adjustment.note,
        },
      });

      return updated;
    });

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Failed to adjust stock" };
  }
}

export async function deleteComponent(id: string) {
  try {
    await prisma.component.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2003") {
      return { success: false, error: "Component is used in BOMs and cannot be deleted" };
    }
    return { success: false, error: "Failed to delete component" };
  }
}
