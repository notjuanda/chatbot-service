import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig, getMainDatabaseConfig } from '../config/database.config';
import { ChatSession } from '../chat/entities/chat-session.entity';
import { ChatMessage } from '../chat/entities/chat-message.entity';
import { Product, Brand, Ingredient, ProductCategory } from './product.entity';

@Module({
  imports: [
    // Base de datos del chatbot
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    // Base de datos principal de GFHome
    TypeOrmModule.forRootAsync({
      name: 'main-database',
      useFactory: (configService: ConfigService) => getMainDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    // Entidades del chatbot
    TypeOrmModule.forFeature([ChatSession, ChatMessage]),
    // Entidades de productos en la base de datos principal
    TypeOrmModule.forFeature([Product, Brand, Ingredient, ProductCategory], 'main-database'),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {} 