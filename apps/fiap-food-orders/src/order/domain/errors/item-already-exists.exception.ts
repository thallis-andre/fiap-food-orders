import { DomainException } from '@fiap-food/tactical-design/core';

export class ItemAlreadyExists extends DomainException {
  constructor(name: string) {
    super(`Item '${name}' already exists`);
  }
}
