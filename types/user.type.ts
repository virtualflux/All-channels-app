import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  // phoneNumber: string
  role: string;
}

export enum UserRole {
  CEO = "ceo",
  STAFF = "staff",
}
