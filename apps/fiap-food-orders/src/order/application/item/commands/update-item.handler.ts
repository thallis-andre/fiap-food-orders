import { Transactional } from '@fiap-food/tactical-design/core';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ItemAlreadyExists } from '../../../domain/errors/item-already-exists.exception';
import { ItemRepository } from '../abstractions/item.repository';
import { UpdateItemCommand } from './update-item.command';

@CommandHandler(UpdateItemCommand)
export class UpdateItemHandler
  implements ICommandHandler<UpdateItemCommand, void>
{
  constructor(private readonly repository: ItemRepository) {}

  @Transactional()
  async execute({ data }: UpdateItemCommand): Promise<void> {
    const { id, ...values } = data;

    if (!Object.keys(values).length) {
      throw new BadRequestException('No value was provided for update');
    }

    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException();
    }

    if (values.name) {
      const exists = await this.repository.findByName(values.name);
      if (exists && exists.id !== id) {
        throw new ItemAlreadyExists(values.name);
      }
    }

    const props = ['name', 'price', 'description', 'type', 'images'];

    for (const prop of props) {
      const newValue = values[prop];
      if (newValue) {
        item[prop] = newValue;
      }
    }

    await this.repository.update(item);
  }
}
