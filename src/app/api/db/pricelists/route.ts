import dB from "@/lib/db/db";
import { headers } from "next/headers";
import { HttpStatusCode } from "axios";
import { PriceList } from "./schema";
import { NextRequest } from "next/server";
import { UserPayload as AuthPayload } from "@/types/user-payload.type";

export async function GET(request: NextRequest) {
  try {
    await dB();
    const priceList = await PriceList.find()
      .sort({ createdAt: -1 })
      .populate("createdBy")
      .exec();
      

    return Response.json(
      { message: "Price lists fetched", data: priceList },
      { status: HttpStatusCode.Ok }
    );
  } catch (e) {
    console.log(e);
    return Response.json(
      { message: "Internal Server error, price list was not fetched" },
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

    const priceList = new PriceList({
      ...body,
      createdBy: claims.userId,
    });

    await priceList.save();
    return Response.json(
      { message: "Price list added", data: priceList },
      { status: HttpStatusCode.Created }
    );
  } catch (e) {
    console.log(e);
    return Response.json(
      { message: "Internal Server error, price list was not added" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
