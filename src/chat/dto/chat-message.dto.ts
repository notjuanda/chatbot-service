import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
    @ApiProperty({
        description: 'Mensaje del usuario para el chatbot',
        example: 'Hola, ¿qué productos sin gluten tienen disponibles?',
    })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiProperty({
        description: 'ID de sesión para mantener contexto de la conversación',
        example: 'session-123',
        required: false,
    })
    @IsOptional()
    @IsString()
    sessionId?: string;

    @ApiProperty({
        description: 'Historial de la conversación actual',
        example: [
            { role: 'user', content: 'Hola' },
            { role: 'assistant', content: '¡Hola! ¿En qué puedo ayudarte?' }
        ],
        required: false,
    })
    @IsOptional()
    @IsArray()
    conversationHistory?: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
} 