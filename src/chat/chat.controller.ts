import { 
  Controller, 
  Post, 
  Delete,
  Body, 
  Req, 
  UseGuards, 
  HttpException, 
  HttpStatus,
  Ip 
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatMessageDto, ChatResponseDto } from './dto/chat-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { UsersService } from '../users/users.service';
import { RateLimitService } from '../common/services/rate-limit.service';
import { RedisSessionService } from './redis-session.service';
import { Request } from 'express';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
    private readonly rateLimitService: RateLimitService,
    private readonly sessionService: RedisSessionService,
  ) {}

  @Post()
  @ApiOperation({ 
    summary: 'Enviar mensaje al chatbot', 
    description: 'Envía un mensaje y recibe una respuesta generada por IA. Requiere autenticación JWT o está limitado por IP para usuarios no autenticados.' 
  })
  @ApiBody({ 
    type: ChatMessageDto, 
    examples: {
      usuarioAutenticado: {
        summary: 'Usuario autenticado',
        value: { message: '¿Qué productos sin gluten tienen?' }
      },
      usuarioNoAutenticado: {
        summary: 'Usuario no autenticado (limitado por IP)',
        value: { message: '¿Tienen pan sin gluten?' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Respuesta generada por el chatbot', 
    type: ChatResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Usuario no autenticado o token inválido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Usuario no tiene permisos de cliente o excedió límite de rate' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Demasiadas solicitudes (rate limit excedido)' 
  })
  async chat(
    @Body() body: ChatMessageDto,
    @Req() req: Request,
    @Ip() ip: string,
    @CurrentUser() user?: any
  ): Promise<ChatResponseDto> {
    let userId: string;
    let isAuthenticated = false;

    // Verificar si el usuario está autenticado
    if (user && user.id) {
      // Usuario autenticado - validar que sea un cliente
      const validatedUser = await this.usersService.validateUser(user.id);
      if (!validatedUser) {
        throw new HttpException(
          'Usuario no tiene permisos de cliente', 
          HttpStatus.FORBIDDEN
        );
      }
      
      userId = `user_${user.id}`;
      isAuthenticated = true;
    } else {
      // Usuario no autenticado - aplicar rate limiting por IP
      if (!this.rateLimitService.isAllowed(ip)) {
        const resetTime = this.rateLimitService.getResetTime(ip);
        throw new HttpException(
          {
            message: 'Has excedido el límite de mensajes. Intenta de nuevo más tarde.',
            resetTime: resetTime?.toISOString(),
          },
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
      
      userId = `ip_${ip}`;
    }

    // Procesar el mensaje
    const result = await this.chatService.chat(userId, body.message);
    
    // Agregar información de rate limiting para usuarios no autenticados
    if (!isAuthenticated) {
      result.remainingRequests = this.rateLimitService.getRemainingRequests(ip);
    }

    return result;
  }

  @Delete('session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Limpiar sesión del chatbot', 
    description: 'Elimina la sesión del chatbot para el usuario autenticado' 
  })
  @ApiResponse({ status: 200, description: 'Sesión eliminada correctamente' })
  async clearSession(@CurrentUser() user: any): Promise<{ message: string }> {
    const userId = `user_${user.id}`;
    await this.sessionService.clearSession(userId);
    return { message: 'Sesión del chatbot eliminada correctamente' };
  }

  @Post('authenticated')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Enviar mensaje al chatbot (solo usuarios autenticados)', 
    description: 'Endpoint específico para usuarios autenticados con JWT' 
  })
  @ApiBody({ type: ChatMessageDto })
  @ApiResponse({ status: 200, description: 'Respuesta generada por el chatbot', type: ChatResponseDto })
  async chatAuthenticated(
    @Body() body: ChatMessageDto,
    @CurrentUser() user: any
  ): Promise<ChatResponseDto> {
    // Validar que el usuario sea un cliente
    const validatedUser = await this.usersService.validateUser(user.id);
    if (!validatedUser) {
      throw new HttpException(
        'Usuario no tiene permisos de cliente', 
        HttpStatus.FORBIDDEN
      );
    }

    const userId = `user_${user.id}`;
    return this.chatService.chat(userId, body.message);
  }
} 