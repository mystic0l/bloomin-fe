import { Product } from '../types';

/** Map a Postgres / API product row to the frontend Product shape. */
export function mapDbProductRow(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    shopId: String(row.shop_id ?? row.shopId ?? ''),
    name: String(row.name ?? ''),
    flavor: String(row.flavor ?? ''),
    price: Number(row.price ?? 0),
    quantity: Number(row.quantity ?? 0),
    imageUrl: (row.image_url as string) || (row.imageUrl as string) || undefined,
    isActive: (row.is_active as boolean) ?? (row.isActive as boolean) ?? true,
  };
}
