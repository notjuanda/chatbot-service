-- Script para agregar columnas de marca e ingredientes a la tabla products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "marcaId" integer;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "marcaNombre" character varying;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "ingredientes" text; 