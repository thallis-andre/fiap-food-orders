import { FindOrdersInput } from '../dtos/find-orders.input';
import { Order } from '../dtos/order.dto';

export class FindOrdersQuery {
  constructor(public readonly data: FindOrdersInput) {}
}

export class FindOrdersResult {
  constructor(public readonly data: Order[]) {}
}
