import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WaitTimeCalculator } from '../../../domain/services/wait-time.calculator';
import { EOrderStatus } from '../../../domain/values/order-status.value';
import { MongooseOrderSchema } from '../../../infra/persistance/mongoose/order/order.schema';
import { OrderFollowUp } from '../dtos/follow-up.dto';
import {
  FollowUpOrdersQuery,
  FollowUpOrdersResult,
} from './follow-up-orders.query';

@QueryHandler(FollowUpOrdersQuery)
export class FollowUpOrdersHandler
  implements IQueryHandler<FollowUpOrdersQuery, FollowUpOrdersResult>
{
  constructor(
    @InjectModel(MongooseOrderSchema.name)
    private readonly queryModel: Model<MongooseOrderSchema>,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(_query: FollowUpOrdersQuery): Promise<FollowUpOrdersResult> {
    const result = await this.queryModel
      .find({
        status: [
          EOrderStatus.PreparationRequested,
          EOrderStatus.PreparationStarted,
          EOrderStatus.PreparationCompleted,
        ],
      })
      .exec();

    /* istanbul ignore if */
    if (!result) {
      return new FollowUpOrdersResult({});
    }

    const ready: OrderFollowUp[] = [];
    const started: OrderFollowUp[] = [];
    const received: OrderFollowUp[] = [];

    for (const order of result) {
      const orderGroup = {
        [EOrderStatus.PreparationCompleted]: ready,
        [EOrderStatus.PreparationStarted]: started,
        [EOrderStatus.PreparationRequested]: received,
      }[order.status];
      orderGroup.push(
        new OrderFollowUp({
          customer: order?.requester?.name ?? 'Unknown',
          orderId: order._id.toHexString(),
          waitingTime: WaitTimeCalculator.calculate(
            /* istanbul ignore next */
            order.preparationRequestedAt ?? order.createdAt,
          ),
        }),
      );
    }

    return new FollowUpOrdersResult({
      /* istanbul ignore next */
      ...(ready.length ? { ready } : {}),
      /* istanbul ignore next */
      ...(started.length ? { started } : {}),
      /* istanbul ignore next */
      ...(received.length ? { received } : {}),
    });
  }
}
