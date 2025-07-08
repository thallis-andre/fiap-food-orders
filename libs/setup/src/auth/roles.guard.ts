import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Roles } from './roles.decorator';
import { User } from './user.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const requiredRoles = this.reflector.get(Roles, handler);
    if (!requiredRoles) {
      return true;
    }
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: User }>();
    const auth = request.get('Authorization');
    if (!auth) {
      throw new UnauthorizedException();
    }
    const [, tokenBody] = request.get('Authorization').split('.');
    const {
      name,
      email,
      ['custom:cpf']: cpf,
      ['custom:role']: role,
    } = JSON.parse(Buffer.from(tokenBody, 'base64').toString('utf-8'));

    const user = new User({ name, cpf, email, role });
    request.user = user;
    return requiredRoles.includes(user.role);
  }
}

export const WithRoles = (...roles: Roles[]) =>
  applyDecorators(Roles(roles), UseGuards(RolesGuard));
