import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { ROLES_KEY } from "../decorators/role.decorator";

interface RequestWithUser {
  user?: {
    id: number;
    email: string;
    role: Role;
    user?: {
      id: number;
      email: string;
      role: Role;
    };
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Check if user exists
    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    // Handle nested user structure from JWT strategy (backward compatibility)
    const userRole: Role | undefined = user.user?.role || user.role;

    if (!userRole) {
      throw new ForbiddenException("User role not found");
    }

    // Check if user's role is in the required roles
    const hasRole = requiredRoles.includes(userRole);

    if (!hasRole) {
      throw new ForbiddenException(
        "Insufficient permissions. Required roles: " + requiredRoles.join(", "),
      );
    }

    return true;
  }
}
