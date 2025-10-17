export interface LocationResponse {
  code: number;
  message: string;
  locations: Location[];
}

export interface Location {
  location_id: string;
  location_name: string;
  type: Type;
  address: Address;
  phone: string;
  tax_settings_id: string;
  website: string;
  fax: string;
  email: Email;
  is_location_active: boolean;
  is_primary_location: boolean;
  autonumbergenerationgroup_id: AutonumbergenerationgroupID;
  autonumbergenerationgroup_name: AutonumbergenerationgroupName;
  parent_location_id: string;
  is_storage_location_enabled: boolean;
  total_zones: number | string;
  shippingzones: any[];
  is_fba_location: boolean;
  sales_channels: any[];
}

export interface Address {
  attention: string;
  street_address1: StreetAddress1;
  street_address2: string;
  city: City;
  postal_code: string;
  country: Country;
  state: City;
  state_code: StateCode;
}

export enum City {
  Empty = "",
  Lagos = "Lagos",
}

export enum Country {
  Nigeria = "Nigeria",
}

export enum StateCode {
  Empty = "",
  La = "LA",
}

export enum StreetAddress1 {
  Empty = "",
  The15OpebiLinkRoadLagos = "15 Opebi Link road, Lagos",
}

export enum AutonumbergenerationgroupID {
  Empty = "",
  The4402407000000721003 = "4402407000000721003",
}

export enum AutonumbergenerationgroupName {
  DefaultTransactionSeries = "Default Transaction Series",
  Empty = "",
}

export enum Email {
  Empty = "",
  User1Demo1VirtualfluxAfrica = "user1@demo1.virtualflux.africa",
}

export enum Type {
  General = "general",
  LineItemOnly = "line_item_only",
}
