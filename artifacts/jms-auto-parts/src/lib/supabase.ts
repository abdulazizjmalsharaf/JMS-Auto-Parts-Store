import { createClient } from '@supabase/supabase-js';
import type { OriginId, Product } from '../data/catalog';

type ProductRow = {
  id: string;
  origin: OriginId;
  brand: string;
  category: string;
  name_en: string;
  name_ar: string;
  category_name_en: string;
  category_name_ar: string;
  models: string[];
  years: number[];
  price: number | string;
  old_price: number | string;
  art: Product['art'];
  color: string;
};

let client: ReturnType<typeof createClient> | undefined;

export function getSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase is not configured for this app.');
  }

  client ??= createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return client;
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await getSupabaseClient()
    .from('products')
    .select(
      'id, origin, brand, category, name_en, name_ar, category_name_en, category_name_ar, models, years, price, old_price, art, color',
    )
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return ((data ?? []) as unknown as ProductRow[]).map((row) => ({
    id: row.id,
    origin: row.origin,
    brand: row.brand,
    category: row.category,
    name: { en: row.name_en, ar: row.name_ar },
    categoryName: { en: row.category_name_en, ar: row.category_name_ar },
    models: row.models,
    years: row.years,
    price: Number(row.price),
    oldPrice: Number(row.old_price),
    art: row.art,
    color: row.color,
  }));
}

export async function placeOrder(input: {
  customerName: string;
  phone: string;
  city: string;
  address: string;
  language: 'en' | 'ar';
  items: { productId: string; quantity: number }[];
}): Promise<void> {
  const ordersClient = getSupabaseClient() as unknown as {
    from: (table: 'orders') => {
      insert: (row: {
        customer_name: string;
        phone: string;
        city: string;
        address: string;
        language: 'en' | 'ar';
        items: { productId: string; quantity: number }[];
      }) => PromiseLike<{ error: Error | null }>;
    };
  };
  const { error } = await ordersClient.from('orders').insert({
    customer_name: input.customerName,
    phone: input.phone,
    city: input.city,
    address: input.address,
    language: input.language,
    items: input.items,
  });

  if (error) throw error;
}
