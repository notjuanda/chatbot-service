import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectDataSource('gfhome')
        private gfhomeDataSource: DataSource,
    ) {}

    async getAllProducts(): Promise<ProductDto[]> {
        const query = `
        SELECT 
            p.id,
            p.nombre,
            p.slug,
            p.descripcion,
            p."precioBob",
            p."precioUsd",
            p.stock,
            p.activo,
            p."certificadoSinGluten",
            p."urlCertificado",
            p."createdAt",
            p."updatedAt",
            b.id as "marcaId",
            b.nombre as "marcaNombre",
            pc.id as "categoriaId",
            pc.nombre as "categoriaNombre"
        FROM products p
        LEFT JOIN brands b ON p."marcaId" = b.id
        LEFT JOIN product_categories pc ON p."categoriaId" = pc.id
        WHERE p.activo = true
        ORDER BY p.nombre
        `;

        const products = await this.gfhomeDataSource.query(query);
        
        return products.map(product => ({
        id: product.id,
        nombre: product.nombre,
        slug: product.slug,
        descripcion: product.descripcion,
        precioBob: parseFloat(product.precioBob),
        precioUsd: product.precioUsd ? parseFloat(product.precioUsd) : undefined,
        stock: product.stock,
        activo: product.activo,
        certificadoSinGluten: product.certificadoSinGluten,
        urlCertificado: product.urlCertificado,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        marca: product.marcaId ? {
            id: product.marcaId,
            nombre: product.marcaNombre,
        } : undefined,
        categoria: product.categoriaId ? {
            id: product.categoriaId,
            nombre: product.categoriaNombre,
        } : undefined,
        }));
    }

    async getProductsByCategory(categoryId: number): Promise<ProductDto[]> {
        const query = `
        SELECT 
            p.id,
            p.nombre,
            p.slug,
            p.descripcion,
            p."precioBob",
            p."precioUsd",
            p.stock,
            p.activo,
            p."certificadoSinGluten",
            p."urlCertificado",
            p."createdAt",
            p."updatedAt",
            b.id as "marcaId",
            b.nombre as "marcaNombre",
            pc.id as "categoriaId",
            pc.nombre as "categoriaNombre"
        FROM products p
        LEFT JOIN brands b ON p."marcaId" = b.id
        LEFT JOIN product_categories pc ON p."categoriaId" = pc.id
        WHERE p.activo = true AND p."categoriaId" = $1
        ORDER BY p.nombre
        `;

        const products = await this.gfhomeDataSource.query(query, [categoryId]);
        
        return products.map(product => ({
        id: product.id,
        nombre: product.nombre,
        slug: product.slug,
        descripcion: product.descripcion,
        precioBob: parseFloat(product.precioBob),
        precioUsd: product.precioUsd ? parseFloat(product.precioUsd) : undefined,
        stock: product.stock,
        activo: product.activo,
        certificadoSinGluten: product.certificadoSinGluten,
        urlCertificado: product.urlCertificado,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        marca: product.marcaId ? {
            id: product.marcaId,
            nombre: product.marcaNombre,
        } : undefined,
        categoria: product.categoriaId ? {
            id: product.categoriaId,
            nombre: product.categoriaNombre,
        } : undefined,
        }));
    }

    async searchProducts(searchTerm: string): Promise<ProductDto[]> {
        const query = `
        SELECT 
            p.id,
            p.nombre,
            p.slug,
            p.descripcion,
            p."precioBob",
            p."precioUsd",
            p.stock,
            p.activo,
            p."certificadoSinGluten",
            p."urlCertificado",
            p."createdAt",
            p."updatedAt",
            b.id as "marcaId",
            b.nombre as "marcaNombre",
            pc.id as "categoriaId",
            pc.nombre as "categoriaNombre"
        FROM products p
        LEFT JOIN brands b ON p."marcaId" = b.id
        LEFT JOIN product_categories pc ON p."categoriaId" = pc.id
        WHERE p.activo = true 
            AND (p.nombre ILIKE $1 OR p.descripcion ILIKE $1 OR b.nombre ILIKE $1)
        ORDER BY p.nombre
        `;

        const products = await this.gfhomeDataSource.query(query, [`%${searchTerm}%`]);
        
        return products.map(product => ({
        id: product.id,
        nombre: product.nombre,
        slug: product.slug,
        descripcion: product.descripcion,
        precioBob: parseFloat(product.precioBob),
        precioUsd: product.precioUsd ? parseFloat(product.precioUsd) : undefined,
        stock: product.stock,
        activo: product.activo,
        certificadoSinGluten: product.certificadoSinGluten,
        urlCertificado: product.urlCertificado,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        marca: product.marcaId ? {
            id: product.marcaId,
            nombre: product.marcaNombre,
        } : undefined,
        categoria: product.categoriaId ? {
            id: product.categoriaId,
            nombre: product.categoriaNombre,
        } : undefined,
        }));
    }

    async getCategories(): Promise<Array<{ id: number; nombre: string }>> {
        const query = `
        SELECT id, nombre
        FROM product_categories
        ORDER BY nombre
        `;

        return await this.gfhomeDataSource.query(query);
    }

    async getBrands(): Promise<Array<{ id: number; nombre: string }>> {
        const query = `
        SELECT id, nombre
        FROM brands
        ORDER BY nombre
        `;

        return await this.gfhomeDataSource.query(query);
    }
}
