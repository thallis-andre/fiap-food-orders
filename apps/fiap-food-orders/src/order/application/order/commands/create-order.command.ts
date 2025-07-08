import { CreateOrderInput } from '../dtos/create-order.input';
import { CreateOrderOutput } from '../dtos/create-order.output';

export class CreateOrderCommand {
  constructor(public readonly data: CreateOrderInput) {}
}

export class CreateOrderResult {
  constructor(public readonly data: CreateOrderOutput) {}
}
