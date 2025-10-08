import { Schema, model, models, mongo } from "mongoose";
import { PriceListType } from "./types/pricelist";

const PriceListSchema = new Schema(
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

export const PriceList = models.PriceList || model("PriceList", PriceListSchema);
