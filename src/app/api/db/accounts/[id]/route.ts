import { NextRequest } from "next/server";
import { HttpStatusCode } from "axios";
import { headers } from "next/headers";
import { Types } from "mongoose";
import { z } from "zod";
import dB from "@/lib/db/db";
import Account, { AccountType } from "../schema";
import type { UserPayload } from "@/types/user-payload.type";
import { ZohoTokenHelper } from "@/lib/zoho-token-helper";
import { AxiosService } from "@/lib/axios.config";
import { sendStatusMail } from "@/lib/email-service";
import { IUser } from "@/types/user.type";

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
      return Response.json({ message: "Invalid account id" }, { status: 400 });
    }

    await dB();
    const account = await Account.findById(id);
    if (!account) {
      return Response.json({ message: "Account not found" }, { status: 404 });
    }

    return Response.json(
      { message: "Account fetched", data: account },
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
      return Response.json({ message: "Invalid account id" }, { status: 400 });
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

    const account = await Account.findOne(
      { _id: id, status: "pending" },
      {},
      { populate: ["createdBy"] }
    );
    if (!account) {
      return Response.json(
        { message: "Account not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    const createdByUser: IUser = account?.createdBy as unknown as IUser;

    account.status = status;

    if (status == "approved") {
      try {
        const res = await createZohoChartAccount({
          account_code: account.account_code,
          account_name: account.account_name,
          account_type: account.account_type,
          description: account.description ?? "",
        });
        if (res.data.data) {
          const data = res.data.data;
          account.zohoAccountId = data.id;
        }
      } catch (error: any) {
        console.log(error.response?.data?.message);
        throw error;
      }
    }

    await account.save();

    return Response.json(
      { message: "Account status updated", data: account },
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

async function createZohoChartAccount(
  dto: Omit<AccountType, "createdBy" | "status">
) {
  const accessToken = await ZohoTokenHelper.getAccessToken();
  const response = await AxiosService.post(
    `books/v3/chartofaccounts?organization_id=${process.env.ZOHO_ORG_ID}`,
    dto,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );
  return response;
}
