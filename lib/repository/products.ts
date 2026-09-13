// Typed repository for the products domain.
// Products have nested variants in a separate table.

import { supabase } from '../supabase';
import { ProductCatalogItem, SKUVariant } from '../../types';
import { mockProducts } from '../../src/data/mockData';
import { RepoReadResult, RepoWriteResult, okRead, errRead, okWrite, errWrite, DataSource } from './types';

// ---- mappers ----

interface ProductRow {
  id: string;
  brand_id: string;
  name: string;
  category: string;
  description: string;
  wholesale_price_usd: number;
  retail_price_usd: number;
  moq: number;
  images: string[];
  owner_id: string | null;
  created_at: string;
}

interface VariantRow {
  id: string;
  product_id: string;
  size: string;
  color: string;
  sku: string;
  inventory_count: number;
  wholesale_price_usd: number;
}

function mapVariant(r: VariantRow): SKUVariant {
  return {
    id: r.id,
    size: r.size,
    color: r.color,
    sku: r.sku,
    inventoryCount: r.inventory_count,
    wholesalePriceUSD: r.wholesale_price_usd,
  };
}

function mapProduct(p: ProductRow, variants: VariantRow[]): ProductCatalogItem {
  return {
    id: p.id,
    brandId: p.brand_id,
    name: p.name,
    category: p.category,
    description: p.description ?? '',
    wholesalePriceUSD: p.wholesale_price_usd,
    retailPriceUSD: p.retail_price_usd,
    moq: p.moq,
    images: p.images ?? [],
    variants: variants.map(mapVariant),
    createdAt: p.created_at,
  };
}

// ---- public API ----

export async function fetchProducts(): Promise<RepoReadResult<ProductCatalogItem>> {
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (pErr) {
    return errRead<ProductCatalogItem>(pErr.message, 'supabase');
  }

  const { data: variants, error: vErr } = await supabase
    .from('product_variants')
    .select('*');

  if (vErr) {
    return errRead<ProductCatalogItem>(vErr.message, 'supabase');
  }

  const productRows = products as ProductRow[];
  const variantRows = (variants as VariantRow[]) ?? [];

  const mapped = productRows.map((p) => {
    const pVariants = variantRows.filter((v) => v.product_id === p.id);
    return mapProduct(p, pVariants);
  });

  return okRead(mapped, 'supabase');
}

export async function createProduct(
  product: ProductCatalogItem,
  source: DataSource
): Promise<RepoWriteResult<ProductCatalogItem>> {
  if (source === 'local') {
    return okWrite(product, 'local');
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      brand_id: product.brandId,
      name: product.name,
      category: product.category,
      description: product.description,
      wholesale_price_usd: product.wholesalePriceUSD,
      retail_price_usd: product.retailPriceUSD,
      moq: product.moq,
      images: product.images,
    })
    .select()
    .single();

  if (error) {
    return errWrite<ProductCatalogItem>(error.message, 'supabase');
  }

  // Insert variants
  const newRow = data as ProductRow;
  if (product.variants.length > 0) {
    const variantRows = product.variants.map((v) => ({
      product_id: newRow.id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      inventory_count: v.inventoryCount,
      wholesale_price_usd: v.wholesalePriceUSD,
    }));

    const { error: vErr } = await supabase.from('product_variants').insert(variantRows);
    if (vErr) {
      return errWrite<ProductCatalogItem>(vErr.message, 'supabase');
    }
  }

  return okWrite(
    mapProduct(newRow, product.variants.map((v, i) => ({
      id: v.id,
      product_id: newRow.id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      inventory_count: v.inventoryCount,
      wholesale_price_usd: v.wholesalePriceUSD,
    }))),
    'supabase'
  );
}

// Fallback: return mock products when not authenticated
export function localProducts(): RepoReadResult<ProductCatalogItem> {
  return okRead(mockProducts, 'local');
}
