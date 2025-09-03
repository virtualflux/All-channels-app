export interface ZohoCurrencies {
  code: number;
  message: string;
  currencies: Currency[];
}

export interface Currency {
  currency_id: string;
  currency_code: string;
  currency_name: string;
  currency_symbol: string;
  price_precision: number;
  currency_format: string;
  is_base_currency: boolean;
  exchange_rate: number;
  effective_date: Date;
}
