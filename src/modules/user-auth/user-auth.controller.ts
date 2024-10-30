import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { CreateUserAuthDto } from './dto/create-user-auth.dto';
import { UpdateUserAuthDto } from './dto/update-user-auth.dto';
import { LocalStrategy } from '../strategies/local.strategy';
import { LoginDto } from './dto/login.dto';

@Controller('user-auth')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @UseGuards(LocalStrategy)
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return this.userAuthService.login(loginDto);
  }

  @Post()
  create(@Body() createUserAuthDto: CreateUserAuthDto) {
    return this.userAuthService.create(createUserAuthDto);
  }
}
