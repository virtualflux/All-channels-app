export interface InventoryChartAccounts {
  code: number;
  message: string;
  chartofaccounts: Chartofaccount[];
}

export interface Chartofaccount {
  account_id: string;
  account_name: string;
  account_code: string;
  account_type: string;
  is_user_created: boolean;
  is_system_account: boolean;
  is_standalone_account: boolean;
  is_active: boolean;
  can_show_in_ze: boolean;
  is_involved_in_transaction: boolean;
  current_balance: null;
  parent_account_id: string;
  parent_account_name: string;
  depth: string;
  has_attachment: boolean;
  is_child_present: string;
  child_count: string;
  documents: string[];
  created_time: string;
  last_modified_time: string;
}
