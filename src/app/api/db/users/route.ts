import { NextRequest } from "next/server";
import dB from "@/lib/db/db";
import { HttpStatusCode } from "axios";
import User from "./schema";

export async function POST(request: NextRequest) {
  try {
    // console.log({ customer });
    const { email }: { email: string } = await request.json();
    await dB();

    const user = await User.findOne({ email });

    return Response.json([]);
  } catch (e) {
    console.error(e);
    return Response.json(
      { message: "Internal Server error, customer was not fetched" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
