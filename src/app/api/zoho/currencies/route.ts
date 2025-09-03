import { AxiosService } from "@/lib/axios.config";
import { ZohoTokenHelper } from "@/lib/zoho-token-helper";
import { ZohoCurrencies } from "@/types/zoho-inventory-currency.type";
import axios, { HttpStatusCode } from "axios";

export async function GET() {
  try {
    const accessToken = await ZohoTokenHelper.getAccessToken();
    const response = await AxiosService.get<ZohoCurrencies>(
      `inventory/v1/settings/currencies?organization_id=${process.env.ZOHO_ORG_ID}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      }
    );

    return Response.json(
      { message: "Currencies fetched", data: response.data.currencies },
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
