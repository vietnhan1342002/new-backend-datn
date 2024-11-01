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

@Controller('user-auth')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @UseGuards(LocalStrategy)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.userAuthService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Permissions([{ resource: Resource.USER, actions: [Action.all] }])
  @Post()
  create(@Body() createUserAuthDto: CreateUserAuthDto) {
    return this.userAuthService.create(createUserAuthDto);
  }

  @Get()
  async findAll(
    @Query() query: string,
    @Param('current') current: string,
    @Param('pageSize') pageSize: string,
  ) {
    return this.userAuthService.findAll(query, +current, +pageSize);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserAuthDto) {
    return this.userAuthService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Permissions([{ resource: Resource.USER, actions: [Action.all] }])
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
