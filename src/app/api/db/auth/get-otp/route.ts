import { NextRequest } from "next/server";
import dB from "@/lib/db/db";
import { HttpStatusCode } from "axios";
import { User } from "../../users/schema";
import Token from "@/app/api/db/token/schema";
import { generateOtp } from "@/lib/utils";
import { sendOTPEmail } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    await dB();

    const { email }: { email: string } = await request.json();

    const user = await User.findOne({ email });

    if (!user?._id)
      return Response.json(
        { message: "Invalid credential. Please check your details" },
        { status: HttpStatusCode.NotFound }
      );

    const token = await Token.findOne({ identifier: email });
    if (token?._id) {
      await Token.deleteOne({ identifier: email });
    }

    const code = generateOtp();
    const newToken = await Token.create({
      identifier: email,
      code,
    });
    if (!newToken) {
      return Response.json(
        { message: "Internal Server error, code was not created successfully" },
        { status: HttpStatusCode.InternalServerError }
      );
    }
    //SEND OTP HERE TO EMAIL
    await sendOTPEmail(user.email, code);
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
