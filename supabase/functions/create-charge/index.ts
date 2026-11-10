import { createClient } from "npm:@supabase/supabase-js@2";

const ASAAS = Deno.env.get("ASAAS_URL") ?? "https://sandbox.asaas.com/api/v3"; // produção: https://api.asaas.com/v3
// MODO DEMONSTRAÇÃO: ligado só com o segredo DEMO_MODE=true. Não gera Pix real.
const DEMO = Deno.env.get("DEMO_MODE") === "true";
const headers = {
  "Content-Type": "application/json",
  access_token: Deno.env.get("ASAAS_API_KEY") ?? "",
  "User-Agent": "doacoes-ong",
};
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const DEMO_QR = "iVBORw0KGgoAAAANSUhEUgAAAOcAAADnCAAAAADAnx78AAACLElEQVR42u3aQXbCMAwFQO5/6fYCPNCXFezAeElL7EkXv5L1+PuN9eDk5OTk5OTk5OTkvLvzka76957+5vMzPftZ92ScnJycnAc4K4H0/vQv932/0dOHxSfj5OTk5DzHWcjBmRMWdlg8GScnJyfnrZyFqOxWd5ycnJycP+9cXHEdyMnJycl5D2fcVZupy7oNQk5OTk7OU53d+YT4VQQDBifNYXBycnJyFp3dFZ+wG47tA3JycnJy7nDG0VXvvy2Ov3V34OTk5OTc6ew282b6hIvtwvz/BE5OTk7OjzpnZgnqH9aru3rJx8nJycm50xk/Jr4rih9d3+HlC+Xk5OTk3O+sl0szyRcPQqzOYXBycnJy7nDGG8YvLa4KZ+syTk5OTs6rnN22X/fiaSYq8/zk5OTk5PyMsz5nkHfcJkcY4sXJycnJudMZZ2R8A9S9vioUjkF+cnJycnJe7IyrtO5cwxXAID85OTk5OT/jjC1xRbXYxYsvrDg5OTk5D3DG+Tl6SdSt7jg5OTk5j3PGUVmPw/oO8cBb4W/FycnJybnTuRpWzXcQp/clfU1OTk5OzjnnlR235rBDPXA5OTk5OU91xvvGwTnaUawUa5ycnJyc+50ziRnfHHWbh5ycnJycX+qML5AW68BKNHNycnJy3tC5WFGNvi1OTk5OzuOci/2+bj3Xbe1xcnJycp7q7NZJ3Quk7ihC0BLk5OTk5Nzh/NrFycnJycnJycnJyXm/9Q+9Wp8U0QKNGwAAAABJRU5ErkJggg=="; // imagem de exemplo (não é um QR code real)

const asaas = async (path: string, init?: RequestInit) => {
  const r = await fetch(ASAAS + path, { ...init, headers });
  const j = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(j));
  return j;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { campaign_id, amount, name, email, anonymous } = await req.json();
    const value = Number(amount);
    if (!(value >= 1 && value <= 10000) || !email?.includes("@")) throw new Error("Dados inválidos");

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: donation, error } = await db.from("donations")
      .insert({ campaign_id, amount: value, donor_name: name || null, email, anonymous: !!anonymous })
      .select("id").single();
    if (error) throw new Error(error.message);

    if (DEMO) {
      // O prefixo "demo-" marca a doação como de teste
      await db.from("donations").update({ asaas_payment_id: `demo-${donation.id}` }).eq("id", donation.id);
      return json({
        donationId: donation.id,
        image: DEMO_QR,
        payload: "CODIGO-DE-DEMONSTRACAO-NAO-E-UM-PIX-REAL",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        demo: true,
      });
    }

    const customer = await asaas("/customers", {
      method: "POST", body: JSON.stringify({ name: name || "Doador(a)", email }),
    });
    const payment = await asaas("/payments", {
      method: "POST",
      body: JSON.stringify({
        customer: customer.id, billingType: "PIX", value,
        dueDate: new Date().toISOString().slice(0, 10),
        description: "Doação — ONG Eliane Martins",
        externalReference: donation.id,
      }),
    });
    const qr = await asaas(`/payments/${payment.id}/pixQrCode`);
    await db.from("donations").update({ asaas_payment_id: payment.id }).eq("id", donation.id);

    return json({ donationId: donation.id, image: qr.encodedImage, payload: qr.payload, expiresAt: qr.expirationDate });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 400);
  }
});
