import { createNestApp } from '@fiap-food/setup';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await createNestApp(AppModule);
  const config = app.get(ConfigService);
  const port = config.get('PORT', '3333');
  await app.listen(port);
}
bootstrap();
