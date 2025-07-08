import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongooseOrderSchema } from '../../../infra/persistance/mongoose/order/order.schema';
import { Order } from '../dtos/order.dto';
import { GetOrderByIdQuery, GetOrderByIdResult } from './get-order-by-id.query';

@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdHandler
  implements IQueryHandler<GetOrderByIdQuery, GetOrderByIdResult>
{
  constructor(
    @InjectModel(MongooseOrderSchema.name)
    private readonly queryModel: Model<MongooseOrderSchema>,
  ) {}

  async execute(query: GetOrderByIdQuery): Promise<GetOrderByIdResult> {
    const result = await this.queryModel
      .findById(new Types.ObjectId(query.id))
      .exec();
    if (!result) {
      throw new NotFoundException();
    }
    return new GetOrderByIdResult(
      new Order({
        id: result._id.toHexString(),
        status: result.status,
        total: result.total,
        paymentId: result.paymentId,
        qrCode: result.qrCode,
        preparationId: result.preparationId,
        preparationRequestedAt: result.preparationRequestedAt,
        rejectionReason: result.rejectionReason,
        requester: result.requester
          ? {
              name: result.requester.name,
              cpf: result.requester.cpf,
              email: result.requester.email,
            }
          : null,
        items: result.items.map(({ key, name, price }) => ({
          key,
          name,
          price,
        })),
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      }),
    );
  }
}
