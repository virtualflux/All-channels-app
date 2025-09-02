import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  fullName: string;
  email: string;
  // phoneNumber: string
  role: UserRole;
}

export enum UserRole {
  CEO = "ceo",
  STAFF = "staff",
}
