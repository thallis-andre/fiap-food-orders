import {
    applyDecorators,
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from './user.model';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalAuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    try {
      this.logger.log(
        'OptionalAuthGuard - Iniciando validação de autenticação',
      );

      const request = context
        .switchToHttp()
        .getRequest<Request & { user: User }>();

      const auth = request.get('Authorization');

      if (!auth) {
        this.logger.log(
          'OptionalAuthGuard - Nenhum header Authorization encontrado, continuando sem autenticação',
        );
        return true;
      }

      this.logger.log(
        'OptionalAuthGuard - Header Authorization encontrado, tentando decodificar JWT',
      );
      this.logger.log(
        `OptionalAuthGuard - Authorization header: ${auth.substring(0, 20)}...`,
      );

      // Parse JWT token correctly: header.payload.signature
      const token = auth.replace('Bearer ', '');
      this.logger.log(
        `OptionalAuthGuard - Token extraído: ${token.substring(0, 20)}...`,
      );

      const tokenParts = token.split('.');
      this.logger.log(
        `OptionalAuthGuard - Token possui ${tokenParts.length} partes`,
      );

      if (tokenParts.length !== 3) {
        this.logger.error(
          'OptionalAuthGuard - Token JWT malformado - não possui 3 partes',
        );
        return true; // Optional auth, so continue even if token is invalid
      }

      const [, tokenBody] = tokenParts;
      this.logger.log(
        `OptionalAuthGuard - Decodificando payload do token: ${tokenBody.substring(0, 20)}...`,
      );

      const decodedPayload = JSON.parse(
        Buffer.from(tokenBody, 'base64').toString('utf-8'),
      );
      this.logger.log(
        `OptionalAuthGuard - Payload decodificado: ${JSON.stringify(decodedPayload, null, 2)}`,
      );

      const {
        name,
        email,
        ['custom:cpf']: cpf,
        ['custom:role']: role,
      } = decodedPayload;

      this.logger.log(
        `OptionalAuthGuard - Dados extraídos - Name: ${name}, Email: ${email}, CPF: ${cpf}, Role: ${role}`,
      );

      const user = new User({ name, cpf, email, role });
      request.user = user;

      this.logger.log(
        'OptionalAuthGuard - Usuário configurado com sucesso na requisição',
      );
      return true;
    } catch (error) {
      this.logger.error(
        'OptionalAuthGuard - Erro durante parsing do JWT token:',
        error,
      );
      this.logger.error(`OptionalAuthGuard - Stack trace: ${error.stack}`);
      this.logger.error(
        `OptionalAuthGuard - Mensagem de erro: ${error.message}`,
      );
      return true; // Optional auth, so continue even if token is invalid
    }
  }
}

export const WithOptionalAuth = () =>
  applyDecorators(UseGuards(OptionalAuthGuard));
