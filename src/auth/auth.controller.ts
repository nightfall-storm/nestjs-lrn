import { Body, Controller, Post, UseGuards, Request } from "@nestjs/common"; // Use Request from @nestjs/common for the DECORATOR
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { Request as ExpressRequest } from "express";

// 1. Create a typed Request interface so ESLint stays quiet
interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
    email: string;
    createdAt: Date;
  };
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @ApiOperation({ summary: "Login a user" })
  // 2. Use the decorator @Request() but type the variable with our custom interface
  async login(@Body() authDto: AuthDto, @Request() req: RequestWithUser) {
    // Now TypeScript knows req.user is safe and has an id/email
    // @Body() validates the request body and makes it available for Swagger docs
    // Passport's LocalStrategy still reads from req.body automatically
    return this.authService.generateJwt(
      req.user.id,
      req.user.email,
      req.user.createdAt,
    );
  }

  @Post("register")
  @ApiOperation({ summary: "Register a user" })
  register(@Body() authDto: AuthDto) {
    return this.authService.register(authDto);
  }
}
