import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from './user.model';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: User }>();
    const auth = request.get('Authorization');
    if (!auth) {
      return true;
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
    return true;
  }
}

export const WithOptionalAuth = () =>
  applyDecorators(UseGuards(OptionalAuthGuard));
