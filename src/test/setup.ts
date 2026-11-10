import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Variáveis de ambiente públicas 
(import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_URL ||= "https://teste.supabase.co";
(import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_ANON_KEY ||= "teste-anon-key";

// Mock do cliente Supabase para testes
vi.mock("../lib/supabase", () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
        rpc: vi.fn(),
        functions: { invoke: vi.fn() },
        storage: { from: vi.fn() },
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: vi.fn().mockReturnValue({
                data: { subscription: { unsubscribe: vi.fn() } },
            }),
            signInWithPassword: vi.fn(),
            signOut: vi.fn().mockResolvedValue({ error: null }),
        },
    },
}));
