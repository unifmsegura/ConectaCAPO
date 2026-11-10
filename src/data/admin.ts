// src/data/admin.ts
import { supabase } from "../lib/supabase";
import { Campaign } from "../types";

// Helpers

function fail(operation: string, error: { message: string } | null): never {
    throw new Error(`Erro ao ${operation}: ${error?.message ?? "erro desconhecido"}`);
}

// Dashboard

export interface AdminResumo {
    totalMes: number;
    assinantesAtivos: number;
}

export async function fetchAdminResumo(): Promise<AdminResumo> {
    const { data, error } = await supabase
        .from("admin_resumo")
        .select("total_mes, assinantes_ativos")
        .single();

    if (error) fail("carregar o resumo do painel", error);

    const row = data as { total_mes: number | string; assinantes_ativos: number };
    return { totalMes: Number(row.total_mes), assinantesAtivos: Number(row.assinantes_ativos) };
}

export interface WeeklyPix {
    week: string; 
    pix: number;
}

export async function fetchAdminSemanal(): Promise<WeeklyPix[]> {
    const { data, error } = await supabase
        .from("admin_semanal")
        .select("semana, pix");

    if (error) fail("carregar o gráfico semanal", error);

    // A view ordena por semana decrescente, o gráfico usa ordem crescente
    return ((data ?? []) as { semana: string; pix: number | string }[])
        .map((r) => ({ week: r.semana, pix: Number(r.pix) }))
        .sort((a, b) => a.week.localeCompare(b.week));
}

export interface AdminTransaction {
    id: string;
    email: string;
    value: number;
    campaign: string;
    date: string;
    status: "Aprovado" | "Pendente";
}

export async function fetchAdminTransactions(limit = 10): Promise<AdminTransaction[]> {
    const { data, error } = await supabase
        .from("admin_transacoes")
        .select("id, email, amount, campaign, created_at, status")
        .limit(limit);

    if (error) fail("carregar as transações", error);

    return ((data ?? []) as {
        id: string; email: string | null; amount: number | string;
        campaign: string; created_at: string; status: string;
    }[]).map((r) => ({
        id: r.id,
        email: r.email ?? "(anônima)",
        value: Number(r.amount),
        campaign: r.campaign,
        date: new Date(r.created_at).toLocaleDateString("pt-BR"),
        status: r.status === "confirmed" ? "Aprovado" : "Pendente",
    }));
}

export interface CampaignInput {
    title: string;
    description: string;
    goal: number;
}

export async function createCampaign(input: CampaignInput): Promise<Campaign> {
    const id =
        input.title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || `campanha-${Date.now()}`;

    const { data, error } = await supabase
        .from("campaigns")
        .insert({ id, title: input.title, description: input.description, goal: input.goal, active: true })
        .select("id, title, description, goal, raised, priority")
        .single();

    if (error) fail("criar a campanha", error);

    const row = data as { id: string; title: string; description: string; goal: number; raised: number; priority: boolean | null };
    return { id: row.id, title: row.title, description: row.description, goal: Number(row.goal), raised: Number(row.raised), priority: row.priority ?? false };
}

export async function updateCampaign(
    id: string,
    changes: Partial<Pick<CampaignInput, "title" | "description" | "goal">>
): Promise<void> {
    const { error } = await supabase.from("campaigns").update(changes).eq("id", id);
    if (error) fail("salvar a campanha", error);
}

export async function setCampaignActive(id: string, active: boolean): Promise<void> {
    const { error } = await supabase.from("campaigns").update({ active }).eq("id", id);
    if (error) fail(active ? "retomar a campanha" : "pausar a campanha", error);
}


export interface Subscription {
    id: string;
    name: string;
    email: string;
    plan: number;
    nextCharge: string;
    status: "Ativo" | "Inadimplente" | "Cancelado";
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
    const { data, error } = await supabase
        .from("subscriptions")
        .select("id, donor_name, email, plan_amount, status, next_charge")
        .order("created_at", { ascending: false });

