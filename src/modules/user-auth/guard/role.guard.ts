import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.guard';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Nếu route là @Public, bỏ qua RoleGuard
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Kiểm tra nếu user là admin thì cấp toàn quyền
    if (user.roleId.nameRole === 'admin') {
      return true; // Admin có quyền toàn bộ
    }

    // Lấy nameRole từ reflector
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      'roles', // Tên key của decorator @Role
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // Nếu không có yêu cầu role, cho phép truy cập
    }

    // Kiểm tra xem user có role đúng hay không
    if (!requiredRoles.includes(user.roleId.nameRole)) {
      throw new ForbiddenException(
        `Insufficient ${user.roleId.nameRole} role permission for action`,
      );
    }

    return true;
  }
}
