import { PERMISSIONS_KEY } from '@/decorator/permission.decorator';
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserAuthService } from '../user-auth.service';
import { Permission } from '@/modules/roles/dto/create-role.dto';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly userAuthService: UserAuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      return false;
    }

    // Lấy request từ context
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new UnauthorizedException('User Id not found');
    }

    const routePermissions: Permission[] = this.reflector.getAllAndOverride(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    try {
      const userPermissions = await this.userAuthService.getUserPermissions(
        request.user._id,
      );
      console.log('User Permissions:', userPermissions); // Ghi log quyền của người dùng

      for (const routePermission of routePermissions) {
        const userPermission = userPermissions.find(
          (perm) => perm.resource === routePermission.resource,
        );

        if (!userPermission) {
          console.error(
            `Không tìm thấy quyền cho tài nguyên: ${routePermission.resource}`,
          );
          throw new ForbiddenException(
            `Không có quyền truy cập vào tài nguyên: ${routePermission.resource}`,
          );
        }

        const allActionsAvailable = routePermission.actions.every(
          (requiredAction) => userPermission.actions.includes(requiredAction),
        );

        if (!allActionsAvailable) {
          console.error(
            `Thiếu hành động cho tài nguyên: ${routePermission.resource}`,
          );
          throw new ForbiddenException(
            `Thiếu quyền hành động cho tài nguyên: ${routePermission.resource}`,
          );
        }
      }
    } catch (error) {
      console.error('Lỗi kiểm tra quyền:', error.message);
      throw new ForbiddenException('Không đủ quyền truy cập');
    }

    return true; // Nếu tất cả kiểm tra đều thành công
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
