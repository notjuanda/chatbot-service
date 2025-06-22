import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Chatbot API - Gluten Free Home')
    .setDescription('API del chatbot inteligente para consultas y recomendaciones de productos sin gluten')
    .setVersion('1.0')
    .addTag('chatbot', 'Endpoints del chatbot')
    .addTag('health', 'Endpoints de salud del servicio')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`🚀 Chatbot service running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 Swagger documentation: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
