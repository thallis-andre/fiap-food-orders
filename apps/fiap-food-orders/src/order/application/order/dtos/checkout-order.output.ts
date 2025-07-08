import { ApiProperty } from '@nestjs/swagger';

export class CheckoutOrderOutput {
  @ApiProperty()
  public readonly qrCode: string;

  constructor(qrCode: string) /* istanbul ignore next */ {
    this.qrCode = qrCode;
  }
}
