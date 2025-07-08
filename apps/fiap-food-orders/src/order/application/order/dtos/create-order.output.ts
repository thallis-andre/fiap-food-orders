import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderOutput {
  @ApiProperty()
  public readonly id: string;

  constructor(id: string) /* istanbul ignore next */ {
    this.id = id;
  }
}
