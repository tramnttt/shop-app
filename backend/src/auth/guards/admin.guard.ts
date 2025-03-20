import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // For now, let's consider all authenticated users as admin for testing
        // In a real application, you would check the user's role
        if (user) {
            return true;
        }

        throw new UnauthorizedException('You do not have admin privileges');
    }
} 