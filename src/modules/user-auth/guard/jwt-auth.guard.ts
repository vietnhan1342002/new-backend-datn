import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.guard'; // Đây là nơi định nghĩa metadata của @Public()

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Kiểm tra nếu route có metadata @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true; // Nếu là @Public, bỏ qua kiểm tra JWT
    }
    return super.canActivate(context); // Nếu không, tiếp tục kiểm tra JWT như bình thường
  }

  handleRequest(err, user, info) {
    if (user) {
      return user;
    }
  
    // Nếu có lỗi, xác định lỗi chính xác
    if (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (err.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
    }
  
    // Nếu không có thông tin xác thực, ném lỗi chung
    throw new UnauthorizedException('User not authenticated');
  }
  
}
