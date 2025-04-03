import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();

        // Check if user has role property, some implementations use user.role or user.roles
        if (!user) return false;

        // Handle case where role might be a string or roles might be an array
        if (user.role) {
            return requiredRoles.includes(user.role);
        } else if (user.roles && Array.isArray(user.roles)) {
            return requiredRoles.some((role) => user.roles.includes(role));
        }

        return false;
    }
} 