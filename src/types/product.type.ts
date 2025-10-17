export interface Welcome {
  code: number;
  message: string;
  item: Item;
}

export interface Item {
  item_id: string;
  name: string;
  sku: string;
  brand: string;
  manufacturer: string;
  category_id: string;
  category_name: string;
  image_name: string;
  image_type: string;
  status: Status;
  source: string;
  is_linked_with_zohocrm: boolean;
  zcrm_product_id: string;
  crm_owner_id: string;
  unit: string;
  unit_id: string;
  unit_conversions: any[];
  default_sales_unit_conversion_id: string;
  default_purchase_unit_conversion_id: string;
  description: string;
  rate: number;
  account_id: string;
  account_name: string;
  tax_id: string;
  tax_name: string;
  tax_percentage: number;
  tax_type: string;
  tax_status: string;
  tax_groups_details: string;
  tax_country_code: string;
  tax_information: string;
  purchase_tax_id: string;
  purchase_tax_name: string;
  purchase_tax_information: string;
  is_default_tax_applied: boolean;
  purchase_tax_percentage: number;
  purchase_tax_type: string;
  associated_template_id: string;
  documents: any[];
  purchase_description: string;
  pricebook_rate: number;
  pricing_scheme: string;
  price_brackets: any[];
  default_price_brackets: DefaultPriceBracket[];
  sales_rate: number;
  purchase_rate: number;
  sales_margin: string;
  purchase_account_id: string;
  purchase_account_name: string;
  inventory_account_id: string;
  inventory_account_name: string;
  created_time: string;
  offline_created_date_with_time: string;
  last_modified_time: string;
  tags: any[];
  can_be_sold: boolean;
  can_be_purchased: boolean;
  track_inventory: boolean;
  item_type: string;
  product_type: string;
  inventory_valuation_method: string;
  is_returnable: boolean;
  reorder_level: number;
  minimum_order_quantity: string;
  maximum_order_quantity: string;
  initial_stock: number;
  initial_stock_rate: number;
  total_initial_stock: number;
  vendor_id: string;
  vendor_name: string;
  stock_on_hand: number;
  asset_value: string;
  available_stock: number;
  actual_available_stock: number;
  committed_stock: number;
  actual_committed_stock: number;
  available_for_sale_stock: number;
  actual_available_for_sale_stock: number;
  lock_details: LockDetails;
  locked_actions: any[];
  locked_fields: CustomFieldHash;
  custom_fields: any[];
  custom_field_hash: CustomFieldHash;
  track_serial_number: boolean;
  track_batch_number: boolean;
  is_storage_location_enabled: boolean;
  is_fulfillable: boolean;
  upc: string;
  ean: string;
  isbn: string;
  part_number: string;
  is_combo_product: boolean;
  combo_type: string;
  image_sync_in_progress: boolean;
  sales_channels: SalesChannel[];
  locations: Location[];
  preferred_vendors: any[];
  package_details: PackageDetails;
  integration_references: any[];
}

export interface CustomFieldHash {}

export interface DefaultPriceBracket {
  start_quantity: number;
  end_quantity: number;
  pricebook_rate: number;
}

export interface Location {
  location_id: string;
  location_name: string;
  status: Status;
  is_primary: boolean;
  is_primary_location: boolean;
  is_item_mapped: boolean;
  location_stock_on_hand: number;
  initial_stock: number;
  initial_stock_rate: number;
  location_asset_value: number;
  location_available_stock: number;
  location_actual_available_stock: number;
  location_committed_stock: number;
  location_actual_committed_stock: number;
  location_available_for_sale_stock: number;
  location_actual_available_for_sale_stock: number;
  location_quantity_in_transit: number;
  serial_numbers: any[];
  batches: any[];
  storages: any[];
  is_storage_location_enabled: boolean;
  is_general_location: boolean;
  sales_channels: any[];
}

export enum Status {
  Active = "active",
}

export interface LockDetails {
  can_lock: boolean;
}

export interface PackageDetails {
  length: string;
  width: string;
  height: string;
  weight: string;
  weight_unit: string;
  dimension_unit: string;
}

export interface SalesChannel {
  integration_id: number;
  can_sync_item_images: boolean;
  is_image_sync_in_progress: boolean;
  channel_product_id: string;
  product_mapping_id: number;
  account_identifier: string;
  name: string;
  formatted_name: string;
  status: Status;
  channel_name: string;
  channel_sku: string;
  channel_group_id: string;
}
