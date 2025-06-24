import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from '../database/product.entity';
import { IProductsService } from '../common/interfaces/chat.interface';

@Injectable()
export class ProductsService implements IProductsService {
  constructor(
    @InjectRepository(Product, 'main-database')
    private readonly productRepository: Repository<Product>,
    @InjectDataSource('main-database')
    private dataSource: DataSource,
  ) {}

  async searchProducts(query: string): Promise<any[]> {
    const lowerQuery = query.toLowerCase();
    
    // Usar consulta SQL directa para evitar problemas con las entidades
    const products = await this.dataSource.query(`
      SELECT p."id", p."nombre", p."descripcion", p."precioBob", p."stock", p."activo", p."certificadoSinGluten",
             b."nombre" as marca, c."nombre" as categoria
      FROM products p
      LEFT JOIN brands b ON p."marcaId" = b."id"
      LEFT JOIN product_categories c ON p."categoriaId" = c."id"
      WHERE p."activo" = true 
        AND (p."nombre" ILIKE $1 OR p."descripcion" ILIKE $1)
      ORDER BY p."stock" DESC
      LIMIT 10
    `, [`%${query}%`]);

    // Si no hay resultados directos, buscar por palabras clave de ingredientes comunes
    if (products.length === 0) {
      const commonIngredients = [
        'almendra', 'coco', 'quinoa', 'arroz', 'maíz', 'avena', 'linaza', 'chia', 'girasol', 'sésamo',
        'almendras', 'nueces', 'pistachos', 'castañas', 'harina', 'almidón', 'proteína', 'fibra',
        'gluten', 'sin gluten', 'gluten free', 'celiaco', 'celíaco', 'intolerancia'
      ];
      
      const matchingIngredients = commonIngredients.filter(ingredient => 
        lowerQuery.includes(ingredient)
      );

      if (matchingIngredients.length > 0) {
        // Buscar en descripción por ingredientes
        const ingredientQuery = matchingIngredients.join('|');
        return this.dataSource.query(`
          SELECT p."id", p."nombre", p."descripcion", p."precioBob", p."stock", p."activo", p."certificadoSinGluten",
                 b."nombre" as marca, c."nombre" as categoria
          FROM products p
          LEFT JOIN brands b ON p."marcaId" = b."id"
          LEFT JOIN product_categories c ON p."categoriaId" = c."id"
          WHERE p."activo" = true AND p."descripcion" ILIKE $1
          ORDER BY p."stock" DESC
          LIMIT 10
        `, [`%${ingredientQuery}%`]);
      }
    }

    return products;
  }

  async getTopProducts(): Promise<any[]> {
    // Devuelve los primeros 10 productos más populares usando SQL directo
    return this.dataSource.query(`
      SELECT p."id", p."nombre", p."descripcion", p."precioBob", p."stock", p."activo", p."certificadoSinGluten",
             b."nombre" as marca, c."nombre" as categoria
      FROM products p
      LEFT JOIN brands b ON p."marcaId" = b."id"
      LEFT JOIN product_categories c ON p."categoriaId" = c."id"
      WHERE p."activo" = true
      ORDER BY p."stock" DESC, p."id" ASC
      LIMIT 10
    `);
  }

  async getProductsByIngredient(ingredient: string): Promise<any[]> {
    // Búsqueda por ingrediente usando SQL directo
    return this.dataSource.query(`
      SELECT DISTINCT p."id", p."nombre", p."descripcion", p."precioBob", p."stock", p."activo", p."certificadoSinGluten",
             b."nombre" as marca, c."nombre" as categoria
      FROM products p
      LEFT JOIN brands b ON p."marcaId" = b."id"
      LEFT JOIN product_categories c ON p."categoriaId" = c."id"
      LEFT JOIN product_ingredients pi ON p."id" = pi."productId"
      LEFT JOIN ingredients i ON pi."ingredientId" = i."id"
      WHERE p."activo" = true 
        AND (i."nombre" ILIKE $1 OR p."descripcion" ILIKE $1)
      ORDER BY p."stock" DESC
      LIMIT 10
    `, [`%${ingredient}%`]);
  }

  async getProductsByBrand(brand: string): Promise<any[]> {
    // Búsqueda por marca usando SQL directo
    return this.dataSource.query(`
      SELECT p."id", p."nombre", p."descripcion", p."precioBob", p."stock", p."activo", p."certificadoSinGluten",
             b."nombre" as marca, c."nombre" as categoria
      FROM products p
      LEFT JOIN brands b ON p."marcaId" = b."id"
      LEFT JOIN product_categories c ON p."categoriaId" = c."id"
      WHERE p."activo" = true 
        AND (b."nombre" ILIKE $1 OR p."nombre" ILIKE $1 OR p."descripcion" ILIKE $1)
      ORDER BY p."stock" DESC
      LIMIT 10
    `, [`%${brand}%`]);
  }

  async getProductsByCategory(category: string): Promise<any[]> {
    // Búsqueda por categoría usando SQL directo
    return this.dataSource.query(`
      SELECT p."id", p."nombre", p."descripcion", p."precioBob", p."stock", p."activo", p."certificadoSinGluten",
             b."nombre" as marca, c."nombre" as categoria
      FROM products p
      LEFT JOIN brands b ON p."marcaId" = b."id"
      LEFT JOIN product_categories c ON p."categoriaId" = c."id"
      WHERE p."activo" = true 
        AND (c."nombre" ILIKE $1 OR p."nombre" ILIKE $1 OR p."descripcion" ILIKE $1)
      ORDER BY p."stock" DESC
      LIMIT 10
    `, [`%${category}%`]);
  }

  async getProductsByPriceRange(minPrice?: number, maxPrice?: number): Promise<any[]> {
    let query = `
      SELECT p."id", p."nombre", p."descripcion", p."precioBob", p."stock", p."activo", p."certificadoSinGluten",
             b."nombre" as marca, c."nombre" as categoria
      FROM products p
      LEFT JOIN brands b ON p."marcaId" = b."id"
      LEFT JOIN product_categories c ON p."categoriaId" = c."id"
      WHERE p."activo" = true
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (minPrice !== undefined) {
      query += ` AND p."precioBob" >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex++;
    }
    
    if (maxPrice !== undefined) {
      query += ` AND p."precioBob" <= $${paramIndex}`;
      params.push(maxPrice);
    }
    
    query += ` ORDER BY p."precioBob" ASC LIMIT 10`;
    
    return this.dataSource.query(query, params);
  }

  async getGlutenFreeProducts(): Promise<any[]> {
    // Productos certificados sin gluten usando SQL directo
    return this.dataSource.query(`
      SELECT p."id", p."nombre", p."descripcion", p."precioBob", p."stock", p."activo", p."certificadoSinGluten",
             b."nombre" as marca, c."nombre" as categoria
      FROM products p
      LEFT JOIN brands b ON p."marcaId" = b."id"
      LEFT JOIN product_categories c ON p."categoriaId" = c."id"
      WHERE p."activo" = true AND p."certificadoSinGluten" = true
      ORDER BY p."stock" DESC
      LIMIT 10
    `);
  }
} 