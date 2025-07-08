import { randomUUID } from 'crypto';
import { ItemAdded } from './events/item-added.event';
import { OrderCheckedOut } from './events/order-checked-out.event';
import { Item } from './item.entity';
import { Order } from './order.aggregate';
import { OrderItem } from './values/order-item.value';
import { Requester } from './values/requester.value';

const createSpiedTarget = () => {
  const requester = new Requester('John Doe', '01234567890', 'john@doe.com');
  const target = new Order(randomUUID(), requester);

  jest.spyOn(target as any, 'applyEvent');
  return target;
};

describe('Order', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  it('should add item to order', () => {
    const target = createSpiedTarget();
    const item = new Item('1', 'XFood', 12.99, 'Dessert', 'desc');
    target.addItem(item);
    const orderItem = OrderItem.fromItem(item);
    const [itemOnOrder] = target.items;
    const expectedOrderItem = new OrderItem(
      itemOnOrder.key,
      orderItem.name,
      orderItem.price,
    );
    expect(target.total).toBe(12.99);
    expect(target.items).toEqual(expect.arrayContaining([expectedOrderItem]));
    expect((target as any).applyEvent).toHaveBeenCalledWith(
      new ItemAdded(expectedOrderItem),
    );
  });

  it('should remove item from order', () => {
    const target = createSpiedTarget();
    const anItem = new Item('1', 'XFood', 12.99, 'Dessert', 'desc');
    const anotherItem = new Item('2', 'XEgg', 14.99, 'Dessert', 'desc');
    target.addItem(anItem);
    target.addItem(anotherItem);
    const [first, second] = target.items;
    target.removeItem(first);
    expect(target.total).toBe(14.99);
    expect(target.items).toEqual(expect.arrayContaining([second]));
  });

  it('should checkout order ', () => {
    const target = createSpiedTarget();
    const anItem = new Item('1', 'XFood', 12.99, 'Dessert', 'desc');
    const anotherItem = new Item('2', 'XEgg', 14.99, 'Dessert', 'desc');
    target.addItem(anItem);
    target.addItem(anotherItem);
    target.checkout('paymentId', 'qrCode');
    expect(target.total).toBe(anItem.price + anotherItem.price);
    expect((target as any).applyEvent).toHaveBeenCalledWith(
      new OrderCheckedOut('paymentId', 'qrCode'),
    );
  });

  it('should not allow adding or removig items from checked out order ', () => {
    const target = createSpiedTarget();
    const anItem = new Item('1', 'XFood', 12.99, 'Dessert', 'desc');
    const anotherItem = new Item('2', 'XEgg', 14.99, 'Dessert', 'desc');
    target.addItem(anItem);
    target.checkout('paymentId', 'qrCode');

    const [item] = target.items;

    expect(() => target.addItem(anotherItem)).toThrow();
    expect(() => target.removeItem(item)).toThrow();
  });
});
