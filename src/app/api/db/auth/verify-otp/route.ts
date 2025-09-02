import { NextRequest } from "next/server";
import dB from "@/lib/db/db";
import { HttpStatusCode } from "axios";
import { User } from "../../users/schema";
import Token from "@/app/api/db/token/schema";
import { generateAccessToken } from "@/lib/utils";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const TOKEN_EXPIRES_IN = 15 * 60 * 1000;
    await dB();

    const { email, code }: { email: string; code: string } =
      await request.json();

    const user = await User.findOne({ email });

    if (!user?._id)
      return Response.json(
        { message: "Invalid credential. Please check your details" },
        { status: HttpStatusCode.BadRequest }
      );

    const token = await Token.findOne({ identifier: email, code });
    if (!token?._id) {
      return Response.json(
        { message: " code not found" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const currentDateTime = new Date().getTime();
    const tokenStartTime = new Date(token!.createdAt).getTime();
    const timeDiff = currentDateTime - tokenStartTime;
    const isTokenActive = timeDiff >= 0 && timeDiff <= TOKEN_EXPIRES_IN;
    if (!isTokenActive) {
      return Response.json(
        { message: "Invalid code" },
        { status: HttpStatusCode.Unauthorized }
      );
    }
    const accessToken = generateAccessToken({
      email: user.email,
      role: user.role,
      userId: user._id.toString(),
    });
    // console.log({ accessToken });
    const maxAge = 60 * 60;

    (await cookies()).set("accessToken", accessToken, {
      httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return Response.json(
      { message: "Login successful", accessToken, role: user.role },
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
