import { ProductType } from "@/app/api/db/products/type/product.type";
import { FormikProps } from "formik";
import SearchableDropdown from "../ui/SearchAbleDropdown";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import { LocationResponse } from "@/types/location.type";

export interface ILocationInput {
  locationIndex: number;

  formik: FormikProps<
    Omit<
      ProductType,
      "product_type" | "ignore_auto_number_generation" | "status" | "createdBy"
    >
  >;
}
const LocationInput = ({ locationIndex, formik }: ILocationInput) => {
  const fetchLocations = async () => {
    try {
      const res = await axios.get<{
        message: string;
        data: LocationResponse["locations"];
      }>(`/api/zoho/locations`);

      return res.data.data;
    } catch (error: any) {
      let message = "Error fetching Locations try refresh the browser please";
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data);
        message = error.response?.data.message;
      }

      toast.error(message);
      return [];
    }
  };

  const { data: locations, isLoading: locationLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });

  const selectedLocationIds =
    formik.values.locations
      ?.map((loc, idx) => (idx !== locationIndex ? loc.location_id : null))
      .filter(Boolean) ?? [];

  const availableLocations =
    (locations ?? []).filter(
      (loc) => !selectedLocationIds.includes(loc.location_id)
    ) ?? [];

  return (
    <>
      <div className="w-full grid grid-cols-12 gap-2">
        <div className="col-span-full md:col-span-6">
          <label className="block text-sm font-medium text-zinc-700 mb-1 mt-2">
            Location
          </label>
          <SearchableDropdown
            options={availableLocations.map((item) => ({
              name: item.location_name,
              value: item.location_id,
            }))}
            value={formik.values.locations[locationIndex].location_id ?? ""}
            onSelect={(data) => {
              const locationInput = formik.values.locations;
              locationInput[locationIndex] = {
                ...locationInput[locationIndex],
                location_id: data.value,
                location_name: data.name,
              };
              formik.setFieldValue("locations", locationInput);
            }}
            placeholder="Select a location"
            className=""
          />
          {formik.touched?.locations &&
          formik.touched?.locations[locationIndex].location_name &&
          formik.errors?.locations &&
          (formik.errors.locations[locationIndex] as any).location_name ? (
            <div className="mt-1 text-sm text-red-600">
              {(formik.errors.locations[locationIndex] as any).location_name}
            </div>
          ) : null}
        </div>
        <div className="col-span-full md:col-span-3 h-full flex flex-col justify-between">
          <label className="block text-sm font-medium text-zinc-700 mb-1 mt-2">
            Opening Stock
          </label>
          <input
            className=" text-black border rounded-md w-full p-2"
            onChange={(e) => {
              const locationInput = formik.values.locations;
              locationInput[locationIndex] = {
                ...locationInput[locationIndex],
                location_stock_on_hand: +e.target.value,
              };
              formik.setFieldValue("locations", locationInput);
            }}
            type="number"
            name="location_stock_on_hand"
            value={
              formik.values.locations[locationIndex].location_stock_on_hand ?? 0
            }
          />
        </div>
        <div className="col-span-full md:col-span-3 h-full flex flex-col justify-between">
          <label className="block text-sm font-medium text-zinc-700 mb-1 mt-2">
            Opening Stock Value
          </label>
          <input
            className="text-black border rounded-md w-full p-2"
            onChange={(e) => {
              const locationInput = formik.values.locations;
              locationInput[locationIndex] = {
                ...locationInput[locationIndex],
                initial_stock_rate: +e.target.value,
              };
              formik.setFieldValue("locations", locationInput);
            }}
            type="number"
            name="initial_stock_rate"
            value={
              formik.values.locations[locationIndex].initial_stock_rate ?? 0
            }
          />
        </div>
      </div>
    </>
  );
};

export default LocationInput;
