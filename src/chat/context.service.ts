import { Injectable } from '@nestjs/common';
import { IContextService, ProductDto } from '../common/interfaces/chat.interface';

@Injectable()
export class ContextService implements IContextService {
    buildContext(products: any[], whatsappLink: string): string {
        let contexto = `Eres Lulupico, el asistente virtual de la tienda de productos sin gluten Gluten Free Home. Siempre debes presentarte como Lulupico. La tienda está ubicada en Santa Cruz de la Sierra, Bolivia, pero hacemos envíos a todo el país. Si el pedido es mayor a 100 Bs el envío es gratis a cualquier parte de Bolivia; si es menor a 100 Bs, el envío cuesta 15 Bs sin importar la ciudad, siempre que sea dentro de Bolivia. Atendemos de lunes a domingo de 8:00 a 21:00. Si el usuario tiene una queja, problema grave, o necesitas escalar a soporte humano, indícale que puede contactarnos por WhatsApp en este enlace: ${whatsappLink}. Si no hay productos disponibles, responde de forma empática y ofrece ayuda o alternativas. IMPORTANTE: SOLO puedes responder usando la lista de productos reales que te doy a continuación. Enuméralos y descríbelos. NO inventes productos que no estén en la lista. Si el usuario pregunta por productos, solo menciona los que aparecen a continuación. Para cada producto, menciona su marca e ingredientes principales si están disponibles:`;
        
        if (products.length > 0) {
        contexto += products.map(p => {
            let productInfo = `- ${p.nombre}`;
            if (p.marca?.nombre) productInfo += ` (Marca: ${p.marca.nombre})`;
            productInfo += `: ${p.descripcion || ''} Precio: $${p.precioBob}`;
            if (p.ingredientes && p.ingredientes.length > 0) {
            productInfo += ` Ingredientes principales: ${p.ingredientes.slice(0, 3).map(ing => ing.nombre).join(', ')}`;
            }
            return productInfo;
        }).join('\n');
        } else {
        contexto += '\n(No hay productos disponibles en este momento)';
        }
        
        return contexto;
    }

    mapProductsToDto(products: any[]): ProductDto[] {
        return products.map(p => ({
        id: p.id,
        name: p.nombre,
        description: p.descripcion,
        price: Number(p.precioBob),
        stock: p.stock,
        brand: p.marca?.nombre || undefined,
        ingredients: p.ingredientes?.map(ing => ing.nombre) || undefined,
        }));
    }
} 