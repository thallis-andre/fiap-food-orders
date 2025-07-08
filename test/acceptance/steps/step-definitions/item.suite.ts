import { faker } from '@faker-js/faker';
import { And, Given, Suite, Then, When } from '@fiap-food/acceptance-factory';
import { HttpService } from '@nestjs/axios';
import { fakeToken } from 'apps/fiap-foodrders/test/mocks/mock.token';
import { strict as assert } from 'assert';
import { randomUUID } from 'crypto';

@Suite()
export class ItemSuite {
  private newItemInfo: any;
  private targetId: string;

  constructor(private readonly http: HttpService) {}

  @Given('The need to add a new item to the menu')
  async createTarget() {
    const dish = faker.food.dish();
    const description = `${faker.food.adjective()} ${dish}`;
    const [randomPrefix] = randomUUID().split('-');
    this.newItemInfo = {
      name: `${randomPrefix} ${dish}`,
      price: 22.9,
      description: `${randomPrefix} ${description}`,
      type: 'Snack',
      images: ['https://anyurl.com'],
    };
  }

  @When('a colaborator makes a create item request')
  async createItemRequest() {
    const response = await this.http.axiosRef.post(
      `http://localhost:3000/v1/items`,
      this.newItemInfo,
      { headers: { Authorization: fakeToken.admin } },
    );
    this.targetId = response.data.id;
  }

  @Then('the item is added to the menu')
  async verifyItemInMenu() {
    const res = await this.http.axiosRef.get(
      `http://localhost:3000/v1/items?type=${this.newItemInfo.type}`,
    );

    const itemInResponse = res.data.data.some(
      (x: any) => x.id === this.targetId,
    );
    assert.equal(itemInResponse, true);
  }

  @And('will be available on the get item endpoint')
  async verifyItemInGetInfo() {
    const res = await this.http.axiosRef.get(
      `http://localhost:3000/v1/items/${this.targetId}`,
    );

    const item = res.data;

    assert.equal(item.name, this.newItemInfo.name);
    assert.equal(item.price, this.newItemInfo.price);
    assert.equal(item.description, this.newItemInfo.description);
    assert.equal(item.type, this.newItemInfo.type);
    assert.equal(
      item.images.every((x) => this.newItemInfo.images.includes(x)),
      true,
    );
  }
}
