import { Injectable } from '@nestjs/common';
import { IContextService, ProductDto } from '../common/interfaces/chat.interface';

@Injectable()
export class ContextService implements IContextService {
    buildContext(products: any[], whatsappLink: string): string {
        let contexto = `INSTRUCCIONES CRÍTICAS: Eres Lulupico, el asistente virtual de Gluten Free Home. 

REGLAS ESTRICTAS:
1. SOLO puedes mencionar productos que estén en la lista que te proporciono a continuación
2. NUNCA inventes productos que no estén en la lista
3. NUNCA inventes nombres de marcas específicas
4. Si el usuario pregunta por un producto que NO está en la lista, responde: "No tenemos ese producto, pero te puedo mostrar lo que sí tenemos disponibles:"
5. NO te presentes en cada mensaje, solo actúa como Lulupico
6. Si no hay productos en la lista, di: "Actualmente no tenemos productos disponibles. Te recomiendo contactar a nuestro equipo por WhatsApp para consultas específicas."
7. Mantén el contexto de la conversación - no te "reinicies" ni saludes repetitivamente
8. Responde de forma natural y continua la conversación

INFORMACIÓN DE LA TIENDA:
- Ubicación: Santa Cruz de la Sierra, Bolivia
- Envíos: Gratis en pedidos mayores a 100 Bs, 15 Bs en pedidos menores
- Horario: Lunes a domingo de 8:00 a 21:00
- WhatsApp para soporte: ${whatsappLink}

LISTA EXACTA DE PRODUCTOS DISPONIBLES (SOLO MENCIONA ESTOS):`;
        
        if (products && products.length > 0) {
            contexto += '\n' + products.map((p, index) => {
                let productInfo = `${index + 1}. ${p.nombre}`;
                
                // Manejar tanto objetos como strings para categoria y marca
                const categoria = typeof p.categoria === 'string' ? p.categoria : p.categoria?.nombre;
                const marca = typeof p.marca === 'string' ? p.marca : p.marca?.nombre;
                
                if (categoria) productInfo += ` (${categoria})`;
                if (marca) productInfo += ` - Marca: ${marca}`;
                productInfo += ` - Precio: Bs. ${p.precioBob}`;
                if (p.descripcion) productInfo += ` - ${p.descripcion}`;
                
                // Manejar ingredientes (pueden venir como array de objetos o como string)
                if (p.ingredientes && Array.isArray(p.ingredientes) && p.ingredientes.length > 0) {
                    const ingredientes = p.ingredientes.slice(0, 3).map(ing => 
                        typeof ing === 'string' ? ing : ing.nombre
                    ).join(', ');
                    productInfo += ` - Ingredientes: ${ingredientes}`;
                }
                
                return productInfo;
            }).join('\n');
        } else {
            contexto += '\nNINGÚN PRODUCTO DISPONIBLE EN ESTE MOMENTO';
        }
        
        contexto += `\n\nRECUERDA: Solo menciona productos de la lista anterior. Si el usuario pregunta por algo que no está, ofrécele los productos disponibles o sugiere contactar por WhatsApp. NUNCA inventes nombres de marcas o productos. Mantén el contexto de la conversación.`;
        
        return contexto;
    }

    mapProductsToDto(products: any[]): ProductDto[] {
        return products.map(p => ({
            id: p.id,
            name: p.nombre,
            description: p.descripcion,
            price: typeof p.precioBob === 'string' ? parseFloat(p.precioBob) : Number(p.precioBob),
            stock: p.stock,
            brand: typeof p.marca === 'string' ? p.marca : p.marca?.nombre || undefined,
            category: typeof p.categoria === 'string' ? p.categoria : p.categoria?.nombre || undefined,
            ingredients: p.ingredientes?.map(ing => 
                typeof ing === 'string' ? ing : ing.nombre
            ) || undefined,
        }));
    }
} 