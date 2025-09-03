import { NextRequest } from "next/server";
import mongoose, { Types } from "mongoose";
import { headers } from "next/headers";
import { UserPayload } from "@/types/user-payload.type";
import { Product, ProductType } from "../schema";

import dB from "@/lib/db/db";
import { HttpStatusCode } from "axios";
import { ZohoTokenHelper } from "@/lib/zoho-token-helper";
import { AxiosService } from "@/lib/axios.config";
import { IUser } from "@/types/user.type";
import { sendStatusMail } from "@/lib/email-service";
import User from "../../users/schema";

interface ZohoInventoryItem {
  name: string;
  unit: string;
  description?: string;
  rate: number;
  account_id: string;
  purchase_rate: number;
  purchase_description?: string;
  purchase_account_id: string;
  inventory_account_id?: string;
  item_type: "sales" | "purchases" | "inventory" | "services";
  product_type?: string;
  is_returnable?: boolean;
  sku?: string;
  initial_stock?: number;
  initial_stock_rate?: number;
  reorder_level?: number;
  inventory_valuation_method?: "fifo" | "wac";
  status?: "active" | "inactive";
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return Response.json({ message: "Invalid product id" }, { status: 400 });
    }

    await dB();

    const hdrs = await headers();
    const claims: UserPayload = JSON.parse(hdrs.get("x-user-payload") ?? "{}");
    if (!claims?.userId) {
      return Response.json(
        { message: "User is not allowed to perform this operation" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const { status } = body;

    const product = (await Product.findOne({ _id: id })) as ProductType & {
      createdAt: string;
      updatedAt: string;
    } & mongoose.Document;

    if (!product) {
      return Response.json(
        { message: "Product not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    let createdByUser: (IUser & mongoose.Document) | null;

    createdByUser = await User.findById(product.createdBy.toString());
    if (status === "approved") {
      try {
        const zohoItemPayload: ZohoInventoryItem = {
          name: product.name,
          unit: product.unit,
          description: product.description,
          rate: product.rate,
          account_id: product.account_id,
          purchase_rate: product.purchase_rate,
          purchase_description: product.purchase_description,
          purchase_account_id: product.purchase_account_id,

          item_type: "inventory", // Default to inventory, adjust as needed
          product_type: product.product_type,
          is_returnable: product.returnable_item,
          reorder_level: product.reorder_level,
          inventory_valuation_method: product.inventory_valuation_method,
          ...(product.inventory_account_id && {
            inventory_account_id: product.inventory_account_id,
          }),
        };

        const createdItem = await createZohoInventoryItem(zohoItemPayload);
      } catch (error: any) {
        console.error(
          "Zoho Inventory creation error:",
          error.response?.data || error.message
        );
        return Response.json(
          {
            message: "Failed to create product in Zoho Inventory",
            error: error.response?.data?.message || error.message,
          },
          { status: HttpStatusCode.InternalServerError }
        );
      }
    }

    // Update the product status
    product.status = status;
    await product.save();

    if (createdByUser?.email) {
      await sendStatusMail(createdByUser.email, {
        status: status as any,
        itemType: "Product",
        itemName: product.name ?? "",
        actorName: claims.fullName,
        decisionAt: product.updatedAt as any,
        submittedAt: product.createdAt,
      });
    }

    return Response.json(
      { message: "Product status updated successfully", data: product },
      { status: 200 } // HttpStatusCode.Ok
    );
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return Response.json(
        { message: "Invalid body", errors: e.flatten?.() ?? e },
        { status: 400 } // HttpStatusCode.BadRequest
      );
    }
    console.error("Product update error:", e);
    return Response.json(
      { message: e?.message ?? "Internal Server Error" },
      { status: 500 } // HttpStatusCode.InternalServerError
    );
  }
}

async function createZohoInventoryItem(itemData: ZohoInventoryItem) {
  const accessToken = await ZohoTokenHelper.getAccessToken();

  const response = await AxiosService.post(
    `inventory/v1/items?organization_id=${process.env.ZOHO_ORG_ID}`,
    {
      ...itemData,
    },
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  //   console.log({ itemData: JSON.stringify(response.data, null, 3) });

  return response;
}
