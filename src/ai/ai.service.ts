import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        this.openai = new OpenAI({
        apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async generateResponse(
        message: string,
        context?: string,
        conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
    ): Promise<string> {
        try {
            console.log('🔑 Verificando API key de OpenAI...');
            const apiKey = this.configService.get<string>('OPENAI_API_KEY');
            if (!apiKey) {
                console.error('❌ API key de OpenAI no encontrada');
                throw new Error('OpenAI API key not configured');
            }
            console.log('✅ API key de OpenAI encontrada');

            // Primero, evaluar si la IA puede manejar esta consulta
            const canHandle = await this.evaluateIfCanHandle(message);
            console.log('🤔 ¿Puede manejar la consulta?', canHandle);

            if (!canHandle) {
                return 'Entiendo tu consulta. Para brindarte la mejor atención posible, te recomiendo contactar directamente con nuestro equipo por WhatsApp. Ellos podrán ayudarte de manera más personalizada y efectiva.';
            }

            const messages: any[] = [
                {
                    role: 'system',
                    content: `Eres un asistente virtual especializado en productos sin gluten para la empresa Gluten Free Home. 
                    
                    Tu función es:
                    1. Responder consultas generales sobre la empresa, productos y servicios
                    2. Recomendar productos específicos basándote en las preferencias del cliente
                    3. Ayudar con atención al cliente básica
                    4. Si no puedes resolver algo, sugiere contactar por WhatsApp
                    
                    Contexto adicional: ${context || 'Sin contexto específico'}
                    
                    Responde de manera amigable y profesional en español.`
                }
            ];

            // Agregar historial de conversación si existe
            if (conversationHistory) {
                messages.push(...conversationHistory);
            }

            // Agregar el mensaje actual del usuario
            messages.push({
                role: 'user',
                content: message
            });

            console.log('📤 Enviando petición a OpenAI...');
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
            });

            const response = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';
            console.log('✅ Respuesta de OpenAI recibida');
            return response;
        } catch (error) {
            console.error('❌ Error en OpenAI:', error);
            
            // Si hay error con OpenAI, usar clasificación local inteligente
            console.log('🔄 Usando clasificación local...');
            const canHandleLocally = this.canHandleLocally(message);
            console.log('🤔 ¿Puede manejar localmente?', canHandleLocally);
            
            if (canHandleLocally) {
                return this.getFallbackResponse(message);
            } else {
                return 'Entiendo tu consulta. Para brindarte la mejor atención posible, te recomiendo contactar directamente con nuestro equipo por WhatsApp. Ellos podrán ayudarte de manera más personalizada y efectiva.';
            }
        }
    }

    private async evaluateIfCanHandle(message: string): Promise<boolean> {
        try {
            const evaluationPrompt = `
                Eres un clasificador de consultas para un chatbot de productos sin gluten.
                
                Tu tarea es determinar si el chatbot puede manejar la consulta del usuario o debe escalar a un humano.
                
                El chatbot PUEDE manejar (responde SI):
                - Consultas sobre productos sin gluten (tipos, precios, características, disponibilidad)
                - Preguntas como "¿qué productos tienen?", "¿qué panes tienen?", "¿tienen galletas?"
                - Información general de la empresa (horarios, ubicación)
                - Recomendaciones de productos
                - Preguntas básicas sobre certificaciones sin gluten
                - Saludos y conversación general
                - Búsqueda de productos específicos
                - Consultas sobre categorías de productos
                
                El chatbot NO PUEDE manejar (responde NO):
                - Quejas, reclamos o problemas específicos
                - Pedidos, pagos o transacciones
                - Cambios en datos personales o cuentas
                - Consultas médicas específicas o alérgenos complejos
                - Negocios mayoristas o comerciales
                - Consultas técnicas muy específicas
                - Cualquier cosa que requiera acción directa del equipo
                
                Consulta del usuario: "${message}"
                
                Responde SOLO con "SI" si el chatbot puede manejar la consulta, o "NO" si debe escalar a un humano.
                
                IMPORTANTE: Si la consulta es sobre productos, disponibilidad, o información general, responde SI.
            `;

            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: evaluationPrompt }],
                max_tokens: 10,
                temperature: 0.1,
            });

            const response = completion.choices[0]?.message?.content?.trim().toUpperCase();
            console.log('🤖 Clasificación IA:', response);
            return response === 'SI';
        } catch (error) {
            console.error('❌ Error evaluando consulta:', error);
            // Si hay error, ser conservador y escalar
            return false;
        }
    }

    private getFallbackResponse(message: string): string {
        const lowerMessage = message.toLowerCase();
        
        // Detectar consultas específicas de productos (prioridad alta)
        if (lowerMessage.includes('pan') || lowerMessage.includes('galletas') || lowerMessage.includes('harina') || 
            lowerMessage.includes('semillas') || lowerMessage.includes('integral') || lowerMessage.includes('específico')) {
            return '¡Perfecto! Te ayudo a encontrar productos específicos. Tenemos varias opciones de pan sin gluten, incluyendo algunos con semillas. ¿Te gustaría que te muestre las opciones disponibles o prefieres que busque algo más específico?';
        }
        
        // Detectar consultas generales de productos
        if (lowerMessage.includes('producto') || lowerMessage.includes('qué') || lowerMessage.includes('tienen') ||
            lowerMessage.includes('disponible') || lowerMessage.includes('disponibles') || lowerMessage.includes('catalogo')) {
            return '¡Hola! Tenemos una excelente variedad de productos sin gluten certificados. Te puedo ayudar a encontrar lo que necesitas. ¿Qué tipo de producto estás buscando específicamente?';
        }
        
        if (lowerMessage.includes('comprar') || lowerMessage.includes('precio') || 
            lowerMessage.includes('buscar') || lowerMessage.includes('encontrar') || lowerMessage.includes('recomendar')) {
            return '¡Hola! Tenemos una excelente variedad de productos sin gluten certificados. Te puedo ayudar a encontrar lo que necesitas. ¿Qué tipo de producto estás buscando específicamente?';
        }
        
        if (lowerMessage.includes('horario') || lowerMessage.includes('abierto') || lowerMessage.includes('cerrado')) {
            return 'Nuestros horarios de atención son de lunes a viernes de 8:00 AM a 6:00 PM, y sábados de 9:00 AM a 2:00 PM. ¿Te gustaría que te ayude con algo más?';
        }
        
        if (lowerMessage.includes('ubicación') || lowerMessage.includes('dirección') || lowerMessage.includes('dónde')) {
            return 'Nos encontramos en [dirección de la empresa]. ¿Te gustaría que te ayude con información sobre nuestros productos o servicios?';
        }
        
        // Saludos generales
        if (lowerMessage.includes('hola') || lowerMessage.includes('buenos días') || lowerMessage.includes('buenas')) {
            return '¡Hola! Soy el asistente virtual de Gluten Free Home. Estoy aquí para ayudarte con información sobre nuestros productos sin gluten y cualquier consulta que tengas. ¿En qué puedo ayudarte hoy?';
        }
        
        // Si no reconoce nada, escalar
        return 'Entiendo tu consulta. Para brindarte la mejor atención posible, te recomiendo contactar directamente con nuestro equipo por WhatsApp. Ellos podrán ayudarte de manera más personalizada y efectiva.';
    }

    async generateWhatsAppLink(message: string): Promise<string> {
        const whatsappNumber = this.configService.get<string>('WHATSAPP_NUMBER');
        const encodedMessage = encodeURIComponent(`Hola, necesito ayuda con: ${message}`);
        return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    }

    private canHandleLocally(message: string): boolean {
        const lowerMessage = message.toLowerCase();
        
        // Casos que SÍ puede manejar localmente
        const canHandleKeywords = [
            'producto', 'productos', 'qué', 'tienen', 'disponible', 'disponibles',
            'pan', 'galletas', 'harina', 'semillas', 'integral', 'específico',
            'buscar', 'encontrar', 'recomendar', 'catalogo', 'catálogo',
            'horario', 'abierto', 'cerrado', 'ubicación', 'dirección', 'dónde',
            'hola', 'buenos días', 'buenas', 'certificado', 'sin gluten'
        ];
        
        // Casos que NO puede manejar localmente
        const cannotHandleKeywords = [
            'queja', 'reclamo', 'problema', 'error', 'mal', 'defectuoso',
            'cancelar', 'devolver', 'reembolso', 'urgente', 'emergencia',
            'pedido', 'orden', 'pagar', 'tarjeta', 'transferencia',
            'envío', 'entrega', 'factura', 'boleta', 'recibo',
            'mi cuenta', 'mis datos', 'cambiar', 'actualizar', 'contraseña',
            'alergia', 'alérgico', 'intolerancia', 'diabético', 'celíaco',
            'mayorista', 'distribuidor', 'negocio', 'restaurante', 'empresa'
        ];
        
        // Si contiene palabras que NO puede manejar, escalar
        if (cannotHandleKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return false;
        }
        
        // Si contiene palabras que SÍ puede manejar, procesar localmente
        if (canHandleKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return true;
        }
        
        // Si no reconoce nada, escalar por seguridad
        return false;
    }
}
