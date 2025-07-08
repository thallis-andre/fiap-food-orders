import { Reflector } from '@nestjs/core';

export enum ERoles {
  Admin = 'ADMIN',
  Customer = 'CUSTOMER',
}

export type Roles = `${ERoles}`;

export const Roles = Reflector.createDecorator<Roles[]>();
