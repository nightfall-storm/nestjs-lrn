import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import type { AuthPayload } from "../types/auth.types";
import { PrismaService } from "src/prisma/prisma.service";

interface RequestWithRefreshTokenBody extends Request {
  body: {
    refreshToken?: string;
  };
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "refresh-token",
) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      passReqToCallback: true,
    });
  }

  async validate(
    req: RequestWithRefreshTokenBody,
    payload: AuthPayload,
  ): Promise<{
    userId: number;
    email: string;
    refreshToken: string;
    tokenEntity: {
      id: string;
      userId: number;
      token: string;
      userAgent: string | null;
      ipAddress: string | null;
      expiresAt: Date;
      createdAt: Date;
      revoked: boolean;
      user: {
        id: number;
        email: string;
        createdAt: Date;
      };
    };
  }> {
    const refreshToken = req.body?.refreshToken;

    if (!refreshToken || typeof refreshToken !== "string") {
      throw new UnauthorizedException("Refresh token is required");
    }

    // Verify token exists in database and is valid
    const tokenEntity = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        token: refreshToken,
        revoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!tokenEntity) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken: refreshToken,
      tokenEntity,
    };
  }
}
