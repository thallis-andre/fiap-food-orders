export class RejectOrderOnPaymentRejectedCommand {
  constructor(public readonly paymentId: string) {}
}
