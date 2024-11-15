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
  Put,
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
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './guard/public.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';

@UseGuards(JwtAuthGuard, RoleGuard)
@Permissions([{ resource: Resource.ALL, actions: [Action.ALL] }])
@Controller('user-auth')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Public()
  @Post('register')
  async register(@Body() createUserAuthDto: CreateUserAuthDto) {
    return this.userAuthService.register(createUserAuthDto);
  }

  //Part auth
  @Public()
  @UseGuards(LocalStrategy)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.userAuthService.login(loginDto);
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.userAuthService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Permissions([{ resource: Resource.PASSWORD, actions: [Action.UPDATE] }])
  @Patch('update-password/')
  async updatePassword(
    @Request() req, // Lấy thông tin user từ token
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    console.log(req.user);

    const _id = req.user._id;
    return this.userAuthService.updatePassword(_id, updatePasswordDto);
  }

  //Part User
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

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userAuthService.findById(id);
  }

  @Patch(':_id')
  update(@Param('_id') _id: string, @Body() updateUserDto: UpdateUserAuthDto) {
    return this.userAuthService.update(_id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userAuthService.remove(id);
  }
}
