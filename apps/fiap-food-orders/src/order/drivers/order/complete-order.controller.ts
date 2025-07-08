import { WithRoles } from '@fiap-food/setup';
import { Controller, HttpCode, Param, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CompleteOrderCommand } from '../../application/order/commands/complete-order.command';
import { ObjectIdValidationPipe } from '../../infra/pipes/object-id-validation.pipe';

@ApiTags('Orders')
@Controller({ version: '1', path: 'orders' })
export class CompleteOrderController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post(':id/complete')
  @WithRoles('ADMIN')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Complete Order',
    description: 'When customer picks up, marks orders as completed',
  })
  @ApiNoContentResponse()
  @ApiBadRequestResponse()
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async execute(@Param('id', new ObjectIdValidationPipe()) id: string) {
    await this.commandBus.execute(new CompleteOrderCommand(id));
  }
}
