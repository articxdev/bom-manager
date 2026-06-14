"use server";

import prisma from "@/lib/prisma";

export async function getTransactions(
  type?: string,
  componentId?: string,
  productId?: string,
  startDate?: Date,
  endDate?: Date
) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        AND: [
          type ? { type } : {},
          componentId ? { componentId } : {},
          productId ? { productId } : {},
          startDate || endDate
            ? {
                createdAt: {
                  ...(startDate && { gte: startDate }),
                  ...(endDate && { lte: endDate }),
                },
              }
            : {},
        ],
      },
      include: {
        component: true,
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: transactions };
  } catch (error) {
    return { success: false, error: "Failed to fetch transactions" };
  }
}

export async function reverseTransaction(transactionId: string, enteredBy?: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { component: true },
    });

    if (!transaction) {
      return { success: false, error: "Transaction not found" };
    }

    if (transaction.reversedTransactionId) {
      return { success: false, error: "This transaction has already been reversed" };
    }

    // Check if there's already a reversal for this transaction
    const existingReversal = await prisma.transaction.findFirst({
      where: { reversedTransactionId: transactionId },
    });

    if (existingReversal) {
      return { success: false, error: "This transaction has already been reversed" };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update component stock
      const newStock = transaction.component.currentStock - transaction.quantityChange;

      await tx.component.update({
        where: { id: transaction.componentId },
        data: { currentStock: newStock },
      });

      // Create reversal transaction
      const reversal = await tx.transaction.create({
        data: {
          componentId: transaction.componentId,
          type: "REVERSAL",
          quantityChange: -transaction.quantityChange,
          resultingBalance: newStock,
          reversedTransactionId: transactionId,
          note: `Reversal of ${transaction.type} transaction from ${transaction.createdAt.toLocaleDateString()}`,
          enteredBy,
        },
      });

      return reversal;
    });

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Failed to reverse transaction" };
  }
}

export async function getTransactionHistory(
  limit: number = 10,
  offset: number = 0
) {
  try {
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          component: true,
          product: true,
        },
      }),
      prisma.transaction.count(),
    ]);

    return {
      success: true,
      data: {
        transactions,
        total,
        pages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch transaction history" };
  }
}
