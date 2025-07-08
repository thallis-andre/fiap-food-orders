import { CheckoutOrderOutput } from '../dtos/checkout-order.output';

export class CheckoutOrderCommand {
  constructor(public readonly id: string) {}
}

export class CheckoutOrderResult {
  constructor(public readonly data: CheckoutOrderOutput) {}
}
