import { z } from "zod";
export const productSchema = z
  .object({
    // createdBy: z.string().transform((args, ctx) => new mongo.ObjectId(args)),
    // product_type: z.string(),
    name: z
      .string({ message: "Product name is required" })
      .min(1, "Product name is required")
      .max(100),
    unit: z.string({ message: "Unit is required" }).min(1, "Unit is required"),
    description: z.string().optional(),

    // Sales Information
    rate: z
      .number({
        required_error: "Selling price is required",
        invalid_type_error: "Selling price must be a number",
      })
      .gt(0, { message: "Selling price must be greater than 0" })
      .nonnegative("Selling price cannot be negative"),
    // account_id: z.string().min(1, "Sales account is required"),

    // Purchase Information
    purchase_rate: z
      .number({
        required_error: "Cost price is required",
        invalid_type_error: "Cost price must be a number",
      })
      .gt(0, { message: "Cost price must be greater than 0" })
      .nonnegative("Cost price cannot be negative"),
    purchase_account_id: z
      .string({ message: "Purchase account is required" })
      .min(1, "Purchase account is required"),
    purchase_description: z.string().optional(),
    track_inventory: z.boolean().optional(),
    inventory_valuation_method: z.enum(["fifo", "wac"]).optional(),
    reorder_level: z.number().nonnegative().optional(),
    inventory_account_id: z.string().optional(),
    // status: z.enum(["pending", "rejected", "approved"]),
    returnable_item: z.boolean().default(false),
  })
  .refine((data) => !data.track_inventory || !!data.inventory_account_id, {
    path: ["inventory_account_id"],
    message: "Inventory account is required when track_inventory is true",
  });

export type ProductType = z.infer<typeof productSchema> & {
  createdBy: string;
  product_type: string;
  account_id: string;
  status: "pending" | "rejected" | "approved";
};
