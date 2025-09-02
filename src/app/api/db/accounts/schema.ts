import { z } from "zod";
import { Schema, model, models, mongo } from "mongoose";

export const accountSchema = z.object({
  createdBy: z.string().transform((args, ctx) => new mongo.ObjectId(args)),
  account_name: z.string().min(1, "account name is required"),
  account_code: z.string().min(1, "account code is required"),
  account_type: z.string().min(1, "account type is required"),
  status: z.enum(["pending", "rejected", "approved"]),
  description: z.string().optional(),
});

export type AccountType = z.infer<typeof accountSchema>;

const AccountSchema = new Schema<AccountType & { zohoAccountId: string }>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    account_name: {
      type: String,
      required: true,
      trim: true,
    },
    zohoAccountId: {
      type: String,
      default: null,
      trim: true,
    },
    description: {
      type: String,
    },
    account_code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    account_type: {
      type: String,
      lowercase: true,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

export default model<AccountType & { zohoAccountId: string }>(
  "Account",
  AccountSchema
);
