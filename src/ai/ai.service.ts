import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { IAiService, ChatMessage } from '../common/interfaces/chat.interface';

@Injectable()
export class AiService implements IAiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      baseURL: 'http://localhost:11434/v1', // Ollama API local
      apiKey: 'ollama', // cualquier string, no se valida
    });
  }

  async generateResponse(
    message: string,
    context?: string,
    conversationHistory?: ChatMessage[]
  ): Promise<string> {
    let prompt = this.buildPrompt(message, context, conversationHistory);

    const completion = await this.openai.chat.completions.create({
      model: 'llama3', // modelo local de Ollama
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: message }
      ],
      max_tokens: 400,
      temperature: 0.3, // Muy bajo para respuestas más consistentes
    });
    
    return completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';
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