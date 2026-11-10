// src/data/api.ts
import { supabase } from "../lib/supabase";
import { Campaign } from "../types";

interface CampaignRow {
    id: string;
    title: string;
    description: string;
    goal: number;
    raised: number;
    priority: boolean | null;
    active: boolean | null;
}

interface PostRow {
    id: string;
    title: string;
    body: string | null;
    image_path: string | null;
    created_at: string;
}

export interface MuralPost {
    id: string;
    title: string;
    message: string;
    imagePath: string | null;
    createdAt: string;
}

export interface MuralStats {
    doadoras: number;
    arrecadado: number;
    metasAtingidas: number;
}

export interface MuralDonor {
    name: string;
    amount: number;
    campaign: string;
    date: string;
    anonymous: boolean;
}

export interface ChargeResult {
    donationId: string;
    image: string; 
    payload: string; 
    expiresAt: string;
    demo?: boolean;
}

export type DonationStatus = "pending" | "confirmed" | "cancelled";

// Helpers

function handleSupabaseError(operation: string, error: { message: string } | null): never {
    throw new Error(`Erro ao ${operation}: ${error?.message ?? "erro desconhecido"}`);
}


export async function fetchCampaigns(): Promise<Campaign[]> {
    const { data, error } = await supabase
        .from("campaigns")
        .select("id, title, description, goal, raised, priority, active")
        .eq("active", true)
        .order("created_at", { ascending: true });

    if (error) handleSupabaseError("carregar as campanhas", error);

    return (data as CampaignRow[]).map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        goal: Number(row.goal),
        raised: Number(row.raised),
        priority: row.priority ?? false,
    }));
}


export async function fetchPosts(): Promise<MuralPost[]> {
    const { data, error } = await supabase
        .from("posts")
        .select("id, title, body, image_path, created_at")
        .order("created_at", { ascending: false });

    if (error) handleSupabaseError("carregar as publicações do mural", error);

    return (data as PostRow[]).map((row) => ({
        id: row.id,
        title: row.title,
        message: row.body ?? "",
        imagePath: row.image_path,
        createdAt: row.created_at,
    }));
}

export async function fetchMuralStats(): Promise<MuralStats> {
    const { data, error } = await supabase
        .from("mural_stats")
        .select("doadoras, arrecadado, metas_atingidas")
        .single();

    if (error) handleSupabaseError("carregar as estatísticas do mural", error);

    const row = data as { doadoras: number; arrecadado: number | string; metas_atingidas: number };
    return {
        doadoras: Number(row.doadoras),
        arrecadado: Number(row.arrecadado),
        metasAtingidas: Number(row.metas_atingidas),
    };
}

export async function fetchMuralDonors(): Promise<MuralDonor[]> {
    const { data, error } = await supabase
        .from("mural")
        .select("id, first_name, amount, campaign, created_at")
        .order("created_at", { ascending: false })
        .limit(30);

    if (error) handleSupabaseError("carregar as doadoras do mural", error);

    return (data as { id: string; first_name: string; amount: number | string; campaign: string; created_at: string }[]).map(
        (row) => ({
            name: row.first_name,
            amount: Number(row.amount),
            campaign: row.campaign,
            date: row.created_at,
            anonymous: false,
        })
    );
}

// Doações/Pix 

export interface CreateChargeInput {
    campaignId: string;
    amount: number;
    name: string;
    email: string;
    anonymous: boolean;
}

export async function createCharge(input: CreateChargeInput): Promise<ChargeResult> {
    const { data, error } = await supabase.functions.invoke("create-charge", {
        body: {
            campaign_id: input.campaignId,
            amount: input.amount,
            name: input.name,
            email: input.email,
            anonymous: input.anonymous,
        },
    });

    if (error) handleSupabaseError("gerar o Pix da doação", error);

    const result = data as {
        donationId: string;
        image: string;
        payload: string;
        expiresAt: string;
        demo?: boolean;
    };

    return {
        donationId: result.donationId,
        image: result.image,
        payload: result.payload,
        expiresAt: result.expiresAt,
        demo: result.demo === true,
    };
}

// Confirma uma doação de demonstração, só funciona com o modo demonstração ligado no servidor.

export async function confirmDemoDonation(donationId: string): Promise<void> {
    const { error } = await supabase.functions.invoke("demo-confirm", {
        body: { donationId },
    });

    if (error) handleSupabaseError("simular o pagamento da doação", error);
}

export async function getDonationStatus(donationId: string): Promise<DonationStatus> {
    const { data, error } = await supabase.rpc("donation_status", { did: donationId });

    if (error) handleSupabaseError("verificar o status da doação", error);

    return data as DonationStatus;
}
