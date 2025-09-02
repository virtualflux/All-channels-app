import { z } from "zod";
import { Schema, model, mongo } from "mongoose";

export const productSchema = z
  .object({
    createdBy: z.string().transform((args, ctx) => new mongo.ObjectId(args)),
    product_type: z.string(),
    name: z.string().min(1, "Product name is required").max(100),
    unit: z.string().min(1, "Unit is required"),
    description: z.string().optional(),

    // Sales Information
    rate: z
      .number({
        required_error: "Selling price is required",
        invalid_type_error: "Selling price must be a number",
      })
      .nonnegative("Selling price cannot be negative"),
    account_id: z.string().min(1, "Sales account is required"),

    // Purchase Information
    purchase_rate: z
      .number({
        required_error: "Cost price is required",
        invalid_type_error: "Cost price must be a number",
      })
      .nonnegative("Cost price cannot be negative"),
    purchase_account_id: z.string().min(1, "Purchase account is required"),
    purchase_description: z.string().optional(),
    track_inventory: z.boolean(),
    inventory_valuation_method: z.enum(["fifo", "wac"]).optional(),
    reorder_level: z.number().nonnegative().optional(),
    inventory_account_id: z.string().optional(),
    status: z.enum(["pending", "rejected", "approved"]),
    returnable_item: z.boolean().default(false),
  })
  .refine((data) => !data.track_inventory || !!data.inventory_account_id, {
    path: ["inventory_account_id"],
    message: "Inventory account is required when track_inventory is true",
  });

export type ProductType = z.infer<typeof productSchema>;

const ProductSchema = new Schema<ProductType>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },

    // Sales Info
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    account_id: {
      type: String,
      required: true,
    },

    // Purchase Info
    purchase_rate: {
      type: Number,
      required: true,
      min: 0,
    },
    purchase_account_id: {
      type: String,
      required: true,
    },
    purchase_description: {
      type: String,
      trim: true,
    },
    inventory_account_id: { type: String, trim: true },
    track_inventory: {
      type: Boolean,
      default: false,
    },
    reorder_level: {
      type: Number,
      required: true,
    },
    inventory_valuation_method: {
      type: String,
      enum: ["fifo", "wac"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "rejected", "approved"],
      default: "pending",
    },
    returnable_item: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Product = model<ProductType>("Product", ProductSchema);
