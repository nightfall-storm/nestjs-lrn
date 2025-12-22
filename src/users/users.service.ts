import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "../prisma/prisma.service";
import {
  handlePostgresError,
  extractUniqueConstraintField,
} from "../common/utils/postgres-error.util";
import * as argon2 from "argon2";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { email, password } = createUserDto;

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

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    }));
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return {
      id: user?.id,
      email: user?.email,
      createdAt: user?.createdAt,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch (error) {
      const field = extractUniqueConstraintField(error);
      handlePostgresError(error, field);
    }
  }

  async remove(id: number) {
    try {
      const user = await this.prisma.user.delete({
        where: { id },
      });
      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch (error) {
      handlePostgresError(error, "Not found");
    }
  }
}
