import { TransactionManager } from '@fiap-food/tactical-design/core';
import {
    FakeRepository,
    FakeTransactionManager,
} from '@fiap-food/test-factory/utils';
import {
    BadRequestException,
    INestApplication,
    NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Item } from '../../../domain/item.entity';
import { ItemRepository } from '../abstractions/item.repository';
import { UpdateItemCommand } from './update-item.command';
import { UpdateItemHandler } from './update-item.handler';

describe('UpdateItemHandler', () => {
  let app: INestApplication;
  let target: UpdateItemHandler;
  let repository: ItemRepository;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateItemHandler,
        {
          provide: TransactionManager,
          useClass: FakeTransactionManager,
        },
        {
          provide: ItemRepository,
          useClass: FakeRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(UpdateItemHandler);
    repository = app.get(ItemRepository);

    repository.findByName = async () => null;
  });

  it('should throw NotFoundException item does not exist', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    jest.spyOn(repository, 'update');
    const command = new UpdateItemCommand({
      id: new Types.ObjectId().toHexString(),
      price: 155,
    });
    await expect(() => target.execute(command)).rejects.toThrow(
      NotFoundException,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when no values are provided for update', async () => {
    const id = new Types.ObjectId().toHexString();
    jest
      .spyOn(repository, 'findById')
      .mockResolvedValue(
        new Item(id, 'XFood', 12.99, 'Snack', 'XFood Description'),
      );
    jest.spyOn(repository, 'update');
    const command = new UpdateItemCommand({ id });
    await expect(() => target.execute(command)).rejects.toThrow(
      BadRequestException,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should update values on Item', async () => {
    const id = new Types.ObjectId().toHexString();
    const itemBeforeUpdate = new Item(
      id,
      'XFood',
      12.99,
      'Beverage',
      'XFood Description',
    );
    jest.spyOn(repository, 'findByName').mockResolvedValue(null);
    jest.spyOn(repository, 'findById').mockResolvedValue(itemBeforeUpdate);
    jest.spyOn(repository, 'update').mockResolvedValue(null);

    const itemAfterUpdate = new Item(
      id,
      'X-Food',
      14.99,
      'Snack',
      'X-Food Description',
      ['https://anyurl.com'],
    );

    const command = new UpdateItemCommand({
      id,
      price: itemAfterUpdate.price,
      name: itemAfterUpdate.name,
      description: itemAfterUpdate.description,
      images: itemAfterUpdate.images,
      type: itemAfterUpdate.type,
    });

    await target.execute(command);
    expect(repository.update).toHaveBeenCalledWith(itemAfterUpdate);
  });
});
