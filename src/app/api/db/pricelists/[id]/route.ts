import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { headers } from "next/headers";
import dB from "@/lib/db/db";
import { UserPayload } from "@/types/user-payload.type";
import { PriceList } from "../schema";
import { HttpStatusCode } from "axios";
import { ZohoTokenHelper } from "@/lib/zoho-token-helper";
import { AxiosService } from "@/lib/axios.config";

interface ZohoPriceBook {
  name: string;
  description?: string;
  currency_id: string;
  pricebook_type: "per_item" | "fixed_percentage";
  rounding_type:
    | "no_rounding"
    | "round_to_dollar"
    | "round_to_dollar_minus_01"
    | "round_to_half_dollar"
    | "round_to_half_dollar_minus_01";
  status: "active" | "inactive";
  pricebook_items?: Array<{
    item_id: string;
    pricebook_rate: number;
  }>;
  percentage?: number;
  is_increase?: boolean;
  sales_or_purchase_type: "sales" | "purchases";
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "Invalid pricelist id" },
        { status: 400 }
      );
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
    const { status } = body;

    const priceList = await PriceList.findOne({ _id: id });

    if (!priceList) {
      return Response.json(
        { message: "PriceList not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    if (status === "approved") {
      try {
        const zohoPriceBookPayload: ZohoPriceBook = {
          name: priceList.name,
          description: priceList.description,
          currency_id: priceList.currency_id,
          sales_or_purchase_type: priceList.sales_or_purchase_type,
          pricebook_type: priceList.pricebook_type as any,
          rounding_type: priceList.rounding_type,
          status: "active",
          ...(priceList.pricebook_items.length && {
            pricebook_items: priceList.pricebook_items.map((item) => ({
              item_id: item.item_id,
              pricebook_rate: item.pricebook_rate,
            })),
          }),
          ...(priceList.percentage && { percentage: priceList.percentage }),
          ...(priceList.pricebook_type == "per_item" && {
            is_increase: priceList.is_increase,
          }),
        };

        console.log({ payload: JSON.stringify(zohoPriceBookPayload, null, 2) });

        const createdPriceBook = await createZohoPriceBook(
          zohoPriceBookPayload
        );
      } catch (error: any) {
        console.error(
          "Zoho Inventory creation error:",
          error.response?.data || error.message
        );

        return Response.json(
          {
            message: "Failed to create pricelist in Zoho Inventory",
            error: error.response?.data?.message || error.message,
          },
          { status: HttpStatusCode.InternalServerError }
        );
      }
    }

    priceList.status = status;
    await priceList.save();

    return Response.json(
      { message: "PriceList status updated successfully", data: priceList },
      { status: HttpStatusCode.Ok }
    );
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return Response.json(
        { message: "Invalid body", errors: e.flatten?.() ?? e },
        { status: HttpStatusCode.BadRequest }
      );
    }
    console.error("PriceList update error:", e);
    return Response.json(
      { message: e?.message ?? "Internal Server Error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

async function createZohoPriceBook(priceBookData: ZohoPriceBook) {
  const accessToken = await ZohoTokenHelper.getAccessToken();

  const response = await AxiosService.post(
    `inventory/v1/pricebooks?organization_id=${process.env.ZOHO_ORG_ID}`,
    priceBookData,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response;
}
