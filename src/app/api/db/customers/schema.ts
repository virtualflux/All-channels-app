import { Schema, model, models, mongo } from "mongoose";
import { CustomerType } from "./types/customer";

const CustomerSchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    company_name: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contact_name: {
      required: true,
      type: String,
      trim: true,
      lowercase: true,
    },
    customer_sub_type: {
      type: String,
      default: "individual",
    },
    contact_persons: [
      {
        first_name: { type: String, required: true, trim: true },
        last_name: {
          type: String,
          required: true,
          trim: true,
        },
        email: {
          type: String,
          trim: true,
        },
        phone: {
          type: String,
          trim: true,
        },
      },
    ],
    account_name: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    account_code: { type: String, trim: true, unique: true },
    account_type: {
      type: String,
      lowercase: true,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Customer =
  models.Customer || model<CustomerType>("Customer", CustomerSchema);
