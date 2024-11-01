import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserAuthService } from '../user-auth.service';
import { PERMISSIONS_KEY } from '@/decorator/permission.decorator';
import { Permission } from '@/modules/roles/dto/create-role.dto';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userAuthService: UserAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const routePermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!routePermissions) return true;

    const userPermissions = await this.userAuthService.getUserPermissions(
      user._id,
    );

    this.checkPermissions(routePermissions, userPermissions);

    return true;
  }

  private checkPermissions(
    routePermissions: Permission[],
    userPermissions: Permission[],
  ) {
    for (const routePermission of routePermissions) {
      const userPermission = userPermissions.find(
        (perm) => perm.resource === routePermission.resource,
      );

      if (!userPermission) {
        throw new ForbiddenException(
          `No permission for resource: ${routePermission.resource}`,
        );
      }

      const hasAllActions = routePermission.actions.every((requiredAction) =>
        userPermission.actions.includes(requiredAction),
      );

      if (!hasAllActions) {
        throw new ForbiddenException(
          `Missing actions for resource: ${routePermission.resource}`,
        );
      }
    }
  }
}
