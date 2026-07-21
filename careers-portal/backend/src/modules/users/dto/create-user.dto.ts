import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH, Role } from '@/common/constants/enums';

export const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).*$/;
export const PASSWORD_STRENGTH_MESSAGE =
  'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one symbol';

export class CreateUserDto {
  @ApiProperty({ example: 'Priya Sharma' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'priya.sharma@rudraas.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Str0ng!Passw0rd', minLength: PASSWORD_MIN_LENGTH })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @Matches(PASSWORD_STRENGTH_REGEX, { message: PASSWORD_STRENGTH_MESSAGE })
  password: string;

  @ApiProperty({ enum: Role, example: Role.HR })
  @IsEnum(Role)
  role: Role;
}
