import { Module } from '@nestjs/common';
import { PixQRCodeService } from './pix-qr-code-service.service';

@Module({
  providers: [PixQRCodeService],
  exports: [PixQRCodeService],
})
export class PixProviderModule {}
