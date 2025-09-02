import { NextRequest } from "next/server";
import { HttpStatusCode } from "axios";
import { headers } from "next/headers";
import { Types } from "mongoose";
import { z } from "zod";
import dB from "@/lib/db/db";
import { Customer, CustomerType } from "../schema";
import type { UserPayload } from "@/types/user-payload.type";
import { ZohoTokenHelper } from "@/lib/zoho-token-helper";
import { AxiosService } from "@/lib/axios.config";

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

    const customer = await Customer.findOne({ _id: id, status: "pending" });

    if (!customer) {
      return Response.json(
        { message: "Customer not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    customer.status = status;

    if (status == "approved") {
      try {
        // await createZohoCustomer({
        //   customer_sub_type: customer.customer_sub_type,
        //   company_name: customer.company_name,
        //   contact_type: "customer",
        //   contact_name: customer.contact_name,
        //   contact_persons: [
        //     { ...customer.contact_persons[0], is_primary_contact: true },
        //   ],
        //   account_id: customer.account_id,
        //   ignore_auto_number_generation: false,
        // });
      } catch (error: any) {
        console.log(error.response?.data?.message);
        throw error;
      }
    }

    await customer.save();

    return Response.json(
      { message: "Customer status updated", data: customer },
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

async function createZohoCustomer(
  dto: Omit<CustomerType, "createdBy" | "status">
) {
  const accessToken = await ZohoTokenHelper.getAccessToken();
  const response = await AxiosService.post(
    `books/v3/contacts?organization_id=${process.env.ZOHO_ORG_ID}`,
    dto,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );
  return response;
}
