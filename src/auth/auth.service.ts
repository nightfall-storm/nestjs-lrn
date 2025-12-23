import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import {
  extractUniqueConstraintField,
  handlePostgresError,
} from "src/common/utils/postgres-error.util";
import { Role } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await argon2.verify(user.password, pass))) {
      // Strip password before returning
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result; // Return user object directly (Passport attaches this to req.user)
    }
    return null;
  }

  async refreshToken(
    userId: number,
    oldRefreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ) {
    // Get user to retrieve email and createdAt
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Revoke the old refresh token
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        token: oldRefreshToken,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    // Generate new tokens
    return this.generateJwt(
      user.id,
      user.email,
      user.role,
      user.createdAt,
      userAgent,
      ipAddress,
    );
  }

  async generateJwt(
    id: number,
    email: string,
    role: Role,
    createdAt: Date,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const payload = { sub: id, email: email, role: role };

    const refreshTokenExpiresIn = Number(process.env.JWT_REFRESH_EXPIRES_IN!);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET!,
      expiresIn: refreshTokenExpiresIn,
    });

    // Calculate expiration date (JWT expiresIn is in seconds)
    const expiresAt = new Date(Date.now() + refreshTokenExpiresIn * 1000);

    const assignedRefreshToken = await this.prisma.refreshToken.create({
      data: {
        userId: id,
        token: refreshToken,
        userAgent: userAgent,
        ipAddress: ipAddress,
        expiresAt,
      },
    });

    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken: assignedRefreshToken.token,
      user: {
        id: id,
        email: email,
        createdAt: createdAt,
      },
    };
  }

  async logout(userId: number, refreshToken: string) {
    // Verify the refresh token is a valid JWT and belongs to the user
    const payload = await this.jwtService.verifyAsync<{
      sub: number;
      email: string;
      role: Role;
    }>(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET!,
    });

    // Ensure the token belongs to the authenticated user
    if (payload.sub !== userId) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Verify token exists in database and belongs to user
    const tokenEntity = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        token: refreshToken,
        revoked: false,
      },
    });

    if (!tokenEntity) {
      throw new UnauthorizedException(
        "Refresh token not found or already revoked",
      );
    }

    // Revoke the refresh token
    await this.prisma.refreshToken.update({
      where: { id: tokenEntity.id },
      data: { revoked: true },
    });

    return { success: true, message: "Logged out successfully" };
  }

  async register(authDto: AuthDto) {
    try {
      const { email, password } = authDto;
      const hashedPassword = await argon2.hash(password);

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch (error) {
      const field = extractUniqueConstraintField(error);
      handlePostgresError(error, field || "email");
    }
  }
}
