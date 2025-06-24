import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ 
    example: '¿Qué productos sin gluten tienen?', 
    description: 'Mensaje enviado por el usuario al chatbot.' 
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ 
    example: 123, 
    description: 'ID del usuario autenticado (opcional si no está autenticado)' 
  })
  @IsOptional()
  @IsNumber()
  userId?: number;
}

export class ChatResponseDto {
  @ApiProperty({ 
    example: '¡Hola! Tenemos pan, galletas y más productos sin gluten.', 
    description: 'Respuesta generada por el chatbot.' 
  })
  response: string;

  @ApiPropertyOptional({ 
    example: [
      { id: 1, nombre: 'Pan sin gluten', precio: 5.99 }
    ], 
    description: 'Productos recomendados (si aplica)' 
  })
  productos?: any[];

  @ApiPropertyOptional({ 
    example: 5, 
    description: 'Número de mensajes restantes para usuarios no autenticados' 
  })
  remainingRequests?: number;
} 