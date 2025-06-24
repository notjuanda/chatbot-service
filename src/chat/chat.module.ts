import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SessionService } from './session.service';
import { ContextService } from './context.service';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ProductsModule } from '../products/products.module';
import { AiModule } from '../ai/ai.module';
import { WhatsAppService } from '../common/services/whatsapp.service';
import { UsersModule } from '../users/users.module';
import { RateLimitService } from '../common/services/rate-limit.service';
import { JwtAuthModule } from '../common/jwt/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession, ChatMessage]),
    ProductsModule,
    AiModule,
    UsersModule,
    JwtAuthModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService, 
    SessionService, 
    ContextService, 
    WhatsAppService,
    RateLimitService,
  ],
  exports: [ChatService, SessionService, ContextService, WhatsAppService],
})
export class ChatModule {} 