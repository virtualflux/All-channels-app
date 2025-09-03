import { UserRole } from "./user.type";

export interface UserPayload {
  email: string;
  fullName: string;
  role: UserRole;
  userId: string;
}
