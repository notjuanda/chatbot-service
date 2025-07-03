import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuración específica de CORS para el frontend
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL,
    ],
    credentials: true, // Importante para cookies de autenticación
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Chatbot Gluten Free Home')
    .setDescription('API para interactuar con el chatbot de productos sin gluten (llama3 + Ollama)')
    .setVersion('1.0')
    .addTag('chat')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Chatbot API corriendo en http://localhost:${process.env.PORT || 3000}/chat`);
  console.log(`📚 Swagger en http://localhost:${process.env.PORT || 3000}/api`);
}
bootstrap();
