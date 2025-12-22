import { Injectable } from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import {
  extractUniqueConstraintField,
  handlePostgresError,
} from "src/common/utils/postgres-error.util";

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

  async generateJwt(id: number, email: string, createdAt: Date) {
    const payload = { sub: id, email: email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: id,
        email: email,
        createdAt: createdAt,
      },
    };
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
