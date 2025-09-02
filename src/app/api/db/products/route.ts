import dB from "@/lib/db/db";
import { headers } from "next/headers";
import { HttpStatusCode } from "axios";
import { Product } from "./schema";
import { NextRequest } from "next/server";
import { UserPayload as AuthPayload } from "@/types/user-payload.type";

export async function GET(request: NextRequest) {
  try {
    await dB();
    const product = await Product.find().exec();

    return Response.json(
      { message: "Products fetched", data: product },
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

    const body = await request.json();
    console.log("Body", body);

    const product = new Product({
      ...body,
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
