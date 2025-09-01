import { NextRequest } from "next/server";

import dB from "@/lib/db/db";
import { HttpStatusCode } from "axios";
export async function GET(request: NextRequest) {
  try {
    await dB();
  } catch (e) {
    console.error(e);
    return Response.json(
      { message: "Internal Server error, customer was not fetched" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
