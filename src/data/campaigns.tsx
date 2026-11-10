// src/data/campaigns.tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Campaign } from "../types";
import { fetchCampaigns } from "./api";

interface CampaignsContextValue {
    campaigns: Campaign[];
    loading: boolean;
    error: string | null;
    reload: () => void;
}

const CampaignsContext = createContext<CampaignsContextValue | null>(null);

export function CampaignsProvider({ children }: { children: React.ReactNode }) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const reload = useCallback(() => setReloadKey((k) => k + 1), []);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const data = await fetchCampaigns();
                if (cancelled) return;
                setCampaigns(data);
                setError(null);
            } catch (err) {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : "Erro ao carregar as campanhas.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        const interval = setInterval(load, 15000);

        const onVisible = () => {
            if (document.visibilityState === "visible") load();
        };
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            cancelled = true;
            clearInterval(interval);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [reloadKey]);

    const value = useMemo<CampaignsContextValue>(
        () => ({ campaigns, loading, error, reload }),
        [campaigns, loading, error, reload]
    );

    return <CampaignsContext.Provider value={value}>{children}</CampaignsContext.Provider>;
}

export function useCampaigns() {
    const ctx = useContext(CampaignsContext);
    if (!ctx) {
        throw new Error("useCampaigns deve ser usado dentro de CampaignsProvider");
    }
    return ctx;
}
