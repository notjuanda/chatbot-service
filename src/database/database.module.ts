import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Product, Brand, Ingredient } from '../database/product.entity';

@Module({
  imports: [
    ConfigModule,
    // Conexión por defecto: para entidades del chatbot
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('CHATBOT_DB_HOST', 'localhost'),
        port: parseInt(config.get('CHATBOT_DB_PORT', '5432')),
        username: config.get('CHATBOT_DB_USERNAME', 'postgres'),
        password: config.get('CHATBOT_DB_PASSWORD', 'password'),
        database: config.get('CHATBOT_DB_NAME', 'chatbot_db'),
        autoLoadEntities: true,
        synchronize: true, // Solo para desarrollo
      }),
    }),
    // Segunda conexión: para productos, ingredientes, marcas, etc.
    TypeOrmModule.forRootAsync({
      name: 'PRODUCTS_DB',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('GFHOME_DB_HOST', 'localhost'),
        port: parseInt(config.get('GFHOME_DB_PORT', '5432')),
        username: config.get('GFHOME_DB_USERNAME', 'postgres'),
        password: config.get('GFHOME_DB_PASSWORD', 'password'),
        database: config.get('GFHOME_DB_NAME', 'gfhome'),
        autoLoadEntities: false, // Se registran manualmente las entidades
        synchronize: false, // Nunca sincronizar la base real
        entities: [Product, Brand, Ingredient],
      }),
    }),
    TypeOrmModule.forFeature([Product, Brand, Ingredient], 'PRODUCTS_DB'),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {} 