export const items = [
  {
    name: 'X-Food',
    price: 14.99,
    description: 'Some nice description for X-Food',
    type: 'Snack',
    images: ['https://anyurl.com/x-food'],
  },
  {
    name: 'X-Egg',
    price: 14.99,
    description: 'Some nice description for X-Egg',
    type: 'Snack',
    images: ['https://anyurl.com/x-egg'],
  },
  {
    name: 'Coke',
    price: 9.99,
    description: 'Some nice description for Coke',
    type: 'Beverage',
    images: ['https://anyurl.com/coke'],
  },
  {
    name: 'Orange Juice',
    price: 6.99,
    description: 'Some nice description for Orange Juice',
    type: 'Beverage',
    images: ['https://anyurl.com/orange_juice'],
  },
  {
    name: 'Ice Cream',
    price: 10.99,
    description: 'Some nice description for Ice Cream',
    type: 'Dessert',
    images: ['https://anyurl.com/ice_cream'],
  },
  {
    name: 'Cookie',
    price: 8.0,
    description: 'Some nice description for Cookie',
    type: 'Dessert',
    images: ['https://anyurl.com/cookie'],
  },
  {
    name: 'French Fries',
    price: 9.99,
    description: 'Some nice description for French Fries',
    type: 'Accompaniment',
    images: ['https://anyurl.com/french_fries'],
  },
  {
    name: 'Nuggets',
    price: 7.9,
    description: 'Some nice description for Nuggets',
    type: 'Accompaniment',
    images: ['https://anyurl.com/nuggets'],
  },
];

export const itemsTypes = Array.from(new Set(items.map((x) => x.type)));
