import { Transactional } from '@fiap-food/tactical-design/core';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ItemAlreadyExists } from '../../../domain/errors/item-already-exists.exception';
import { Item } from '../../../domain/item.entity';
import { ItemRepository } from '../abstractions/item.repository';
import { CreateItemCommand, CreateItemResult } from './create-item.command';

@CommandHandler(CreateItemCommand)
export class CreateItemHandler
  implements ICommandHandler<CreateItemCommand, CreateItemResult>
{
  constructor(private readonly repository: ItemRepository) {}

  @Transactional()
  async execute({ data }: CreateItemCommand): Promise<CreateItemResult> {
    const { name, price, description, type, images } = data;

    const itemAlreadyExists = await this.repository.findByName(name);
    if (itemAlreadyExists) {
      throw new ItemAlreadyExists(name);
    }
    const id = this.repository.generateId();
    const item = new Item(id, name, price, type, description, images);
    await this.repository.create(item);

    return new CreateItemResult(id);
  }
}
