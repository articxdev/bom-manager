import { z } from "zod";

export const componentSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  currentStock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  reorderThreshold: z.coerce.number().int().min(0, "Threshold cannot be negative"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  description: z.string().optional().default(""),
});

export const bomItemSchema = z.object({
  componentId: z.string().min(1, "Component is required"),
  quantityPerUnit: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export const productWithBOMSchema = productSchema.extend({
  bomItems: z.array(bomItemSchema).min(1, "At least one component is required"),
});

export const manualAdjustmentSchema = z.object({
  quantityChange: z.coerce.number().int(),
  note: z.string().min(1, "Note/reason is required"),
});

export const productionSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1").int(),
  confirmNegativeStock: z.boolean().optional().default(false),
});

export const damageSchema = z.object({
  componentId: z.string().min(1, "Component is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  note: z.string().optional().default(""),
  confirmNegativeStock: z.boolean().optional().default(false),
});

export const stockInSchema = z.object({
  componentId: z.string().min(1, "Component is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export type ComponentInput = z.infer<typeof componentSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type BOMItemInput = z.infer<typeof bomItemSchema>;
export type ProductWithBOMInput = z.infer<typeof productWithBOMSchema>;
export type ManualAdjustmentInput = z.infer<typeof manualAdjustmentSchema>;
export type ProductionInput = z.infer<typeof productionSchema>;
export type DamageInput = z.infer<typeof damageSchema>;
export type StockInInput = z.infer<typeof stockInSchema>;
