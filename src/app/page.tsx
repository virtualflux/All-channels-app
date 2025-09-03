import AuthComponent from "@/components/auth/Auth";
import { connection } from "next/server";

export default async function Home() {
  await connection()
  return (
    <>
      <AuthComponent />
    </>
  );
}
