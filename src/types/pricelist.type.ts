export interface IPriceList {
  _id: string;
  name: string;
  description: string;
  currency_id: string;
  sales_or_purchase_type: string;
  rounding_type:
    | "no_rounding"
    | "round_to_dollar"
    | "round_to_dollar_minus_01"
    | "round_to_half_dollar"
    | "round_to_half_dollar_minus_01";
  pricebook_type: string;
  is_increase: boolean;

  pricebook_items: { item_id: string; pricebook_rate: number }[];
  createdBy: string;
  status: "pending" | "rejected" | "approved";
  createdAt: string;
  updatedAt: string;
}
