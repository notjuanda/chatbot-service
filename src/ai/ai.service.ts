import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAiService, ChatMessage } from '../common/interfaces/chat.interface';

@Injectable()
export class AiService implements IAiService {
  private geminiApiKey: string;
  private geminiModel: string;
  private geminiApiUrl: string;

  constructor(private configService: ConfigService) {
    this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.geminiModel = this.configService.get<string>('GEMINI_MODEL') || 'gemini-1.5-flash-latest';
    this.geminiApiUrl = this.configService.get<string>('GEMINI_API_URL') || 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  async generateResponse(
    message: string,
    context?: string,
    conversationHistory?: ChatMessage[]
  ): Promise<string> {
    const prompt = this.buildPrompt(message, context, conversationHistory);
    const url = `${this.geminiApiUrl}/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt }
          ]
        }
      ]
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      // Gemini responde con choices[0].message.content o candidates[0].content.parts[0].text
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                   data?.choices?.[0]?.message?.content ||
                   'Lo siento, no pude generar una respuesta.';
      return text;
    } catch (error) {
      return 'Lo siento, no pude generar una respuesta en este momento.';
    }
  }

  private buildPrompt(
    message: string, 
    context?: string, 
    conversationHistory?: ChatMessage[]
  ): string {
    let prompt = `INSTRUCCIONES CRÍTICAS - LEE Y SIGUE EXACTAMENTE:

Eres Lulupico, asistente de Gluten Free Home.

REGLAS OBLIGATORIAS:
1. NUNCA te presentes como "Soy Lulupico" o similar.
2. NUNCA digas "¡Hola!" si ya estás en conversación - solo responde directamente.
3. NUNCA inventes nombres de marcas (solo menciona las que están en la lista).
4. SOLO menciona productos EXACTAMENTE como aparecen en la lista.
5. Si no tienes un producto, di: "No tenemos ese producto, pero te puedo mostrar lo que sí tenemos:"
6. Responde de forma natural, como si ya te conocieran.
7. Sé amigable pero directo.
8. NO inventes descripciones detalladas de productos.
9. Mantén el contexto de la conversación - no te "reinicies".
10. Para saludos simples (hola, buenos días, etc.), responde amigablemente sin mostrar productos automáticamente.

EJEMPLOS DE RESPUESTAS CORRECTAS:
- "¡Hola! ¿En qué puedo ayudarte hoy?"
- "¡Hola! ¿Buscas algo específico sin gluten?"
- "Tenemos varios productos sin gluten disponibles..."
- "No tenemos pastas, pero te puedo mostrar nuestros panes..."
- "Tenemos estos productos disponibles..."
- "Sí, actualmente solo trabajamos con NutriPan, pero tenemos variedad..."

EJEMPLOS DE RESPUESTAS INCORRECTAS:
- "¡Hola! Soy Lulupico..." ❌
- "¡Hola! Tenemos..." ❌ (si ya estás en conversación)
- "Tenemos NutriPan..." ❌ (si no está en la lista)
- "Nuestro pan blanco sin gluten..." ❌ (si no está en la lista)

CONTEXTO ACTUAL:`;
    
    if (context) {
      prompt += `\n${context}\n`;
    } else {
      prompt += `\nNo hay productos disponibles en este momento.\n`;
    }
    
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += '\nHISTORIAL RECIENTE:\n';
      conversationHistory.slice(-4).forEach(msg => {
        prompt += `${msg.role === 'user' ? 'Usuario' : 'Lulupico'}: ${msg.content}\n`;
      });
      prompt += '\nIMPORTANTE: Ya estás en conversación. Responde directamente sin saludar de nuevo.\n';
    } else {
      prompt += '\nIMPORTANTE: Es el primer mensaje. Puedes saludar amigablemente.\n';
    }
    
    prompt += `\nUsuario: ${message}\nLulupico:`;
    
    return prompt;
  }
} 