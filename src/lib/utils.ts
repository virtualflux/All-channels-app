import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserRole } from "../types/user.type";
import jwt from "jsonwebtoken";
import { UserPayload } from "@/types/user-payload.type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateOtp() {
  const code = Math.floor(100000 + Math.random() * 700000);

  return code.toString();
}

export function generateAccessToken(payload: UserPayload) {
  const accessToken = jwt.sign(payload, process.env.SECRET_KEY || "");
  return accessToken;
}
