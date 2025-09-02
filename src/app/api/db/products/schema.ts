// import { Schema, Types, model, models, mongo } from "mongoose";

// interface IProduct {
//   createdBy: Types.ObjectId | string;
// }

// const ProductSchema = new Schema<IProduct>(
//   {
//     createdBy: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },
//     account_name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     zohoAccountId: {
//       type: String,
//       default: null,
//       trim: true,
//     },
//     description: {
//       type: String,
//     },
//     account_code: {
//       type: String,
//       required: true,
//       trim: true,
//       unique: true,
//     },
//     account_type: {
//       type: String,
//       lowercase: true,
//       required: true,
//     },
//     status: {
//       type: String,
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// export const Product = model<IProduct>("Product", ProductSchema);
