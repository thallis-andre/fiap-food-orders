import { ApiProperty } from '@nestjs/swagger';

export class CreateItemOutput {
  @ApiProperty()
  id: string;
}
