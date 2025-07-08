import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Roles } from './roles.decorator';

export class User {
  public readonly name: string;
  public readonly cpf?: string;
  public readonly email?: string;
  public readonly role?: Roles;

  constructor(values: User) {
    Object.assign(this, values);
  }
}

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { user: User }>();
    return request.user;
  },
);
