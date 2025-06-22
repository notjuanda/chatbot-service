import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
    @ApiProperty({
        description: 'Respuesta del chatbot generada por IA',
        example: '¡Hola! Tenemos una gran variedad de productos sin gluten. ¿Te gustaría que te recomiende algunos?',
    })
    message: string;

    @ApiProperty({
        description: 'ID de sesión para mantener contexto',
        example: 'session-123',
        required: false,
    })
    sessionId?: string;

    @ApiProperty({
        description: 'Enlace de WhatsApp para escalamiento',
        example: 'https://wa.me/59176305114?text=Hola%2C%20necesito%20ayuda',
        required: false,
    })
    whatsappLink?: string;

    @ApiProperty({
        description: 'Productos recomendados por el chatbot',
        example: [
            {
                id: 1,
                nombre: 'Pan sin gluten integral',
                precioBob: 25.50,
                descripcion: 'Pan integral sin gluten',
                categoria: 'Panes',
                marca: 'GlutenFree'
            }
        ],
        required: false,
    })
    products?: Array<{
        id: number;
        nombre: string;
        precioBob: number;
        descripcion?: string;
        categoria?: string;
        marca?: string;
    }>;

    @ApiProperty({
        description: 'Categorías de productos disponibles',
        example: [
            { id: 1, nombre: 'Panes' },
            { id: 2, nombre: 'Galletas' }
        ],
        required: false,
    })
    categories?: Array<{
        id: number;
        nombre: string;
    }>;
} 