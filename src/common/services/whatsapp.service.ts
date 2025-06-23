import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsAppService {
    private readonly whatsappNumber: string;
    private readonly defaultMessage: string;

    constructor(private configService: ConfigService) {
        this.whatsappNumber = this.configService.get('WHATSAPP_NUMBER', '59169685424');
        this.defaultMessage = 'Hola, necesito ayuda con un problema que el chatbot no pudo resolver.';
    }

    generateWhatsAppLink(customMessage?: string): string {
        const message = customMessage || this.defaultMessage;
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;
    }

    getWhatsAppNumber(): string {
        return this.whatsappNumber;
    }

    getDefaultMessage(): string {
        return this.defaultMessage;
    }
} 