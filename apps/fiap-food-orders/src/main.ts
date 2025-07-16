import { createNestApp } from '@fiap-food/setup';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('🚀 Iniciando aplicação NestJS...');
    console.log('📝 Variáveis de ambiente:');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - PORT:', process.env.PORT);
    console.log(
      '  - MONGO_URL:',
      process.env.MONGO_URL ? 'Configurado' : 'NÃO CONFIGURADO',
    );
    console.log(
      '  - AMQP_URL:',
      process.env.AMQP_URL ? 'Configurado' : 'NÃO CONFIGURADO',
    );

    console.log('🔧 Criando aplicação NestJS...');
    const app = await createNestApp(AppModule);

    console.log('⚙️ Obtendo configurações...');
    const config = app.get(ConfigService);
    const port = config.get('PORT', '3333');

    console.log(`🌐 Iniciando servidor na porta ${port}...`);
    await app.listen(port);

    console.log(`✅ Aplicação iniciada com sucesso na porta ${port}`);
    console.log(`🔗 URL: http://localhost:${port}`);
  } catch (error) {
    console.error('❌ ERRO na inicialização da aplicação:');
    console.error('📜 Mensagem:', error.message);
    console.error('📋 Stack:', error.stack);
    console.error('🔍 Tipo de erro:', error.constructor.name);

    // Log detalhado para debug
    if (error.name === 'MongooseServerSelectionError') {
      console.error('🔌 Erro de conexão MongoDB detectado');
    }

    // Forçar exit para evitar processo zombie
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('💥 ERRO CRÍTICO no bootstrap:');
  console.error(error);
  process.exit(1);
});
