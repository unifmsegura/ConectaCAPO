// src/data/auth.ts
import { supabase } from "../lib/supabase";

export type AdminRole = "administradora" | "voluntaria";

export interface AdminProfile {
    role: AdminRole;
    name: string;
}

export async function signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        throw new Error("E-mail ou senha incorretos.");
    }
}

export async function signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw new Error(`Erro ao sair: ${error.message}`);
    }
}

export async function fetchAdminProfile(userId: string): Promise<AdminProfile | null> {
    const { data, error } = await supabase
        .from("admins")
        .select("role, name")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        throw new Error(`Erro ao carregar seu perfil: ${error.message}`);
    }

    if (!data) return null;
    return { role: data.role as AdminRole, name: (data as { role: string; name: string }).name };
}

export function onAuthChange(
    callback: (userId: string | null) => void
): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user?.id ?? null);
    });
    return () => data.subscription.unsubscribe();
}

export async function getCurrentUserId(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
}
