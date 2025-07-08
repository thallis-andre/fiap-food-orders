import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongooseItemSchema } from '../../../infra/persistance/mongoose/item/item.schema';
import { Item } from '../dtos/item.dto';
import { GetItemByIdQuery, GetItemByIdResult } from './get-item-by-id.query';

@QueryHandler(GetItemByIdQuery)
export class GetItemByIdHandler
  implements IQueryHandler<GetItemByIdQuery, GetItemByIdResult>
{
  constructor(
    @InjectModel(MongooseItemSchema.name)
    private readonly queryModel: Model<MongooseItemSchema>,
  ) {}

  async execute(query: GetItemByIdQuery): Promise<GetItemByIdResult> {
    const result = await this.queryModel
      .findById(new Types.ObjectId(query.id))
      .exec();
    if (!result) {
      throw new NotFoundException();
    }
    return new GetItemByIdResult(
      new Item({
        id: result._id.toHexString(),
        name: result.name,
        description: result.description,
        type: result.type,
        price: result.price,
        images: result.images,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      }),
    );
  }
}
