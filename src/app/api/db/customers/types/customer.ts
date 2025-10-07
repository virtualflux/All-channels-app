import { z } from "zod";
export const contactPersonSchema = z.object({
  first_name: z
    .string({ message: "First name is required" })
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less"),
  last_name: z
    .string({ message: "Last name is required" })
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less"),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().max(20, "Phone must be 20 characters or less").optional(),
  is_primary_contact: z.boolean().default(true),
});

export const customerSchema = z
  .object({
    // createdBy: z.string().transform((args, ctx) => new mongo.ObjectId(args)),

    contact_type: z.string(),
    customer_sub_type: z.enum(["individual", "business", "other"], {
      errorMap: () => ({ message: "Customer sub type is required" }),
    }),
    contact_persons: z
      .array(contactPersonSchema)
      .min(1, "At least one contact person is required"),
    company_name: z
      .string({ message: "Company name is required" })
      .max(100, "Company name must be 100 characters or less")
      .optional(),
    contact_name: z
      .string({ message: "Please enter a customer name" })
      .min(1, "Contact name is required")
      .max(100, "Contact name must be 100 characters or less"),
    // account_id: z.string().min(1, "Ledger is required"),
    // ignore_auto_number_generation: z.boolean().default(true),
    // status: z.enum(["pending", "rejected", "approved"]),
    account_name: z
      .string({ message: "Account name is required" })
      .min(1, "account name is required"),
    account_code: z
      .string({ message: "account code is required" })
      .min(1, "account code is required"),
    account_type: z.string().min(1, "account type is required"),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.customer_sub_type === "business" && !data.company_name) {
        return false;
      }
      return true;
    },
    {
      message: "Company name is required for business customers",
      path: ["company_name"],
    }
  );

export type CustomerType = z.infer<typeof customerSchema> & {
  status: "pending" | "rejected" | "approved";
};
