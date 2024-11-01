import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { CreateUserAuthDto } from './dto/create-user-auth.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalStrategy } from './strategies/local.strategy';
import { Resource } from '../roles/enum/resource.enum';
import { Action } from '../roles/enum/action.enum';
import { Permissions } from '@/decorator/permission.decorator';
import { UpdateUserAuthDto } from './dto/update-user-auth.dto';
import { RoleGuard } from './guard/role.guard';

@Controller('user-auth')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  //Test
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Permissions([{ resource: Resource.PATIENT, actions: [Action.CREAT] }])
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  //Part auth
  @UseGuards(LocalStrategy)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.userAuthService.login(loginDto);
  }

  //Part User

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Permissions([{ resource: Resource.USER, actions: [Action.ALL] }])
  @Post()
  create(@Body() createUserAuthDto: CreateUserAuthDto) {
    return this.userAuthService.create(createUserAuthDto);
  }

  @Get('department/:id')
  async getUsersByDepartment(@Param('id') id: string): Promise<any> {
    return this.userAuthService.getUsersByDepartment(id);
  }

  @Get()
  async findAll(
    @Query() query: string,
    @Param('current') current: string,
    @Param('pageSize') pageSize: string,
  ) {
    return this.userAuthService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userAuthService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserAuthDto) {
    return this.userAuthService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userAuthService.remove(id);
  }
}
