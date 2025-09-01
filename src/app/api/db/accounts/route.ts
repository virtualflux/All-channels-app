import { NextRequest } from "next/server";
import dB from "@/lib/db/db";
import { HttpStatusCode } from "axios";
import Account from "./schema";
import { MongooseError } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await dB();
  } catch (e: any) {
    console.log(e);
    return Response.json(
      {
        message: e.message || "Internal Server error, customer was not fetched",
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dB();

    const body = await request.json();
    console.log({ body });

    const account = new Account({
      ...body,
    });

    await account.save();
    return Response.json(
      { message: "Account added", data: account },
      { status: HttpStatusCode.Created }
    );
  } catch (e: any) {
    console.log(e);

    return Response.json(
      {
        message: e.message || "Internal Server error, Account was not created",
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
