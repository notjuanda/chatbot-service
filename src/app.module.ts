import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { AiModule } from './ai/ai.module';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { AppConfigModule } from './config/config.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule, 
    ProductsModule, 
    ChatModule, 
    AiModule
  ],
})
export class AppModule {}
