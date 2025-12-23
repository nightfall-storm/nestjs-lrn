import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Roles } from "src/common/decorators/role.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Role } from "@prisma/client";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user (ADMIN only)" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all users (ADMIN only)" })
  @ApiQuery({ name: "current_page", type: Number, required: false })
  @ApiQuery({ name: "per_page", type: Number, required: false })
  @ApiQuery({ name: "search", type: String, required: false })
  findAll(
    @Query("current_page") currentPage: number = 1,
    @Query("per_page") perPage: number = 10,
    @Query("search") search: string = "",
  ) {
    return this.usersService.findAll(currentPage, perPage, search);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a user by id (ADMIN only)" })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a user by id (ADMIN only)" })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a user by id (ADMIN only)" })
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }
}
