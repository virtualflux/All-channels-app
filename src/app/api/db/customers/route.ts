import { NextRequest } from "next/server";
import { headers } from "next/headers";
import dB from "@/lib/db/db";
import { Customer } from "./schema";
import { HttpStatusCode } from "axios";
import { UserPayload as AuthPayload } from "@/types/user-payload.type";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");

    const limit = 100;
    const skip = (page - 1) * limit;
    await dB();
    const totalCustomers = await Customer.countDocuments();
    const customers = await Customer.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy")
      .exec();

    return Response.json(
      { message: "Customers", data: customers, count: totalCustomers },
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
    const contact_persons = body.contact_persons;

    const customer = new Customer({
      ...body,
      contact_persons: contact_persons,
      createdBy: claims.userId,
    });

    await customer.save();
    return Response.json(
      { message: "Customer added", data: customer },
      { status: HttpStatusCode.Created }
    );
  } catch (e) {
    console.log(e);
    return Response.json(
      { message: "Internal Server error, customer was not added" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
