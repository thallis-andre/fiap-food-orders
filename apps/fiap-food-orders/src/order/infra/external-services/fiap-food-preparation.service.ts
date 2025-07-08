import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PreparationService } from '../../application/order/abstractions/preparation.service';
import { OrderItem } from '../../domain/values/order-item.value';

@Injectable()
export class FiapFoodPreparationService implements PreparationService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async requestPreparation(
    orderId: string,
    items: OrderItem[],
  ): Promise<{ conciliationId: string }> {
    const baseURL = this.config.getOrThrow('BASE_URL_PREPARATION_SERVICE');
    const itemNames = items.map((x) => x.name);
    const result = await this.http.axiosRef.post(`${baseURL}/v1/preparations`, {
      orderId,
      items: itemNames,
    });
    return { conciliationId: result.data.id };
  }
}
