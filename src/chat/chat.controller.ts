import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiProperty } from '@nestjs/swagger';
import { ChatService } from './chat.service';

class ChatRequestDto {
  @ApiProperty({ example: 'user123', description: 'Identificador único del usuario o sesión.' })
  userId: string;

  @ApiProperty({ example: '¿Qué productos sin gluten tienen?', description: 'Mensaje enviado por el usuario al chatbot.' })
  message: string;
}

class ChatResponseDto {
  @ApiProperty({ example: '¡Hola! Tenemos pan, galletas y más productos sin gluten.', description: 'Respuesta generada por el chatbot.' })
  response: string;
}

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar mensaje al chatbot', description: 'Envía un mensaje y recibe una respuesta generada por IA, con contexto real de productos.' })
  @ApiBody({ type: ChatRequestDto, examples: {
    ejemplo1: {
      summary: 'Consulta de productos',
      value: { userId: 'user123', message: '¿Qué productos sin gluten tienen?' }
    },
    ejemplo2: {
      summary: 'Consulta de stock',
      value: { userId: 'user456', message: '¿Tienen pan sin gluten disponible?' }
    }
  }})
  @ApiResponse({ status: 200, description: 'Respuesta generada por el chatbot', type: ChatResponseDto, examples: {
    ejemplo1: {
      summary: 'Respuesta con productos',
      value: { response: '¡Hola! Tenemos pan, galletas y más productos sin gluten.' }
    }
  }})
  async chat(@Body() body: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatService.chat(body.userId, body.message);
  }
} 