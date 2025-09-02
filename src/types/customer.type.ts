import { CustomerType } from "@/app/api/db/customers/schema";
import { Types } from "mongoose";

export interface ICustomer {
  _id: string;
  createdBy?: string;
  company_name?: string;
  contact_name: string;
  customer_sub_type: string;
  account_name: string;
  account_type: string;
  account_code: string;
  description: string;
  contact_persons: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}
