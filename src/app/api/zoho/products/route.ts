import { AxiosService } from "@/lib/axios.config";
import { ZohoTokenHelper } from "@/lib/zoho-token-helper";
import { ZohoInventoryItems } from "@/types/zoho-inventory-items.type";
import axios, { HttpStatusCode } from "axios";

export async function GET() {
  try {
    const accessToken = await ZohoTokenHelper.getAccessToken();
    const response = await AxiosService.get<ZohoInventoryItems>(
      `inventory/v1/items?organization_id=${process.env.ZOHO_ORG_ID}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      }
    );

    return Response.json(
      { message: "Products fetched", data: response.data.items },
      { status: HttpStatusCode.Ok }
    );
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.log(error.response?.data);
      return Response.json(
        {
          message:
            error.response?.data?.message ||
            error.message ||
            "Internal server error",
        },
        { status: error.response?.status || 500 }
      );
    }
    return Response.json(
      { message: error?.message || "Internal server error" },
      { status: error?.response?.status || 500 }
    );
  }
}
