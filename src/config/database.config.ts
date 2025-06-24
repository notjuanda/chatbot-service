import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASS'),
  database: configService.get('DB_NAME'),
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  synchronize: configService.get('NODE_ENV') !== 'production',
  logging: configService.get('NODE_ENV') === 'development',
});

// Configuración para la base de datos principal de GFHome
export const getMainDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('MAIN_DB_HOST'),
  port: configService.get('MAIN_DB_PORT', 5432),
  username: configService.get('MAIN_DB_USER'),
  password: configService.get('MAIN_DB_PASS'),
  database: configService.get('MAIN_DB_NAME'),
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  synchronize: false,
  logging: false,
  name: 'main-database', // Nombre para distinguir las conexiones
}); 