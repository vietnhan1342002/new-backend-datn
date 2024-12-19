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
  calculateSkip,
  comparePasswordHelper,
  hashPasswordHelper,
  isExistHelper,
  preparePaginationFilter,
} from '@/helpers/utils';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/login.dto';
import { RolesService } from '../roles/roles.service';
import aqp from 'api-query-params';
import { UpdateUserAuthDto } from './dto/update-user-auth.dto';
import { Patient } from '../patients/schemas/patient.schema';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Doctor } from '../doctors/schemas/doctor.schema';

@Injectable()
export class UserAuthService {
  constructor(
    @InjectModel(UserAuth.name)
    private userAuthModel: Model<UserAuthDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
    @InjectModel(Patient.name)
    private patientModel: Model<Patient>,

    @InjectModel(Doctor.name)
    private doctorModel: Model<Doctor>,

    private jwtService: JwtService,
    private roleService: RolesService,
  ) { }

  //-------------------------------------------------------------------------//

  async register(createUserDto: CreateUserAuthDto) {
    const existingUser = await this.checkPhoneExists(createUserDto.phoneNumber);
    if (existingUser) {
      throw new BadRequestException('Phone number already exists. Please use a different phone number.')
    }

    const user = await this.createUser(createUserDto);

    // Set default role to 'patient'
    user.roleId = new Types.ObjectId('673d931c35e97c832bfa6351');
    await user.save();

    // Create Patient record with only userId (no other information required)
    if (user.roleId.toString() === '673d931c35e97c832bfa6351') {
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
    const { phoneNumber, password } = loginDto;
    const user = await this.validateUser(phoneNumber, password);

    //Generate JWT tokens
    const tokens = await this.generateUserTokens(user._id);

    return {
      ...tokens,
      userId: user._id,
    };
  }

  async logout(refreshToken: string) {
    // Xóa refresh token khỏi cơ sở dữ liệu
    const result = await this.refreshTokenModel.deleteOne({
      token: refreshToken,
    });

    if (result.deletedCount === 0) {
      throw new BadRequestException(
        'Refresh Token không hợp lệ hoặc đã hết hạn',
      );
    }

    return { message: 'Đã đăng xuất thành công' };
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
      { expiresIn: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRED, 10) },
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

    const role = await this.roleService.findRoleById(new Types.ObjectId(user.roleId));
    console.log(role);

    return role.permissions;
  }

  //--------------------------------------Part for User------------------------------------------------------------//

  async create(createUserDto: CreateUserAuthDto) {

    const existingUser = await this.checkPhoneExists(createUserDto.phoneNumber);
    if (existingUser) {
      return { message: 'Phone number already exists. Please use a different phone number.' };
    }

    const user = await this.createUser(createUserDto);
    // Create Patient record with only userId (no other information required)
    if (user.roleId.toString() === '673d935335e97c832bfa6356') {
      const newDoctor = new this.doctorModel({
        userId: user._id,
      });
      await newDoctor.save();
    }

    return {
      _id: user.id,
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    const { totalItems, totalPages } = await preparePaginationFilter(
      this.userAuthModel,
      filter,
      current,
      pageSize,
    );

    // Tính toán skip để phân trang
    const skip = calculateSkip(current, pageSize);

    // Truy vấn các bản ghi với phân trang và sắp xếp
    const result = await
      this.userAuthModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .populate({ path: 'roleId', select: 'nameRole' })
        .select('-password')
        .sort(sort as any)
        .exec();

    // Nếu không có dữ liệu, ném ngoại lệ
    if (result.length === 0) {
      throw new NotFoundException('No user available');
    }

    return { result, totalItems, totalPages };
  }

  async findEmployee(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    // Thêm điều kiện loại trừ roleId vào filter
    const roleIdToExclude = '673d931c35e97c832bfa6351';
    filter.roleId = { $ne: new Types.ObjectId(roleIdToExclude) };

    const { totalItems, totalPages } = await preparePaginationFilter(
      this.userAuthModel,
      filter,
      current,
      pageSize,
    );

    // Tính toán skip để phân trang
    const skip = calculateSkip(current, pageSize);

    // Truy vấn các bản ghi với phân trang và sắp xếp
    const result = await this.userAuthModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .populate({ path: 'roleId', select: 'nameRole' })
      .select('-password') // Loại bỏ trường password trong kết quả trả về
      .sort(sort as any)
      .exec();

    // Nếu không có dữ liệu, ném ngoại lệ
    if (result.length === 0) {
      throw new NotFoundException('No user available');
    }

    return { result, totalItems, totalPages };
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
    const { fullName, phoneNumber, roleId } = updateUserDto;
    return await this.userAuthModel.updateOne(
      { _id },
      { fullName, phoneNumber, roleId: new Types.ObjectId(roleId) },
    );
  }

  async remove(id: string) {
    const result = await this.userAuthModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} deleted successfully` };
  }

  async verifyToken(token: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      if (decoded) {
        return true;
      }
      return false;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  //-------------------------HELPER--------------------------------------------//
  async validateUser(emailOrPhone: string, password: string): Promise<any> {
    const user = await this.userAuthModel.findOne({
      $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }],
    });

    if (!user) {
      throw new BadRequestException('Email / Password invalid');
    }

    const isValidPassword = await comparePasswordHelper(
      password,
      user.password,
    );

    if (!isValidPassword) {
      throw new BadRequestException('Email / Password invalid');
    }

    return user;
  }

  async createUser(createUserDto: CreateUserAuthDto) {
    const { password, fullName, phoneNumber, roleId } = createUserDto;

    // Mã hóa mật khẩu
    const hashPassword = await hashPasswordHelper(password);

    // Tạo người dùng mới
    const user = await this.userAuthModel.create({
      password: hashPassword,
      fullName,
      phoneNumber,
      roleId: new Types.ObjectId(roleId),
    });

    return user;
  }

  async checkPhoneExists(phoneNumber: string): Promise<boolean> {
    const user = await this.userAuthModel.findOne({ phoneNumber }).exec();
    return user ? true : false;  // Return true if a user with the phone number exists, false otherwise
  }

  async handleVerifyToken(token) {
    try {
      const payload = this.jwtService.verify(token)
      return payload['userId']
    } catch (error) {
      throw new UnauthorizedException()
    }
  }
}
