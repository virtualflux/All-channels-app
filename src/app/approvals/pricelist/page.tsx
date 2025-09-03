import PriceListsPage from "@/components/approvals/PriceList";
import { AxiosService } from "@/lib/axios.config";
import { ZohoTokenHelper } from "@/lib/zoho-token-helper";
import { ZohoCurrencies } from "@/types/zoho-inventory-currency.type";
import axios from "axios";





export default async function Index() {

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

        return (
            <>
                <PriceListsPage currencies={response.data.currencies} />
            </>
        );
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            let message =
                error.response?.data?.message ||
                error.message ||
                "Internal server error"
            return <div className="w-full"><p className=" text-center">{message}</p></div>
        }
        return <>
            <div className="w-full"><p className=" text-center">Error fetching data</p></div>
        </>
    }



}
