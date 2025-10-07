import { z } from "zod";
export const priceListSchema = z
  .object({
    name: z.string({ message: "Name is required" }).min(1, "Name is required"),
    description: z.string().optional(),
    currency_id: z
      .string({ message: "Currency must be selected" })
      .min(1, "Currency is required"),
    sales_or_purchase_type: z.enum(["sales", "purchases"], {
      message: "Please select either sales or purchases",
    }),
    rounding_type: z.enum([
      "no_rounding",
      "round_to_dollar",
      "round_to_dollar_minus_01",
      "round_to_half_dollar",
      "round_to_half_dollar_minus_01",
    ]),
    pricebook_type: z.enum(["per_item", "fixed_percentage"], {
      errorMap: () => ({ message: "Pricebook type is required" }),
    }),
    pricebook_items: z.array(
      z.object({
        item_id: z.string().min(1, "Item is required"),
        pricebook_rate: z
          .number({ invalid_type_error: "Rate is required" })
          .nonnegative("Rate cannot be negative"),
      })
    ),
    percentage: z
      .number({ invalid_type_error: "Percentage is required" })
      .positive("Percentage must be greater than 0")
      .max(100000, "Too large")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.pricebook_type === "per_item") {
        return data.pricebook_items && data.pricebook_items.length > 0;
      }
      return true;
    },
    {
      message: "Add at least one item for per-item pricebook",
      path: ["pricebook_items"],
    }
  )
  .refine(
    (data) => {
      if (data.pricebook_type === "per_item") {
        return data.pricebook_items.every(
          (item) => item.item_id && item.pricebook_rate !== undefined
        );
      }
      return true;
    },
    {
      message: "All items must have valid item and rate for Per item pricebook",
      path: ["pricebook_items"],
    }
  )
  .refine(
    (data) => {
      if (data.pricebook_type === "fixed_percentage") {
        return data.percentage !== undefined && data.percentage > 0;
      }
      return true;
    },
    {
      message:
        "Percentage is required and must be greater than 0 for fixed percentage pricebook",
      path: ["percentage"],
    }
  )
  .refine(
    (data) => {
      if (data.pricebook_type === "fixed_percentage") {
        return !data.pricebook_items || data.pricebook_items.length === 0;
      }
      return true;
    },
    {
      message:
        "Pricebook items should not be provided for fixed percentage pricebook",
      path: ["pricebook_items"],
    }
  );

export type PriceListType = z.infer<typeof priceListSchema>;
