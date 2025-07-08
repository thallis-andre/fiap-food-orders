import { Entity } from '@fiap-food/tactical-design/core';
import { ItemTypes } from './values/item-type.value';

export class Item extends Entity {
  private _images: string[] = [];
  constructor(
    protected readonly _id: string,
    private _name: string,
    private _price: number,
    private _type: ItemTypes,
    private _description: string,
    images: string[] = null,
  ) {
    super(_id);
    if (images?.length) {
      this._images = this.uniqueImages(images);
    }
  }

  get name() {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get type() {
    return this._type;
  }

  set type(value: ItemTypes) {
    this._type = value;
  }

  get price() {
    return this._price;
  }

  set price(value: number) {
    this._price = value;
  }

  get description() {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get images() {
    return this._images.map((x) => x);
  }

  set images(value: string[]) {
    this._images = this.uniqueImages(value);
  }

  private uniqueImages(images: string[]) {
    return Array.from(new Set(images));
  }
}