    if (error) fail("carregar as assinaturas", error);

    return ((data ?? []) as {
        id: string; donor_name: string; email: string;
        plan_amount: number | string; status: string; next_charge: string | null;
    }[]).map((r) => ({
        id: r.id,
        name: r.donor_name,
        email: r.email,
        plan: Number(r.plan_amount),
        nextCharge: r.next_charge ? new Date(r.next_charge + "T00:00:00").toLocaleDateString("pt-BR") : "—",
        status: r.status === "ativo" ? "Ativo" : r.status === "inadimplente" ? "Inadimplente" : "Cancelado",
    }));
}


export interface Expense {
    id: string;
    category: string;
    amount: number;
    month: string;
    note: string | null;
}

export async function fetchExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase
        .from("expenses")
        .select("id, category, amount, month, note")
        .order("created_at", { ascending: false });

    if (error) fail("carregar as despesas", error);

    return ((data ?? []) as { id: string; category: string; amount: number | string; month: string; note: string | null }[]).map((r) => ({
        id: r.id,
        category: r.category,
        amount: Number(r.amount),
        month: r.month,
        note: r.note,
    }));
}

export async function createExpense(category: string, amount: number, note?: string): Promise<void> {
    const month = new Date().toISOString().slice(0, 8) + "01"; 
    const { error } = await supabase.from("expenses").insert({ category, amount, month, note: note ?? null });
    if (error) fail("registrar a despesa", error);
}


export interface TeamMember {
    name: string;
    email: string;
    role: "Administradora" | "Voluntária";
}

export async function fetchTeam(): Promise<TeamMember[]> {
    const { data, error } = await supabase
        .from("admins")
        .select("name, email, role");

    if (error) fail("carregar a equipe", error);

    return ((data ?? []) as { name: string | null; email: string | null; role: string }[]).map((r) => ({
        name: r.name ?? "(sem nome)",
        email: r.email ?? "(sem e-mail)",
        role: r.role === "administradora" ? "Admin" : "Voluntária",
    }));
}


export interface AdminPost {
    id: string;
    title: string;
    body: string;
    imagePath: string | null;
    imageUrl: string | null;
    createdAt: string;
}

export async function fetchAdminPosts(): Promise<AdminPost[]> {
    const { data, error } = await supabase
        .from("posts")
        .select("id, title, body, image_path, created_at")
        .order("created_at", { ascending: false });

    if (error) fail("carregar as publicações", error);

    return ((data ?? []) as {
        id: string; title: string; body: string | null;
        image_path: string | null; created_at: string;
    }[]).map((r) => ({
        id: r.id,
        title: r.title,
        body: r.body ?? "",
        imagePath: r.image_path,
        imageUrl: r.image_path
            ? supabase.storage.from("mural").getPublicUrl(r.image_path).data.publicUrl
            : null,
        createdAt: new Date(r.created_at).toLocaleDateString("pt-BR"),
    }));
}

export async function createPost(title: string, body: string, file: File | null): Promise<void> {
    let imagePath: string | null = null;

    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            throw new Error("A foto deve ter no máximo 5 MB.");
        }
        const ext = file.name.split(".").pop() ?? "jpg";
        imagePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("mural").upload(imagePath, file);
        if (upErr) fail("enviar a foto", upErr);
    }

    const { error } = await supabase.from("posts").insert({ title, body, image_path: imagePath });
    if (error) {
        if (imagePath) await supabase.storage.from("mural").remove([imagePath]);
        fail("publicar no mural", error);
    }
}

export async function deletePost(post: AdminPost): Promise<void> {
    if (post.imagePath) {
        const { error: rmErr } = await supabase.storage.from("mural").remove([post.imagePath]);
        if (rmErr) fail("remover a foto", rmErr);
    }
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) fail("remover a publicação", error);
}
