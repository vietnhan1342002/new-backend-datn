import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserAuthDto } from './dto/create-user-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { UserAuth, UserAuthDocument } from './schemas/user-auth.schema';
import { Model, ObjectId, Types } from 'mongoose';
import {
  comparePasswordHelper,
  hashPasswordHelper,
  isExistHelper,
} from '@/helpers/utils';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/login.dto';
import { RolesService } from '../roles/roles.service';
import aqp from 'api-query-params';
import { UpdateUserAuthDto } from './dto/update-user-auth.dto';
import { Patient } from '../patients/schemas/patient.schema';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UserAuthService {
  constructor(
    @InjectModel(UserAuth.name)
    private userAuthModel: Model<UserAuthDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
    @InjectModel(Patient.name)
    private patientModel: Model<Patient>,

    private jwtService: JwtService,
    private roleService: RolesService,
  ) {}

  //-------------------------------------------------------------------------//

  async register(createUserDto: CreateUserAuthDto) {
    const user = await this.createUser(createUserDto);

    // Set default role to 'patient'
    user.roleId = new Types.ObjectId('67356ba52a541b6fc4ecf1a4');
    await user.save();

    // Create Patient record with only userId (no other information required)
    if (user.roleId.toString() === '67356ba52a541b6fc4ecf1a4') {
      const newPatient = new this.patientModel({
        userId: user._id,
      });
      await newPatient.save();
    }

    return {
      _id: user.id,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);

    //Generate JWT tokens
    const tokens = await this.generateUserTokens(user._id);

    return {
      ...tokens,
      userId: user._id,
    };
  }

  async updatePassword(_id: string, updatePasswordDto: UpdatePasswordDto) {
    const { currentPassword, newPassword } = updatePasswordDto;

    // Lấy người dùng theo _id
    const user = await this.userAuthModel.findById({ _id });
    if (!user) {
      throw new NotFoundException(`User not found : ${_id}`);
    }

    // Kiểm tra mật khẩu hiện tại
    const isValidPassword = await comparePasswordHelper(
      currentPassword,
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException(`Current password is incorrect`);
    }

    if (newPassword === currentPassword) {
      throw new BadRequestException(
        'New password cannot be the same as the current password',
      );
    }

    // Cập nhật mật khẩu mới sau khi hash
    user.password = await hashPasswordHelper(newPassword);
    await user.save();

    return { message: 'Password updated successfully' };
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
      expiryDate.getDate() + Number(process.env.JWT_REFRESH_TOKEN_EXPIRED || 3),
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

  async getUserPermissions(userId: string) {
    const user = await this.userAuthModel.findById(userId);
    if (!user) throw new BadRequestException('User does not exist');

    const role = await this.roleService.findRoleById(user.roleId.toString());
    return role.permissions;
  }

  //--------------------------------------Part for User------------------------------------------------------------//

  async create(createUserDto: CreateUserAuthDto) {
    const user = await this.createUser(createUserDto);

    return {
      _id: user.id,
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    // Trả về true nếu đúng, false nếu không
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.userAuthModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    const result = await this.userAuthModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);
    return { result, totalPages };
  }

  async findById(userId: string) {
    const user = await this.userAuthModel
      .findOne({ _id: userId })
      .populate({ path: 'roleId', select: 'nameRole' })
      .select('-password');
    if (!user) throw new NotFoundException('User does not exist');
    return user;
  }

  async update(_id: string, updateUserDto: UpdateUserAuthDto) {
    const { fullName, phoneNumber } = updateUserDto;

    return await this.userAuthModel.updateOne(
      { _id },
      { fullName, phoneNumber },
    );
  }

  async remove(id: string) {
    const result = await this.userAuthModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { message: `User with ID ${id} deleted successfully` };
  }

  //-------------------------HELPER--------------------------------------------//
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userAuthModel.findOne({ email });

    const isValidPassword = await comparePasswordHelper(
      password,
      user.password,
    );

    if (!isValidPassword || !user) {
      throw new BadRequestException('Email / Password invalid');
    }

    return user;
  }

  async createUser(createUserDto: CreateUserAuthDto) {
    const { email, password, fullName, phoneNumber } = createUserDto;

    const emailExists = await isExistHelper({ email }, this.userAuthModel);
    if (emailExists) {
      throw new BadRequestException(
        `Email : ${email} Already exists. Please use another email!`,
      );
    }

    // Mã hóa mật khẩu
    const hashPassword = await hashPasswordHelper(password);

    // Tạo người dùng mới
    const user = await this.userAuthModel.create({
      email,
      password: hashPassword,
      fullName,
      phoneNumber,
    });

    return user;
  }
}
