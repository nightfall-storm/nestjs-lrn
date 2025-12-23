import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import type { AuthPayload } from "../types/auth.types";
import { Role } from "@prisma/client";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  validate(payload: AuthPayload): {
    id: number;
    email: string;
    role: Role;
  } {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
