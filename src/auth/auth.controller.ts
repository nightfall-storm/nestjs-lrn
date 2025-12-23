import { Body, Controller, Post, UseGuards, Request } from "@nestjs/common"; // Use Request from @nestjs/common for the DECORATOR
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { RefreshTokenGuard } from "./guards/refresh-token.guard";
import { Request as ExpressRequest } from "express";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

// 1. Create a typed Request interface so ESLint stays quiet
interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
    email: string;
    createdAt: Date;
  };
}

interface RequestWithRefreshToken extends ExpressRequest {
  user: {
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
    };
  };
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(RefreshTokenGuard)
  @Post("refresh-token")
  @ApiOperation({ summary: "Refresh access and refresh tokens" })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Request() req: RequestWithRefreshToken,
  ) {
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;
    return this.authService.refreshToken(
      req.user.userId,
      req.user.refreshToken,
      userAgent,
      ipAddress,
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @ApiOperation({ summary: "Login a user" })
  // 2. Use the decorator @Request() but type the variable with our custom interface
  async login(@Body() authDto: AuthDto, @Request() req: RequestWithUser) {
    // Now TypeScript knows req.user is safe and has an id/email
    // @Body() validates the request body and makes it available for Swagger docs
    // Passport's LocalStrategy still reads from req.body automatically
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;
    return this.authService.generateJwt(
      req.user.id,
      req.user.email,
      req.user.createdAt,
      userAgent,
      ipAddress,
    );
  }

  @Post("register")
  @ApiOperation({ summary: "Register a user" })
  register(@Body() authDto: AuthDto) {
    return this.authService.register(authDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("logout")
  @ApiOperation({ summary: "Logout a user" })
  logout(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Request() req: RequestWithUser,
  ) {
    return this.authService.logout(req.user.id, refreshTokenDto.refreshToken);
  }
}
