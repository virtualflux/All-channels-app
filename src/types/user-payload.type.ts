import { UserRole } from "./user.type";

export interface UserPayload {
  email: string;
  role: UserRole;
  userId: string;
}
