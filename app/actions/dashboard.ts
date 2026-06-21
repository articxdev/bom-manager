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

    // Calculate total products generated (produced)
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

    // Group to find unique production runs (transactions within 5 seconds for the same product represent a single batch run)
    const sortedTxs = [...productionTransactions].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const activeRuns: { productId: string; quantity: number; lastTime: number }[] = [];
    let totalProductsGenerated = 0;

    for (const tx of sortedTxs) {
      if (!tx.productId || tx.productionQuantity === null) continue;
      const txTime = tx.createdAt.getTime();
      const existingRun = activeRuns.find(
        (run) => run.productId === tx.productId && Math.abs(txTime - run.lastTime) < 5000
      );

      if (existingRun) {
        existingRun.lastTime = txTime;
      } else {
        activeRuns.push({
          productId: tx.productId,
          quantity: tx.productionQuantity,
          lastTime: txTime,
        });
        totalProductsGenerated += tx.productionQuantity;
      }
    }

    return {
      success: true,
      data: {
        totalComponents,
        totalProducts,
        totalProductsGenerated,
        lowStockCount,
        lowStockComponents,
        recentTransactions,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch dashboard data" };
  }
}


