import { AxiosService } from "@/lib/axios.config";
import { ZohoTokenHelper } from "@/lib/zoho-token-helper";
import { InventoryChartAccounts } from "@/types/zoho-inventory-chartaccounts.type";
import axios, { HttpStatusCode } from "axios";

export async function GET() {
  try {
    const accessToken = await ZohoTokenHelper.getAccessToken();
    const response = await AxiosService.get<InventoryChartAccounts>(
      `books/v3/chartofaccounts?organization_id=${process.env.ZOHO_ORG_ID}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      }
    );

    return Response.json(
      { message: "Accounts fetched", data: response.data.chartofaccounts },
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
