import dB from "@/lib/db/db";
import { headers } from "next/headers";
import { HttpStatusCode } from "axios";
import Account from "../accounts/schema";
import { Product } from "./productSchema";
import { NextRequest } from "next/server";
import { IAccount } from "@/types/account.type";
import { UserPayload as AuthPayload } from "@/types/user-payload.type";

export async function POST(request: NextRequest) {
  try {
    await dB();
    const hdrs = await headers();

    const claims: AuthPayload = JSON.parse(hdrs.get("x-user-payload") ?? "{}");
    console.log("Claims", claims)

    if (!claims?.userId)
      return Response.json(
        { message: "User is not allowed to perform this operation." },
        { status: HttpStatusCode.Forbidden }
      );

    const body = await request.json();
    console.log("Body", body)
    // const account: IAccount | null = await Account.findOne({
    //   _id: body.account_id,
    // });

    // if (!account?._id) {
    //   return Response.json(
    //     { message: "Account was not found" },
    //     { status: HttpStatusCode.NotFound }
    //   );
    // }
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
