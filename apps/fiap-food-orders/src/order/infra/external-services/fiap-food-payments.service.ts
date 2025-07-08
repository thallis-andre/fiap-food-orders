import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setTimeout } from 'timers/promises';
import { PaymentService } from '../../application/order/abstractions/payments.service';

@Injectable()
export class FiapFoodPaymentService implements PaymentService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async createPixPayment(
    amount: number,
  ): Promise<{ id: string; qrCode: string }> {
    const baseURL = this.config.getOrThrow('BASE_URL_PAYMENT_SERVICE');
    const result = await this.http.axiosRef.post(`${baseURL}/v1/payments`, {
      type: 'PixQrCode',
      amount,
    });

    const { id } = result.data;
    let qrCode: string;
    for (let attemptCount = 0; attemptCount < 10; attemptCount++) {
      const getResult = await this.http.axiosRef.get(
        `${baseURL}/v1/payments/${id}`,
      );
      await setTimeout(250);
      const paymentStatus = getResult.data.status;
      /* istanbul ignore if */
      if (paymentStatus === 'Drafted') {
        continue;
      }
      qrCode = getResult.data.content;
      break;
    }

    return { id, qrCode };
  }
}
