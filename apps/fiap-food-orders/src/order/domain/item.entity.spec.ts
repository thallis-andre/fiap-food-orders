import { Item } from './item.entity';

describe('Item', () => {
  const id = '123';
  const name = 'XFood';
  const price = 12.99;
  const description = 'Dummy';
  const images = ['anyurl.com'];

  it('should instantiate without images', () => {
    const target = new Item(id, name, price, 'Dessert', description);
    expect(target).toBeInstanceOf(Item);
  });

  it('should instantiate with images', () => {
    const target = new Item(id, name, price, 'Dessert', description, images);
    expect(target).toBeInstanceOf(Item);
    expect(target.images).toEqual(expect.arrayContaining(images));
  });
});
