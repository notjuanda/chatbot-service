import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const chatbotDatabaseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.CHATBOT_DB_HOST || 'localhost',
    port: parseInt(process.env.CHATBOT_DB_PORT || '5432'),
    username: process.env.CHATBOT_DB_USERNAME || 'postgres',
    password: process.env.CHATBOT_DB_PASSWORD || 'password',
    database: process.env.CHATBOT_DB_NAME || 'chatbot_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
};

export const gfhomeDatabaseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.GFHOME_DB_HOST || 'localhost',
    port: parseInt(process.env.GFHOME_DB_PORT || '5432'),
    username: process.env.GFHOME_DB_USERNAME || 'postgres',
    password: process.env.GFHOME_DB_PASSWORD || 'password',
    database: process.env.GFHOME_DB_NAME || 'gluten_free_home',
    entities: [], // No necesitamos entidades aquí, solo consultas
    synchronize: false, // Nunca sincronizar la BD principal
    logging: false,
}; 