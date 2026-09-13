// Typed repository for the orders domain.
// Orders have nested line items in a separate table.

import { supabase } from '../supabase';
import { Order, OrderItem } from '../../types';
import { mockOrders } from '../../src/data/mockData';
import { RepoReadResult, RepoWriteResult, okRead, errRead, okWrite, errWrite, DataSource } from './types';

// ---- mappers ----

interface OrderRow {
  id: string;
  buyer_id: string;
  brand_id: string;
  status: Order['status'];
  total_amount_usd: number;
  created_at: string;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price_usd: number;
}

function mapOrderItem(r: OrderItemRow): OrderItem {
  return {
    productId: r.product_id,
    variantId: r.variant_id,
    quantity: r.quantity,
    unitPriceUSD: r.unit_price_usd,
  };
}

function mapOrder(o: OrderRow, items: OrderItemRow[]): Order {
  return {
    id: o.id,
    buyerId: o.buyer_id,
    brandId: o.brand_id,
    status: o.status,
    totalAmountUSD: o.total_amount_usd,
    items: items.map(mapOrderItem),
    createdAt: o.created_at,
  };
}

// ---- public API ----

export async function fetchOrders(): Promise<RepoReadResult<Order>> {
  const { data: orders, error: oErr } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (oErr) {
    return errRead<Order>(oErr.message, 'supabase');
  }

  const { data: items, error: iErr } = await supabase
    .from('order_items')
    .select('*');

  if (iErr) {
    return errRead<Order>(iErr.message, 'supabase');
  }

  const orderRows = orders as OrderRow[];
  const itemRows = (items as OrderItemRow[]) ?? [];

  const mapped = orderRows.map((o) => {
    const oItems = itemRows.filter((i) => i.order_id === o.id);
    return mapOrder(o, oItems);
  });

  return okRead(mapped, 'supabase');
}

export async function createOrder(
  order: Order,
  source: DataSource
): Promise<RepoWriteResult<Order>> {
  if (source === 'local') {
    return okWrite(order, 'local');
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      buyer_id: order.buyerId,
      brand_id: order.brandId,
      status: order.status,
      total_amount_usd: order.totalAmountUSD,
    })
    .select()
    .single();

  if (error) {
    return errWrite<Order>(error.message, 'supabase');
  }

  const newRow = data as OrderRow;

  // Insert order items
  if (order.items.length > 0) {
    const itemRows = order.items.map((item) => ({
      order_id: newRow.id,
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      unit_price_usd: item.unitPriceUSD,
    }));

    const { error: iErr } = await supabase.from('order_items').insert(itemRows);
    if (iErr) {
      return errWrite<Order>(iErr.message, 'supabase');
    }
  }

  return okWrite(mapOrder(newRow, order.items.map((item) => ({
    id: '',
    order_id: newRow.id,
    product_id: item.productId,
    variant_id: item.variantId,
    quantity: item.quantity,
    unit_price_usd: item.unitPriceUSD,
  }))), 'supabase');
}

// Fallback: return mock orders when not authenticated
export function localOrders(): RepoReadResult<Order> {
  return okRead(mockOrders, 'local');
}
