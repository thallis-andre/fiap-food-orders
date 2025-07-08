import { Order } from '../dtos/order.dto';

export class GetOrderByIdQuery {
  constructor(public readonly id: string) {}
}

export class GetOrderByIdResult {
  constructor(public readonly data: Order) {}
}
