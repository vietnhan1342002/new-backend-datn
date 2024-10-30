import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserAuthDto } from './dto/create-user-auth.dto';
import { UpdateUserAuthDto } from './dto/update-user-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { UserAuth, UserAuthDocument } from './schemas/user-auth.schema';
import { Model } from 'mongoose';
import {
  comparePasswordHelper,
  hashPasswordHelper,
  isExistHelper,
} from '@/helpers/utils';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UserAuthService {
  constructor(
    @InjectModel(UserAuth.name)
    private userAuthModel: Model<UserAuthDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,

    private jwtService: JwtService,
    // private roleService: RolesService,
  ) {}

  async create(createUserDto: CreateUserAuthDto) {
    const { email, password, fullName, phoneNumber } = createUserDto;

    const emailExists = await isExistHelper({ email }, this.userAuthModel);

    if (emailExists) {
      throw new BadRequestException(
        `Email : ${email} Đã tồn tại. Vui lòng dùng email khác!`,
      );
    }

    const hashPassword = await hashPasswordHelper(password);

    const user = await this.userAuthModel.create({
      email,
      password: hashPassword,
      fullName,
      phoneNumber,
    });

    return {
      _id: user.id,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    // Tìm người dùng theo email
    const user = await this.userAuthModel.findOne({ email }); // Chỉ định kiểu rõ ràng cho user

    // Kiểm tra xem người dùng có tồn tại không
    if (!user) {
      throw new BadRequestException('Email / Password không hợp lệ'); // Ném lỗi nếu không tìm thấy người dùng
    }

    // Kiểm tra mật khẩu
    const isValidPassword = await comparePasswordHelper(
      password,
      user.password,
    );

    if (!isValidPassword) {
      throw new BadRequestException('Email / Password không hợp lệ'); // Ném lỗi nếu mật khẩu không đúng
    }

    return user; // Trả về người dùng nếu xác thực thành công
  }

  async login(loginDto: LoginDto) {
    const { email } = loginDto;

    const user = await this.userAuthModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Không có người dùng với email: ', email);
    }
    //Generate JWT tokens
    const tokens = await this.generateUserTokens(user._id);
    return {
      ...tokens,
      userId: user._id,
    };
  }

  async generateUserTokens(userId) {
    const accessToken = this.jwtService.sign(
      { userId },
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRED },
    );
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(token: string, userId: string) {
    // Calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(
      expiryDate.getDate() + +process.env.JWT_REFRESH_TOKEN_EXPIRED,
    );

    await this.refreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      {
        upsert: true,
      },
    );
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.refreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh Token is invalid');
    }
    return this.generateUserTokens(token.userId);
  }
}
