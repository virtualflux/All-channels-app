import { cookies } from "next/headers";
export async function POST() {
  (await cookies()).delete("accessToken");
  return new Response(null, { status: 204 });
}
