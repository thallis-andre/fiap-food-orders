import { faker } from '@faker-js/faker';
import { And, Given, Suite, Then, When } from '@fiap-food/acceptance-factory';
import { HttpService } from '@nestjs/axios';
import { strict as assert } from 'assert';
import { randomUUID } from 'crypto';
import { setTimeout } from 'timers/promises';
import { fakeToken } from './utils/token';

@Suite()
export class OrderSuite {
  private itemId: string;
  private orderId: string;

  private readonly orderServiceBaseURL = 'http://localhost:3000';
  private readonly paymentsServiceBaseURL = 'http://localhost:4000';
  private readonly preparationServiceBaseURL = 'http://localhost:5000';

  constructor(private readonly http: HttpService) {}

  @Given('an existing item in the menu')
  async createItem() {
    const dish = faker.food.dish();
    const description = `${faker.food.adjective()} ${dish}`;
    const [randomPrefix] = randomUUID().split('-');
    const res = await this.http.axiosRef.post(
      `${this.orderServiceBaseURL}/v1/items`,
      {
        name: `${randomPrefix} ${dish}`,
        price: 22.9,
        description: `${randomPrefix} ${description}`,
        type: 'Snack',
        images: ['https://anyurl.com'],
      },
      { headers: { Authorization: fakeToken.admin } },
    );
    this.itemId = res.data.id;
  }

  @And('a customer wants to place an order')
  async createOrder() {
    const res = await this.http.axiosRef.post(
      `${this.orderServiceBaseURL}/v1/orders`,
      { items: [{ id: this.itemId }] },
    );
    this.orderId = res.data.id;
  }

  @When('the customer checks the order out')
  async createItemRequest() {
    await this.http.axiosRef.post(
      `${this.orderServiceBaseURL}/v1/orders/${this.orderId}/checkout`,
    );
  }

  @And('the payment is approved')
  async approvePayment() {
    const paymentId = await this.http.axiosRef
      .get(`${this.orderServiceBaseURL}/v1/orders/${this.orderId}`)
      .then((x) => x.data.paymentId);
    await this.http.axiosRef.patch(
      `${this.paymentsServiceBaseURL}/v1/payments/${paymentId}/approve`,
    );
  }

  @And('the order preparation is advanced')
  async advancePreparation() {
    let preparationId = null;
    let counter = 0;
    do {
      preparationId = await this.http.axiosRef
        .get(`${this.orderServiceBaseURL}/v1/orders/${this.orderId}`)
        .then((x) => x.data.preparationId);
      await setTimeout(500);
    } while (!preparationId && counter++ <= 10);
    await this.http.axiosRef.patch(
      `${this.preparationServiceBaseURL}/v1/preparations/${preparationId}/advance`,
      {},
      { headers: { Authorization: fakeToken.admin } },
    );
    await this.http.axiosRef.patch(
      `${this.preparationServiceBaseURL}/v1/preparations/${preparationId}/advance`,
      {},
      { headers: { Authorization: fakeToken.admin } },
    );
  }

  @And('the customer picks up his order')
  async pickUpOrder() {
    await this.http.axiosRef.post(
      `${this.orderServiceBaseURL}/v1/orders/${this.orderId}/complete`,
      {},
      { headers: { Authorization: fakeToken.admin } },
    );
  }
  @Then('the order is marked complete')
  async verifyOrderCompleted() {
    const res = await this.http.axiosRef.get(
      `${this.orderServiceBaseURL}/v1/orders/${this.orderId}`,
    );
    const order = res.data;
    assert.equal(order.status, 'Completed');
  }
}
