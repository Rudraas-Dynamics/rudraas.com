import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Role } from '@/common/constants/enums';
import { AuthenticatedUser, CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller({ path: 'users', version: '1' })
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List Admin/HR user accounts (Admin only)' })
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new Admin/HR user account (Admin only)' })
  create(@Body() dto: CreateUserDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.usersService.create(dto, actor);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user account, including role or password reset (Admin only)' })
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.usersService.update(id, dto, actor);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a user account (soft delete, Admin only)' })
  deactivate(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.usersService.deactivate(id, actor);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Reactivate a previously deactivated user account (Admin only)' })
  activate(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.usersService.activate(id, actor);
  }
}
