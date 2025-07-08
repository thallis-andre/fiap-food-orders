import { TransactionManager } from '@fiap-food/tactical-design/core';
import {
    FakeRepository,
    FakeTransactionManager,
} from '@fiap-food/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ItemAlreadyExists } from '../../../domain/errors/item-already-exists.exception';
import { Item } from '../../../domain/item.entity';
import { ItemRepository } from '../abstractions/item.repository';
import { CreateItemCommand } from './create-item.command';
import { CreateItemHandler } from './create-item.handler';

describe('CreateItemHandler', () => {
  let app: INestApplication;
  let target: CreateItemHandler;
  let repository: ItemRepository;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        CreateItemHandler,
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
    target = app.get(CreateItemHandler);
    repository = app.get(ItemRepository);

    repository.findByName = async () => null;
  });

  it('should create a new Item', async () => {
    jest.spyOn(repository, 'create').mockResolvedValue();
    jest.spyOn(repository, 'findByName').mockResolvedValue(null);
    const command = new CreateItemCommand({
      name: 'X-Food',
      description: 'Dummy',
      price: 12.99,
      type: 'Snack',
      images: ['https://anyurl.com'],
    });
    await target.execute(command);
    expect(repository.create).toHaveBeenCalled();
  });

  it('should throw if item already exists', async () => {
    jest.spyOn(repository, 'create').mockResolvedValue();
    jest
      .spyOn(repository, 'findByName')
      .mockResolvedValue(Object.create(Item.prototype));
    const command = new CreateItemCommand({
      name: 'X-Food',
      description: 'Dummy',
      price: 12.99,
      type: 'Snack',
      images: ['https://anyurl.com'],
    });
    await expect(() => target.execute(command)).rejects.toThrow(
      ItemAlreadyExists,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });
});
