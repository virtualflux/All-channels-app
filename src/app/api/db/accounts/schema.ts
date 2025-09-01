import { z } from "zod";
import { Schema, model, models } from "mongoose";

export const accountSchema = z.object({
  account_name: z.string().min(1, "account name is required"),
  account_code: z.string().min(1, "account code is required"),
  account_type: z.string().min(1, "account type is required"),
  description: z.string().optional(),
});

export type AccountType = z.infer<typeof accountSchema>;

const AccountSchema = new Schema<AccountType>(
  {
    account_name: {
      type: String,
      required: true,
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
  },
  { timestamps: true }
);

export default models.accounts || model<AccountType>("Account", AccountSchema);
