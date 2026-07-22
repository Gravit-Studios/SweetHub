// Edge Function: consolida a leitura pública do cardápio (empresa + produtos
// + fotos) numa única chamada, com um cache curto em memória por instância —
// antes eram 2-3 idas ao Postgres a cada visita à vitrine (ver getPublicCompany/
// getPublicProducts em db.js, que faziam essas consultas direto do navegador
// via PostgREST). Não é um CDN de verdade (memória não é compartilhada entre
// instâncias/regiões, e zera a cada cold start) — mas não exige nenhuma peça
// de infra nova além do Supabase, e já absorve rajadas curtas de tráfego na
// mesma loja (várias pessoas abrindo o mesmo link ao mesmo tempo).
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const CACHE_TTL_MS = 45_000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extraHeaders },
  });
}

type CacheEntry = { body: unknown; expiresAt: number };
const cache = new Map<string, CacheEntry>();

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadMenu(slug: string) {
  const { data: company, error: companyError } = await supabase
    .from('public_companies')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (companyError) throw companyError;
  if (!company) return { company: null, products: [] };

  const { data: products, error: productsError } = await supabase
    .from('public_products')
    .select('*')
    .eq('user_id', company.id)
    .order('category', { ascending: true });
  if (productsError) throw productsError;

  const productIds = products.map((p: { id: string }) => p.id);
  const photosByProduct = new Map<string, string[]>();
  if (productIds.length > 0) {
    const { data: photos, error: photosError } = await supabase
      .from('public_product_photos')
      .select('*')
      .in('product_id', productIds)
      .order('position', { ascending: true });
    if (photosError) throw photosError;
    photos.forEach((photo: { product_id: string; photo_url: string }) => {
      const list = photosByProduct.get(photo.product_id) || [];
      list.push(photo.photo_url);
      photosByProduct.set(photo.product_id, list);
    });
  }

  return {
    company,
    products: products.map((p: { id: string }) => ({ ...p, photos: photosByProduct.get(p.id) || [] })),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const url = new URL(req.url);
  const slug = (url.searchParams.get('slug') || '').trim();
  if (!slug) return json({ error: 'Informe o slug da loja.' }, 400);

  const cached = cache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return json(cached.body, 200, { 'Cache-Control': 'public, max-age=30', 'X-Cache': 'HIT' });
  }

  try {
    const body = await loadMenu(slug);
    cache.set(slug, { body, expiresAt: Date.now() + CACHE_TTL_MS });
    return json(body, 200, { 'Cache-Control': 'public, max-age=30', 'X-Cache': 'MISS' });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Erro ao carregar o cardápio.' }, 500);
  }
});
