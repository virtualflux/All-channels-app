export interface ZohoInventoryItems {
  code: number;
  message: string;
  items: Item[];
}

export interface Item {
  group_id: number;
  group_name: string;
  item_id: number;
  name: string;
  unit: string;
  item_type: string;
  product_type: string;
  is_taxable: boolean;
  tax_id: number;
  description: string;
  tax_name: string;
  tax_percentage: number;
  tax_type: string;
  purchase_account_id: number;
  purchase_account_name: string;
  account_name: string;
  inventory_account_id: number;
  attribute_id1: number;
  attribute_name1: string;
  status: string;
  source: string;
  rate: number;
  pricebook_rate: number;
  purchase_rate: number;
  reorder_level: number;
  vendor_id: number;
  vendor_name: string;
  locations: Location[];
  sku: string;
  upc: number;
  ean: number;
  isbn: number;
  part_number: number;
  attribute_option_id1: number;
  attribute_option_name1: string;
  image_id: number;
  image_name: string;
  purchase_description: string;
  image_type: string;
  item_tax_preferences: ItemTaxPreference[];
  hsn_or_sac: number;
  sat_item_key_code: string;
  unitkey_code: string;
  custom_fields: CustomField[];
}

export interface CustomField {
  customfield_id: string;
  value: string;
}

export interface ItemTaxPreference {
  tax_id: number;
  tax_specification: string;
}

export interface Location {
  location_id: string;
  location_name: string;
  status: string;
  is_primary: boolean;
  location_stock_on_hand: string;
  location_available_stock: string;
  location_actual_available_stock: string;
}
