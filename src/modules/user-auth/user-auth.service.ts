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
import { Model, Types } from 'mongoose';
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
import { DepartmentsService } from '../departments/departments.service';

@Injectable()
export class UserAuthService {
  constructor(
    @InjectModel(UserAuth.name)
    private userAuthModel: Model<UserAuthDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,

    private jwtService: JwtService,
    private roleService: RolesService,
    private departmentService: DepartmentsService,
  ) {}

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
    if (!user) throw new BadRequestException('Người dùng không tồn tại');

    const role = await this.roleService.findRoleById(user.roleId.toString());
    return role.permissions;
  }

  //--------------------------------------Part for User------------------------------------------------------------//

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

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

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
      .select('-password');
    if (!user) throw new NotFoundException('Không có người dùng này');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserAuthDto) {
    const { fullName, phoneNumber, departmentID } = updateUserDto;

    const objectIdDepartmentID = new Types.ObjectId(departmentID);

    return await this.userAuthModel.updateOne(
      { _id: id },
      { fullName, phoneNumber, departmentID: objectIdDepartmentID },
    );
  }

  async remove(id: string) {
    const result = await this.userAuthModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { message: `User with ID ${id} deleted successfully` };
  }

  async getUsersByDepartment(id: string): Promise<UserAuth[]> {
    const department = await this.departmentService.findOne(id);
    if (!department) {
      throw new NotFoundException('Không có phòng này');
    }
    const user = await this.userAuthModel
      .find({ departmentID: department._id })
      .populate({
        path: 'departmentID',
        select: 'departmentName',
      }) // Populate thông tin của phòng ban
      .select('fullName departmentName')
      .exec();

    if (user.length === 0) throw new NotFoundException('Không có nhân viên');

    return user;
  }
}
