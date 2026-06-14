"use server";

import prisma from "@/lib/prisma";

export async function getDashboardData() {
  try {
    const totalComponents = await prisma.component.count();
    const totalProducts = await prisma.product.count();
    
    // Get all components and filter in JS for low stock comparison
    const allComponents = await prisma.component.findMany({
      orderBy: { currentStock: "asc" },
    });
    
    const lowStockComponents = allComponents.filter(
      (c) => c.currentStock <= c.reorderThreshold
    ).slice(0, 10);
    
    const lowStockCount = allComponents.filter(
      (c) => c.currentStock <= c.reorderThreshold
    ).length;

    const recentTransactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        component: true,
        product: true,
      },
    });

    return {
      success: true,
      data: {
        totalComponents,
        totalProducts,
        lowStockCount,
        lowStockComponents,
        recentTransactions,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch dashboard data" };
  }
}

