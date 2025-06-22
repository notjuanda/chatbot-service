import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { chatbotDatabaseConfig, gfhomeDatabaseConfig } from '../config/database.config';

@Module({
    imports: [
        // Conexión a la base de datos del chatbot
        TypeOrmModule.forRoot({
        ...chatbotDatabaseConfig,
        name: 'chatbot', // Nombre de la conexión
        }),
        // Conexión a la base de datos de GFHome
        TypeOrmModule.forRoot({
        ...gfhomeDatabaseConfig,
        name: 'gfhome', // Nombre de la conexión
        }),
    ],
})
export class DatabaseModule {} 