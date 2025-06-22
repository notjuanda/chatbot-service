import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@ApiTags('chatbot')
@Controller('chatbot')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Procesar mensaje del usuario',
    description: 'Envía un mensaje al chatbot y recibe una respuesta inteligente con recomendaciones de productos si aplica',
  })
  @ApiBody({ type: ChatMessageDto })
  @ApiResponse({
    status: 200,
    description: 'Respuesta exitosa del chatbot',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async processMessage(@Body() chatMessageDto: ChatMessageDto): Promise<ChatResponseDto> {
    return this.chatService.processMessage(chatMessageDto);
  }

  @Post('health')
  @HttpCode(HttpStatus.OK)
  @ApiTags('health')
  @ApiOperation({
    summary: 'Verificar estado del servicio',
    description: 'Endpoint para verificar que el chatbot esté funcionando correctamente',
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio funcionando correctamente',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        message: { type: 'string', example: 'Chatbot service is running' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  health() {
    return {
      status: 'ok',
      message: 'Chatbot service is running',
      timestamp: new Date().toISOString(),
    };
  }
}
