import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongooseItemSchema } from '../../../infra/persistance/mongoose/item/item.schema';
import { Item } from '../dtos/item.dto';
import { FindItemsQuery, FindItemsResult } from './find-items.query';

@QueryHandler(FindItemsQuery)
export class FindItemsHandler
  implements IQueryHandler<FindItemsQuery, FindItemsResult>
{
  constructor(
    @InjectModel(MongooseItemSchema.name)
    private readonly queryModel: Model<MongooseItemSchema>,
  ) {}

  async execute(query: FindItemsQuery): Promise<FindItemsResult> {
    const { name, type } = query.data;

    const result = await this.queryModel
      .find({
        ...(name ? { name } : {}),
        ...(type ? { type } : {}),
      })
      .exec();

    if (!result) {
      return new FindItemsResult([]);
    }

    return new FindItemsResult(
      result.map(
        (x) =>
          new Item({
            id: x._id.toHexString(),
            name: x.name,
            description: x.description,
            type: x.type,
            price: x.price,
            images: x.images,
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
          }),
      ),
    );
  }
}
