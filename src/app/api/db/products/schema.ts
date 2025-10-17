import { Schema, model, models, mongo } from "mongoose";
import { ProductType } from "./type/product.type";

const ProductSchema = new Schema(
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
    locations: [
      {
        location_id: {
          type: String,
        },
        location_name: {
          type: String,
        },
        location_stock_on_hand: {
          type: String,
          default: 0,
        },
        initial_stock_rate: {
          type: String,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Product =
  models.Product || model<ProductType>("Product", ProductSchema);
