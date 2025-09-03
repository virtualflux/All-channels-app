import { z } from "zod";
import { Schema, model, mongo } from "mongoose";

export const priceListSchema = z.object({
  createdBy: z.string().transform((args, ctx) => new mongo.ObjectId(args)),

  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  currency_id: z.string().min(1, "Currency is required"),
  sales_or_purchase_type: z.enum(["sales", "purchases"]),
  rounding_type: z.enum([
    "no_rounding",
    "round_to_dollar",
    "round_to_dollar_minus_01",
    "round_to_half_dollar",
    "round_to_half_dollar_minus_01",
  ]),
  status: z.enum(["pending", "rejected", "approved"]),
  pricebook_type: z.string(),
  pricebook_items: z
    .array(
      z.object({
        item_id: z.string().min(1, "Item is required"),
        pricebook_rate: z
          .number({ invalid_type_error: "Rate is required" })
          .nonnegative("Rate cannot be negative"),
      })
    )
    .min(1, "Add at least one item"),
  is_increase: z.boolean(),
  percentage: z
    .number({ invalid_type_error: "Percentage is required" })
    .positive("Percentage must be greater than 0")
    .max(100000, "Too large"),
});

export type PriceListType = z.infer<typeof priceListSchema>;

const PriceListSchema = new Schema<Omit<PriceListType, "">>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    currency_id: {
      type: String,
      required: true,
    },
    sales_or_purchase_type: {
      type: String,
      enum: ["sales", "purchases"],
      required: true,
    },
    rounding_type: {
      type: String,
      enum: [
        "no_rounding",
        "round_to_dollar",
        "round_to_dollar_minus_01",
        "round_to_half_dollar",
        "round_to_half_dollar_minus_01",
      ],
      default: "no_rounding",
    },

    pricebook_type: {
      type: String,
      enum: ["per_item", "fixed_percentage"],
      required: true,
    },
    is_increase: {
      type: Boolean,
    },
    percentage: { type: Number },
    pricebook_items: [
      { item_id: String, pricebook_rate: Number, item_name: String },
    ],
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

export const PriceList = model<Omit<PriceListType, "">>(
  "PriceList",
  PriceListSchema
);
