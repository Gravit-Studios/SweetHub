// Edge Function: recebe o formulário público de "Solicitar orçamento" da
// vitrine (recurso do plano Vitrine) — grava o pedido e, se configurado,
// dispara um e-mail de aviso pra confeitaria via Resend.
//
// Sem policy de insert pro anon/usuário em budget_requests de propósito
// (ver schema.sql): só essa função, com service role, grava na tabela —
// depois de confirmar que a loja (slug) existe e é do plano Vitrine.
//
// Secrets necessárias (Project Settings → Edge Functions → Secrets):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (já existem, usadas em outras
//   funções)
//   RESEND_API_KEY — opcional: sem ela, o pedido é salvo normalmente (visível
//   em Gestão → Orçamentos) mas nenhum e-mail é enviado.

import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sendNotificationEmail(to: string, payload: { name: string; phone: string; email: string; message: string; companyName: string }) {
  if (!RESEND_API_KEY) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'SweetHub <onboarding@resend.dev>',
        to: [to],
        reply_to: payload.email,
        subject: `Novo pedido de orçamento — ${payload.name}`,
        html: `
          <p><strong>${payload.name}</strong> pediu um orçamento pela vitrine de ${payload.companyName}.</p>
          <p><strong>Telefone:</strong> ${payload.phone || '(não informado)'}<br/>
          <strong>E-mail:</strong> ${payload.email}</p>
          <p><strong>Mensagem:</strong><br/>${payload.message.replace(/\n/g, '<br/>')}</p>
        `,
      }),
    });
  } catch {
    // Best-effort: se o e-mail falhar, o pedido já foi salvo e continua
    // visível em Gestão → Orçamentos — não deve travar a submissão do
    // formulário por causa disso.
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Corpo da requisição inválido.' }, 400);
  }

  const slug = String(payload.slug || '').trim();
  const name = String(payload.name || '').trim();
  const phone = String(payload.phone || '').trim();
  const email = String(payload.email || '').trim();
  const message = String(payload.message || '').trim();
  if (!slug) return json({ error: 'Loja inválida.' }, 400);
  if (!name || !email || !message) return json({ error: 'Preencha nome, e-mail e mensagem.' }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, company_name, budget_notification_email')
    .eq('slug', slug)
    .eq('plan', 'vitrine')
    .maybeSingle();
  if (profileError) return json({ error: profileError.message }, 500);
  if (!profile) return json({ error: 'Loja não encontrada.' }, 404);

  const { error: insertError } = await admin
    .from('budget_requests')
    .insert({ user_id: profile.id, name, phone, email, message });
  if (insertError) return json({ error: insertError.message }, 500);

  let recipient = profile.budget_notification_email;
  if (!recipient) {
    const { data: userData } = await admin.auth.admin.getUserById(profile.id);
    recipient = userData?.user?.email ?? null;
  }
  if (recipient) {
    await sendNotificationEmail(recipient, { name, phone, email, message, companyName: profile.company_name || 'sua loja' });
  }

  return json({ ok: true });
});
