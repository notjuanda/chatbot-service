import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { ChatModule } from './chat/chat.module';
import { AiModule } from './ai/ai.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    ChatModule,
    AiModule,
    ProductsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
