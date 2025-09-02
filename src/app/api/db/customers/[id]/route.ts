import { NextRequest } from "next/server";
import { HttpStatusCode } from "axios";
import { headers } from "next/headers";
import { Types } from "mongoose";
import { z } from "zod";
import dB from "@/lib/db/db";
import { Customer } from "../schema";
import type { UserPayload } from "@/types/user-payload.type";

const BodySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return Response.json({ message: "Invalid customer id" }, { status: 400 });
    }

    await dB();
    const customer = await Customer.findById(id);
    if (!customer) {
      return Response.json({ message: "Customer not found" }, { status: 404 });
    }

    return Response.json(
      { message: "Customer fetched", data: customer },
      { status: HttpStatusCode.Ok }
    );
  } catch (e: any) {
    console.error(e);
    return Response.json(
      { message: e?.message ?? "Internal Server Error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return Response.json({ message: "Invalid customer id" }, { status: 400 });
    }

    await dB();

    const hdrs = await headers();
    const claims: UserPayload = JSON.parse(hdrs.get("x-user-payload") ?? "{}");
    if (!claims?.userId) {
      return Response.json(
        { message: "User is not allowed to perform this operation" },
        { status: HttpStatusCode.Forbidden }
      );
    }

    const body = await req.json();
    const { status } = BodySchema.parse(body);

    const updated = await Customer.findOneAndUpdate(
      { _id: id, status: "pending" },
      { $set: { status } },
      { new: true }
    );

    if (!updated) {
      return Response.json(
        { message: "Customer not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    return Response.json(
      { message: "Customer status updated", data: updated },
      { status: HttpStatusCode.Ok }
    );
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return Response.json(
        { message: "Invalid body", errors: e.flatten?.() ?? e },
        { status: HttpStatusCode.BadRequest }
      );
    }
    console.error(e);
    return Response.json(
      { message: e?.message ?? "Internal Server Error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

async function createZohoCustomer() {}
