import { NextRequest } from "next/server";
import dB from "@/lib/db/db";
import { HttpStatusCode } from "axios";
import { User } from "../../users/schema";
export async function POST(request: NextRequest) {
  try {
    await dB();

    const { email }: { email: string } = await request.json();

    const user = await User.findOne({ email });

    if (!user?._id)
      return Response.json(
        { message: "Invalid credential. Please check your details" },
        { status: HttpStatusCode.BadRequest }
      );

    return Response.json(
      { message: "OTP sent !" },
      { status: HttpStatusCode.Ok }
    );
  } catch (e) {
    console.error(e);
    return Response.json(
      { message: "Internal Server error, customer was not fetched" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
