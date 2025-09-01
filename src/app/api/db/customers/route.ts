import { NextRequest } from "next/server";

import dB from "@/lib/db/db";
import { Customer } from "./schema";
import { HttpStatusCode } from "axios";
export async function GET(request: NextRequest) {
  try {
    await dB();
    const customers = await Customer.find().exec();

    return Response.json(
      { message: "Customers", data: customers },
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

    const body = await request.json();
    const contact_persons = body.contact_persons;

    const customer = new Customer({
      ...body,
      contact_persons: contact_persons,
    });

    await customer.save();
    return Response.json(
      { message: "Customer added", data: customer },
      { status: HttpStatusCode.Created }
    );
  } catch (e) {
    console.log(e);
    return Response.json(
      { message: "Internal Server error, customer was not fetched" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
