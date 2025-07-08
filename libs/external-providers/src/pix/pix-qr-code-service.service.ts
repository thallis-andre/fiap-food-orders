import { Injectable } from '@nestjs/common';
import PIX from './pix';

@Injectable()
export class PixQRCodeService {
  async createPixQRCode(
    pixkey: string,
    amount: number,
    merchant: string,
    city: string,
    code: string,
  ): Promise<PIX> {
    const transaction = new PIX({
      pixkey,
      merchant,
      city,
      code,
      amount,
    });
    return transaction;
  }
}
