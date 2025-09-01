import mongoose from "mongoose";
import { IUser, UserRole } from "../../../../../types/user.type";

/* Userschema will correspond to a collection in your MongoDB database. */
const UserSchema = new mongoose.Schema<IUser>({
  name: {
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
});

export const User = mongoose.model<IUser>("User", UserSchema);
