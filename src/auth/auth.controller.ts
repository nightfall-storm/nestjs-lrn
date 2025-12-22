import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: "Login a user" })
  login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @Post("register")
  @ApiOperation({ summary: "Register a user" })
  register(@Body() authDto: AuthDto) {
    return this.authService.register(authDto);
  }
}
