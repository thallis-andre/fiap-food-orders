export abstract class PaymentService {
  abstract createPixPayment(
    amount: number,
  ): Promise<{ id: string; qrCode: string }>;
}
