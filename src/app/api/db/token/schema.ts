import { model, Schema } from "mongoose";
import { IToken } from "../../../../../types/token.type";

const TokenSchema = new Schema<IToken>(
  {
    identifier: {
      type: String,
      required: [true, "Email or phone number is required"],
      trim: true,
      lowercase: true,
    },
    code: {
      type: String,
      required: [true, "provide 6 digit code"],
      maxLength: 6,
      minLength: 6,
    },
  },
  { timestamps: true }
);

export default model("Token", TokenSchema);
