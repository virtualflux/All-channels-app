import { z } from "zod";
import { Schema, model, mongo } from "mongoose";

export const productSchema = z.object({
  createdBy: z.string().transform((args, ctx) => new mongo.ObjectId(args)),

  name: z.string().min(1, "Product name is required").max(100),
  unit: z.string().min(1, "Unit is required"),
  description: z.string().optional(),

  // Sales Information
  selling_price: z
    .number({
      required_error: "Selling price is required",
      invalid_type_error: "Selling price must be a number",
    })
    .nonnegative("Selling price cannot be negative"),
  sales_account: z.string().min(1, "Sales account is required"),
  sales_description: z.string().optional(),
  sales_tax: z.string().optional(),

  // Purchase Information
  cost_price: z
    .number({
      required_error: "Cost price is required",
      invalid_type_error: "Cost price must be a number",
    })
    .nonnegative("Cost price cannot be negative"),
  purchase_account: z.string().min(1, "Purchase account is required"),
  purchase_description: z.string().optional(),
  purchase_tax: z.string().optional(),

  status: z.enum(["active", "inactive"]).default("active"),
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
    selling_price: {
      type: Number,
      required: true,
      min: 0,
    },
    sales_account: {
      type: String,
      required: true,
    },
    sales_description: {
      type: String,
      trim: true,
    },
    sales_tax: {
      type: String,
    },

    // Purchase Info
    cost_price: {
      type: Number,
      required: true,
      min: 0,
    },
    purchase_account: {
      type: String,
      required: true,
    },
    purchase_description: {
      type: String,
      trim: true,
    },
    purchase_tax: {
      type: String,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const Product = model<ProductType>("Product", ProductSchema);
