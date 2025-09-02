import { NextRequest } from "next/server";
import dB from "@/lib/db/db";
import { HttpStatusCode } from "axios";
import Account, { AccountType } from "./schema";
import { FilterQuery, mongo } from "mongoose";
import { headers } from "next/headers";
import { UserPayload } from "@/types/user-payload.type";
import { UserRole } from "@/types/user.type";
import { IAccount } from "@/types/account.type";

const ALLOWED_STATUSES = new Set<"pending" | "approved" | "rejected">([
  "pending",
  "approved",
  "rejected",
]);

export async function GET(request: NextRequest) {
  try {
    const filter: FilterQuery<IAccount> = {};
    const query = request.nextUrl.searchParams;
    const status = query.get("status");

    if (status) filter.status = status;
    await dB();
    const accounts = await Account.find({ ...filter });

    return Response.json(
      {
        message: "Account fetched",
        data: accounts,
      },
      { status: HttpStatusCode.Ok }
    );
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
    const hdrs = await headers();
    console.log(JSON.stringify(hdrs, null, 2));
    const claims: UserPayload = JSON.parse(hdrs.get("x-user-payload") ?? "{}");
    // console.log({ claims });

    const body = await request.json();
    console.log({ body });

    if (!claims?.userId)
      return Response.json(
        { message: "User is not allowed to perform this operation." },
        { status: HttpStatusCode.Forbidden }
      );

    const account = new Account({
      ...body,
      createdBy: new mongo.ObjectId(claims.userId),
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
