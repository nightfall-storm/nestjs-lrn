import type { Role } from "@prisma/client";

export type AuthPayload = {
  sub: number;
  email: string;
  role: Role;
};
