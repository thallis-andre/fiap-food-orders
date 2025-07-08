import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongooseOrderSchema } from '../../../infra/persistance/mongoose/order/order.schema';
import { Order } from '../dtos/order.dto';
import { FindOrdersQuery, FindOrdersResult } from './find-orders.query';

@QueryHandler(FindOrdersQuery)
export class FindOrdersHandler
  implements IQueryHandler<FindOrdersQuery, FindOrdersResult>
{
  constructor(
    @InjectModel(MongooseOrderSchema.name)
    private readonly queryModel: Model<MongooseOrderSchema>,
  ) {}

  async execute(query: FindOrdersQuery): Promise<FindOrdersResult> {
    const { from, to, customerCpf, customerEmail, status } = query.data;

    const fromTo = from && to ? { createdAt: { $gte: from, $lt: to } } : {};
    const fromOnly = from && !to ? { createdAt: { $gte: from } } : {};
    const toOnly = !from && to ? { createdAt: { $lt: to } } : {};

    const result = await this.queryModel
      .find({
        ...(status ? { status } : {}),
        ...(customerCpf ? { 'requester.cpf': customerCpf } : {}),
        ...(customerEmail ? { 'requester.email': customerEmail } : {}),
        ...fromTo,
        ...fromOnly,
        ...toOnly,
      })
      .exec();

    /* istanbul ignore if */
    if (!result) {
      return new FindOrdersResult([]);
    }

    return new FindOrdersResult(
      result.map(
        (x) =>
          new Order({
            id: x._id.toHexString(),
            status: x.status,
            total: x.total,
            paymentId: x.paymentId,
            qrCode: x.qrCode,
            preparationId: x.preparationId,
            preparationRequestedAt: x.preparationRequestedAt,
            rejectionReason: x.rejectionReason,
            requester: x.requester
              ? {
                  name: x.requester.name,
                  cpf: x.requester.cpf,
                  email: x.requester.email,
                }
              : null,
            items: x.items.map(({ key, name, price }) => ({
              key,
              name,
              price,
            })),
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
          }),
      ),
    );
  }
}
