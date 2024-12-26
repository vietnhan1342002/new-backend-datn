
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { IS_PUBLIC_KEY } from './public.guard';
import { Permission } from '@/modules/roles/dto/create-role.dto';
import { PERMISSIONS_KEY } from '@/decorator/permission.decorator';
import { Resource } from '@/modules/roles/enum/resource.enum';
import { Action } from '@/modules/roles/enum/action.enum';
import { Reflector } from '@nestjs/core';
import { UserAuthService } from '../user-auth.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userAuthService: UserAuthService,
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }


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
    // console.log('routePermissions', routePermissions);
    // console.log('userPermissions', userPermissions);
    if (
      userPermissions.some(
        (perm) =>
          perm.resource === Resource.ALL && perm.actions.includes(Action.ALL),
      )
    ) {
      return true;
    }
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