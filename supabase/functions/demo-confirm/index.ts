import { createClient } from "npm:@supabase/supabase-js@2";

// Confirma uma doação DE DEMONSTRAÇÃO (asaas_payment_id começando com "demo-"
// Só funciona com o segredo DEMO_MODE=true. Doações reais nunca são afetadas
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (Deno.env.get("DEMO_MODE") !== "true") return json({ error: "Modo demonstração desligado." }, 403);

  try {
    const { donationId } = await req.json();
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await db.from("donations")
      .update({ status: "confirmed" })
      .eq("id", donationId).eq("status", "pending").like("asaas_payment_id", "demo-%")
      .select("id");
    if (error) throw new Error(error.message);
    if (!data?.length) return json({ error: "Doação de demonstração não encontrada." }, 404);
    return json({ ok: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 400);
  }
});
