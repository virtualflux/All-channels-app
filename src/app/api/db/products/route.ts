import dB from "@/lib/db/db";
import { headers } from "next/headers";
import axios, { HttpStatusCode } from "axios";
import { Product } from "./schema";
import { NextRequest } from "next/server";
import { UserPayload as AuthPayload } from "@/types/user-payload.type";

export async function GET(request: NextRequest) {
  try {
    await dB();
     const { searchParams } = new URL(request.url);
     const page = parseInt(searchParams.get("page") || "1");

     const limit = 100;
     const skip = (page - 1) * limit;

     const totalProduct = await Product.countDocuments();
     const product = await Product.find()
       .sort({ createdAt: -1 })
       .skip(skip)
       .limit(limit)
       .populate("createdBy")
       .exec();

     return Response.json(
       { message: "Products fetched", data: product, count: totalProduct },
       { status: HttpStatusCode.Ok }
     );
  } catch (e) {
    console.log(e);
    return Response.json(
      { message: "Internal Server error, customer was not fetched" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dB();
    const hdrs = await headers();

    const claims: AuthPayload = JSON.parse(hdrs.get("x-user-payload") ?? "{}");

    if (!claims?.userId)
      return Response.json(
        { message: "User is not allowed to perform this operation." },
        { status: HttpStatusCode.Forbidden }
      );

    // const account = await axios.get('/api/zoho/accounts')

    const ACCOUNT_ID = "4402407000021043011";

    const body = await request.json();
    console.log("Body", body);

    const product = new Product({
      ...body,
      account_id: ACCOUNT_ID,
      createdBy: claims.userId,
    });

    await product.save();
    return Response.json(
      { message: "Product added", data: product },
      { status: HttpStatusCode.Created }
    );
  } catch (e) {
    console.log(e);
    return Response.json(
      { message: "Internal Server error, product was not added" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
