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
    // Nếu không có lỗi và có user, trả về user
    if (user) {
      return user;
    }
    // Nếu gặp lỗi mà không phải là @Public(), ném ra lỗi không xác thực
    throw err || new UnauthorizedException();
  }
}
