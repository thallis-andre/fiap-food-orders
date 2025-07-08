/* eslint-disable @typescript-eslint/no-unused-vars */
import { Entity, Repository } from '@fiap-food/tactical-design/core';
import { Types } from 'mongoose';

export class FakeRepository<T extends Entity> implements Repository<T> {
  create(entity: T): Promise<void> {
    throw new Error('Method not implemented.');
  }
  update(entity: T): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<T> {
    throw new Error('Method not implemented.');
  }
  findAll(): Promise<T[]> {
    throw new Error('Method not implemented.');
  }

  generateId(): string {
    return new Types.ObjectId().toHexString();
  }
}
