import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    description: "The email of the user",
    example: "test@example.com",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  @ApiProperty({
    description: "The password of the user",
    example: "password123",
  })
  password: string;
}
