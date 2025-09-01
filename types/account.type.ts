import { AccountType } from "@/app/api/db/accounts/schema";

export interface IAccount {
  _id: string;
  account_name: string;
  account_type: string;
  account_code: string;
  description: string;
  status: AccountType["status"];
}
