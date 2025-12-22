import { BadRequestException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon2 from "argon2";
import {
  extractUniqueConstraintField,
  handlePostgresError,
} from "src/common/utils/postgres-error.util";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(authDto: AuthDto) {
    const { email, password } = authDto;

    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        password: true,
      },
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new BadRequestException("Invalid credentials");
    }
    const payload = { sub: user.id, email: user.email };
    return { access_token: await this.jwtService.signAsync(payload) };
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
