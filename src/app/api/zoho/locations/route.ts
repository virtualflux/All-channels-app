import { AxiosService } from "@/lib/axios.config";
import { ZohoTokenHelper } from "@/lib/zoho-token-helper";
import { LocationResponse } from "@/types/location.type";
import axios, { HttpStatusCode } from "axios";

export async function GET() {
  try {
    const accessToken = await ZohoTokenHelper.getAccessToken();
    const response = await AxiosService.get<LocationResponse>(
      `inventory/v1/locations?organization_id=${process.env.ZOHO_ORG_ID}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      }
    );

    return Response.json(
      { message: "Fetched locations", data: response.data.locations },
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
