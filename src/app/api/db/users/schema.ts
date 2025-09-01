import mongoose from "mongoose";
import { IUser, UserRole } from "../../../../../types/user.type";

/* Userschema will correspond to a collection in your MongoDB database. */
const UserSchema = new mongoose.Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Please provide a name"],
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Please provide a emai."],
      lowercase: true,
    },
    role: {
      type: String,
      enum: UserRole,
      default: UserRole.STAFF,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
